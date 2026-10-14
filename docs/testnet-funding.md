# Check test gas

Run the read-only funding check with the intended public address:

```sh
node scripts/check-payout-test-funding.mjs robinhood-testnet "$BASE_TEST_ADDRESS"
node scripts/check-payout-test-funding.mjs base-sepolia "$BASE_TEST_ADDRESS"
node scripts/check-payout-test-funding.mjs solana-devnet "$SOLANA_TEST_ADDRESS"
node scripts/check-payout-test-funding.mjs solana-testnet "$SOLANA_TEST_ADDRESS"
```

An optional third argument selects an HTTPS RPC URL. Use a public URL without
credentials. The command checks the EVM chain ID or Solana genesis hash before
reading a finalized balance. Mainnet network names are rejected. It neither
reads signing keys nor requests funds, signs, or broadcasts a transaction.

JSON output reports the integer balance as a decimal string (`wei` or
`lamports`), the finalized block or slot, and `nonzero`. A zero balance is a
successful observation, not an RPC error. Exit code 1 means the check failed;
do not treat that result as zero or funded. A nonzero balance proves gas is
present but does not prove it covers deployment costs. This command does not
check test USDC or other token balances.

For a later funding recheck, rerun the same command with the same public address
and network. Never change addresses to evade faucet cooldowns or verification.

Solana deployment also needs program and buffer rent. Budget approximately
6 SOL for a deployment rehearsal, then confirm the current rent and transaction
estimate before deployment. A few lamports do not meet that budget. Devnet USDC
is a separate token; Solana testnet uses an explicitly reviewed custom test mint
because it has no canonical Circle USDC faucet asset.

## Robinhood Chain testnet

Reuse the dedicated Base test payer for Robinhood test gas. Keep it separate
from production deployer and fee wallets. The official network has chain ID
46630 (`0xb626`), RPC `https://rpc.testnet.chain.robinhood.com`, and explorer
`https://explorer.testnet.chain.robinhood.com`. ETH pays testnet gas.

Request free test tokens through the [official faucet](https://faucet.testnet.chain.robinhood.com/).
The faucet advertises 0.01 test ETH and five of each supported test stock token
per request, once per 24 hours. Respect its authentication and cooldown rules.
A submitted request is not proof of receipt: run the funding check above and
verify the faucet transaction on the testnet explorer. Do not substitute stock
tokens for the project's reviewed reward asset or treat them as USDC.

The funding checker reads public data only. It checks chain identity before
reading a finalized, block-bound balance. It does not enable Robinhood in the
payment registry, authorize a fee, deploy contracts, or prove an end-to-end
payment. TOK-01–06 and MVP-07b still require the full implementation and chain
acceptance evidence. [Official network configuration](https://docs.robinhood.com/chain/connecting/).
