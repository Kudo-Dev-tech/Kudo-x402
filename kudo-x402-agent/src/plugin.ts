import type { ChannelType, Plugin } from "@elizaos/core";
import {
  type GenerateTextParams,
  ModelType,
  type Provider,
  type ProviderResult,
  type IAgentRuntime,
  type Memory,
  type State,
  logger,
  AgentRuntime,
  MemoryType,
} from "@elizaos/core";
import { check, z } from "zod";
import { makeTwitterPostAction } from "./actions/makeTwitterPost";
import { transactCreditCardAction } from "./actions/transactCreditCard";
import { helloWorldAction } from "./actions/helloWorld";
import { KudoDemoService } from "./services/kudoDemoService";
import { proveIncome } from "./actions/proveIncome";
import {
  checkOwnership,
  proveIncomeFunction,
  registerAgent,
} from "./registrationFlowFunctions";
import { KudoRegistrationService } from "./services/kudoRegistrationService";

/**
 * Define the configuration schema for the plugin with the following properties:
 *
 * @param {string} KUDO_DEMO_VARIABLE - The name of the plugin (min length of 1, optional)
 * @returns {object} - The configured schema object
 */
const configSchema = z.object({
  KUDO_DEMO_VARIABLE: z
    .string()
    .min(1, "Kudo demo variable is not provided")
    .optional()
    .transform((val) => {
      if (!val) {
        console.warn("Warning: Kudo demo variable is not provided");
      }
      return val;
    }),
});

/**
 * Example Hello World Provider
 * This demonstrates the simplest possible provider implementation
 */
const helloWorldProvider: Provider = {
  name: "HELLO_WORLD_PROVIDER",
  description: "A simple example provider",

  get: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State,
  ): Promise<ProviderResult> => {
    return {
      text: "I am a provider",
      values: {},
      data: {},
    };
  },
};

const plugin: Plugin = {
  name: "kudo-demo",
  description:
    "A demo plugin for Kudo with Twitter posting and credit card transaction actions",
  // Set lowest priority so real models take precedence
  priority: -1000,
  config: {
    KUDO_DEMO_VARIABLE: process.env.KUDO_DEMO_VARIABLE,
  },
  async init(config: Record<string, string>, runtime: IAgentRuntime) {
    logger.info("*** Initializing kudo-demo plugin ***");

    try {
      const validatedConfig = await configSchema.parseAsync(config);

      // Set all environment variables at once
      for (const [key, value] of Object.entries(validatedConfig)) {
        if (value) process.env[key] = value;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid plugin configuration: ${error.errors.map((e) => e.message).join(", ")}`,
        );
      }
      throw error;
    }
  },
  models: {
    [ModelType.TEXT_SMALL]: async (
      _runtime,
      { prompt, stopSequences = [] }: GenerateTextParams,
    ) => {
      return "Never gonna give you up, never gonna let you down, never gonna run around and desert you...";
    },
    [ModelType.TEXT_LARGE]: async (
      _runtime,
      {
        prompt,
        stopSequences = [],
        maxTokens = 8192,
        temperature = 0.7,
        frequencyPenalty = 0.7,
        presencePenalty = 0.7,
      }: GenerateTextParams,
    ) => {
      return "Never gonna make you cry, never gonna say goodbye, never gonna tell a lie and hurt you...";
    },
  },
  routes: [
    {
      name: "helloworld",
      path: "/helloworld",
      type: "GET",
      handler: async (_req: any, res: any) => {
        // send a response
        res.json({
          message: "Hello World!",
        });
      },
    },
  ],
  events: {
    MESSAGE_RECEIVED: [
      async (params) => {
        logger.info("MESSAGE_RECEIVED event received");
        // print the keys
        logger.info(Object.keys(params));
      },
    ],
    VOICE_MESSAGE_RECEIVED: [
      async (params) => {
        logger.info("VOICE_MESSAGE_RECEIVED event received");
        // print the keys
        logger.info(Object.keys(params));
      },
    ],
    WORLD_CONNECTED: [
      async (params) => {
        logger.info("WORLD_CONNECTED event received");
        // print the keys
        logger.info(Object.keys(params));
      },
    ],
    WORLD_JOINED: [
      async (params) => {
        logger.info("WORLD_JOINED event received");
        // print the keys
        logger.info(Object.keys(params));
      },
    ],
  },
  services: [KudoRegistrationService, KudoDemoService],
  actions: [
    makeTwitterPostAction,
    transactCreditCardAction,
    helloWorldAction,
    proveIncome,
  ],
  providers: [helloWorldProvider],
};

export default plugin;
