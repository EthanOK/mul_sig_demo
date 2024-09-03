import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

let backSigner = Keypair.fromSecretKey(
  new Uint8Array([
    90, 128, 210, 226, 64, 203, 165, 80, 41, 66, 156, 246, 166, 115, 157, 106,
    82, 89, 169, 39, 30, 244, 63, 22, 168, 217, 184, 186, 48, 225, 201, 242, 17,
    156, 50, 50, 95, 249, 208, 97, 125, 161, 51, 184, 198, 99, 200, 137, 82, 59,
    106, 33, 249, 30, 57, 53, 110, 103, 72, 10, 129, 46, 135, 249,
  ])
);

export const backSigner_publicKey = backSigner.publicKey;
export const sendBack = async (
  payer: string,
  serializedTransaction: string
): Promise<string> => {
  const transaction = Transaction.from(bs58.decode(serializedTransaction));
  // 验证 payer token 是否正确
  if (transaction.feePayer.toBase58() !== new PublicKey(payer).toBase58()) {
    throw new Error("Invalid payer");
  }
  // 验证交易信息

  // 后端 签名
  transaction.partialSign(backSigner);

  return bs58.encode(
    transaction.serialize({
      requireAllSignatures: false,
    })
  );
};
