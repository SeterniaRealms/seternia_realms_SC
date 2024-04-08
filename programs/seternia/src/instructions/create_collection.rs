use anchor_lang::prelude::*;
use anchor_spl::{token::{TokenAccount, Mint, Token}, associated_token::AssociatedToken};
use anchor_spl::metadata::Metadata;
use anchor_spl::token::{MintTo ,mint_to};
use anchor_spl::metadata::{
    mpl_token_metadata::types::{DataV2,CollectionDetails},
    approve_collection_authority,
    create_master_edition_v3, create_metadata_accounts_v3,
    CreateMasterEditionV3,CreateMetadataAccountsV3,ApproveCollectionAuthority
};
use std::mem::size_of;
use crate::{constants::*, states::*,errors::*};

pub fn create_faction(ctx: Context<CreateFaction>,id:u64,faction: String) -> Result<()> {

    let accts: &mut CreateFaction<'_> = ctx.accounts;
    let authority: &mut Box<Account<'_, Treasure>> = &mut accts.treasure;

    if authority.admin != accts.admin.to_account_info().key() {
        return Err(CustomError::Unauthorized.into());
    }
    accts.faction.id = id;
    accts.faction.classes = 0;
    accts.faction.faction = faction;
    Ok(())
}
pub fn create_class(ctx: Context<CreateClass>,id:u64,title:String,symbol:String) -> Result<()> {

    let accts: &mut CreateClass<'_> = ctx.accounts;
    let authority: &mut Box<Account<'_, Treasure>> = &mut accts.treasure;

    if authority.admin != accts.admin.to_account_info().key() {
        return Err(CustomError::Unauthorized.into());
    }
    accts.faction.classes += 1;
    
    accts.class.faction = accts.faction.key();
    accts.class.traits = 0;
    accts.class.id = id;
    accts.class.title = title;
    accts.class.symbol = symbol;
    Ok(())
}
pub fn create_trait(ctx: Context<CreateTrait>,id:u64,level:u64,coins:u64,uri:String) -> Result<()> {

    let accts: &mut CreateTrait<'_> = ctx.accounts;
    let authority: &mut Box<Account<'_, Treasure>> = &mut accts.treasure;

    if authority.admin != accts.admin.to_account_info().key() {
        return Err(CustomError::Unauthorized.into());
    }
    accts.class.traits += 1;

    accts.traits.class = accts.class.key();
    accts.traits.level = level;
    accts.traits.coins = coins;
    accts.traits.uri = uri;
    Ok(())
}

