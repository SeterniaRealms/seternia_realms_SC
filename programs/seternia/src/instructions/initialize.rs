use anchor_lang::prelude::*;
use std::mem::size_of;

use crate::{constants::*, states::*};

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        seeds = [TRESURE_SEED],
        bump,
        space = 8 + (size_of::<Treasure>() * 2)
    )]
    pub treasure: Box<Account<'info, Treasure>>,
    
    #[account(
        init,
        payer = admin,
        seeds = [ROLE_SEED],
        bump,
        space = 8 + size_of::<Pubkey>() * 30
    )]
    pub role: Box<Account<'info, Role>>,

    pub system_program: Program<'info, System>,
}

impl<'info> Initialize<'info> {
    pub fn validate(
        ctx: Context<Self>,
        main_collection:Pubkey,
        rune_collection:Pubkey,
        role:Pubkey
    ) -> Result<()> {
        let accts: &mut Initialize<'_> = ctx.accounts;
        let admin_key: Pubkey = accts.admin.key();
        accts.treasure.admin = admin_key;
        accts.treasure.rune_collection = rune_collection;
        accts.treasure.main_collection = main_collection;
        accts.role.addresses.push(role);
        Ok(())
    }
}
