import {
  type Action,
  type ActionResult,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type State,
  logger,
} from "@elizaos/core";

/**
 * Hello World action
 * A simple action that returns a greeting message
 */
export const helloWorldAction: Action = {
  name: "HELLO_WORLD",
  similes: ["GREET", "SAY_HELLO"],
  description: "A simple hello world action that greets the user",

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
    try {
      logger.info("Handling HELLO_WORLD action");

      await callback({
        text: "Hello, World! 👋",
        actions: ["HELLO_WORLD"],
        source: message.content.source,
      });

      return {
        success: true,
        data: { greeting: "Hello, World!" },
      };
    } catch (error) {
      logger.error("Error in HELLO_WORLD action:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },

  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "Say hello",
        },
      },
      {
        name: "{{name2}}",
        content: {
          text: "Hello, World! 👋",
          actions: ["HELLO_WORLD"],
        },
      },
    ],
  ],
};
