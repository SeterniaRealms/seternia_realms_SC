use anchor_lang::prelude::*;
use anchor_spl::{token::{TokenAccount, Mint, Token}, associated_token::AssociatedToken};
use anchor_spl::metadata::{
    Metadata,MetadataAccount,
    mpl_token_metadata::types::DataV2,update_metadata_accounts_v2,UpdateMetadataAccountsV2
};
use std::mem::size_of;
use crate::{constants::*, states::*,errors::*};

pub fn create_wallet(ctx: Context<InitializeCoinWallet>) -> Result<()> {
    ctx.accounts.wallet.owner = ctx.accounts.payer.key();
    Ok(())
}
pub fn add_coin(ctx: Context<Coin>,payer:Pubkey,amount:u64) -> Result<()> {
    let accts: &mut Coin<'_> = ctx.accounts;

    if !accts.role.addresses.contains(&accts.authority.key()) {
        return Err(CustomError::ZeroAddressDetected.into());
    }
    
    accts.wallet.amount += amount;
    Ok(())
}
pub fn rmv_coin(ctx: Context<Coin>,payer:Pubkey,amount:u64) -> Result<()> {
    let accts: &mut Coin<'_> = ctx.accounts;

    if amount > accts.wallet.amount{
        return Err(CustomError::IncorrectAmount.into());
    }
    if !accts.role.addresses.contains(&accts.authority.key()) {
        return Err(CustomError::ZeroAddressDetected.into());
    }

    accts.wallet.amount -= amount;
    Ok(())
}
pub fn faction_coins(ctx: Context<FactionCoins>,payer:Pubkey,id:u64,amount:u64) -> Result<()> {
    let accts: &mut FactionCoins<'_> = ctx.accounts;
    let collection = accts.metadata.collection.clone();

    if !accts.role.addresses.contains(&accts.authority.key()) {
        return Err(CustomError::ZeroAddressDetected.into());
    }
    if !collection.clone().ok_or(CustomError::EmptyData)?.verified 
    || accts.mint.key() != accts.associated.mint
    || accts.wallet.owner.key() != accts.associated.owner
    || collection.ok_or(CustomError::EmptyData)?.key != accts.treasure.main_collection{
        return Err(CustomError::IncorrectNFT.into());
    }
    
    accts.faction.coins += amount;
    Ok(())
}
pub fn faction_reward(ctx: Context<FactionReward>,id:u64,amount:u64) -> Result<()> {
    let accts: &mut FactionReward<'_> = ctx.accounts;
    let program = accts.system_program.clone();

    if amount > accts.authority.lamports(){
        return Err(CustomError::IncorrectAmount.into());
    }

    if !accts.role.addresses.contains(&accts.authority.key()) {
        return Err(CustomError::ZeroAddressDetected.into());
    }
    accts.faction.season += 1;
    accts.faction.coins = 0;
    accts.faction.distribution = amount.checked_div(accts.faction.members)
    .ok_or(CustomError::MathOverflow)?;

    let cpi_deposit = CpiContext::new(
        program.to_account_info(), 
        anchor_lang::system_program::Transfer{
            from:accts.authority.to_account_info(),
            to:accts.faction.to_account_info()
        }
    );
    let _ = anchor_lang::system_program::transfer(cpi_deposit, amount)?;
    Ok(())
}
pub fn close_faction_reward(ctx: Context<FactionReward>,id:u64,_bump:u8) -> Result<()> {
    let accts: &mut FactionReward<'_> = ctx.accounts;
    let program = accts.system_program.clone();

    let binding = _bump.to_le_bytes();
    let id_bytes = id.to_le_bytes();

    let seeds: &[&[&[u8]]] = &[&[
        FACTION_SEED.as_ref(),
        id_bytes.as_ref(),
        binding.as_ref()
    ]];

    if 0 >= accts.faction.get_lamports(){
        return Err(CustomError::IncorrectAmount.into());
    }

    if !accts.role.addresses.contains(&accts.authority.key()) {
        return Err(CustomError::ZeroAddressDetected.into());
    }
    accts.faction.distribution = 0;

    let cpi_deposit = CpiContext::new_with_signer(
        program.to_account_info(), 
        anchor_lang::system_program::Transfer{
            from:accts.faction.to_account_info(),
            to:accts.authority.to_account_info()
        },
        seeds
    );

    let _ = anchor_lang::system_program::transfer(cpi_deposit, accts.faction.get_lamports())?;
    Ok(())
}
pub fn faction_claim(ctx: Context<FactionClaim>,id:u64,_bump:u8) -> Result<()> {
    let accts: &mut FactionClaim<'_> = ctx.accounts;
    let program = accts.system_program.clone();
    let collection = accts.metadata.collection.clone();
    let binding = _bump.to_le_bytes();
    let id_bytes = id.to_le_bytes();

    let seeds: &[&[&[u8]]] = &[&[
        FACTION_SEED.as_ref(),
        id_bytes.as_ref(),
        binding.as_ref()
    ]];

    if accts.data_mint.season == accts.faction.season{
        return Err(CustomError::IncorrectDefinition.into());
    }
    
    if accts.faction.distribution == 0
    || accts.faction.get_lamports() == 0{
        return Err(CustomError::IncorrectAmount.into());
    }

    if !collection.clone().ok_or(CustomError::EmptyData)?.verified 
    || accts.mint.key() != accts.associated.mint
    || accts.authority.key() != accts.associated.owner
    || collection.ok_or(CustomError::EmptyData)?.key != accts.treasure.main_collection{
        return Err(CustomError::IncorrectNFT.into());
    }

    accts.data_mint.season = accts.faction.season;

    let cpi_deposit = CpiContext::new_with_signer(
        program.to_account_info(), 
        anchor_lang::system_program::Transfer{
            from:accts.faction.to_account_info(),
            to:accts.authority.to_account_info()
        },
        seeds
    );

    let _ = anchor_lang::system_program::transfer(cpi_deposit, accts.faction.distribution)?;

    Ok(())
}
pub fn upgrate_nft(ctx: Context<NftUpgrate>,_bump:u8) -> Result<()> {
    let accts: &mut NftUpgrate<'_> = ctx.accounts;
    let traits = accts.traits.clone();
    let collection = accts.metadata.collection.clone();
    let level: u64 = traits.level.clone();
    let mut name: String = accts.metadata.name.clone();
    if let Some(pos) = name.find("Level:") {
        name.replace_range(pos + 7..pos + 8, level.to_string().as_str());
    }
    let binding = _bump.to_le_bytes();
    
    let seeds: &[&[&[u8]]] = &[&[
        TRESURE_SEED,
        binding.as_ref()
    ]];
    
    if accts.wallet.owner == accts.authority.key(){
        return Err(CustomError::IncorrectAmount.into());
    }
    if accts.wallet.amount < accts.traits.coins {
        return Err(CustomError::IncorrectAmount.into());
    }
    if accts.data_mint.class != accts.traits.class {
        return Err(CustomError::IncorrectDefinition.into());
    }
    if accts.data_mint.level >= accts.traits.level {
        return Err(CustomError::IncorrectDefinition.into());
    }
    if !collection.clone().ok_or(CustomError::EmptyData)?.verified 
    || accts.mint.key() != accts.associated.mint
    || accts.authority.key() != accts.associated.owner
    || collection.ok_or(CustomError::EmptyData)?.key != accts.treasure.main_collection{
        return Err(CustomError::IncorrectNFT.into());
    }
    accts.wallet.amount -= accts.traits.coins;

    let cpi_up = CpiContext::new_with_signer(
        accts.metadata_program.to_account_info(),
        UpdateMetadataAccountsV2{
            metadata:accts.metadata.to_account_info(),
            update_authority: accts.treasure.to_account_info()
        }
        ,seeds
    );

    let _= update_metadata_accounts_v2(cpi_up,None,
    Some(DataV2 { 
        name: name,
        uri: traits.uri.clone(),
        symbol: accts.metadata.symbol.clone(), 
        seller_fee_basis_points: accts.metadata.seller_fee_basis_points, 
        creators: accts.metadata.creators.clone(), 
        collection: accts.metadata.collection.clone(), 
        uses: None
    }),Some(true),None)?;

    Ok(())
}

