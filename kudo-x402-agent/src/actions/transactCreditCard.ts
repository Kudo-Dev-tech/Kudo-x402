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
import { ethers } from "ethers";
import { COVENANT_GENERATION_PROMPT } from "../prompts";

/**
 * Generate signature for covenant parameters
 * Signs: agentAddr, covenantPromise, covenantAsk, nftType
 */
async function generateCovenantSignature(
  privateKey: string,
  agentAddr: string,
  covenantPromise: string,
  covenantAsk: string,
  nftType: string,
  recipient: string,
  debtAmount: string
): Promise<{ signature: string; v: number; r: string; s: string }> {
  // ABI encode the parameters
  const abiCoder = ethers.AbiCoder.defaultAbiCoder();

  const encoded = abiCoder.encode(
    ["string", "string", "string", "address", "uint256", "address"],
    [covenantPromise, covenantAsk, nftType, agentAddr, debtAmount, recipient],
  );

  // Sign the encoded data
  const wallet = new ethers.Wallet(privateKey);
  const messageHash = ethers.keccak256(encoded);
  const signature = wallet.signingKey.sign(messageHash);

  return {
    v: signature.v,
    r: signature.r,
    s: signature.s,
    signature: "",
  };
}

/**
 * Transact Credit Card action
 * Processes credit card transactions
 */
export const transactCreditCardAction: Action = {
  name: "TRANSACT_CREDIT_CARD",
  similes: ["PROCESS_PAYMENT", "CHARGE_CARD", "MAKE_PAYMENT"],
  description: "Processes credit card transactions",

  validate: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State,
  ): Promise<boolean> => {
    // Always valid
    return true;
  },

  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State,
    _options: any,
    callback: HandlerCallback,
    _responses: Memory[],
  ): Promise<ActionResult> => {
    logger.info("Handling TRANSACT_CREDIT_CARD action");
    const { paymentRequirements, paymentURL, reqBody } = _options;
    if (!paymentRequirements || !paymentURL) {
      logger.error("Payment response or URL not provided in options");
      return {
        success: false,
        error: "Payment response or URL not provided in options",
      };
    }

    try {
      // Generate covenant promise and ask using AI
      const prompt = COVENANT_GENERATION_PROMPT.replace(
        "{{messageText}}",
        message.content.text,
      );

      const llmResult = await _runtime.useModel(ModelType.SMALL, {
        prompt,
      });

      // Parse the JSON response
      const covenantResult = {
        object: JSON.parse(llmResult),
      };

      logger.info("Generated covenant:", JSON.stringify(covenantResult.object));

      // Generate signature using ethers
      const nftType = "CREDIT_CARD";
      const privateKey = _runtime.getSetting("EVM_PRIVATE_KEY");

      if (!privateKey) {
        logger.error("EVM_PRIVATE_KEY not found in settings");
        return {
          success: false,
          error: "EVM_PRIVATE_KEY not configured",
        };
      }

      const wallet = new ethers.Wallet(privateKey);
      const signatureData = await generateCovenantSignature(
        privateKey,
        wallet.address,
        covenantResult.object.covenantPromise,
        covenantResult.object.covenantAsk,
        nftType,
        "0x1BAB12dd29E89455752613055EC6036eD6c17ccf",
        covenantResult.object.debtAmount
      );

      paymentRequirements.extra = {
        kudoPaymentParams: {
          agentAddr: wallet.address,
          signature: {
            v: signatureData.v,
            r: signatureData.r,
            s: signatureData.s,
          },
          covenantPromise: covenantResult.object.covenantPromise,
          covenantAsk: covenantResult.object.covenantAsk,
          debtAmount: covenantResult.object.debtAmount,
        },
      };

      // Read the response body as text
      const paymentRequirementsText = JSON.stringify(paymentRequirements);

      // Encode the response text as base64
      const base64Encoded = Buffer.from(paymentRequirementsText).toString(
        "base64",
      );
      logger.info("Encoded payment response as base64");

      // Make POST request with X-PAYMENT header
      logger.info(`Making payment request to ${paymentURL}`);
      logger.info(`Request body: ${JSON.stringify(reqBody)}`);
      const response = await fetch(paymentURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-PAYMENT": base64Encoded,
        },
        body: JSON.stringify(reqBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Payment request failed: ${response.status} ${errorText}`);
        return {
          success: false,
          error: `Payment request failed: ${response.status}`,
        };
      }

      const result = await response.json();
      logger.info("Payment processed successfully:", JSON.stringify(result));

      await callback({
        text: "Credit card transaction processed",
        actions: ["TRANSACT_CREDIT_CARD"],
        source: message.content.source,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      logger.error("Error in TRANSACT_CREDIT_CARD action:", error);
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
          text: "Process a payment",
        },
      },
      {
        name: "{{name2}}",
        content: {
          text: "Credit card transaction action not yet implemented",
          actions: ["TRANSACT_CREDIT_CARD"],
        },
      },
    ],
  ],
};
