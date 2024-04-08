import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID,ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, createInitializeMintInstruction, MINT_SIZE } from '@solana/spl-token';
import { PublicKey,sendAndConfirmTransaction,SystemProgram ,Connection,ComputeBudgetProgram} from "@solana/web3.js";
import { MintData } from "./require"
import { Seternia } from "../target/types/seternia";
import { readContracts,readPrivateKeys } from "./start"
import { BN } from "bn.js";
const info = {
  programId: new PublicKey("11111111111111111111111111111111"),
  TOKEN_METADATA_PROGRAM_ID: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
  RuneKey: new PublicKey("3eDcm2adhJ9KrJtdmh9K6jjoH3UDq2psgWPTcw7fBrZd"),
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
  const fid = new BN(1);
  const cid = new BN(1);
  const tid = new BN(1);
  const id = new BN(1);
  it("should mint and active NFT successfully!", async () => {
    let transaction = new anchor.web3.Transaction();
    let cump_limit = ComputeBudgetProgram.setComputeUnitLimit({ units: 1800_000 });
    const [TreasuryKey,bump] = await anchor.web3.PublicKey.findProgramAddress(
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
    const [TraitKey] = await anchor.web3.PublicKey.findProgramAddress(
      [ClassKey.toBuffer(),Buffer.from(tid.toArray("le", 8))],
      program.programId
    );

    const [CollectionKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("collection")],
      program.programId
    );
    const [CmetadataAddress] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("metadata"),info.TOKEN_METADATA_PROGRAM_ID.toBuffer(),CollectionKey.toBuffer()],
      info.TOKEN_METADATA_PROGRAM_ID
    );
    const [CmasterEdition] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        info.TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        CollectionKey.toBuffer(),
        Buffer.from("edition")
      ],
      info.TOKEN_METADATA_PROGRAM_ID
    );

    const RuneTokenAccount = await getAssociatedTokenAddress(
      info.RuneKey,
      wallet.publicKey
    );
    const [RmetadataAddress] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("metadata"),info.TOKEN_METADATA_PROGRAM_ID.toBuffer(),info.RuneKey.toBuffer()],
      info.TOKEN_METADATA_PROGRAM_ID
    );

    const [MintKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("mint"),Buffer.from(id.toArray("le", 8))],
      program.programId
    );
    const [MintDataKey] = await anchor.web3.PublicKey.findProgramAddress(
      [MintKey.toBuffer()],
      program.programId
    );
    const [metadataAddress] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("metadata"),info.TOKEN_METADATA_PROGRAM_ID.toBuffer(),MintKey.toBuffer()],
      info.TOKEN_METADATA_PROGRAM_ID
    );
    const [masterEdition] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        info.TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        MintKey.toBuffer(),
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
    const MintTokenAccount = await getAssociatedTokenAddress(
      MintKey,
      wallet.publicKey
    );
    if(await con.getAccountInfo(TreasuryKey)!=null){
      const txi = await program.methods.active().accounts({
        payer:wallet.publicKey,
        treasure:TreasuryKey,
        class:ClassKey,
        traits:TraitKey,
        dataMint:MintDataKey,
        mint:MintKey,
        associated:MintTokenAccount,
        metadata:metadataAddress,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: exe_sys_prog.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        metadataProgram: info.TOKEN_METADATA_PROGRAM_ID,
      }).instruction()
      const tx = await program.methods.mint(
        id,
        bump
      ).accounts({
        payer:wallet.publicKey,
        treasure:TreasuryKey,
        faction:FactionKey,
        class:ClassKey,
        traits:TraitKey,
        mint:MintKey,
        collectionMint:CollectionKey,
        runeMint:info.RuneKey,
        tokenAccount:MintTokenAccount,
        runeAccont:RuneTokenAccount,
        masterEditionAccount:masterEdition,
        collectionMasterEdition:CmasterEdition,
        nftMetadata:metadataAddress,
        collectionMetadata:CmetadataAddress,
        runeMetadata:RmetadataAddress,
        delegate:delegate,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: exe_sys_prog.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        metadataProgram: info.TOKEN_METADATA_PROGRAM_ID,
      }).instruction();
      transaction.add(tx).add(txi).add(cump_limit);
      const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
      
      console.log("Your transaction signature: ", txSignature);
      const mint_data = await program.account.mintData.fetch(MintDataKey) as MintData;
      console.log(" mint data:",  mint_data);
    }
  });
});
