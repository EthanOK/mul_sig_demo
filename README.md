# Solana 离线签名

## partial sign

[RecentBlockhash](https://solana.com/docs/core/transactions#recent-blockhash)

交易的区块哈希有效期为 150 个区块，1 个区块通常会在 400-600ms 间波动，所以交易的区块 hash 的过期时间一般在 60-90 秒。

RecentBlockhash 对于交易来说是一个重要的值。如果您使用最近过期的区块哈希（150 个区块之后），您的交易将被拒绝.

[部分签署交易](https://solanacookbook.com/references/offline-transactions.html#partial-sign-transaction)

## Durable Nonce

使用 `Durable Nonce` 来获取一个永不过期的最近区块哈希。

> Create Nonce Account

> 1. 使用存储在 nonce 账户中的 nonce 作为最近的区块哈希。

> 2. 将 nonce advance 操作放在第一个指令中。

[durable-nonce](https://solanacookbook.com/references/offline-transactions.html#durable-nonce)
