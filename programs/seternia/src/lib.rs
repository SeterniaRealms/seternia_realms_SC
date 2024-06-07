use anchor_lang::prelude::*;

/// instructions
pub mod instructions;
pub mod constants;
pub mod errors;
pub mod states;
use crate::instructions::*;

declare_id!("7fHyCXb2goZ8cGDm8CqY9rogsZm4FySD2QSznEUJHZvb");

#[program]
pub mod seternia {
    use super::*;
    pub fn initialize(
        ctx: Context<Initialize>,
        main_collection:Pubkey,
        rune_collection:Pubkey,
        role:Pubkey
    ) -> Result<()>{
        Initialize::validate(ctx,main_collection,rune_collection,role)?;
        Ok(())
    }

    pub fn change_admin(ctx: Context<TreasureSettings>,new_admin:Pubkey) -> Result<()>{
        TreasureSettings::change_admin(ctx,new_admin)?;
        Ok(())
    }
    pub fn change_collection(
        ctx: Context<TreasureSettings>,
        new_main_collection:Pubkey,
        new_rune_collection:Pubkey
    ) -> Result<()>{
        TreasureSettings::change_collection(ctx,new_main_collection,new_rune_collection)?;
        Ok(())
    }
    pub fn add_role(ctx: Context<RoleSettings>,bot:Pubkey) -> Result<()>{
        RoleSettings::add_role(ctx,bot)?;
        Ok(())
    }
    pub fn rmv_role(ctx: Context<RoleSettings>,bot:Pubkey) -> Result<()>{
        RoleSettings::rmv_role(ctx,bot)?;
        Ok(())
    }
    pub fn create_wallet(ctx: Context<InitializeCoinWallet>)-> Result<()>{
        env_settings::create_wallet(ctx)?;
        Ok(())
    }
    pub fn add_coin(ctx: Context<Coin>, payer: Pubkey, amount: u64)-> Result<()>{
        env_settings::add_coin(ctx, payer, amount)?;
        Ok(())
    }
    pub fn rmv_coin(ctx: Context<Coin>, payer: Pubkey, amount: u64)-> Result<()>{
        env_settings::rmv_coin(ctx, payer, amount)?;
        Ok(())
    }
    pub fn faction_coins(ctx: Context<FactionCoins>, payer: Pubkey, id:u64, amount: u64)-> Result<()>{
        env_settings::faction_coins(ctx, payer, id, amount)?;
        Ok(())
    }
    pub fn faction_reward(ctx: Context<FactionReward>,id:u64,amount:u64)-> Result<()>{
        env_settings::faction_reward(ctx,id,amount)?;
        Ok(())
    }
    pub fn close_faction_reward(ctx: Context<FactionReward>,id:u64,_bump:u8)-> Result<()>{
        env_settings::close_faction_reward(ctx,id,_bump)?;
        Ok(())
    }
    pub fn faction_claim(ctx: Context<FactionClaim>,id:u64,_bump:u8)-> Result<()>{
        env_settings::faction_claim(ctx,id,_bump)?;
        Ok(())
    }
    pub fn upgrate_nft(ctx: Context<NftUpgrate>,_bump:u8)-> Result<()>{
        env_settings::upgrate_nft(ctx,_bump)?;
        Ok(())
    }
    pub fn create_faction(ctx: Context<CreateFaction>,id:u64,faction: String) -> Result<()>{
        create_collection::create_faction(ctx,id,faction)?;
        Ok(())
    }
    pub fn create_class(ctx: Context<CreateClass>,id:u64,title:String,symbol:String) -> Result<()>{
        create_collection::create_class(ctx,id,title,symbol)?;
        Ok(())
    }
    pub fn create_race(ctx: Context<CreateRace>,id:u64,limit:u64,name:String,token:Pubkey,value:u64) -> Result<()>{
        create_collection::create_race(ctx,id,limit,name,token,value)?;
        Ok(())
    }
    pub fn create_trait(ctx: Context<CreateTrait>,id:u64,level:u64,coins:u64,uri:String) -> Result<()>{
        create_collection::create_trait(ctx,id,level,coins,uri)?;
        Ok(())
    }
    pub fn mint_collection(
            ctx: Context<MintCollection>,
            name:String,
            uri: String,
            symbol: String,
            _bump:u8
        ) -> Result<()>{
        create_collection::mint_collection(ctx,name,uri,symbol,_bump)?;
        Ok(())
    }
    pub fn mint(
            ctx: Context<MintNFT>,
            id:u64,
            is_nft: bool,
            _bump:u8
        ) -> Result<()>{
        create_mint::mint(ctx,id,is_nft,_bump)?;
        Ok(())
    }
    pub fn active(ctx: Context<Active>) -> Result<()> {
        create_mint::active(ctx)?;
        Ok(())
    }
}