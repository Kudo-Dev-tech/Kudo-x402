import {
  type Action,
  type ActionResult,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type State,
  logger,
} from "@elizaos/core";
import { Address, createPublicClient, createWalletClient, http } from "viem";

import { baseSepolia } from "viem/chains";
import { paymentHistoryABI } from "../PaymentHistoryABI";
import { privateKeyToAccount } from "viem/accounts";

/**
 * Hello World action
 * A simple action that returns a greeting message
 */
export const checkValidationAction: Action = {
  name: "CHECK_VALIDATION",
  similes: ["VALIDATE", "CHECK_VALIDATION"],
  description: "A action to verify the payment",

  validate: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State,
  ): Promise<boolean> => {
    // Always valid
    return true;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    options: any,
    callback: HandlerCallback,
    responses: Memory[],
  ): Promise<ActionResult> => {
    //Call the validatePayment(CovenantID) fxn in the ABI
    logger.info("Starting validation...");

    // How to get the covenantId?
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
      abi: paymentHistoryABI,
      functionName: "validatePayment",
      chain: baseSepolia,
      account: privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`),
      args: [],
    });

    try {
      const hash = await walletClient.writeContract(request);
      logger.info("Validation is successful, with hash:", hash);
      return { success: true } as ActionResult;
    } catch (error) {
      logger.info("Validation is unsuccesful:", error);
      return { success: false } as ActionResult;
    }
  },

  examples: [],
};