#[derive(Accounts)]
pub struct InitializeCoinWallet<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        space = 16 + size_of::<CoinWallet>(),
        seeds = [COIN_SEED,payer.key().as_ref()], 
        bump,
    )]
    pub wallet: Account<'info, CoinWallet>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(payer: Pubkey)]
pub struct Coin<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [ROLE_SEED],
        bump,
    )]
    pub role: Box<Account<'info, Role>>,

    #[account(
        mut,
        seeds = [COIN_SEED,payer.key().as_ref()], 
        bump,
    )]
    pub wallet: Account<'info, CoinWallet>,


    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(id: u64,payer: Pubkey)]
pub struct FactionCoins<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [ROLE_SEED],
        bump,
    )]
    pub role: Box<Account<'info, Role>>,

    #[account(
        mut,
        seeds = [COIN_SEED,payer.key().as_ref()], 
        bump,
    )]
    pub wallet: Account<'info, CoinWallet>,

    #[account(
        mut,
        seeds = [TRESURE_SEED],
        bump,
    )]
    pub treasure: Box<Account<'info, Treasure>>,

    pub mint: Account<'info, Mint>,

    pub associated: Account<'info, TokenAccount>,

    pub metadata: Account<'info, MetadataAccount>,

    #[account(
        mut,
        seeds = [FACTION_SEED,id.to_le_bytes().as_ref()], 
        bump,
    )]
    pub faction: Box<Account<'info, Faction>>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub metadata_program: Program<'info, Metadata>,
}
#[derive(Accounts)]
#[instruction(id: u64)]
pub struct FactionReward<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [ROLE_SEED],
        bump,
    )]
    pub role: Box<Account<'info, Role>>,

    #[account(
        mut,
        seeds = [FACTION_SEED,id.to_le_bytes().as_ref()], 
        bump,
    )]
    pub faction: Box<Account<'info, Faction>>,

    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
