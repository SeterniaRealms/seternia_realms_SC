import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Seternia } from "../target/types/seternia";
import { PublicKey,Keypair,Connection,sendAndConfirmTransaction, Transaction, SystemProgram } from "@solana/web3.js";
import { readFileSync ,writeFileSync } from 'fs';

describe("seternia", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const connection = new Connection("https://api.devnet.solana.com");
  const pwallet = anchor.Wallet.local().payer;

  const program = anchor.workspace.seternia as Program<Seternia>
  //const con = new Connection("http://127.0.0.1:8899");
  const sol_drop = false;
  it("Is deploy!", async () => {
      const contractAddressFilePath = "contract.txt";
      writeFileSync(contractAddressFilePath, program.programId.toString());
      const contractAddressFile = readContracts("contract.txt")[0];
      if (program.programId.toString() == contractAddressFile){
        console.log("File Contract address: ",new PublicKey(contractAddressFile).toString());
      }
  });
  it("Sol Drop!", async () => {
    if (sol_drop){
        const wallets = readPrivateKeys("private_keys.txt");
        const quantity = 500000000;
        const transaction = new Transaction();
        for (const wallet of wallets) {
        transaction.add(
            SystemProgram.transfer({
            fromPubkey: pwallet.publicKey,
            toPubkey: wallet.publicKey,
            lamports: quantity,
            })
        );
      }
      const signature = await sendAndConfirmTransaction(connection,transaction,[pwallet], { skipPreflight: true });
      console.log(`Transaction Sol Drop: ${signature}`);
    }
});
});
export function readContracts(filePath: string): string[] {
  const privateKeysString = readFileSync(filePath, 'utf-8');
  return privateKeysString.split('\n').map(line => line.trim()).filter(line => line.length > 0);
}
export function readPrivateKeys(filePath: string): Keypair[] {
  const privateKeysString = readFileSync(filePath, 'utf-8');
  const privateKeys = privateKeysString.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  return privateKeys.map(privateKey => {
    const privateKeyBytes = Buffer.from(privateKey, 'hex');
    return Keypair.fromSecretKey(privateKeyBytes);
  });
}
