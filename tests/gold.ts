import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID,ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, createInitializeMintInstruction, MINT_SIZE } from '@solana/spl-token';
import { PublicKey,sendAndConfirmTransaction,SystemProgram ,Connection,ComputeBudgetProgram} from "@solana/web3.js";
import { Treasure,Role, CoinWallet, Faction, MintData } from "./require"
import { Seternia } from "../target/types/seternia";
import { readContracts,readPrivateKeys } from "./start"
import { BN } from "bn.js";
const info = {
  programId: new PublicKey("11111111111111111111111111111111"),
  TOKEN_METADATA_PROGRAM_ID: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
  mint_address: new PublicKey("")
}

describe("seternia", () => {
  const con = new Connection("https://api.devnet.solana.com");
  const provider = anchor.AnchorProvider.env();
  const wallet = 
  //readPrivateKeys("private_keys.txt")[0];
  anchor.Wallet.local().payer;
  info.programId = new PublicKey(readContracts("contract.txt")[0]);
  anchor.setProvider(provider);
  const fid = new BN(1);
  const cid = new BN(1);
  const tid = new BN(1);
  //const program = new Program(require("../target/idl/seternia.json"), info.programId,provider);
  const program = anchor.workspace.seternia as Program<Seternia>
  const exe_sys_prog = anchor.web3.SystemProgram;
  //const con = new Connection("http://127.0.0.1:8899");
  it("should initialize coin wallet successfully!", async () => {
    let transaction = new anchor.web3.Transaction();
    const [WalletKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("COIN_SEED"),wallet.publicKey.toBuffer()],
      program.programId
    );
    const tx = await program.methods.createWallet().accounts({
      payer:wallet.publicKey,
      wallet:WalletKey,
      systemProgram:exe_sys_prog.programId
    }).instruction();
    transaction.add(tx);
    const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
    const wallet_data = await program.account.coinWallet.fetch(WalletKey) as CoinWallet;
    console.log("Your transaction signature: ", txSignature);
    console.log("wallet data:", wallet_data);
  });

  it("should add coin to wallet successfully!", async () => {
    let transaction = new anchor.web3.Transaction();

    const coins = new BN(100);

    const [WalletKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("COIN_SEED"),wallet.publicKey.toBuffer()],
      program.programId
    );
    const [RoleKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("ROLE_SEED")],
      program.programId
    );
    const tx = await program.methods.addCoin(
      wallet.publicKey,
      coins
    ).accounts({
      authority:wallet.publicKey,
      role:RoleKey,
      wallet:WalletKey,
      systemProgram:exe_sys_prog.programId
    }).instruction();
    transaction.add(tx);
    const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
    const wallet_data = await program.account.coinWallet.fetch(WalletKey) as CoinWallet;
    console.log("Your transaction signature: ", txSignature);
    console.log("wallet data:", wallet_data);
  });

  it("should rmv coin to wallet successfully!", async () => {
    let transaction = new anchor.web3.Transaction();

    const coins = new BN(100);

    const [WalletKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("COIN_SEED"),wallet.publicKey.toBuffer()],
      program.programId
    );
    const [RoleKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("ROLE_SEED")],
      program.programId
    );
    const tx = await program.methods.rmvCoin(
      wallet.publicKey,
      coins
    ).accounts({
      authority:wallet.publicKey,
      role:RoleKey,
      wallet:WalletKey,
      systemProgram:exe_sys_prog.programId
    }).instruction();
    transaction.add(tx);
    const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
    const wallet_data = await program.account.coinWallet.fetch(WalletKey) as CoinWallet;
    console.log("Your transaction signature: ", txSignature);
    console.log("wallet data:", wallet_data);
  });

  it("should faction coin to wallet successfully!", async () => {
    let transaction = new anchor.web3.Transaction();

    const coins = new BN(100);

    const [TreasuryKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("TRESURE_SEED")],
      program.programId
    );
    const [WalletKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("COIN_SEED"),wallet.publicKey.toBuffer()],
      program.programId
    );
    const [RoleKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("ROLE_SEED")],
      program.programId
    );
    const [FactionKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("FACTION_SEED"),Buffer.from(fid.toArray("le", 8))],
      program.programId
    );
    const MintTokenAccount = await getAssociatedTokenAddress(
      info.mint_address,
      wallet.publicKey
    );

    const [metadataAddress] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("metadata"),info.TOKEN_METADATA_PROGRAM_ID.toBuffer(),info.mint_address.toBuffer()],
      info.TOKEN_METADATA_PROGRAM_ID
    );
    const tx = await program.methods.factionCoins(
      wallet.publicKey,
      fid,
      coins
    ).accounts({
      authority:wallet.publicKey,
      role:RoleKey,
      wallet:WalletKey,
      treasure:TreasuryKey,
      mint:info.mint_address,
      associated:MintTokenAccount,
      metadata:metadataAddress,
      faction:FactionKey,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      systemProgram: exe_sys_prog.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      metadataProgram: info.TOKEN_METADATA_PROGRAM_ID,
    }).instruction();
    transaction.add(tx);
    const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
    const wallet_data = await program.account.coinWallet.fetch(WalletKey) as CoinWallet;
    console.log("Your transaction signature: ", txSignature);
    console.log("wallet data:", wallet_data);
  });

  it("should faction reward successfully!", async () => {
    let transaction = new anchor.web3.Transaction();

    const coins = new BN(100);

    const [RoleKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("ROLE_SEED")],
      program.programId
    );
    const [FactionKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("FACTION_SEED"),Buffer.from(fid.toArray("le", 8))],
      program.programId
    );
    
    const tx = await program.methods.factionReward(
      fid,
      coins
    ).accounts({
      authority:wallet.publicKey,
      role:RoleKey,
      faction:FactionKey,
      systemProgram: exe_sys_prog.programId,
    }).instruction();
    transaction.add(tx);
    const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
    const faction_data = await program.account.faction.fetch(FactionKey) as Faction;
    console.log("Your transaction signature: ", txSignature);
    console.log("faction data:", faction_data);
  });

  it("should close faction reward successfully!", async () => {
    let transaction = new anchor.web3.Transaction();

    const [RoleKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("ROLE_SEED")],
      program.programId
    );
    const [FactionKey,bump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("FACTION_SEED"),Buffer.from(fid.toArray("le", 8))],
      program.programId
    );
    const tx = await program.methods.closeFactionReward(
      fid,
      bump
    ).accounts({
      authority:wallet.publicKey,
      role:RoleKey,
      faction:FactionKey,
      systemProgram: exe_sys_prog.programId,
    }).instruction();
    transaction.add(tx);
    const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
    const faction_data = await program.account.faction.fetch(FactionKey) as Faction;
    console.log("Your transaction signature: ", txSignature);
    console.log("faction data:", faction_data);
  });

  it("should faction claim to wallet successfully!", async () => {
    let transaction = new anchor.web3.Transaction();

    const [TreasuryKey,bump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("TRESURE_SEED")],
      program.programId
    );

    const [FactionKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("FACTION_SEED"),Buffer.from(fid.toArray("le", 8))],
      program.programId
    );
    const MintTokenAccount = await getAssociatedTokenAddress(
      info.mint_address,
      wallet.publicKey
    );
    const [metadataAddress] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("metadata"),info.TOKEN_METADATA_PROGRAM_ID.toBuffer(),info.mint_address.toBuffer()],
      info.TOKEN_METADATA_PROGRAM_ID
    );
    const [MintDataKey] = await anchor.web3.PublicKey.findProgramAddress(
      [info.mint_address.toBuffer()],
      program.programId
    );

    const tx = await program.methods.factionClaim(
      fid,
      bump
    ).accounts({
      authority:wallet.publicKey,
      treasure:TreasuryKey,
      mint:info.mint_address,
      associated:MintTokenAccount,
      metadata:metadataAddress,
      dataMint:MintDataKey,
      faction:FactionKey,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      systemProgram: exe_sys_prog.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      metadataProgram: info.TOKEN_METADATA_PROGRAM_ID,
    }).instruction();
    transaction.add(tx);
    const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
    const faction_data = await program.account.faction.fetch(FactionKey) as Faction;
    console.log("Your transaction signature: ", txSignature);
    console.log("faction data:", faction_data);
  });

  it("should close faction reward successfully!", async () => {
    let transaction = new anchor.web3.Transaction();

    const coins = new BN(100);

    const [RoleKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("ROLE_SEED")],
      program.programId
    );
    const [FactionKey,bump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("FACTION_SEED"),Buffer.from(fid.toArray("le", 8))],
      program.programId
    );
    const tx = await program.methods.closeFactionReward(
      fid,
      bump
    ).accounts({
      authority:wallet.publicKey,
      role:RoleKey,
      faction:FactionKey,
      systemProgram: exe_sys_prog.programId,
    }).instruction();
    transaction.add(tx);
    const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
    const faction_data = await program.account.faction.fetch(FactionKey) as Faction;
    console.log("Your transaction signature: ", txSignature);
    console.log("faction data:", faction_data);
  });

  it("should Nft upgrate to wallet successfully!", async () => {
    let transaction = new anchor.web3.Transaction();

    const coins = new BN(100);

    const [TreasuryKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("TRESURE_SEED")],
      program.programId
    );

    const [FactionKey,bump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("FACTION_SEED"),Buffer.from(fid.toArray("le", 8))],
      program.programId
    );
    const [ClassKey] = await anchor.web3.PublicKey.findProgramAddress(
      [FactionKey.toBuffer(),Buffer.from(cid.toArray("le", 8))],
      program.programId
    );
    const [TraitKey] = await anchor.web3.PublicKey.findProgramAddress(
      [ClassKey.toBuffer(),Buffer.from(tid.toArray("le", 8))],
      program.programId
    );
    const [WalletKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("COIN_SEED"),wallet.publicKey.toBuffer()],
      program.programId
    );
    const MintTokenAccount = await getAssociatedTokenAddress(
      info.mint_address,
      wallet.publicKey
    );
    const [metadataAddress] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("metadata"),info.TOKEN_METADATA_PROGRAM_ID.toBuffer(),info.mint_address.toBuffer()],
      info.TOKEN_METADATA_PROGRAM_ID
    );
    const [MintDataKey] = await anchor.web3.PublicKey.findProgramAddress(
      [info.mint_address.toBuffer()],
      program.programId
    );

    const tx = await program.methods.upgrateNft(
      bump
    ).accounts({
      authority:wallet.publicKey,
      treasure:TreasuryKey,
      mint:info.mint_address,
      associated:MintTokenAccount,
      metadata:metadataAddress,
      wallet:WalletKey,
      dataMint:MintDataKey,
      faction:FactionKey,
      traits:TraitKey,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      systemProgram: exe_sys_prog.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      metadataProgram: info.TOKEN_METADATA_PROGRAM_ID,
    }).instruction();
    transaction.add(tx);
    const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
    const mint_data = await program.account.mintData.fetch(FactionKey) as MintData;
    console.log("Your transaction signature: ", txSignature);
    console.log("mint data:", mint_data);
  });
});