pub fn mint_collection(
    ctx: Context<MintCollection>,
    name:String,
    uri: String,
    symbol: String,
    _bump:u8
) -> Result<()> {
    let accts: &mut MintCollection<'_> = ctx.accounts;
    let binding: [u8; 1] = _bump.to_le_bytes();
    let authority: &mut Box<Account<'_, Treasure>> = &mut accts.treasure;

    let seeds: &[&[&[u8]]] = &[&[
        TRESURE_SEED,
        binding.as_ref()
    ]];
    if authority.admin != accts.admin.to_account_info().key() {
        return Err(CustomError::Unauthorized.into());
    }
    let mut _collection_details: Option<CollectionDetails> = None;

    let cpi_ctx = CpiContext::new_with_signer(
        accts.token_program.to_account_info(), 
            MintTo {
                mint: accts.mint.to_account_info(),
                to: accts.token_account.to_account_info(),
                authority: authority.to_account_info(),
            },
        seeds
    );
    //msg!("CPI Context Assigned");
    mint_to(cpi_ctx, 1)?;
    let createmeta = CpiContext::new_with_signer(
        accts.metadata_program.to_account_info(),
        CreateMetadataAccountsV3 {
            payer: accts.admin.to_account_info(),
            mint: accts.mint.to_account_info(),
            metadata: accts.nft_metadata.to_account_info(),
            mint_authority: authority.to_account_info(),
            update_authority: authority.to_account_info(),
            system_program: accts.system_program.to_account_info(),
            rent: accts.rent.to_account_info(),
        }, 
        seeds
    );
    //msg!("Account Info Assigned");
    let _ = create_metadata_accounts_v3(
        createmeta,
        DataV2{
            name: name,
            uri: uri,
            symbol: symbol,
            seller_fee_basis_points:0,
            creators:None,
            collection:None,
            uses:None
        },
        true,
        true,
        _collection_details
    )?;
    //msg!("{:?} Metadata Account Created !!!",meta);
    let createmaster = CpiContext::new_with_signer(
        accts.metadata_program.to_account_info(),
        CreateMasterEditionV3 {
            edition: accts.master_edition_account.to_account_info(),
            payer: accts.admin.to_account_info(),
            mint: accts.mint.to_account_info(),
            metadata: accts.nft_metadata.to_account_info(),
            mint_authority: authority.to_account_info(),
            update_authority: authority.to_account_info(),
            system_program: accts.system_program.to_account_info(),
            token_program: accts.token_program.to_account_info(),
            rent: accts.rent.to_account_info(),
        }, 
        seeds
    );
    let _ = create_master_edition_v3(createmaster,Some(0))?;

    let cpi_apv = CpiContext::new_with_signer(
        accts.metadata_program.to_account_info(),
        ApproveCollectionAuthority{
            collection_authority_record:accts.delegate.to_account_info(),
            metadata:accts.nft_metadata.to_account_info(),
            payer: accts.admin.to_account_info(),
            mint: accts.mint.to_account_info(),
            update_authority: authority.to_account_info(),
            new_collection_authority:authority.to_account_info()
        }
        ,seeds
    );
    let _= approve_collection_authority(cpi_apv)?;
    Ok(())
}
#[derive(Accounts)]
pub struct MintCollection<'info> {

    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [TRESURE_SEED],
        bump,
    )]
    pub treasure: Box<Account<'info, Treasure>>,
    #[account( 
        init,
        payer = admin, 
        mint::decimals = 0,
        mint::authority = treasure,
        mint::freeze_authority = treasure,
        seeds = [COLLECTION], 
        bump,
    )]
    pub mint: Account<'info, Mint>,
    #[account(
        init_if_needed,
        payer = admin,
        associated_token::mint = mint,
        associated_token::authority = admin,
    )]
    pub token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [
            METADATA,
            metadata_program.key().as_ref(),
            mint.key().as_ref(),
            EDITION.as_ref(),
        ],
        bump,
        seeds::program = metadata_program.key()
    )]
    /// CHECK:
    pub master_edition_account: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [
            METADATA,
            metadata_program.key().as_ref(),
            mint.key().as_ref(),
        ],
        bump,
        seeds::program = metadata_program.key()
    )]
    /// CHECK:
    pub nft_metadata: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [
            METADATA,
            metadata_program.key().as_ref(),
            mint.key().as_ref(),
            COLLECTION_AUTHORITY,
            treasure.key().as_ref()
        ],
        bump,
        seeds::program = metadata_program.key()
    )]
    /// CHECK:
    pub delegate: UncheckedAccount<'info>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub metadata_program: Program<'info, Metadata>,
}
#[derive(Accounts)]
#[instruction(id: u64)]
pub struct CreateFaction<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        seeds = [TRESURE_SEED],
        bump,
    )]
    pub treasure: Box<Account<'info, Treasure>>,
    #[account(
        init,
        payer = admin,
        space = 16 + size_of::<Faction>(),
        seeds = [FACTION_SEED,id.to_le_bytes().as_ref()], 
        bump,
    )]
    pub faction: Box<Account<'info, Faction>>,

    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
#[instruction(id: u64)]
pub struct CreateClass<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        seeds = [TRESURE_SEED],
        bump,
    )]
    pub treasure: Box<Account<'info, Treasure>>,

    #[account(mut)]
    pub faction: Box<Account<'info, Faction>>,
    #[account(
        init,
        payer = admin,
        space = 16 + size_of::<Class>(),
        seeds = [faction.key().as_ref(),id.to_le_bytes().as_ref()], 
        bump,
    )]
    pub class: Account<'info, Class>,

    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
#[instruction(id: u64)]
pub struct CreateTrait<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        seeds = [TRESURE_SEED],
        bump,
    )]
    pub treasure: Box<Account<'info, Treasure>>,

    #[account(mut)]
    pub class: Box<Account<'info, Class>>,

    #[account(
        init,
        payer = admin,
        space = 160 + size_of::<Traits>(),
        seeds = [class.key().as_ref(),id.to_le_bytes().as_ref()], 
        bump,
    )]
    pub traits: Account<'info, Traits>,

    pub system_program: Program<'info, System>,
}