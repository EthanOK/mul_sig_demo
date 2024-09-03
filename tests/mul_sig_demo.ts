import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MulSigDemo } from "../target/types/mul_sig_demo";
import { Transaction, PublicKey, Keypair } from "@solana/web3.js";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { backSigner_publicKey, sendBack } from "./back";

describe("mul_sig_demo", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.MulSigDemo as Program<MulSigDemo>;

  const provider = anchor.getProvider();

  it("Is mul sig", async () => {
    // Add your test here.
    const { blockhash } = await provider.connection.getLatestBlockhash();

    const transaction = await program.methods
      .initialize()
      .accountsPartial({
        payer: provider.publicKey,
        backSigner: backSigner_publicKey,
      })
      .transaction();
    transaction.feePayer = provider.publicKey;
    transaction.recentBlockhash = blockhash;

    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
    });

    // send transaction to back get signer transaction
    const serializedTransaction_backSign = await sendBack(
      provider.publicKey.toBase58(),
      bs58.encode(serializedTransaction)
    );

    const transaction__backSign = Transaction.from(
      bs58.decode(serializedTransaction_backSign)
    );
    const tx = await provider.sendAndConfirm(transaction__backSign);
    console.log("tx:", tx);
  });
});
