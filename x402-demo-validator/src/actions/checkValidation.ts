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
export const checkValidation: Action = {
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
  ): Promise<ActionResult> => {},

  examples: [],
};
