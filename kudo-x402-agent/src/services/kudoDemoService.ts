import { Service, type IAgentRuntime, logger, ModelType } from "@elizaos/core";
import { ethers } from "ethers";
import { KudoABI } from "../KudoABI";
import { COVENANT_TIMING_EVALUATION_PROMPT } from "../prompts";

export class KudoDemoService extends Service {
  static serviceType = "kudo-demo";
  capabilityDescription =
    "This is a kudo demo service which is attached to the agent through the kudo-demo plugin.";

  private intervalId: NodeJS.Timeout | null = null;
  private intervalMs: number;

  constructor(runtime: IAgentRuntime) {
    super(runtime);

    // Get interval from env var, default to 60000ms (1 minute)
    const intervalEnv = runtime.getSetting("KUDO_JOB_INTERVAL_MS");
    this.intervalMs = intervalEnv ? parseInt(intervalEnv, 10) : 60000;

    logger.info(`Kudo job interval set to ${this.intervalMs}ms`);
  }

  static async start(runtime: IAgentRuntime) {
    logger.info("*** Starting kudo-demo service ***");
    const service = new KudoDemoService(runtime);
    service.startJob();
    return service;
  }

  static async stop(runtime: IAgentRuntime) {
    logger.info("*** Stopping kudo-demo service ***");
    // get the service from the runtime
    const service = runtime.getService(KudoDemoService.serviceType);
    if (!service) {
      throw new Error("Kudo demo service not found");
    }
    service.stop();
  }

  private startJob() {
    logger.info("Starting kudo job interval");
    this.intervalId = setInterval(() => {
      this.runJob();
    }, this.intervalMs);

    // Run immediately on start
    this.runJob();
  }

  private async handleCovenant(nftId: string, covenant: any, contract: ethers.Contract) {
    try {
      logger.info(`Handling covenant: ${covenant.covenantPromise}`);

      // Use LLM to determine how much USDC to repay
      const repaymentPrompt = `Based on the following covenant promise, determine how much USDC should be repaid.

Covenant Promise: ${covenant.covenantPromise}
Ask: ${covenant.ask}

Extract the USDC amount that needs to be repaid. Respond with a JSON object in the following format:
{
  "amount": <number in USDC, e.g., 100 for 100 USDC>
}`;

      const llmResult = await this.runtime.useModel(ModelType.SMALL, {
        prompt: repaymentPrompt,
      });

      const repaymentData = JSON.parse(llmResult);
      const usdcAmount = repaymentData.amount;

      logger.info(`Determined repayment amount: ${usdcAmount} USDC`);

      // Convert USDC to atomic units (10^6)
      const atomicAmount = BigInt(Math.floor(usdcAmount * 1000000));

      logger.info(`Atomic amount: ${atomicAmount}`);

      // USDC contract address and recipient
      const usdcContractAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
      const recipientAddress = "0x1BAB12dd29E89455752613055EC6036eD6c17ccf";

      // Get wallet from runtime
      const privateKey = this.runtime.getSetting("EVM_PRIVATE_KEY");
      const rpcUrl = this.runtime.getSetting("EVM_PROVIDER_URL");

      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const wallet = new ethers.Wallet(privateKey, provider);

      // Create USDC contract instance
      const usdcAbi = [
        "function transfer(address to, uint256 amount) returns (bool)",
      ];
      const usdcContract = new ethers.Contract(
        usdcContractAddress,
        usdcAbi,
        wallet,
      );

      // Execute transfer
      logger.info(
        `Transferring ${atomicAmount} USDC (atomic units) to ${recipientAddress}`,
      );
      const tx = await usdcContract.transfer(recipientAddress, atomicAmount);

      logger.info(`Transaction sent: ${tx.hash}`);

      const receipt = await tx.wait();

      logger.info(`Transaction confirmed: ${receipt.hash}`);

      // Call setPromiseSettlementData on Kudo contract
      logger.info(
        `Setting promise settlement data for covenant nftId: ${nftId}`,
      );

      const settlementTx = await contract.setPromiseSettlementData(
        nftId,
        receipt.hash,
        "",
      );

      logger.info(`Settlement data transaction sent: ${settlementTx.hash}`);

      const settlementReceipt = await settlementTx.wait();

      logger.info(
        `Settlement data transaction confirmed: ${settlementReceipt.hash}`,
      );
    } catch (error) {
      logger.error("Error handling covenant:", error);
      throw error;
    }
  }

  private async runJob() {
    logger.info("Running kudo job");

    try {
      // Get contract address and RPC URL from settings
      const contractAddress = this.runtime.getSetting("KUDO_CONTRACT");
      const rpcUrl = this.runtime.getSetting("EVM_PROVIDER_URL");
      const privateKey = this.runtime.getSetting("EVM_PRIVATE_KEY");

      if (!contractAddress) {
        logger.error("KUDO_CONTRACT not configured");
        return;
      }

      if (!rpcUrl) {
        logger.error("EVM_PROVIDER_URL not configured");
        return;
      }

      if (!privateKey) {
        logger.error("EVM_PRIVATE_KEY not configured");
        return;
      }

      // Create provider and contract instance
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const wallet = new ethers.Wallet(privateKey, provider);
      const contract = new ethers.Contract(contractAddress, KudoABI, wallet);

      // Get agent wallet address
      const agentAddress = wallet.address;

      logger.info(
        `Fetching all covenants and filtering by agent address: ${agentAddress}`,
      );

      // Call getCovenantsDetails to get all covenants
      const allCovenantDetails = await contract.getCovenantsDetails();

      // Filter covenants by agent address, empty promiseSettlementData, and empty askSettlementData
      const agentCovenants = allCovenantDetails.filter(
        (covenantDetail: any) => {
          return (
            covenantDetail.covenantData.agentWallet.toLowerCase() ===
              agentAddress.toLowerCase() &&
            !covenantDetail.covenantData.promiseSettlementData &&
            !!covenantDetail.covenantData.askSettlementData
          );
        },
      );

      logger.info(
        `Found ${agentCovenants.length} covenants for agent ${agentAddress}`,
      );


      await Promise.all(agentCovenants.map(async (covenantDetail: any) => {
         const covenant = covenantDetail.covenantData;

        logger.info(`Processing covenant: ${covenant.covenantPromise}`);

        // Use LLM to determine if it's time to perform the covenant promise
        const currentTime = new Date().toISOString();
        const prompt = COVENANT_TIMING_EVALUATION_PROMPT.replace(
          "{{currentTime}}",
          currentTime,
        )
          .replace("{{covenantPromise}}", covenant.covenantPromise)
          .replace("{{ask}}", covenant.ask);

        const llmResult = await this.runtime.useModel(ModelType.SMALL, {
          prompt,
        });

        const decision = JSON.parse(llmResult);

        logger.info(`Decision for covenant: ${JSON.stringify(decision)}`);

        if (decision.shouldPerform) {
          logger.info(`Time to perform covenant: ${covenant.covenantPromise}`);
          await this.handleCovenant(covenantDetail.nftId, covenant, contract);
        } else {
          logger.info(`Not yet time to perform covenant: ${decision.reason}`);
        }
      }));
    } catch (error) {
      logger.error("Error in runJob:", error);
    }
  }

  async stop() {
    logger.info("*** Stopping kudo-demo service instance ***");

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info("Kudo job interval stopped");
    }
  }
}
