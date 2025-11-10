import { Service, type IAgentRuntime, logger, ModelType } from "@elizaos/core";
import { ethers } from "ethers";
import { KudoABI } from "../KudoABI";
import { COVENANT_TIMING_EVALUATION_PROMPT } from "../prompts";
import {
  proveIncomeFunction,
  registerAgent,
} from "src/registrationFlowFunctions";

export class KudoRegistrationService extends Service {
  static serviceType = "kudo-registration";
  capabilityDescription =
    "This is a kudo registration service which aims to register the agent in the contract.";

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
    logger.info("*** Starting kudo-registration service ***");
    try {
      logger.info("Reading previous memory");
      const previousAgentIDList = await runtime.getMemories({
        roomId: runtime.agentId,
        tableName: "agentInfo",
        count: 100,
      });

      if (!previousAgentIDList.length) {
        const { hash, agentId } = await registerAgent(runtime);
        await proveIncomeFunction(agentId.toString());
        await runtime.createMemory(
          {
            agentId: runtime.agentId,
            entityId: runtime.agentId,
            roomId: runtime.agentId,
            content: {
              text: agentId.toString(),
            },
          },
          "agentInfo",
          false,
        );

        logger.info(`Successfully created a memory for agentId: ${agentId}`);
      } else {
        const allText = previousAgentIDList
          .map((m) => m.content?.text)
          .filter(Boolean)
          .join(" ");
        logger.info(`Found Memory for the following Agent IDs: ${allText}`);
      }
    } catch (error) {
      console.log(error);
      throw new Error("Registration failed... ");
    }
    const service = new KudoRegistrationService(runtime);
    return service;
  }

  static async stop(runtime: IAgentRuntime) {
    logger.info("*** Stopping kudo-demo service ***");
    // get the service from the runtime
    const service = runtime.getService(KudoRegistrationService.serviceType);
    if (!service) {
      throw new Error("Kudo demo service not found");
    }
    service.stop();
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