#[instruction(id: u64)]
pub struct FactionClaim<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [TRESURE_SEED],
        bump,
    )]
    pub treasure: Box<Account<'info, Treasure>>,

    pub mint: Account<'info, Mint>,

    pub associated: Account<'info, TokenAccount>,

    pub metadata: Account<'info, MetadataAccount>,

    #[account( 
        mut,
        seeds = [mint.key().as_ref()], 
        bump,
    )]
    pub data_mint: Box<Account<'info, MintData>>,

    #[account(
        mut,
        seeds = [FACTION_SEED,id.to_le_bytes().as_ref()], 
        bump,
    )]
    pub faction: Box<Account<'info, Faction>>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub metadata_program: Program<'info, Metadata>,
}
#[derive(Accounts)]
pub struct NftUpgrate<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [TRESURE_SEED],
        bump,
    )]
    pub treasure: Box<Account<'info, Treasure>>,

    pub mint: Account<'info, Mint>,

    pub associated: Account<'info, TokenAccount>,

    pub metadata: Account<'info, MetadataAccount>,

    #[account(mut)]
    pub wallet: Account<'info, CoinWallet>,

    #[account( 
        mut,
        seeds = [mint.key().as_ref()], 
        bump,
    )]
    pub data_mint: Box<Account<'info, MintData>>,

    pub faction: Box<Account<'info, Faction>>,

    pub traits: Account<'info, Traits>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub metadata_program: Program<'info, Metadata>,
}