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
import { transactCreditCardAction } from "./transactCreditCard";
import { TWITTER_POST_PROMPT, CREDIT_CARD_TXN_MSG_PROMPT } from "../prompts";

/**
 * Make Twitter Post action
 * Posts content to Twitter via MCP server
 */
export const makeTwitterPostAction: Action = {
  name: "MAKE_TWITTER_POST",
  similes: ["POST_TWEET", "TWEET", "POST_TO_TWITTER"],
  description:
    "Posts content to Twitter using AI-generated text. No Twitter API integration needed - this action calls an MCP server to handle the actual posting. Supports HTTP x402 payment flows for paid posting services.",

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
      logger.info("Handling MAKE_TWITTER_POST action");

      const userInput = message.content.text;

      if (!userInput) {
        logger.error("No text provided for tweet");
        return {
          success: false,
          error: "No text provided for tweet",
        };
      }

      // Generate tweet content using LLM
      const prompt = TWITTER_POST_PROMPT.replace("{{userInput}}", userInput);

      logger.info("Generating tweet content with LLM");

      const llmResult = await runtime.useModel(ModelType.TEXT_SMALL, {
        prompt,
      });

      const tweetText = llmResult.trim();
      logger.info(`Generated tweet: ${tweetText}`);

      const twitterMcpUrl = process.env.TWITTER_MCP || "http://localhost:3000";

      // Make request to Twitter MCP server
      const response = await fetch(`${twitterMcpUrl}/post_tweet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: tweetText,
        }),
      });

      // Check for 402 Payment Required status
      if (response.status === 402) {
        logger.info(
          "Received 402 Payment Required - triggering credit card transaction",
        );

        // Parse the 402 response to get amount and dueDate
        const paymentData = (await response.json()) as any;
        const paymentRequirements = paymentData.accepts[0];

        const { amount, dueDateMinutes } = paymentRequirements.extra;

        const dueDate = new Date(
          Date.now() + dueDateMinutes * 60 * 1000,
        ).toISOString();

        const creditCardTxnMsgPrompt = CREDIT_CARD_TXN_MSG_PROMPT.replace(
          "{{amount}}",
          amount,
        )
          .replace("{{dueDate}}", dueDate)
          .replace("{{tweet}}", tweetText);

        const creditCardTxnMsg = await runtime.useModel(ModelType.TEXT_SMALL, {
          prompt: creditCardTxnMsgPrompt,
        });

        await callback({
          text: "Payment required to post tweet. Processing payment...",
          actions: ["MAKE_TWITTER_POST"],
          source: message.content.source,
        });

        // Create a new message with the credit card transaction text
        const txnMessage: Memory = {
          ...message,
          content: {
            ...message.content,
            text: creditCardTxnMsg,
          },
        };

        logger.info(
          "Generated credit card transaction message",
          creditCardTxnMsg,
        );

        // Trigger the credit card transaction action with payment response
        await transactCreditCardAction.handler(
          runtime,
          txnMessage,
          state,
          {
            ...options,
            paymentRequirements: paymentRequirements,
            paymentURL: `${twitterMcpUrl}/post_tweet`,
            reqBody: {
              text: tweetText,
            },
          },
          callback,
          responses,
        );

        return {
          success: true,
          data: { paymentTriggered: true },
        };
      }

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Failed to post tweet: ${response.status} ${errorText}`);
        return {
          success: false,
          error: `Failed to post tweet: ${response.status}`,
        };
      }

      const result = await response.json();
      logger.info("Tweet posted successfully:", JSON.stringify(result));

      await callback({
        text: `Successfully posted tweet: "${tweetText}"`,
        actions: ["MAKE_TWITTER_POST"],
        source: message.content.source,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      logger.error("Error in MAKE_TWITTER_POST action:", error);
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
          text: "Post this to Twitter",
        },
      },
      {
        name: "{{name2}}",
        content: {
          text: "Twitter post action not yet implemented",
          actions: ["MAKE_TWITTER_POST"],
        },
      },
    ],
  ],
};
