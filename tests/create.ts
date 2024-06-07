import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID,ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, createInitializeMintInstruction, MINT_SIZE } from '@solana/spl-token';
import { PublicKey,sendAndConfirmTransaction,SystemProgram ,Connection,ComputeBudgetProgram} from "@solana/web3.js";
import { Faction, Class, Traits, Race } from "./require"
import { Seternia } from "../target/types/seternia";
import { readContracts,readPrivateKeys } from "./start"
import { BN } from "bn.js";
const info = {
  programId: new PublicKey("11111111111111111111111111111111"),
  TOKEN_METADATA_PROGRAM_ID: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
}

describe("seternia", () => {
  console.log(TOKEN_PROGRAM_ID.toString())
  const TOKEN_OUT = new anchor.web3.PublicKey(
    "J8q6ejoQfCDbJUiSq7WC6LrAUAPPApi2tRqQEnBp8E73"
  );
  const con = new Connection("https://api.devnet.solana.com");
  const provider = anchor.AnchorProvider.env();
  const wallet = 
  //readPrivateKeys("private_keys.txt")[0];
  anchor.Wallet.local().payer;
  info.programId = new PublicKey(readContracts("contract.txt")[0]);
  anchor.setProvider(provider);
  const program = new Program(require("../target/idl/seternia.json"), info.programId,provider);
  //const program = anchor.workspace.seternia as Program<Seternia>
  const exe_sys_prog = anchor.web3.SystemProgram;
  //const con = new Connection("http://127.0.0.1:8899");
  const fid = new BN(1);
  const cid = new BN(1);
  const rid = new BN(1);
  const tid = new BN(1);
  const fstr = "Silver Flame";
  const title = "Bonk Swordsman";
  const name:String = "Seternia"
  const uri: String = "https://aquamarine-elaborate-cuckoo-625.mypinata.cloud/ipfs/QmWrZJsMxVCgQtnvVea8nQF6peaTyvwxNGdzXxtHGfXgCQ"
  const symbol: String = "BSTR"
  const Swordsman = "https://aquamarine-elaborate-cuckoo-625.mypinata.cloud/ipfs/QmPAGLzekzMbzkW5CAsVxat6dEHMxRgWbgmAiL533NgXVz";
  it("should create faction successfully!", async () => {
    let transaction = new anchor.web3.Transaction();
    const [TreasuryKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("TRESURE_SEED")],
      program.programId
    );
    const [FactionKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("FACTION_SEED"),Buffer.from(fid.toArray("le", 8))],
      program.programId
    );
    if(await con.getAccountInfo(TreasuryKey)!=null){
      const tx = await program.methods.createFaction(
        fid,
        fstr
      ).accounts({
        admin:wallet.publicKey,
        treasure:TreasuryKey,
        faction:FactionKey,
        systemProgram:exe_sys_prog.programId
      }).instruction();
      transaction.add(tx);
      const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
      
      console.log("Your transaction signature: ", txSignature);
      const faction_data = await program.account.faction.fetch(FactionKey) as Faction;
      console.log("faction data:", faction_data);
    }
  });

  it("should create class successfully!", async () => {
    
    let transaction = new anchor.web3.Transaction();
    const [TreasuryKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("TRESURE_SEED")],
      program.programId
    );
    const [FactionKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("FACTION_SEED"),Buffer.from(fid.toArray("le", 8))],
      program.programId
    );
    const [ClassKey] = await anchor.web3.PublicKey.findProgramAddress(
      [FactionKey.toBuffer(),Buffer.from(cid.toArray("le", 8))],
      program.programId
    );
    if(await con.getAccountInfo(TreasuryKey)!=null){
      const tx = await program.methods.createClass(
        cid,
        title,
        "STR"
      ).accounts({
        admin:wallet.publicKey,
        treasure:TreasuryKey,
        faction:FactionKey,
        class:ClassKey,
        systemProgram:exe_sys_prog.programId
      }).instruction();
      transaction.add(tx);
      const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
      
      console.log("Your transaction signature: ", txSignature);
      const class_data = await program.account.class.fetch(ClassKey) as Class;
      console.log("class data:", class_data);
    }
  });

  it("should create race successfully!", async () => {
    let transaction = new anchor.web3.Transaction();
    const [TreasuryKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("TRESURE_SEED")],
      program.programId
    );
    const [FactionKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("FACTION_SEED"),Buffer.from(fid.toArray("le", 8))],
      program.programId
    );
    const [ClassKey] = await anchor.web3.PublicKey.findProgramAddress(
      [FactionKey.toBuffer(),Buffer.from(cid.toArray("le", 8))],
      program.programId
    );
    const [RaceKey] = await anchor.web3.PublicKey.findProgramAddress(
      [ClassKey.toBuffer(),Buffer.from(rid.toArray("le", 8))],
      program.programId
    );
    if(await con.getAccountInfo(TreasuryKey)!=null){
      const tx = await program.methods.createRace(
        rid,
        new BN(300),
        "Bonk",
        TOKEN_OUT,
        new BN(3000000000000),
      ).accounts({
        admin:wallet.publicKey,
        treasure:TreasuryKey,
        class:ClassKey,
        race:RaceKey,
        systemProgram:exe_sys_prog.programId
      }).instruction();
      transaction.add(tx);
      const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
      
      console.log("Your transaction signature: ", txSignature);
      const race_data = await program.account.race.fetch(RaceKey) as Race;
      console.log("race data:", race_data);
    }
  });

  it("should create trait successfully!", async () => {
    let transaction = new anchor.web3.Transaction();
    const [TreasuryKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("TRESURE_SEED")],
      program.programId
    );
    const [FactionKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("FACTION_SEED"),Buffer.from(fid.toArray("le", 8))],
      program.programId
    );
    const [ClassKey] = await anchor.web3.PublicKey.findProgramAddress(
      [FactionKey.toBuffer(),Buffer.from(cid.toArray("le", 8))],
      program.programId
    );
    const [RaceKey] = await anchor.web3.PublicKey.findProgramAddress(
      [ClassKey.toBuffer(),Buffer.from(rid.toArray("le", 8))],
      program.programId
    );
    const [TraitKey] = await anchor.web3.PublicKey.findProgramAddress(
      [RaceKey.toBuffer(),Buffer.from(tid.toArray("le", 8))],
      program.programId
    );
    if(await con.getAccountInfo(TreasuryKey)!=null){
      const tx = await program.methods.createTrait(
        tid,
        new BN(0),
        new BN(0),
        Swordsman
      ).accounts({
        admin:wallet.publicKey,
        treasure:TreasuryKey,
        race:RaceKey,
        traits:TraitKey,
        systemProgram:exe_sys_prog.programId
      }).instruction();
      transaction.add(tx);
      const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
      
      console.log("Your transaction signature: ", txSignature);
      const trait_data = await program.account.traits.fetch(TraitKey) as Traits;
      console.log("trait data:", trait_data);
    }
  });

  it("should mint collection successfully!", async () => {
    let transaction = new anchor.web3.Transaction();
    let cump_limit = ComputeBudgetProgram.setComputeUnitLimit({ units: 800_000 });
    const [TreasuryKey,bump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("TRESURE_SEED")],
      program.programId
    );
    const [CollectionKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("collection")],
      program.programId
    );
    const CollectionTokenAccount = await getAssociatedTokenAddress(
      CollectionKey,
      wallet.publicKey
    );

    const [metadataAddress] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("metadata"),info.TOKEN_METADATA_PROGRAM_ID.toBuffer(),CollectionKey.toBuffer()],
      info.TOKEN_METADATA_PROGRAM_ID
    );
    const [masterEdition] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        info.TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        CollectionKey.toBuffer(),
        Buffer.from("edition")
      ],
      info.TOKEN_METADATA_PROGRAM_ID
    );
    const [delegate] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        info.TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        CollectionKey.toBuffer(),
        Buffer.from("collection_authority"),
        TreasuryKey.toBuffer()
      ],
      info.TOKEN_METADATA_PROGRAM_ID
    );

    if(await con.getAccountInfo(TreasuryKey)!=null){
      const tx = await program.methods.mintCollection(
        name,
        uri,
        symbol,
        bump
      ).accounts({
        admin:wallet.publicKey,
        treasure:TreasuryKey,
        mint:CollectionKey,
        tokenAccount:CollectionTokenAccount,
        masterEditionAccount:masterEdition,
        nftMetadata:metadataAddress,
        delegate:delegate,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: exe_sys_prog.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        metadataProgram: info.TOKEN_METADATA_PROGRAM_ID,
      }).instruction();
      transaction.add(tx).add(cump_limit);
      const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
      
      console.log("Your transaction signature: ", txSignature);
    }
  });
});
