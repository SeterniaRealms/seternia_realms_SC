use anchor_lang::prelude::*;

use crate::{constants::*, states::*,errors::*};

#[derive(Accounts)]
pub struct RoleSettings<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
      seeds = [TRESURE_SEED],
      bump,
    )]
    pub treasure: Box<Account<'info, Treasure>>,
    
    #[account(
        mut,
        seeds = [ROLE_SEED],
        bump,
    )]
    pub role: Box<Account<'info, Role>>,

    pub system_program: Program<'info, System>,
}

impl<'info> RoleSettings<'info> {
    pub fn add_role(ctx: Context<Self>,role:Pubkey) -> Result<()> {
        let accts: &mut RoleSettings<'_> = ctx.accounts;
        if accts.treasure.admin != accts.admin.to_account_info().key() {
            return Err(CustomError::Unauthorized.into());
        }
        if accts.role.addresses.contains(&role){
            return Err(CustomError::AddressExist.into());
        }
        accts.role.addresses.push(role);
        Ok(())
    }
    pub fn rmv_role(ctx: Context<Self>,role:Pubkey) -> Result<()> {
        let accts: &mut RoleSettings<'_> = ctx.accounts;
        let accts_roles: &Vec<Pubkey> = &accts.role.addresses;
        if accts.treasure.admin != accts.admin.to_account_info().key() {
            return Err(CustomError::Unauthorized.into());
        }
        for i in 0..accts_roles.len(){
            if role == accts_roles[i]{
                accts.role.addresses.remove(i);
                break;
            }
        }
        Ok(())
    }
}