/** Real Anvil transactions, deploys the compiled escrow and test asset. Run with Bun. */
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { encodeDeployData } from "viem";
import {
  baseAwardId,
  buildBindCalldata,
  buildCancelBindingCalldata,
  buildClaimFeesCalldata,
  buildCommitAwardCalldata,
  buildDepositCalldata,
  buildPayCalldata,
  buildWithdrawCalldata,
  verifyBinding,
  verifyPayment,
  verifyReserve,
} from "./adapter";

const root = fileURLToPath(new URL(".", import.meta.url));
const rpcUrl = "http://127.0.0.1:18546";
const chainId = BigInt(process.env.EVM_INTEGRATION_CHAIN_ID ?? "31337");
if (![31337n, 46630n].includes(chainId))
  throw new Error(
    "Integration supports local or Robinhood testnet chain identity only",
  );
const anvil = spawn(
  "anvil",
  ["--port", "18546", "--chain-id", String(chainId), "--silent"],
  {
    stdio: "ignore",
  },
);
const owner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const attester = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const recipient = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
const fee = "0x0000000000000000000000000000000000000fee";
const projectId = `0x${"1".padStart(64, "0")}`;
const source = `0x${"2".padStart(64, "0")}`;
const delay = "3600";
async function rpc(method: string, params: unknown[]) {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const body = await response.json();
  if (body.error) throw new Error(JSON.stringify(body.error));
  return body.result;
}
function deploy(contract: string, args: string[] = []) {
  const output = execFileSync(
    "forge",
    [
      "create",
      "--root",
      root,
      contract,
      "--rpc-url",
      rpcUrl,
      "--unlocked",
      "--from",
      owner,
      "--broadcast",
      "--json",
      ...(args.length ? ["--constructor-args", ...args] : []),
    ],
    { encoding: "utf8" },
  );
  return JSON.parse(output).deployedTo as string;
}
async function send(
  to: string,
  signature: string,
  args: string[],
  from = owner,
) {
  const data = execFileSync("cast", ["calldata", signature, ...args], {
    encoding: "utf8",
  }).trim();
  const tx = await rpc("eth_sendTransaction", [
    { from, to, data, gas: "0x7a1200" },
  ]);
  await rpc("anvil_mine", ["0x1"]);
  return tx as string;
}
try {
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt++) {
    if (anvil.exitCode !== null)
      throw new Error("Isolated Anvil could not start");
    try {
      await rpc("eth_chainId", []);
      ready = true;
      break;
    } catch {
      await Bun.sleep(50);
    }
  }
  assert(ready, "Anvil startup");
  const token = deploy("integration/TestDollar.sol:TestDollar");
  const vault = deploy("src/ProjectEscrow.sol:ProjectEscrow", [
    projectId,
    token,
    owner,
    owner,
    fee,
    attester,
    delay,
  ]);
  const id = baseAwardId(chainId, vault, source);
  await send(token, "mint(address,uint256)", [owner, "110000000"]);
  await send(token, "approve(address,uint256)", [vault, "110000000"]);
  await rpc("eth_sendTransaction", [
    {
      from: owner,
      to: vault,
      gas: "0x7a1200",
      data: buildDepositCalldata("110000000"),
    },
  ]);
  await rpc("anvil_mine", ["0x1"]);
  const reserveTx = (await rpc("eth_sendTransaction", [
    {
      from: owner,
      to: vault,
      gas: "0x7a1200",
      data: buildCommitAwardCalldata({
        obligationId: id,
        githubUserId: "101",
        grossMicro: "100000000",
        sourceDigest: source,
      }),
    },
  ])) as string;
  await rpc("anvil_mine", ["0x1"]);
  const runtimeCode = (await rpc("eth_getCode", [vault, "latest"])) as string;
  const config = {
    rpcUrl,
    chainId,
    vault,
    asset: token,
    owner,
    identityAuthority: attester,
    feeRecipient: fee,
    codeSha256: createHash("sha256")
      .update(Buffer.from(runtimeCode.slice(2), "hex"))
      .digest("hex"),
    bindingDelaySeconds: delay,
  };
  await assert.rejects(
    verifyReserve(config, reserveTx, 0, id),
    /not finalized/,
  );
  await rpc("anvil_mine", ["0x40"]);
  await assert.rejects(
    verifyReserve({ ...config, asset: owner }, reserveTx, 0, id),
    /asset or authority/,
  );
  await assert.rejects(
    verifyReserve({ ...config, codeSha256: "f".repeat(64) }, reserveTx, 0, id),
    /runtime code/,
  );
  await assert.rejects(
    verifyReserve({ ...config, bindingDelaySeconds: "0" }, reserveTx, 0, id),
    /binding delay/,
  );
  const reservation = await verifyReserve(config, reserveTx, 0, id);
  assert.equal(reservation.githubUserId, "101");
  assert.equal(reservation.grossMicro, "100000000");
  assert.equal(reservation.feeMicro, "2000000");
  assert.equal(reservation.sourceDigest, source);
  await assert.rejects(
    verifyReserve({ ...config, chainId: 84532n }, reserveTx, 0, id),
    /Wrong chain/,
  );
  await assert.rejects(
    verifyReserve({ ...config, vault: token }, reserveTx, 0, id),
    /deployment/,
  );
  await assert.rejects(
    verifyReserve(config, reserveTx, 0, source),
    /Wrong event/,
  );
  await assert.rejects(verifyReserve(config, reserveTx, 1, id), /event index/);
  const bindingTx = await rpc("eth_sendTransaction", [
    {
      from: attester,
      to: vault,
      gas: "0x7a1200",
      data: buildBindCalldata({
        githubUserId: "101",
        destination: recipient,
        expectedVersion: "0",
        claimDigest: source,
        expiresAt: "18446744073709551615",
      }),
    },
  ]);
  await rpc("anvil_mine", ["0x1"]);
  await assert.rejects(
    verifyBinding(config, bindingTx, 0, "101"),
    /not finalized/,
  );
  await rpc("anvil_mine", ["0x40"]);
  const binding = await verifyBinding(config, bindingTx, 0, "101");
  assert.equal(binding.destination, recipient.toLowerCase());
  assert.equal(binding.bindingVersion, "1");
  assert.equal(binding.claimDigest, source);
  assert.ok(BigInt(binding.activatesAt) > 0n);
  await assert.rejects(verifyBinding(config, bindingTx, 0, "202"), /identity/);
  // A pending binding cannot pay; the owner can still cancel it.
  const early = await rpc("eth_sendTransaction", [
    {
      from: recipient,
      to: vault,
      gas: "0x7a1200",
      data: buildPayCalldata(id, binding.bindingVersion),
    },
  ]);
  await rpc("anvil_mine", ["0x1"]);
  assert.equal(
    ((await rpc("eth_getTransactionReceipt", [early])) as { status: string })
      .status,
    "0x0",
  );
  const cancelTx = await rpc("eth_sendTransaction", [
    {
      from: owner,
      to: vault,
      gas: "0x7a1200",
      data: buildCancelBindingCalldata("101", "1"),
    },
  ]);
  await rpc("anvil_mine", ["0x1"]);
  assert.equal(
    ((await rpc("eth_getTransactionReceipt", [cancelTx])) as { status: string })
      .status,
    "0x1",
  );
  await rpc("eth_sendTransaction", [
    {
      from: attester,
      to: vault,
      gas: "0x7a1200",
      data: buildBindCalldata({
        githubUserId: "101",
        destination: recipient,
        expectedVersion: "1",
        claimDigest: source,
        expiresAt: "18446744073709551615",
      }),
    },
  ]);
  await rpc("evm_increaseTime", [Number(delay)]);
  await rpc("anvil_mine", ["0x1"]);
  const paymentTx = await rpc("eth_sendTransaction", [
    {
      from: recipient,
      to: vault,
      gas: "0x7a1200",
      data: buildPayCalldata(id, "2"),
    },
  ]);
  await rpc("anvil_mine", ["0x1"]);
  await assert.rejects(
    verifyPayment(config, paymentTx, 0, id),
    /not finalized/,
  );
  await rpc("anvil_mine", ["0x40"]);
  await rpc("eth_sendTransaction", [
    {
      from: owner,
      to: vault,
      gas: "0x7a1200",
      data: buildWithdrawCalldata("10000000"),
    },
  ]);
  await rpc("anvil_mine", ["0x1"]);
  const refunded = execFileSync(
    "cast",
    ["call", token, "balanceOf(address)(uint256)", owner, "--rpc-url", rpcUrl],
    { encoding: "utf8" },
  ).trim();
  assert.equal(refunded.split(" ")[0], "9000000");
  const payment = await verifyPayment(config, paymentTx, 0, id);
  assert.equal(payment.destination, recipient.toLowerCase());
  assert.equal(payment.bindingVersion, "2");
  assert.equal(payment.grossMicro, "100000000");
  assert.equal(payment.feeMicro, "2000000");
  assert.equal(payment.netMicro, "98000000");
  const recipientBalance = execFileSync(
    "cast",
    [
      "call",
      token,
      "balanceOf(address)(uint256)",
      recipient,
      "--rpc-url",
      rpcUrl,
    ],
    { encoding: "utf8" },
  ).trim();
  assert.equal(recipientBalance.split(" ")[0], "98000000");
  // Fees accrue in the vault and anyone can move them to the fee recipient.
  await rpc("eth_sendTransaction", [
    {
      from: recipient,
      to: vault,
      gas: "0x7a1200",
      data: buildClaimFeesCalldata(),
    },
  ]);
  await rpc("anvil_mine", ["0x1"]);
  const feeBalance = execFileSync(
    "cast",
    ["call", token, "balanceOf(address)(uint256)", fee, "--rpc-url", rpcUrl],
    { encoding: "utf8" },
  ).trim();
  assert.equal(feeBalance.split(" ")[0], "3000000");
  await assert.rejects(
    verifyReserve(config, paymentTx, 0, id),
    /Wrong event topics/,
  );
  // A separate vault sends only collected fees to the converter. Real Uniswap
  // bytecode and funded liquidity exercise failure and retry after a real payout.
  function deployArtifact(path: string, args: unknown[]) {
    const artifact = JSON.parse(readFileSync(path, "utf8"));
    const data = encodeDeployData({
      abi: artifact.abi,
      bytecode: `0x${artifact.bytecode.replace(/^0x/, "")}`,
      args,
    });
    const receipt = JSON.parse(
      execFileSync(
        "cast",
        [
          "send",
          "--rpc-url",
          rpcUrl,
          "--unlocked",
          "--from",
          owner,
          "--json",
          "--create",
          data,
        ],
        { encoding: "utf8" },
      ),
    );
    assert.equal(receipt.status, "0x1");
    return receipt.contractAddress as string;
  }
  function call(to: string, signature: string, args: string[] = []) {
    return execFileSync(
      "cast",
      ["call", to, signature, ...args, "--rpc-url", rpcUrl],
      { encoding: "utf8" },
    )
      .trim()
      .split(" ")[0];
  }
  async function transactionStatus(tx: string) {
    return (
      (await rpc("eth_getTransactionReceipt", [tx])) as { status: string }
    ).status;
  }
  const outputToken = deploy("integration/TestDollar.sol:TestDollar");
  const dexFactory = deployArtifact(
    "node_modules/@uniswap/v2-core/build/UniswapV2Factory.json",
    [owner],
  );
  const weth = deployArtifact(
    "node_modules/@uniswap/v2-periphery/build/WETH9.json",
    [],
  );
  const router = deployArtifact(
    "node_modules/@uniswap/v2-periphery/build/UniswapV2Router02.json",
    [dexFactory, weth],
  );
  const converter = deploy("src/FeeConverter.sol:FeeConverter", [
    token,
    outputToken,
    router,
    fee,
    owner,
  ]);
  for (const asset of [token, outputToken]) {
    await send(asset, "mint(address,uint256)", [owner, "1000000000"]);
    await send(asset, "approve(address,uint256)", [router, "1000000000"]);
  }
  const expiry = "18446744073709551615";
  assert.equal(
    await transactionStatus(
      await send(
        router,
        "addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256)",
        [
          token,
          outputToken,
          "1000000000",
          "1000000000",
          "1000000000",
          "1000000000",
          owner,
          expiry,
        ],
      ),
    ),
    "0x1",
  );
  const retryVault = deploy("src/ProjectEscrow.sol:ProjectEscrow", [
    projectId,
    token,
    owner,
    owner,
    converter,
    attester,
    "0",
  ]);
  await send(token, "approve(address,uint256)", [retryVault, "1000000"]);
  assert.equal(
    await transactionStatus(
      await send(retryVault, "deposit(uint64)", ["1000000"]),
    ),
    "0x1",
  );
  const retrySource = `0x${"3".padStart(64, "0")}`;
  const retryAward = baseAwardId(chainId, retryVault, retrySource);
  await send(retryVault, "commitAward(bytes32,uint64,uint64,bytes32)", [
    retryAward,
    "101",
    "1000000",
    retrySource,
  ]);
  await send(
    retryVault,
    "bindDestination(uint64,address,uint64,bytes32,uint64)",
    ["101", recipient, "0", retrySource, expiry],
    attester,
  );
  const beforeNet = BigInt(
    call(token, "balanceOf(address)(uint256)", [recipient]),
  );
  assert.equal(
    await transactionStatus(
      await send(
        retryVault,
        "pay(bytes32,uint64)",
        [retryAward, "1"],
        recipient,
      ),
    ),
    "0x1",
  );
  const paidNet = BigInt(
    call(token, "balanceOf(address)(uint256)", [recipient]),
  );
  assert.equal(paidNet - beforeNet, 980000n);
  await send(retryVault, "claimFees()", []);
  assert.equal(
    call(token, "balanceOf(address)(uint256)", [converter]),
    "20000",
  );
  assert.equal(
    await transactionStatus(
      await send(
        converter,
        "approveConversion(uint256,uint256,uint256)",
        ["20000", "1000000000000", expiry],
        recipient,
      ),
    ),
    "0x0",
  );
  assert.equal(
    await transactionStatus(
      await send(converter, "approveConversion(uint256,uint256,uint256)", [
        "20000",
        "1000000000000",
        expiry,
      ]),
    ),
    "0x1",
  );
  assert.equal(
    await transactionStatus(
      await send(converter, "execute(uint256)", ["1"], recipient),
    ),
    "0x0",
  );
  assert.equal(call(converter, "pendingOrderId()(uint256)"), "1");
  assert.equal(
    call(token, "balanceOf(address)(uint256)", [converter]),
    "20000",
  );
  assert.equal(
    call(token, "allowance(address,address)(uint256)", [converter, router]),
    "0",
  );
  assert.equal(
    BigInt(call(token, "balanceOf(address)(uint256)", [recipient])),
    paidNet,
  );
  // An expired quote must retain the exact fee order for a later retry.
  const latestBlock = await rpc("eth_getBlockByNumber", ["latest", false]);
  const shortExpiry = BigInt(latestBlock.timestamp) + 60n;
  assert.equal(
    await transactionStatus(
      await send(converter, "requote(uint256,uint256,uint256)", [
        "1",
        "15000",
        shortExpiry.toString(),
      ]),
    ),
    "0x1",
  );
  await rpc("evm_setNextBlockTimestamp", [Number(shortExpiry + 1n)]);
  assert.equal(
    await transactionStatus(
      await send(converter, "execute(uint256)", ["1"], recipient),
    ),
    "0x0",
  );
  assert.equal(call(converter, "pendingOrderId()(uint256)"), "1");
  assert.equal(
    call(token, "balanceOf(address)(uint256)", [converter]),
    "20000",
  );
  assert.equal(
    await transactionStatus(
      await send(converter, "requote(uint256,uint256,uint256)", [
        "1",
        "15000",
        expiry,
      ]),
    ),
    "0x1",
  );
  assert.equal(
    await transactionStatus(
      await send(converter, "execute(uint256)", ["1"], recipient),
    ),
    "0x1",
  );
  assert.equal(call(converter, "pendingOrderId()(uint256)"), "0");
  assert.equal(call(converter, "totalInputConverted()(uint256)"), "20000");
  const received = BigInt(
    call(outputToken, "balanceOf(address)(uint256)", [fee]),
  );
  assert(received >= 15000n);
  assert.equal(
    BigInt(call(converter, "totalUsdcReceived()(uint256)")),
    received,
  );
  assert.equal(
    call(token, "allowance(address,address)(uint256)", [converter, router]),
    "0",
  );
  assert.equal(
    await transactionStatus(
      await send(converter, "execute(uint256)", ["1"], recipient),
    ),
    "0x0",
  );
  assert.equal(
    await transactionStatus(
      await send(
        retryVault,
        "pay(bytes32,uint64)",
        [retryAward, "1"],
        recipient,
      ),
    ),
    "0x0",
  );
  assert.equal(
    BigInt(call(token, "balanceOf(address)(uint256)", [recipient])),
    paidNet,
  );
  console.log(
    "Fee conversion passed: real Uniswap liquidity, paid contributor, failed swap and expired quote retained, successful retry, exact fee debit/output credit, zero residual approval, payout and swap replay rejected.",
  );
  console.log(
    "Base adapter integration passed: real deployment, vault-bound award, delayed and cancellable binding, payment, fee claim, finalized gating, wrong chain/vault/award/index/delay rejection.",
  );
} finally {
  anvil.kill("SIGTERM");
}
