use anchor_lang::prelude::*;

use crate::{constants::*, states::*,errors::*};

#[derive(Accounts)]
pub struct TreasureSettings<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [TRESURE_SEED],
        bump,
    )]
    pub treasure: Box<Account<'info, Treasure>>,
    pub system_program: Program<'info, System>,
}

impl<'info> TreasureSettings<'info> {
    pub fn change_admin(ctx: Context<Self>,new_admin:Pubkey) -> Result<()> {
        let accts: &mut TreasureSettings<'_> = ctx.accounts;
        if accts.treasure.admin != accts.admin.to_account_info().key() {
            return Err(CustomError::Unauthorized.into());
        }
        accts.treasure.admin = new_admin;
        Ok(())
    }
    pub fn change_collection(
        ctx: Context<Self>,
        new_main_collection:Pubkey,
        new_rune_collection:Pubkey
    ) -> Result<()> {
        let accts: &mut TreasureSettings<'_> = ctx.accounts;
        if accts.treasure.admin != accts.admin.to_account_info().key() {
            return Err(CustomError::Unauthorized.into());
        }
        accts.treasure.main_collection = new_main_collection;
        accts.treasure.rune_collection = new_rune_collection;
        Ok(())
    }
}
