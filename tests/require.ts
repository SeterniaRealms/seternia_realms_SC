import BN from "bn.js";
import { PublicKey } from '@solana/web3.js';

export interface Treasure {
  admin: PublicKey;
  mainCollection: PublicKey;
  runeCollection: PublicKey;
}

export interface Role {
  addresses: PublicKey[];
}

export interface CoinWallet {
  owner: PublicKey;
  amount: BN;
}

export interface Faction {
  id: BN;
  season: BN;
  coins: BN;
  members: BN;
  distribution: BN;
  classes: BN;
  faction: string;
}

export interface Class {
  faction: PublicKey;
  title: string;
  symbol: string;
  id: BN;
  traits: BN;
}

export interface Traits {
  class: PublicKey;
  level: BN;
  coins: BN;
  uri: string;
}

export interface MintData {
  attributes: PublicKey;
  class: PublicKey;
  traits: PublicKey;
  mint: PublicKey;
  season: BN;
  level: BN;
}

export interface ClassList {
  factionData: PublicKey[];
}