import { Service, IAgentRuntime, logger, ModelType } from "@elizaos/core";
import { createPublicClient, createWalletClient, http, decodeEventLog } from "viem";
import { paymentHistoryABI } from "src/PaymentHistoryABI";
import { KudoABI } from "src/KudoABI";
import { baseSepolia } from "viem/chains";
import type { Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { PaymentData } from "./types";
import { validationRegistryABI } from "src/validationRegistryABI";

export class KudoValidatorService extends Service {
  static serviceType = "s";
  capabilityDescription =
    "The agent can listen to and respond to smart contract events";

  private walletClient: any;
  private unwatch: (() => void) | null = null;
  private paymentHistoryContract: Address;
  private validationRegistryContract: Address;
  private kudoContract: Address;
  private publicClient: any;

  constructor(protected runtime: IAgentRuntime) {
    super();
    if (!process.env.PAYMENT_HISTORY_ADDR) {
      throw new Error("PAYMENT_HISTORY_ADDR is required");
    }
    if (!process.env.KUDO_ADDR) {
      throw new Error("KUDO_ADDR is required");
    }
    if (!process.env.PRIVATE_KEY) {
      throw new Error("PRIVATE_KEY is required");
    }
    if (!process.env.RPC_ENDPOINT) {
      throw new Error("RPC_ENDPOINT is required");
    }

    this.paymentHistoryContract = process.env.PAYMENT_HISTORY_ADDR as Address;
    this.validationRegistryContract = process.env
      .VALIDATION_REGISTRY_ADDR as Address;
    this.kudoContract = process.env.KUDO_ADDR as Address;

    const account = privateKeyToAccount(process.env.PRIVATE_KEY as Address);

    this.walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(process.env.RPC_ENDPOINT),
    });

    this.publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(process.env.RPC_ENDPOINT),
    });
  }

  static async start(runtime: IAgentRuntime): Promise<KudoValidatorService> {
    const service = new KudoValidatorService(runtime);
    await service.initialize();
    return service;
  }

  private async initialize() {
    this.startEventListener();
  }

  private startEventListener() {
    console.log("Listening for ValidationRequest events at ", process.env.VALIDATION_REGISTRY_ADDR);
    this.unwatch = this.publicClient.watchContractEvent({
      address: process.env.VALIDATION_REGISTRY_ADDR,
      abi: validationRegistryABI,
      eventName: "ValidationRequest",
      onLogs: async (logs) => {
        console.log("Received validation request logs:", logs.length);
        for (const log of logs) {
          console.log("here are the validation request logs", log)
          await this.handleEvent(log);
        }
      },
      pollingInterval: 10000,
    });
  }

  private async getScore(covenantId: string): Promise<number> {
    try {
      // Query the Kudo contract for covenant data
      const covenantData = await this.publicClient.readContract({
        address: this.kudoContract,
        abi: KudoABI,
        functionName: "getCovenant",
        args: [BigInt(covenantId)],
      });

      const covenantPromise = covenantData.covenantPromise;
      const promiseSettlementData = covenantData.promiseSettlementData;

      logger.info(`Covenant Promise: ${covenantPromise}`);
      logger.info(`Promise Settlement Data: ${promiseSettlementData}`);

      // Parse promiseSettlementData to extract transaction hash if present
      let transactionHash: string | null = promiseSettlementData;
    
      if (!transactionHash) {
        logger.warn("No transaction hash found in promiseSettlementData");
        return 0;
      }

      // Fetch transaction receipt to check if it was successful
      const transactionReceipt = await this.publicClient.getTransactionReceipt({
        hash: transactionHash as `0x${string}`,
      });

      // Check if transaction was successful
      if (transactionReceipt.status !== "success") {
        logger.warn("Transaction was not successful");
        return 0;
      }

      // ERC20 Transfer event ABI
      const transferEventAbi = [
        {
          type: "event",
          name: "Transfer",
          inputs: [
            { indexed: true, name: "from", type: "address" },
            { indexed: true, name: "to", type: "address" },
            { indexed: false, name: "value", type: "uint256" },
          ],
        },
      ] as const;

      // Find and decode Transfer events
      interface TransferEvent {
        from: Address;
        to: Address;
        value: bigint;
        address: Address;
      }

      const transferEvents: TransferEvent[] = transactionReceipt.logs
        .map((log: any) => {
          try {
            const decoded = decodeEventLog({
              abi: transferEventAbi,
              data: log.data,
              topics: log.topics,
            }) as any;
            if (decoded.eventName === "Transfer" && decoded.args) {
              return {
                from: decoded.args.from as Address,
                to: decoded.args.to as Address,
                value: decoded.args.value as bigint,
                address: log.address as Address,
              };
            }
            return null;
          } catch {
            return null;
          }
        })
        .filter((event: TransferEvent | null): event is TransferEvent => event !== null);

      if (transferEvents.length === 0) {
        logger.warn("No Transfer events found in transaction");
        return 0;
      }

      // Log all transfer events
      transferEvents.forEach((event: TransferEvent, index: number) => {
        logger.info(`Transfer Event ${index + 1}:`);
        logger.info(`  Token Contract: ${event.address}`);
        logger.info(`  From: ${event.from}`);
        logger.info(`  To: ${event.to}`);
        logger.info(`  Amount: ${event.value.toString()}`);
      });

      // Use LLM to determine if the transfer fulfills the covenant promise
      const transferDetails = transferEvents
        .map(
          (event: TransferEvent, index: number) =>
            `Transfer ${index + 1}:\n- Token: ${event.address}\n- From: ${event.from}\n- To: ${event.to}\n- Amount: ${event.value.toString()}`
        )
        .join("\n\n");

      const prompt = `You are analyzing a blockchain transaction to determine if it fulfills a covenant promise.

Covenant Promise:
${covenantPromise}

Transaction Details:
${transferDetails}

Transaction Hash: ${transactionHash}

Question: Does this transaction fulfill the covenant promise?
Consider:
1. Is the transferred amount greater than or equal to what was promised?
2. Are the from/to addresses correct based on the promise?

Answer with only "YES" or "NO" followed by a brief one-sentence explanation.`;

      try {
         const response = await this.runtime.useModel(ModelType.TEXT_SMALL, {
          prompt,
        });

        const responseText = typeof response === 'string' ? response : response || '';
        const isFullfilled = responseText.toLowerCase().includes("yes");

        logger.info(`Covenant Promise: ${covenantPromise}`);
        logger.info(`Transaction Hash: ${transactionHash}`);
        logger.info(`LLM Analysis: ${responseText}`);
        logger.info(
          `Transaction validation result: ${isFullfilled ? "FULFILLED" : "NOT_FULFILLED"}`
        );

        return isFullfilled ? 100 : 0;
      } catch (error) {
        logger.error("Error calling LLM:", error);
        // Fallback: if LLM fails, return 100 if transfer events exist
        logger.info(
          "Falling back to simple validation: Transfer events found, returning score 100"
        );
        return 100;
      }
    } catch (error) {
      logger.error("Error in getScore:", error);
      return 0;
    }
  }

  private async handleEvent(eventLog: any) {
    const eventParams = this.extractEventParameters(eventLog);
    console.log("Here are the eventParams", eventParams);

    // requestUri is the covenantId
    const covenantId = eventParams.requestUri;

    // Get the score by validating the covenant
    const score = await this.getScore(covenantId);

    await this.validatePayment(
      eventParams.validatorAddress,
      BigInt(covenantId),
      score,
      eventParams.requestHash,
    );

    logger.info(
      `Validate Payment has been completed for agentId: ${eventParams.agentId}, covenantId: ${covenantId}, score: ${score}`,
    );
  }

  private async validatePayment(
    agentAddress: Address,
    covenantId: bigint,
    score: number,
    requestHash: Address,
  ) {
    logger.info(
      `Validating payment for covenantId ${covenantId} with score ${score}`,
    );

    // Generate responseUri and responseHash (placeholder values for now)
    const responseUri = `validated-${covenantId}-${Date.now()}`;
    const responseHash = `0x${"0".repeat(64)}` as Address; // Empty bytes32
    const tag = `0x${"0".repeat(64)}` as Address; // Empty bytes32

    const { request } = await this.publicClient.simulateContract({
      address: this.paymentHistoryContract,
      abi: paymentHistoryABI,
      functionName: "validatePayment",
      chain: baseSepolia,
      account: privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`),
      args: [
        agentAddress,
        covenantId,
        score,
        requestHash,
        responseUri,
        responseHash,
        tag,
      ],
    });

    try {
      const hash = await this.walletClient.writeContract(request);
      logger.info("Validation is successful, with hash:", hash);
    } catch (error) {
      logger.info("Validation is unsuccesful:", error);
    }
  }

  private extractEventParameters(eventLog: any): PaymentData {
    return eventLog.args;
  }

  async stop(): Promise<void> {
    if (this.unwatch) {
      this.unwatch();
      this.unwatch = null;
    }
  }
}
