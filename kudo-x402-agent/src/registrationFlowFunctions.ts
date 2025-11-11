import {
  type Action,
  type ActionResult,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  ModelType,
  type State,
  createMessageMemory,
  logger,
} from "@elizaos/core";

import { registryABI } from "./registryABI";
import { http } from "viem";

import { Address, createWalletClient, createPublicClient } from "viem";
import { APIResponse } from "./actions";
import { proveIncomeABI } from "./actions/proveIncomeABI";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { validationRegistryABI } from "./validationRegistryABI";
import { ValidationRequestParams } from "./types";

export function getProveIncomeParameters(response: APIResponse) {
  const receipts = [];
  const vs = [];
  const rs = [];
  const ss = [];

  for (const receipt of response.receipts) {
    const createdAtTimestamp = BigInt(
      Math.floor(new Date(receipt.createdAt).getTime()),
    );

    receipts.push({
      fromAddress: receipt.fromAddress as Address,
      toAddress: receipt.toAddress as Address,
      chainId: BigInt(receipt.chainId),
      txHash: receipt.txHash as Address,
      createdAt: createdAtTimestamp,
      amountUSDC: BigInt(receipt.amountUSDC),
      fileURI: receipt.fileURI || "",
      nonce: BigInt(receipt.nonce),
    });

    vs.push(receipt.facilitatorSignature.v);
    rs.push(receipt.facilitatorSignature.r as Address);
    ss.push(receipt.facilitatorSignature.s as Address);
  }

  return {
    receipts,
    vs,
    rs,
    ss,
  };
}

export async function proveIncomeFunction(agentId: String) {
  logger.info(`Proving Income records... for ${agentId}`);
  const URL = `http://kudo-402-payment-receipts-server-production.up.railway.app/get_payment_receipts/${agentId}`; // Need to update the URL here.
  const response = await fetch(URL, {
    method: "GET",
  });

  const data = (await response.json()) as APIResponse;

  if (!data.receipts.length) {
    logger.info("No Income Records found...");
    return { success: true };
  }

  logger.info("Successfully called API to obtain income");
  const { receipts, vs, rs, ss } = getProveIncomeParameters(data);
  const walletClient = createWalletClient({
    account: process.env.PRIVATE_KEY as Address,
    chain: baseSepolia,
    transport: http(process.env.RPC_ENDPOINT),
  });

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(process.env.RPC_ENDPOINT),
  });

  const { result, request } = await publicClient.simulateContract({
    address: process.env.INCOME_CONTRACT_ADDR as Address,
    abi: proveIncomeABI,
    functionName: "proveIncome",
    chain: baseSepolia,
    account: privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`),
    args: [receipts, vs, rs, ss],
  });

  try {
    const hash = await walletClient.writeContract(request);
    logger.info("Successfully proven income with hash:", hash);
    return { success: true };
  } catch (error) {
    logger.info("Unsuccessfully proven income...");
    return { success: false };
  }
}

export async function registerAgent(runtime: IAgentRuntime) {
  const walletClient = createWalletClient({
    account: process.env.PRIVATE_KEY as Address,
    chain: baseSepolia,
    transport: http(process.env.RPC_ENDPOINT),
  });

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(process.env.RPC_ENDPOINT),
  });

  const { result, request } = await publicClient.simulateContract({
    address: process.env.REGISTRY_CONTRACT_ADDR as Address,
    abi: registryABI,
    functionName: "register",
    chain: baseSepolia,
    account: privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`),
    args: [],
  });

  try {
    const hash = await walletClient.writeContract(request);
    logger.info("Registration is successful, with hash:", hash);
    logger.info("Registration is successful, with agentId:", result);
    return { hash, agentId: result };
  } catch (error) {
    logger.info("Registration is unsuccesful:", error);
    return { success: false };
  }
}

export async function checkOwnership() {
  const walletClient = createWalletClient({
    account: process.env.PRIVATE_KEY as Address,
    chain: baseSepolia,
    transport: http(process.env.RPC_ENDPOINT),
  });

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(process.env.RPC_ENDPOINT),
  });

  logger.info("Wallet successfully initialized.");

  const { result, request } = await publicClient.simulateContract({
    address: process.env.REGISTRY_CONTRACT_ADDR as Address,
    abi: registryABI,
    functionName: "owner",
    chain: baseSepolia,
    account: privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`),
    args: [],
  });

  try {
    const hash = await walletClient.writeContract(request);
    logger.info("Onweship check is successful, with hash:", hash);
    return { hash, agentId: result };
  } catch (error) {
    logger.info("Ownership check is unsuccesful:", error);
    return { hash: null, agentId: null };
  }
}

export async function validateAgent(
  validatorAddress: Address,
  agentId: bigint,
  requestUri: string,
  requestHash: Address,
) {
  console.log("Validating agent...")
  const walletClient = createWalletClient({
    account: process.env.PRIVATE_KEY as Address,
    chain: baseSepolia,
    transport: http(process.env.RPC_ENDPOINT),
  });

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(process.env.RPC_ENDPOINT),
  });

  const { result, request } = await publicClient.simulateContract({
    address: process.env.VALIDATION_REGISTRY_ADDR as Address,
    abi: validationRegistryABI,
    functionName: "validationRequest",
    chain: baseSepolia,
    account: privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`),
    args: [validatorAddress, agentId, requestUri, requestHash],
  });

  try {
    const hash = await walletClient.writeContract(request);
    logger.info("Validation event has been fired with hash:", hash);
    return { hash, agentId: result };
  } catch (error) {
    logger.info("Validation is unsuccesful:", error);
    return { success: false };
  }
}
