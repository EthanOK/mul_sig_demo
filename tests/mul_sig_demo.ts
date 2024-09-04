import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MulSigDemo } from "../target/types/mul_sig_demo";
import {
  Transaction,
  PublicKey,
  Keypair,
  SystemProgram,
  NONCE_ACCOUNT_LENGTH,
  NonceAccount,
} from "@solana/web3.js";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { backSigner_publicKey, sendBack } from "./back";

describe("mul_sig_demo", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const wallet = anchor.AnchorProvider.env().wallet;

  const program = anchor.workspace.MulSigDemo as Program<MulSigDemo>;

  const provider = anchor.getProvider();

  const payer = Keypair.generate();

  const nonceAccount = Keypair.generate();

  it("Is requestAirdrop!", async () => {
    const s = await provider.connection.requestAirdrop(payer.publicKey, 10e9);
    await provider.connection.confirmTransaction(s);
  });

  it("Is off-chain signature: latestBlockhash", async () => {
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

    let transaction__backSign = Transaction.from(
      bs58.decode(serializedTransaction_backSign)
    );

    transaction__backSign = await wallet.signTransaction(transaction__backSign);

    // if payer is Keypair
    // transaction__backSign.partialSign(payer);

    // if sleep 100 s, Transaction simulation failed: Blockhash not found.
    // await new Promise((resolve) => setTimeout(resolve, 100000));

    const tx = await provider.connection.sendRawTransaction(
      transaction__backSign.serialize()
    );
    console.log("tx:", tx);
  });

  it("Is off-chain signature: Durable Nonce: Create Nonce Account", async () => {
    let transaction = new Transaction().add(
      // create nonce account
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: nonceAccount.publicKey,
        lamports: await provider.connection.getMinimumBalanceForRentExemption(
          NONCE_ACCOUNT_LENGTH
        ),
        space: NONCE_ACCOUNT_LENGTH,
        programId: SystemProgram.programId,
      }),
      // init nonce account
      SystemProgram.nonceInitialize({
        noncePubkey: nonceAccount.publicKey, // nonce account pubkey
        authorizedPubkey: payer.publicKey, // nonce account authority (for advance and close)
      })
    );

    const txhash = await provider.connection.sendTransaction(transaction, [
      payer,
      nonceAccount,
    ]);

    await provider.connection.confirmTransaction(txhash);

    console.log(`txhash: ${txhash}`);
  });

  it("Is off-chain signature: Durable Nonce", async () => {
    const accountInfo = await provider.connection.getAccountInfo(
      nonceAccount.publicKey
    );
    const nonceAccount_parsed = NonceAccount.fromAccountData(accountInfo.data);

    console.log(nonceAccount_parsed);

    const transaction = await program.methods
      .initialize()
      .accountsPartial({
        payer: payer.publicKey,
        backSigner: backSigner_publicKey,
      })
      .preInstructions([
        SystemProgram.nonceAdvance({
          noncePubkey: nonceAccount.publicKey,
          authorizedPubkey: payer.publicKey,
        }),
      ])
      .transaction();
    transaction.feePayer = payer.publicKey;
    transaction.recentBlockhash = nonceAccount_parsed.nonce;

    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
    });

    // send transaction to back get signer transaction
    const serializedTransaction_backSign = await sendBack(
      payer.publicKey.toBase58(),
      bs58.encode(serializedTransaction)
    );

    let transaction__backSign = Transaction.from(
      bs58.decode(serializedTransaction_backSign)
    );

    // transaction__backSign = await wallet.signTransaction(transaction__backSign);

    transaction__backSign.partialSign(payer);

    // console.log("transaction__backSign:", transaction__backSign);

    await new Promise((resolve) => setTimeout(resolve, 10000));

    const tx = await provider.connection.sendRawTransaction(
      transaction__backSign.serialize()
    );
    await provider.connection.confirmTransaction(tx);
    console.log("tx:", tx);


    const accountInfo_after = await provider.connection.getAccountInfo(
      nonceAccount.publicKey
    );
    const nonceAccount_parsed_after = NonceAccount.fromAccountData(accountInfo_after.data);

    console.log(nonceAccount_parsed_after);
  });
});
