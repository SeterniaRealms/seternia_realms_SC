use anchor_lang::prelude::*;
use std::ops::Deref;

#[account]
pub struct Treasure {
    pub admin: Pubkey,
    pub main_collection: Pubkey,
    pub rune_collection: Pubkey
}
#[account]
pub struct Role {
    pub addresses:Vec<Pubkey>
}
#[account]
pub struct CoinWallet {
    pub owner:Pubkey,
    pub amount:u64
}
#[account]
pub struct Faction {
    pub id:u64,
    pub season:u64,
    pub coins:u64,
    pub members:u64,
    pub distribution:u64,
    pub classes:u64,
    pub faction: String
}
#[account]
pub struct Class {
    pub faction: Pubkey,
    pub title: String,
    pub symbol: String,
    pub id:u64,
    pub traits: u64
}
#[account]
pub struct Traits {
    pub class:Pubkey,
    pub level:u64,
    pub coins:u64,
    pub uri: String,
}
#[account]
pub struct MintData {
    pub attributes: Pubkey,
    pub class: Pubkey,
    pub traits: Pubkey,
    pub mint: Pubkey,
    pub season:u64,
    pub level: u64,
}

#[account]
pub struct ClassList {
    pub faction_data: Vec<Pubkey>
}
#[derive(Clone, Debug, PartialEq)]
pub struct CollectionAuthorityRecordAccount(anchor_spl::metadata::mpl_token_metadata::accounts::CollectionAuthorityRecord);

impl anchor_lang::AccountDeserialize for CollectionAuthorityRecordAccount {
    fn try_deserialize(buf: &mut &[u8]) -> anchor_lang::Result<Self> {
        let me = Self::try_deserialize_unchecked(buf)?;
        if me.key != anchor_spl::metadata::mpl_token_metadata::types::Key::CollectionAuthorityRecord {
            return Err(ErrorCode::AccountNotInitialized.into());
        }
        Ok(me)
    }

    fn try_deserialize_unchecked(buf: &mut &[u8]) -> anchor_lang::Result<Self> {
        let result = anchor_spl::metadata::mpl_token_metadata::accounts::CollectionAuthorityRecord::safe_deserialize(buf)?;
        Ok(Self(result))
    }
}

impl Deref for CollectionAuthorityRecordAccount {
    type Target = anchor_spl::metadata::mpl_token_metadata::accounts::CollectionAuthorityRecord;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl anchor_lang::AccountSerialize for CollectionAuthorityRecordAccount {}

impl anchor_lang::Owner for CollectionAuthorityRecordAccount {
    fn owner() -> Pubkey {
        anchor_spl::metadata::mpl_token_metadata::ID
    }
}