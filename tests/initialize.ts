import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey,sendAndConfirmTransaction ,Connection, Keypair} from "@solana/web3.js";
import { Treasure,Role } from "./require"
import { Seternia } from "../target/types/seternia";
import { readContracts,readPrivateKeys } from "./start"

const info = {
  programId: new PublicKey("11111111111111111111111111111111"),
  role_address: new PublicKey("65ZmLNGUuGw9BMNeXvNZUS6mtDMgfbW1gX2RigobVqJw"),
  RuneKey: new PublicKey("3famTgp4zZyTYbSSLW44gKi5rqqBW98MQ6YTadwf7SvT"),
}

describe("seternia", () => {
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
  const NFT_COLLECTION = new anchor.web3.PublicKey(
    "ExFWcTTrFMkWc6XCyfPvSpdw8yVLb385ep8ctRvfVt62"
  );
  it("Is initialized!", async () => {
    let transaction = new anchor.web3.Transaction();
    const [TreasuryKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("TRESURE_SEED")],
      program.programId
    );
    const [RoleKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("ROLE_SEED")],
      program.programId
    );
    if(await con.getAccountInfo(TreasuryKey)==null){
      const main_collection = Keypair.generate().publicKey;
      const tx = await program.methods.initialize(
        main_collection,
        NFT_COLLECTION,
        RoleKey
      ).accounts({
        admin:wallet.publicKey,
        treasure:TreasuryKey,
        role:RoleKey,
        systemProgram:exe_sys_prog.programId
      }).instruction();
      transaction.add(tx);
      const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
      
      console.log("Your transaction signature: ", txSignature);
      const treasury_data = await program.account.treasure.fetch(TreasuryKey) as Treasure;
      console.log("treasury data:", treasury_data);
    }
  });

  

  it("should change admin successfully", async () => {
    let transaction = new anchor.web3.Transaction();
    const [TreasuryKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("TRESURE_SEED")],
      program.programId
    );
    const treasury_data = await program.account.treasure.fetch(TreasuryKey) as Treasure;
    if(await con.getAccountInfo(TreasuryKey)!=null 
    && treasury_data.admin.toString() == wallet.publicKey.toString()){
      const tx = await program.methods.changeAdmin(wallet.publicKey).accounts({
        admin:wallet.publicKey,
        treasure:TreasuryKey,
        systemProgram:exe_sys_prog.programId
      }).instruction();
      transaction.add(tx);
      const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
      
      console.log("Your transaction signature: ", txSignature);
      console.log("treasury data:", treasury_data);
    }
  });

  

  it("should change collection and metadata successfully", async () => {
    let transaction = new anchor.web3.Transaction();
    const [TreasuryKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("TRESURE_SEED")],
      program.programId
    );
    const [newMainCollection] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("collection")],
      program.programId
    );
    const treasury_data = await program.account.treasure.fetch(TreasuryKey) as Treasure;
    if(await con.getAccountInfo(TreasuryKey)!=null 
    && treasury_data.admin.toString() == wallet.publicKey.toString()){
      const newRuneCollection = info.RuneKey;

      const tx = await program.methods.changeCollection(newMainCollection,newRuneCollection).accounts({
        admin:wallet.publicKey,
        treasure:TreasuryKey,
        systemProgram:exe_sys_prog.programId
      }).instruction();
      transaction.add(tx);
      const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
      
      console.log("Your transaction signature: ", txSignature);
      console.log("treasury data:", treasury_data);
    }
  });

  

  it("should add role", async () => {
    let transaction = new anchor.web3.Transaction();
    const [TreasuryKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("TRESURE_SEED")],
      program.programId
    );
    const [RoleKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("ROLE_SEED")],
      program.programId
    );
    const treasury_data = await program.account.treasure.fetch(TreasuryKey) as Treasure;
    if(await con.getAccountInfo(TreasuryKey)!=null 
    && treasury_data.admin.toString() == wallet.publicKey.toString()){
      const tx = await program.methods.addRole(info.role_address).accounts({
        admin:wallet.publicKey,
        treasure:TreasuryKey,
        role:RoleKey,
        systemProgram:exe_sys_prog.programId
      }).instruction();
      transaction.add(tx);
      const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
      
      console.log("Your transaction signature: ", txSignature);
      const _data = await program.account.role.fetch(RoleKey) as Role;
      console.log(" Role data:", _data);
    }
  });

  it("should remove role", async () => {
    let transaction = new anchor.web3.Transaction();
    const [TreasuryKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("TRESURE_SEED")],
      program.programId
    );
    const [RoleKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("ROLE_SEED")],
      program.programId
    );
    const treasury_data = await program.account.treasure.fetch(TreasuryKey) as Treasure;
    if(await con.getAccountInfo(TreasuryKey)!=null 
    && treasury_data.admin.toString() == wallet.publicKey.toString()){
      const tx = await program.methods.rmvRole(info.role_address).accounts({
        admin:wallet.publicKey,
        treasure:TreasuryKey,
        role:RoleKey,
        systemProgram:exe_sys_prog.programId
      }).instruction();
      transaction.add(tx);
      const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
      
      console.log("Your transaction signature: ", txSignature);
      const _data = await program.account.role.fetch(RoleKey) as Role;
      console.log(" Role data:", _data);
    }
  });
});
