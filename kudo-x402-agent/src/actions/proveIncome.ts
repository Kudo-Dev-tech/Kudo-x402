import {
  type Action,
  type ActionResult,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  ModelType,
  type State,
  logger,
} from "@elizaos/core";

import { proveIncomeFunction } from "src/registrationFlowFunctions";

export const proveIncome: Action = {
  name: "PROVE_INCOME",
  similes: ["PROVE_INCOME", "CHECK_INCOME"],
  description: "Prove an income statement",

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
    const storedMemory = await runtime.getMemories({
      roomId: runtime.agentId,
      tableName: "agentInfo",
      count: 100,
    });

    const agentId = storedMemory[0].content.text as String;

    return (await proveIncomeFunction(agentId)) as ActionResult;
  },

  examples: [],
};
