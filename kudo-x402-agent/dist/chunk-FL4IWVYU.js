// src/index.ts
import {
  logger as logger8
} from "@elizaos/core";

// src/plugin.ts
import {
  ModelType as ModelType6,
  logger as logger7
} from "@elizaos/core";
import { z } from "zod";

// src/actions/makeTwitterPost.ts
import {
  ModelType as ModelType2,
  logger as logger2
} from "@elizaos/core";

// src/actions/transactCreditCard.ts
import {
  ModelType,
  logger
} from "@elizaos/core";
import { ethers } from "ethers";

// src/prompts.ts
var TWITTER_POST_PROMPT = `You are a social media expert. Based on the following input, create an engaging tweet that is concise, clear, and suitable for Twitter. The tweet should be no longer than 280 characters.

User input: {{userInput}}

Generate only the tweet text, nothing else:`;
var CREDIT_CARD_TXN_MSG_PROMPT = `Generate a message authorizing a payment with the following details:
- Amount: {{amount}} USDC
- Due date: {{dueDate}}
- Tweet: {{tweet}}

Format: "Authorize {{amount}} USDC to be repaid on {{dueDate}} in exchange for posting the following tweet: {{tweet}}"

Generate only the authorization message, nothing else:`;
var COVENANT_GENERATION_PROMPT = `Based on the following message, generate a covenant promise and ask:

Message: {{messageText}}

You MUST respond with ONLY a valid JSON object with the following structure (no additional text or formatting):
{
  "agentAddr": "string - The agent's address (extract from message or generate appropriate identifier)",
  "signature": "string - A cryptographic signature placeholder (use empty string)",
  "covenantPromise": "string - A formal promise statement like 'I promise to pay back [amount] USDC on [date] at [time] UTC' based on the payment details in the message",
  "covenantAsk": "string - The action being requested, stated directly without mentioning payment or repayment. For example: 'Post a tweet' not 'In exchange for posting a tweet I will...'"
  "debtAmount": "string - The repayment amount in USDC with 6 decimal places. For example, 1 USDC = '1000000', 0.5 USDC = '500000'"
}

Generate a valid JSON object following this exact structure. Format the promise and ask professionally and clearly.`;
var COVENANT_TIMING_EVALUATION_PROMPT = `You are evaluating whether it is time to perform a covenant promise.

Current Time: {{currentTime}}

Covenant Promise: {{covenantPromise}}
Ask (what was requested): {{ask}}

Based on the covenant promise and the current time, determine if it is currently time to perform this action. The action should be performed if:
- The deadline has passed or is imminent
- The timing conditions specified in the promise have been met
- It is appropriate to execute the promise now

Respond with a JSON object in the following format:
{
  "shouldPerform": true/false,
  "reason": "Brief explanation of why it should or should not be performed now"
}`;

// src/actions/transactCreditCard.ts
async function generateCovenantSignature(privateKey, agentAddr, covenantPromise, covenantAsk, nftType, recipient, debtAmount) {
  const abiCoder = ethers.AbiCoder.defaultAbiCoder();
  const encoded = abiCoder.encode(
    ["string", "string", "string", "address", "uint256", "address"],
    [covenantPromise, covenantAsk, nftType, agentAddr, debtAmount, recipient]
  );
  const wallet = new ethers.Wallet(privateKey);
  const messageHash = ethers.keccak256(encoded);
  const signature = wallet.signingKey.sign(messageHash);
  return {
    v: signature.v,
    r: signature.r,
    s: signature.s,
    signature: ""
  };
}
var transactCreditCardAction = {
  name: "TRANSACT_CREDIT_CARD",
  similes: ["PROCESS_PAYMENT", "CHARGE_CARD", "MAKE_PAYMENT"],
  description: "Processes credit card transactions",
  validate: async (_runtime, _message, _state) => {
    return true;
  },
  handler: async (_runtime, message, _state, _options, callback, _responses) => {
    logger.info("Handling TRANSACT_CREDIT_CARD action");
    const { paymentRequirements, paymentURL, reqBody } = _options;
    if (!paymentRequirements || !paymentURL) {
      logger.error("Payment response or URL not provided in options");
      return {
        success: false,
        error: "Payment response or URL not provided in options"
      };
    }
    try {
      const prompt = COVENANT_GENERATION_PROMPT.replace(
        "{{messageText}}",
        message.content.text
      );
      const llmResult = await _runtime.useModel(ModelType.SMALL, {
        prompt
      });
      const covenantResult = {
        object: JSON.parse(llmResult)
      };
      logger.info("Generated covenant:", JSON.stringify(covenantResult.object));
      const nftType = "CREDIT_CARD";
      const privateKey = _runtime.getSetting("EVM_PRIVATE_KEY");
      if (!privateKey) {
        logger.error("EVM_PRIVATE_KEY not found in settings");
        return {
          success: false,
          error: "EVM_PRIVATE_KEY not configured"
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
            s: signatureData.s
          },
          covenantPromise: covenantResult.object.covenantPromise,
          covenantAsk: covenantResult.object.covenantAsk,
          debtAmount: covenantResult.object.debtAmount
        }
      };
      const paymentRequirementsText = JSON.stringify(paymentRequirements);
      const base64Encoded = Buffer.from(paymentRequirementsText).toString(
        "base64"
      );
      logger.info("Encoded payment response as base64");
      logger.info(`Making payment request to ${paymentURL}`);
      logger.info(`Request body: ${JSON.stringify(reqBody)}`);
      const response = await fetch(paymentURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-PAYMENT": base64Encoded
        },
        body: JSON.stringify(reqBody)
      });
      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Payment request failed: ${response.status} ${errorText}`);
        return {
          success: false,
          error: `Payment request failed: ${response.status}`
        };
      }
      const result = await response.json();
      logger.info("Payment processed successfully:", JSON.stringify(result));
      await callback({
        text: "Credit card transaction processed",
        actions: ["TRANSACT_CREDIT_CARD"],
        source: message.content.source
      });
      return {
        success: true,
        data: result
      };
    } catch (error) {
      logger.error("Error in TRANSACT_CREDIT_CARD action:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  },
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "Process a payment"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Credit card transaction action not yet implemented",
          actions: ["TRANSACT_CREDIT_CARD"]
        }
      }
    ]
  ]
};

// src/actions/makeTwitterPost.ts
var makeTwitterPostAction = {
  name: "MAKE_TWITTER_POST",
  similes: ["POST_TWEET", "TWEET", "POST_TO_TWITTER"],
  description: "Posts content to Twitter using AI-generated text. No Twitter API integration needed - this action calls an MCP server to handle the actual posting. Supports HTTP x402 payment flows for paid posting services.",
  validate: async (_runtime, _message, _state) => {
    return true;
  },
  handler: async (runtime, message, state, options, callback, responses) => {
    try {
      logger2.info("Handling MAKE_TWITTER_POST action");
      const userInput = message.content.text;
      if (!userInput) {
        logger2.error("No text provided for tweet");
        return {
          success: false,
          error: "No text provided for tweet"
        };
      }
      const prompt = TWITTER_POST_PROMPT.replace("{{userInput}}", userInput);
      logger2.info("Generating tweet content with LLM");
      const llmResult = await runtime.useModel(ModelType2.TEXT_SMALL, {
        prompt
      });
      const tweetText = llmResult.trim();
      logger2.info(`Generated tweet: ${tweetText}`);
      const twitterMcpUrl = process.env.TWITTER_MCP || "http://localhost:3000";
      const response = await fetch(`${twitterMcpUrl}/post_tweet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: tweetText
        })
      });
      if (response.status === 402) {
        logger2.info(
          "Received 402 Payment Required - triggering credit card transaction"
        );
        const paymentData = await response.json();
        const paymentRequirements = paymentData.accepts[0];
        const { amount, dueDateMinutes } = paymentRequirements.extra;
        const dueDate = new Date(
          Date.now() + dueDateMinutes * 60 * 1e3
        ).toISOString();
        const creditCardTxnMsgPrompt = CREDIT_CARD_TXN_MSG_PROMPT.replace(
          "{{amount}}",
          amount
        ).replace("{{dueDate}}", dueDate).replace("{{tweet}}", tweetText);
        const creditCardTxnMsg = await runtime.useModel(ModelType2.TEXT_SMALL, {
          prompt: creditCardTxnMsgPrompt
        });
        await callback({
          text: "Payment required to post tweet. Processing payment...",
          actions: ["MAKE_TWITTER_POST"],
          source: message.content.source
        });
        const txnMessage = {
          ...message,
          content: {
            ...message.content,
            text: creditCardTxnMsg
          }
        };
        logger2.info(
          "Generated credit card transaction message",
          creditCardTxnMsg
        );
        await transactCreditCardAction.handler(
          runtime,
          txnMessage,
          state,
          {
            ...options,
            paymentRequirements,
            paymentURL: `${twitterMcpUrl}/post_tweet`,
            reqBody: {
              text: tweetText
            }
          },
          callback,
          responses
        );
        return {
          success: true,
          data: { paymentTriggered: true }
        };
      }
      if (!response.ok) {
        const errorText = await response.text();
        logger2.error(`Failed to post tweet: ${response.status} ${errorText}`);
        return {
          success: false,
          error: `Failed to post tweet: ${response.status}`
        };
      }
      const result = await response.json();
      logger2.info("Tweet posted successfully:", JSON.stringify(result));
      await callback({
        text: `Successfully posted tweet: "${tweetText}"`,
        actions: ["MAKE_TWITTER_POST"],
        source: message.content.source
      });
      return {
        success: true,
        data: result
      };
    } catch (error) {
      logger2.error("Error in MAKE_TWITTER_POST action:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  },
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "Post this to Twitter"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Twitter post action not yet implemented",
          actions: ["MAKE_TWITTER_POST"]
        }
      }
    ]
  ]
};

// src/actions/helloWorld.ts
import {
  logger as logger3
} from "@elizaos/core";
var helloWorldAction = {
  name: "HELLO_WORLD",
  similes: ["GREET", "SAY_HELLO"],
  description: "A simple hello world action that greets the user",
  validate: async (_runtime, _message, _state) => {
    return true;
  },
  handler: async (runtime, message, state, options, callback, responses) => {
    try {
      logger3.info("Handling HELLO_WORLD action");
      await callback({
        text: "Hello, World! \u{1F44B}",
        actions: ["HELLO_WORLD"],
        source: message.content.source
      });
      return {
        success: true,
        data: { greeting: "Hello, World!" }
      };
    } catch (error) {
      logger3.error("Error in HELLO_WORLD action:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  },
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "Say hello"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Hello, World! \u{1F44B}",
          actions: ["HELLO_WORLD"]
        }
      }
    ]
  ]
};

// src/services/kudoDemoService.ts
import { Service, logger as logger5, ModelType as ModelType4 } from "@elizaos/core";
import { ethers as ethers2 } from "ethers";

// src/KudoABI.ts
var KudoABI = [
  {
    type: "constructor",
    inputs: [
      {
        name: "creditLimit",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "incomeHistory",
        type: "address",
        internalType: "address"
      },
      {
        name: "paymentHistory",
        type: "address",
        internalType: "address"
      },
      {
        name: "admin",
        type: "address",
        internalType: "address"
      },
      {
        name: "initialDelay",
        type: "uint48",
        internalType: "uint48"
      }
    ],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "DEFAULT_ADMIN_ROLE",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "EVALUATOR_CONTRACT_ROLE",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "acceptDefaultAdminTransfer",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      {
        name: "to",
        type: "address",
        internalType: "address"
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "beginDefaultAdminTransfer",
    inputs: [
      {
        name: "newAdmin",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "calculateCreditLimit",
    inputs: [
      {
        name: "creditScore",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "maxLimit",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "pure"
  },
  {
    type: "function",
    name: "cancelDefaultAdminTransfer",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "changeDefaultAdminDelay",
    inputs: [
      {
        name: "newDelay",
        type: "uint48",
        internalType: "uint48"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "defaultAdmin",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "defaultAdminDelay",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint48",
        internalType: "uint48"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "defaultAdminDelayIncreaseWait",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint48",
        internalType: "uint48"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getAgentAvailableCredit",
    inputs: [
      {
        name: "agent",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getAgentCovenantsData",
    inputs: [
      {
        name: "agent",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct Kudo.CovenantData[]",
        components: [
          {
            name: "agentWallet",
            type: "address",
            internalType: "address"
          },
          {
            name: "agentId",
            type: "uint256",
            internalType: "uint256"
          },
          {
            name: "status",
            type: "uint8",
            internalType: "enum Kudo.CovenantStatus"
          },
          {
            name: "nftType",
            type: "string",
            internalType: "string"
          },
          {
            name: "ask",
            type: "string",
            internalType: "string"
          },
          {
            name: "covenantPromise",
            type: "string",
            internalType: "string"
          },
          {
            name: "promiseDetail",
            type: "string",
            internalType: "string"
          },
          {
            name: "askSettlementData",
            type: "string",
            internalType: "string"
          },
          {
            name: "promiseSettlementData",
            type: "string",
            internalType: "string"
          },
          {
            name: "abilityScore",
            type: "uint128",
            internalType: "uint128"
          },
          {
            name: "debtAmount",
            type: "uint256",
            internalType: "uint256"
          }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getAgentCreditLimit",
    inputs: [
      {
        name: "agent",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getAgentCreditScore",
    inputs: [
      {
        name: "agent",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getAgentDebt",
    inputs: [
      {
        name: "agent",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getApproved",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getCovenant",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct Kudo.CovenantData",
        components: [
          {
            name: "agentWallet",
            type: "address",
            internalType: "address"
          },
          {
            name: "agentId",
            type: "uint256",
            internalType: "uint256"
          },
          {
            name: "status",
            type: "uint8",
            internalType: "enum Kudo.CovenantStatus"
          },
          {
            name: "nftType",
            type: "string",
            internalType: "string"
          },
          {
            name: "ask",
            type: "string",
            internalType: "string"
          },
          {
            name: "covenantPromise",
            type: "string",
            internalType: "string"
          },
          {
            name: "promiseDetail",
            type: "string",
            internalType: "string"
          },
          {
            name: "askSettlementData",
            type: "string",
            internalType: "string"
          },
          {
            name: "promiseSettlementData",
            type: "string",
            internalType: "string"
          },
          {
            name: "abilityScore",
            type: "uint128",
            internalType: "uint128"
          },
          {
            name: "debtAmount",
            type: "uint256",
            internalType: "uint256"
          }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getCovenantDetails",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct Kudo.CovenantDetails",
        components: [
          {
            name: "nftId",
            type: "uint256",
            internalType: "uint256"
          },
          {
            name: "agentName",
            type: "string",
            internalType: "string"
          },
          {
            name: "agentId",
            type: "string",
            internalType: "string"
          },
          {
            name: "owner",
            type: "address",
            internalType: "address"
          },
          {
            name: "promiseSettlementData",
            type: "string",
            internalType: "string"
          },
          {
            name: "covenantData",
            type: "tuple",
            internalType: "struct Kudo.CovenantData",
            components: [
              {
                name: "agentWallet",
                type: "address",
                internalType: "address"
              },
              {
                name: "agentId",
                type: "uint256",
                internalType: "uint256"
              },
              {
                name: "status",
                type: "uint8",
                internalType: "enum Kudo.CovenantStatus"
              },
              {
                name: "nftType",
                type: "string",
                internalType: "string"
              },
              {
                name: "ask",
                type: "string",
                internalType: "string"
              },
              {
                name: "covenantPromise",
                type: "string",
                internalType: "string"
              },
              {
                name: "promiseDetail",
                type: "string",
                internalType: "string"
              },
              {
                name: "askSettlementData",
                type: "string",
                internalType: "string"
              },
              {
                name: "promiseSettlementData",
                type: "string",
                internalType: "string"
              },
              {
                name: "abilityScore",
                type: "uint128",
                internalType: "uint128"
              },
              {
                name: "debtAmount",
                type: "uint256",
                internalType: "uint256"
              }
            ]
          }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getCovenantsDetails",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct Kudo.CovenantDetails[]",
        components: [
          {
            name: "nftId",
            type: "uint256",
            internalType: "uint256"
          },
          {
            name: "agentName",
            type: "string",
            internalType: "string"
          },
          {
            name: "agentId",
            type: "string",
            internalType: "string"
          },
          {
            name: "owner",
            type: "address",
            internalType: "address"
          },
          {
            name: "promiseSettlementData",
            type: "string",
            internalType: "string"
          },
          {
            name: "covenantData",
            type: "tuple",
            internalType: "struct Kudo.CovenantData",
            components: [
              {
                name: "agentWallet",
                type: "address",
                internalType: "address"
              },
              {
                name: "agentId",
                type: "uint256",
                internalType: "uint256"
              },
              {
                name: "status",
                type: "uint8",
                internalType: "enum Kudo.CovenantStatus"
              },
              {
                name: "nftType",
                type: "string",
                internalType: "string"
              },
              {
                name: "ask",
                type: "string",
                internalType: "string"
              },
              {
                name: "covenantPromise",
                type: "string",
                internalType: "string"
              },
              {
                name: "promiseDetail",
                type: "string",
                internalType: "string"
              },
              {
                name: "askSettlementData",
                type: "string",
                internalType: "string"
              },
              {
                name: "promiseSettlementData",
                type: "string",
                internalType: "string"
              },
              {
                name: "abilityScore",
                type: "uint128",
                internalType: "uint128"
              },
              {
                name: "debtAmount",
                type: "uint256",
                internalType: "uint256"
              }
            ]
          }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getCovenantsWithStatus",
    inputs: [
      {
        name: "status",
        type: "uint8",
        internalType: "enum Kudo.CovenantStatus"
      }
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct Kudo.CovenantData[]",
        components: [
          {
            name: "agentWallet",
            type: "address",
            internalType: "address"
          },
          {
            name: "agentId",
            type: "uint256",
            internalType: "uint256"
          },
          {
            name: "status",
            type: "uint8",
            internalType: "enum Kudo.CovenantStatus"
          },
          {
            name: "nftType",
            type: "string",
            internalType: "string"
          },
          {
            name: "ask",
            type: "string",
            internalType: "string"
          },
          {
            name: "covenantPromise",
            type: "string",
            internalType: "string"
          },
          {
            name: "promiseDetail",
            type: "string",
            internalType: "string"
          },
          {
            name: "askSettlementData",
            type: "string",
            internalType: "string"
          },
          {
            name: "promiseSettlementData",
            type: "string",
            internalType: "string"
          },
          {
            name: "abilityScore",
            type: "uint128",
            internalType: "uint128"
          },
          {
            name: "debtAmount",
            type: "uint256",
            internalType: "uint256"
          }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getCreditLimit",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getIncomeScore",
    inputs: [
      {
        name: "agent",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getPaymentScore",
    inputs: [
      {
        name: "agent",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getRoleAdmin",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "grantRole",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "account",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "hasRole",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "account",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "i_paymentHistory",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IPaymentHistory"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "isApprovedForAll",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address"
      },
      {
        name: "operator",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "mintCovenant",
    inputs: [
      {
        name: "agentId",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "debtAmount",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "covenantPromise",
        type: "string",
        internalType: "string"
      },
      {
        name: "ask",
        type: "string",
        internalType: "string"
      },
      {
        name: "nftType",
        type: "string",
        internalType: "string"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "mintCovenantOnBehalfOf",
    inputs: [
      {
        name: "agentAddress",
        type: "address",
        internalType: "address"
      },
      {
        name: "agentId",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "debtAmount",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "covenantPromise",
        type: "string",
        internalType: "string"
      },
      {
        name: "ask",
        type: "string",
        internalType: "string"
      },
      {
        name: "nftType",
        type: "string",
        internalType: "string"
      },
      {
        name: "signature",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "ownerOf",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "pendingDefaultAdmin",
    inputs: [],
    outputs: [
      {
        name: "newAdmin",
        type: "address",
        internalType: "address"
      },
      {
        name: "schedule",
        type: "uint48",
        internalType: "uint48"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "pendingDefaultAdminDelay",
    inputs: [],
    outputs: [
      {
        name: "newDelay",
        type: "uint48",
        internalType: "uint48"
      },
      {
        name: "schedule",
        type: "uint48",
        internalType: "uint48"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "renounceRole",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "account",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "revokeRole",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "account",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "rollbackDefaultAdminDelay",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "safeTransferFrom",
    inputs: [
      {
        name: "from",
        type: "address",
        internalType: "address"
      },
      {
        name: "to",
        type: "address",
        internalType: "address"
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "safeTransferFrom",
    inputs: [
      {
        name: "from",
        type: "address",
        internalType: "address"
      },
      {
        name: "to",
        type: "address",
        internalType: "address"
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "setApprovalForAll",
    inputs: [
      {
        name: "operator",
        type: "address",
        internalType: "address"
      },
      {
        name: "approved",
        type: "bool",
        internalType: "bool"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "setAskSettlementData",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "settlementData",
        type: "string",
        internalType: "string"
      },
      {
        name: "promiseDetail",
        type: "string",
        internalType: "string"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "setCovenantStatus",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "status",
        type: "uint8",
        internalType: "enum Kudo.CovenantStatus"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "setPromiseSettlementData",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "data",
        type: "string",
        internalType: "string"
      },
      {
        name: "requestUri",
        type: "string",
        internalType: "string"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "supportsInterface",
    inputs: [
      {
        name: "interfaceId",
        type: "bytes4",
        internalType: "bytes4"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "tokenURI",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "transferFrom",
    inputs: [
      {
        name: "from",
        type: "address",
        internalType: "address"
      },
      {
        name: "to",
        type: "address",
        internalType: "address"
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "event",
    name: "AgentSet",
    inputs: [
      {
        name: "agentWallet",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "agentName",
        type: "string",
        indexed: false,
        internalType: "string"
      },
      {
        name: "agentId",
        type: "string",
        indexed: false,
        internalType: "string"
      },
      {
        name: "teeId",
        type: "string",
        indexed: false,
        internalType: "string"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "Approval",
    inputs: [
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "approved",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "ApprovalForAll",
    inputs: [
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "operator",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "approved",
        type: "bool",
        indexed: false,
        internalType: "bool"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "AskSettlementSet",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "askSettlement",
        type: "string",
        indexed: false,
        internalType: "string"
      },
      {
        name: "promiseDetails",
        type: "string",
        indexed: false,
        internalType: "string"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "CovenantAskSet",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "status",
        type: "uint8",
        indexed: false,
        internalType: "enum Kudo.CovenantStatus"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "CovenantMinted",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "agent",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "nftType",
        type: "string",
        indexed: false,
        internalType: "string"
      },
      {
        name: "covenantPromise",
        type: "string",
        indexed: false,
        internalType: "string"
      },
      {
        name: "ask",
        type: "string",
        indexed: false,
        internalType: "string"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "CovenantPromiseSet",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        indexed: true,
        internalType: "uint256"
      },
      {
        name: "status",
        type: "uint8",
        indexed: false,
        internalType: "enum Kudo.CovenantStatus"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "CovenantRegistered",
    inputs: [
      {
        name: "requestId",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32"
      },
      {
        name: "agentWallet",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "nftId",
        type: "uint256",
        indexed: true,
        internalType: "uint256"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "DefaultAdminDelayChangeCanceled",
    inputs: [],
    anonymous: false
  },
  {
    type: "event",
    name: "DefaultAdminDelayChangeScheduled",
    inputs: [
      {
        name: "newDelay",
        type: "uint48",
        indexed: false,
        internalType: "uint48"
      },
      {
        name: "effectSchedule",
        type: "uint48",
        indexed: false,
        internalType: "uint48"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "DefaultAdminTransferCanceled",
    inputs: [],
    anonymous: false
  },
  {
    type: "event",
    name: "DefaultAdminTransferScheduled",
    inputs: [
      {
        name: "newAdmin",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "acceptSchedule",
        type: "uint48",
        indexed: false,
        internalType: "uint48"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "PromiseSettlementSet",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "promiseSettlement",
        type: "string",
        indexed: false,
        internalType: "string"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "RoleAdminChanged",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32"
      },
      {
        name: "previousAdminRole",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32"
      },
      {
        name: "newAdminRole",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "RoleGranted",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32"
      },
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "RoleRevoked",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32"
      },
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      {
        name: "from",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "to",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256"
      }
    ],
    anonymous: false
  },
  {
    type: "error",
    name: "AccessControlBadConfirmation",
    inputs: []
  },
  {
    type: "error",
    name: "AccessControlEnforcedDefaultAdminDelay",
    inputs: [
      {
        name: "schedule",
        type: "uint48",
        internalType: "uint48"
      }
    ]
  },
  {
    type: "error",
    name: "AccessControlEnforcedDefaultAdminRules",
    inputs: []
  },
  {
    type: "error",
    name: "AccessControlInvalidDefaultAdmin",
    inputs: [
      {
        name: "defaultAdmin",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "AccessControlUnauthorizedAccount",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address"
      },
      {
        name: "neededRole",
        type: "bytes32",
        internalType: "bytes32"
      }
    ]
  },
  {
    type: "error",
    name: "AccessForbidden",
    inputs: []
  },
  {
    type: "error",
    name: "AgentRegistered",
    inputs: []
  },
  {
    type: "error",
    name: "ConditionIsNotMet",
    inputs: []
  },
  {
    type: "error",
    name: "ECDSAInvalidSignature",
    inputs: []
  },
  {
    type: "error",
    name: "ECDSAInvalidSignatureLength",
    inputs: [
      {
        name: "length",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "ECDSAInvalidSignatureS",
    inputs: [
      {
        name: "s",
        type: "bytes32",
        internalType: "bytes32"
      }
    ]
  },
  {
    type: "error",
    name: "ERC721IncorrectOwner",
    inputs: [
      {
        name: "sender",
        type: "address",
        internalType: "address"
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "owner",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "ERC721InsufficientApproval",
    inputs: [
      {
        name: "operator",
        type: "address",
        internalType: "address"
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "ERC721InvalidApprover",
    inputs: [
      {
        name: "approver",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "ERC721InvalidOperator",
    inputs: [
      {
        name: "operator",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "ERC721InvalidOwner",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "ERC721InvalidReceiver",
    inputs: [
      {
        name: "receiver",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "ERC721InvalidSender",
    inputs: [
      {
        name: "sender",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "ERC721NonexistentToken",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "InvalidCovenantStatus",
    inputs: []
  },
  {
    type: "error",
    name: "InvalidParameter",
    inputs: []
  },
  {
    type: "error",
    name: "InvalidSignature",
    inputs: []
  },
  {
    type: "error",
    name: "SafeCastOverflowedUintDowncast",
    inputs: [
      {
        name: "bits",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  }
];

// src/registrationFlowFunctions.ts
import {
  logger as logger4
} from "@elizaos/core";
import { http } from "viem";
import { createWalletClient, createPublicClient } from "viem";

// src/actions/proveIncomeABI.ts
var proveIncomeABI = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "addFacilitator",
    inputs: [
      {
        name: "facilitator",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "canonicalReceiptHash",
    inputs: [
      {
        name: "r",
        type: "tuple",
        internalType: "struct ProofOfIncome.ReceiptInput",
        components: [
          {
            name: "fromAddress",
            type: "address",
            internalType: "address"
          },
          {
            name: "toAddress",
            type: "address",
            internalType: "address"
          },
          {
            name: "chainId",
            type: "uint256",
            internalType: "uint256"
          },
          {
            name: "txHash",
            type: "bytes32",
            internalType: "bytes32"
          },
          {
            name: "createdAt",
            type: "uint256",
            internalType: "uint256"
          },
          {
            name: "amountUSDC",
            type: "uint256",
            internalType: "uint256"
          },
          {
            name: "fileURI",
            type: "string",
            internalType: "string"
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256"
          }
        ]
      }
    ],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    stateMutability: "pure"
  },
  {
    type: "function",
    name: "getIsFacilitator",
    inputs: [
      {
        name: "facilitator",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getMonthlyIncomeUSDC",
    inputs: [
      {
        name: "agent",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "isFacilitator",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "monthlyIncomeUSDC",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "proveIncome",
    inputs: [
      {
        name: "receipts",
        type: "tuple[]",
        internalType: "struct ProofOfIncome.ReceiptInput[]",
        components: [
          {
            name: "fromAddress",
            type: "address",
            internalType: "address"
          },
          {
            name: "toAddress",
            type: "address",
            internalType: "address"
          },
          {
            name: "chainId",
            type: "uint256",
            internalType: "uint256"
          },
          {
            name: "txHash",
            type: "bytes32",
            internalType: "bytes32"
          },
          {
            name: "createdAt",
            type: "uint256",
            internalType: "uint256"
          },
          {
            name: "amountUSDC",
            type: "uint256",
            internalType: "uint256"
          },
          {
            name: "fileURI",
            type: "string",
            internalType: "string"
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256"
          }
        ]
      },
      {
        name: "vs",
        type: "uint8[]",
        internalType: "uint8[]"
      },
      {
        name: "rs",
        type: "bytes32[]",
        internalType: "bytes32[]"
      },
      {
        name: "ss",
        type: "bytes32[]",
        internalType: "bytes32[]"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "removeFacilitator",
    inputs: [
      {
        name: "facilitator",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [
      {
        name: "newOwner",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "usedNonces",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      },
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "verifyReceipt",
    inputs: [
      {
        name: "r",
        type: "tuple",
        internalType: "struct ProofOfIncome.ReceiptInput",
        components: [
          {
            name: "fromAddress",
            type: "address",
            internalType: "address"
          },
          {
            name: "toAddress",
            type: "address",
            internalType: "address"
          },
          {
            name: "chainId",
            type: "uint256",
            internalType: "uint256"
          },
          {
            name: "txHash",
            type: "bytes32",
            internalType: "bytes32"
          },
          {
            name: "createdAt",
            type: "uint256",
            internalType: "uint256"
          },
          {
            name: "amountUSDC",
            type: "uint256",
            internalType: "uint256"
          },
          {
            name: "fileURI",
            type: "string",
            internalType: "string"
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256"
          }
        ]
      },
      {
        name: "v",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "sigR",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "sigS",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "event",
    name: "FacilitatorAdded",
    inputs: [
      {
        name: "facilitator",
        type: "address",
        indexed: true,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "FacilitatorRemoved",
    inputs: [
      {
        name: "facilitator",
        type: "address",
        indexed: true,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "IncomeProven",
    inputs: [
      {
        name: "agent",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "validCount",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "monthlyIncomeUSDC",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "error",
    name: "OwnableInvalidOwner",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "OwnableUnauthorizedAccount",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address"
      }
    ]
  }
];

// src/registrationFlowFunctions.ts
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// src/validationRegistryABI.ts
var validationRegistryABI = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "UPGRADE_INTERFACE_VERSION",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getAgentValidations",
    inputs: [
      {
        name: "agentId",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bytes32[]",
        internalType: "bytes32[]"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getIdentityRegistry",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getSummary",
    inputs: [
      {
        name: "agentId",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "validatorAddresses",
        type: "address[]",
        internalType: "address[]"
      },
      {
        name: "tag",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    outputs: [
      {
        name: "count",
        type: "uint64",
        internalType: "uint64"
      },
      {
        name: "avgResponse",
        type: "uint8",
        internalType: "uint8"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getValidationStatus",
    inputs: [
      {
        name: "requestHash",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    outputs: [
      {
        name: "validatorAddress",
        type: "address",
        internalType: "address"
      },
      {
        name: "agentId",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "response",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "responseHash",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "tag",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "lastUpdate",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getValidatorRequests",
    inputs: [
      {
        name: "validatorAddress",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bytes32[]",
        internalType: "bytes32[]"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getVersion",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string"
      }
    ],
    stateMutability: "pure"
  },
  {
    type: "function",
    name: "initialize",
    inputs: [
      {
        name: "_identityRegistry",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "proxiableUUID",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [
      {
        name: "newOwner",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "upgradeToAndCall",
    inputs: [
      {
        name: "newImplementation",
        type: "address",
        internalType: "address"
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "validationRequest",
    inputs: [
      {
        name: "validatorAddress",
        type: "address",
        internalType: "address"
      },
      {
        name: "agentId",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "requestUri",
        type: "string",
        internalType: "string"
      },
      {
        name: "requestHash",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "validationResponse",
    inputs: [
      {
        name: "requestHash",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "response",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "responseUri",
        type: "string",
        internalType: "string"
      },
      {
        name: "responseHash",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "tag",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "validations",
    inputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    outputs: [
      {
        name: "validatorAddress",
        type: "address",
        internalType: "address"
      },
      {
        name: "agentId",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "response",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "responseHash",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "tag",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "lastUpdate",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "event",
    name: "Initialized",
    inputs: [
      {
        name: "version",
        type: "uint64",
        indexed: false,
        internalType: "uint64"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "Upgraded",
    inputs: [
      {
        name: "implementation",
        type: "address",
        indexed: true,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "ValidationRequest",
    inputs: [
      {
        name: "validatorAddress",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "agentId",
        type: "uint256",
        indexed: true,
        internalType: "uint256"
      },
      {
        name: "requestUri",
        type: "string",
        indexed: false,
        internalType: "string"
      },
      {
        name: "requestHash",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "ValidationResponse",
    inputs: [
      {
        name: "validatorAddress",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "agentId",
        type: "uint256",
        indexed: true,
        internalType: "uint256"
      },
      {
        name: "requestHash",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32"
      },
      {
        name: "response",
        type: "uint8",
        indexed: false,
        internalType: "uint8"
      },
      {
        name: "responseUri",
        type: "string",
        indexed: false,
        internalType: "string"
      },
      {
        name: "responseHash",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32"
      },
      {
        name: "tag",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32"
      }
    ],
    anonymous: false
  },
  {
    type: "error",
    name: "AddressEmptyCode",
    inputs: [
      {
        name: "target",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "ERC1967InvalidImplementation",
    inputs: [
      {
        name: "implementation",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "ERC1967NonPayable",
    inputs: []
  },
  {
    type: "error",
    name: "FailedCall",
    inputs: []
  },
  {
    type: "error",
    name: "InvalidInitialization",
    inputs: []
  },
  {
    type: "error",
    name: "NotInitializing",
    inputs: []
  },
  {
    type: "error",
    name: "OwnableInvalidOwner",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "OwnableUnauthorizedAccount",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "UUPSUnauthorizedCallContext",
    inputs: []
  },
  {
    type: "error",
    name: "UUPSUnsupportedProxiableUUID",
    inputs: [
      {
        name: "slot",
        type: "bytes32",
        internalType: "bytes32"
      }
    ]
  }
];

// src/registrationFlowFunctions.ts
function getProveIncomeParameters(response) {
  const receipts = [];
  const vs = [];
  const rs = [];
  const ss = [];
  for (const receipt of response.receipts) {
    const createdAtTimestamp = BigInt(
      Math.floor(new Date(receipt.createdAt).getTime())
    );
    receipts.push({
      fromAddress: receipt.fromAddress,
      toAddress: receipt.toAddress,
      chainId: BigInt(receipt.chainId),
      txHash: receipt.txHash,
      createdAt: createdAtTimestamp,
      amountUSDC: BigInt(receipt.amountUSDC),
      fileURI: receipt.fileURI || "",
      nonce: BigInt(receipt.nonce)
    });
    vs.push(receipt.facilitatorSignature.v);
    rs.push(receipt.facilitatorSignature.r);
    ss.push(receipt.facilitatorSignature.s);
  }
  return {
    receipts,
    vs,
    rs,
    ss
  };
}
async function proveIncomeFunction(agentId) {
  logger4.info(`Proving Income records... for ${agentId}`);
  const URL = `http://kudo-402-payment-receipts-server-production.up.railway.app/get_payment_receipts/${agentId}`;
  const response = await fetch(URL, {
    method: "GET"
  });
  const data = await response.json();
  if (!data.receipts.length) {
    logger4.info("No Income Records found...");
    return { success: true };
  }
  logger4.info("Successfully called API to obtain income");
  const { receipts, vs, rs, ss } = getProveIncomeParameters(data);
  const walletClient = createWalletClient({
    account: process.env.PRIVATE_KEY,
    chain: baseSepolia,
    transport: http(process.env.RPC_ENDPOINT)
  });
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(process.env.RPC_ENDPOINT)
  });
  const { result, request } = await publicClient.simulateContract({
    address: process.env.INCOME_CONTRACT_ADDR,
    abi: proveIncomeABI,
    functionName: "proveIncome",
    chain: baseSepolia,
    account: privateKeyToAccount(process.env.PRIVATE_KEY),
    args: [receipts, vs, rs, ss]
  });
  try {
    const hash = await walletClient.writeContract(request);
    logger4.info("Successfully proven income with hash:", hash);
    return { success: true };
  } catch (error) {
    logger4.info("Unsuccessfully proven income...");
    return { success: false };
  }
}
async function validateAgent(validatorAddress, agentId, requestUri, requestHash) {
  console.log("Validating agent...");
  const walletClient = createWalletClient({
    account: process.env.PRIVATE_KEY,
    chain: baseSepolia,
    transport: http(process.env.RPC_ENDPOINT)
  });
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(process.env.RPC_ENDPOINT)
  });
  const { result, request } = await publicClient.simulateContract({
    address: process.env.VALIDATION_REGISTRY_ADDR,
    abi: validationRegistryABI,
    functionName: "validationRequest",
    chain: baseSepolia,
    account: privateKeyToAccount(process.env.PRIVATE_KEY),
    args: [validatorAddress, agentId, requestUri, requestHash]
  });
  try {
    const hash = await walletClient.writeContract(request);
    logger4.info("Validation event has been fired with hash:", hash);
    return { hash, agentId: result };
  } catch (error) {
    logger4.info("Validation is unsuccesful:", error);
    return { success: false };
  }
}

// src/services/kudoDemoService.ts
var KudoDemoService = class _KudoDemoService extends Service {
  static serviceType = "kudo-demo";
  capabilityDescription = "This is a kudo demo service which is attached to the agent through the kudo-demo plugin.";
  intervalId = null;
  intervalMs;
  constructor(runtime) {
    super(runtime);
    const intervalEnv = runtime.getSetting("KUDO_JOB_INTERVAL_MS");
    this.intervalMs = intervalEnv ? parseInt(intervalEnv, 10) : 6e4;
    logger5.info(`Kudo job interval set to ${this.intervalMs}ms`);
  }
  static async start(runtime) {
    logger5.info("*** Starting kudo-demo service ***");
    const service = new _KudoDemoService(runtime);
    service.startJob();
    return service;
  }
  static async stop(runtime) {
    logger5.info("*** Stopping kudo-demo service ***");
    const service = runtime.getService(_KudoDemoService.serviceType);
    if (!service) {
      throw new Error("Kudo demo service not found");
    }
    service.stop();
  }
  startJob() {
    logger5.info("Starting kudo job interval");
    this.intervalId = setInterval(() => {
      this.runJob();
    }, this.intervalMs);
    this.runJob();
  }
  async handleCovenant(nftId, covenant, contract) {
    try {
      logger5.info(`Handling covenant: ${covenant.covenantPromise}`);
      const repaymentPrompt = `Based on the following covenant promise, determine how much USDC should be repaid.

Covenant Promise: ${covenant.covenantPromise}
Ask: ${covenant.ask}

Extract the USDC amount that needs to be repaid. Respond with a JSON object in the following format:
{
  "amount": <number in USDC, e.g., 100 for 100 USDC>
}`;
      const llmResult = await this.runtime.useModel(ModelType4.SMALL, {
        prompt: repaymentPrompt
      });
      const repaymentData = JSON.parse(llmResult);
      const usdcAmount = repaymentData.amount;
      logger5.info(`Determined repayment amount: ${usdcAmount} USDC`);
      const atomicAmount = BigInt(Math.floor(usdcAmount * 1e6));
      logger5.info(`Atomic amount: ${atomicAmount}`);
      const usdcContractAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
      const recipientAddress = "0x1BAB12dd29E89455752613055EC6036eD6c17ccf";
      const privateKey = this.runtime.getSetting("EVM_PRIVATE_KEY");
      const rpcUrl = this.runtime.getSetting("EVM_PROVIDER_URL");
      const provider = new ethers2.JsonRpcProvider(rpcUrl);
      const wallet = new ethers2.Wallet(privateKey, provider);
      const usdcAbi = [
        "function transfer(address to, uint256 amount) returns (bool)"
      ];
      const usdcContract = new ethers2.Contract(
        usdcContractAddress,
        usdcAbi,
        wallet
      );
      logger5.info(
        `Transferring ${atomicAmount} USDC (atomic units) to ${recipientAddress}`
      );
      const tx = await usdcContract.transfer(recipientAddress, atomicAmount);
      logger5.info(`Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      logger5.info(`Transaction confirmed: ${receipt.hash}`);
      logger5.info(
        `Setting promise settlement data for covenant nftId: ${nftId}`
      );
      const settlementTx = await contract.setPromiseSettlementData(
        nftId,
        receipt.hash,
        ""
      );
      logger5.info(`Settlement data transaction sent: ${settlementTx.hash}`);
      const settlementReceipt = await settlementTx.wait();
      logger5.info(
        `Settlement data transaction confirmed: ${settlementReceipt.hash}`
      );
      logger5.info("Requesting Validation...");
      const storedMemory = await this.runtime.getMemories({
        roomId: this.runtime.agentId,
        tableName: "agentInfo",
        count: 100
      });
      const agentId = BigInt(storedMemory[0].content.text);
      const requestUri = `${nftId}`;
      const requestHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
      await validateAgent(
        process.env.PAYMENT_HISTORY_ADDR,
        agentId,
        requestUri,
        requestHash
      );
      logger5.info("Validation Successful");
    } catch (error) {
      logger5.error("Error handling covenant:", error);
      throw error;
    }
  }
  async runJob() {
    logger5.info("Running kudo job");
    try {
      const contractAddress = this.runtime.getSetting("KUDO_CONTRACT");
      const rpcUrl = this.runtime.getSetting("EVM_PROVIDER_URL");
      const privateKey = this.runtime.getSetting("EVM_PRIVATE_KEY");
      if (!contractAddress) {
        logger5.error("KUDO_CONTRACT not configured");
        return;
      }
      if (!rpcUrl) {
        logger5.error("EVM_PROVIDER_URL not configured");
        return;
      }
      if (!privateKey) {
        logger5.error("EVM_PRIVATE_KEY not configured");
        return;
      }
      const provider = new ethers2.JsonRpcProvider(rpcUrl);
      const wallet = new ethers2.Wallet(privateKey, provider);
      const contract = new ethers2.Contract(contractAddress, KudoABI, wallet);
      const agentAddress = wallet.address;
      logger5.info(
        `Fetching all covenants and filtering by agent address: ${agentAddress}`
      );
      const allCovenantDetails = await contract.getCovenantsDetails();
      const agentCovenants = allCovenantDetails.filter(
        (covenantDetail) => {
          return covenantDetail.covenantData.agentWallet.toLowerCase() === agentAddress.toLowerCase() && covenantDetail.covenantData.status !== 1 && !!covenantDetail.covenantData.askSettlementData;
        }
      );
      logger5.info(
        `Found ${agentCovenants.length} covenants for agent ${agentAddress}`
      );
      await Promise.all(
        agentCovenants.map(async (covenantDetail) => {
          const covenant = covenantDetail.covenantData;
          logger5.info(`Processing covenant: ${covenant.covenantPromise}`);
          const currentTime = (/* @__PURE__ */ new Date()).toISOString();
          const prompt = COVENANT_TIMING_EVALUATION_PROMPT.replace(
            "{{currentTime}}",
            currentTime
          ).replace("{{covenantPromise}}", covenant.covenantPromise).replace("{{ask}}", covenant.ask);
          const llmResult = await this.runtime.useModel(ModelType4.SMALL, {
            prompt
          });
          const decision = JSON.parse(llmResult);
          logger5.info(`Decision for covenant: ${JSON.stringify(decision)}`);
          if (decision.shouldPerform) {
            logger5.info(
              `Time to perform covenant: ${covenant.covenantPromise}`
            );
            await this.handleCovenant(covenantDetail.nftId, covenant, contract);
          } else {
            logger5.info(`Not yet time to perform covenant: ${decision.reason}`);
          }
        })
      );
    } catch (error) {
      logger5.error("Error in runJob:", error);
    }
  }
  async stop() {
    logger5.info("*** Stopping kudo-demo service instance ***");
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger5.info("Kudo job interval stopped");
    }
  }
};

// src/actions/proveIncome.ts
var proveIncome = {
  name: "PROVE_INCOME",
  similes: ["PROVE_INCOME", "CHECK_INCOME"],
  description: "Prove an income statement",
  validate: async (_runtime, _message, _state) => {
    return true;
  },
  handler: async (runtime, message, state, options, callback, responses) => {
    const storedMemory = await runtime.getMemories({
      roomId: runtime.agentId,
      tableName: "agentInfo",
      count: 100
    });
    const agentId = storedMemory[0].content.text;
    return await proveIncomeFunction(agentId);
  },
  examples: []
};

// src/services/kudoRegistrationService.ts
import { Service as Service2, logger as logger6 } from "@elizaos/core";
var KudoRegistrationService = class _KudoRegistrationService extends Service2 {
  static serviceType = "kudo-registration";
  capabilityDescription = "This is a kudo registration service which aims to register the agent in the contract.";
  constructor(runtime) {
    super(runtime);
  }
  static async start(runtime) {
    logger6.info("*** Starting kudo-registration service ***");
    try {
      logger6.info("Reading previous memory");
      const previousAgentIDList = await runtime.getMemories({
        roomId: runtime.agentId,
        tableName: "agentInfo",
        count: 100
      });
      if (!previousAgentIDList.length) {
        const agentId = BigInt(449);
        await runtime.createMemory(
          {
            agentId: runtime.agentId,
            entityId: runtime.agentId,
            roomId: runtime.agentId,
            content: {
              text: agentId.toString()
            }
          },
          "agentInfo",
          false
        );
        logger6.info(`Successfully created a memory for agentId: ${agentId}`);
      } else {
        const allText = previousAgentIDList.map((m) => m.content?.text).filter(Boolean).join(" ");
        logger6.info(`Found Memory for the following Agent IDs: ${allText}`);
      }
    } catch (error) {
      console.log(error);
      throw new Error("Registration failed... ");
    }
    const service = new _KudoRegistrationService(runtime);
    return service;
  }
  static async stop(runtime) {
    logger6.info("*** Stopping kudo-demo service ***");
    const service = runtime.getService(_KudoRegistrationService.serviceType);
    if (!service) {
      throw new Error("Kudo demo service not found");
    }
    service.stop();
  }
  async stop() {
    logger6.info("*** Stopping kudo-registration service instance ***");
  }
};

// src/plugin.ts
var configSchema = z.object({
  KUDO_DEMO_VARIABLE: z.string().min(1, "Kudo demo variable is not provided").optional().transform((val) => {
    if (!val) {
      console.warn("Warning: Kudo demo variable is not provided");
    }
    return val;
  })
});
var helloWorldProvider = {
  name: "HELLO_WORLD_PROVIDER",
  description: "A simple example provider",
  get: async (_runtime, _message, _state) => {
    return {
      text: "I am a provider",
      values: {},
      data: {}
    };
  }
};
var plugin = {
  name: "kudo-demo",
  description: "A demo plugin for Kudo with Twitter posting and credit card transaction actions",
  // Set lowest priority so real models take precedence
  priority: -1e3,
  config: {
    KUDO_DEMO_VARIABLE: process.env.KUDO_DEMO_VARIABLE
  },
  async init(config, runtime) {
    logger7.info("*** Initializing kudo-demo plugin ***");
    try {
      const validatedConfig = await configSchema.parseAsync(config);
      for (const [key, value] of Object.entries(validatedConfig)) {
        if (value) process.env[key] = value;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid plugin configuration: ${error.errors.map((e) => e.message).join(", ")}`
        );
      }
      throw error;
    }
  },
  models: {
    [ModelType6.TEXT_SMALL]: async (_runtime, { prompt, stopSequences = [] }) => {
      return "Never gonna give you up, never gonna let you down, never gonna run around and desert you...";
    },
    [ModelType6.TEXT_LARGE]: async (_runtime, {
      prompt,
      stopSequences = [],
      maxTokens = 8192,
      temperature = 0.7,
      frequencyPenalty = 0.7,
      presencePenalty = 0.7
    }) => {
      return "Never gonna make you cry, never gonna say goodbye, never gonna tell a lie and hurt you...";
    }
  },
  routes: [
    {
      name: "helloworld",
      path: "/helloworld",
      type: "GET",
      handler: async (_req, res) => {
        res.json({
          message: "Hello World!"
        });
      }
    }
  ],
  events: {
    MESSAGE_RECEIVED: [
      async (params) => {
        logger7.info("MESSAGE_RECEIVED event received");
        logger7.info(Object.keys(params));
      }
    ],
    VOICE_MESSAGE_RECEIVED: [
      async (params) => {
        logger7.info("VOICE_MESSAGE_RECEIVED event received");
        logger7.info(Object.keys(params));
      }
    ],
    WORLD_CONNECTED: [
      async (params) => {
        logger7.info("WORLD_CONNECTED event received");
        logger7.info(Object.keys(params));
      }
    ],
    WORLD_JOINED: [
      async (params) => {
        logger7.info("WORLD_JOINED event received");
        logger7.info(Object.keys(params));
      }
    ]
  },
  services: [KudoRegistrationService, KudoDemoService],
  actions: [
    makeTwitterPostAction,
    transactCreditCardAction,
    helloWorldAction,
    proveIncome
  ],
  providers: [helloWorldProvider]
};
var plugin_default = plugin;

// src/index.ts
var character = {
  name: "Eliza",
  plugins: [
    "@elizaos/plugin-sql",
    ...process.env.ANTHROPIC_API_KEY ? ["@elizaos/plugin-anthropic"] : [],
    ...process.env.OPENAI_API_KEY ? ["@elizaos/plugin-openai"] : [],
    ...!process.env.OPENAI_API_KEY ? ["@elizaos/plugin-local-ai"] : [],
    ...process.env.DISCORD_API_TOKEN ? ["@elizaos/plugin-discord"] : [],
    ...process.env.TWITTER_USERNAME ? ["@elizaos/plugin-twitter"] : [],
    ...process.env.TELEGRAM_BOT_TOKEN ? ["@elizaos/plugin-telegram"] : [],
    ...!process.env.IGNORE_BOOTSTRAP ? ["@elizaos/plugin-bootstrap"] : []
  ],
  settings: {
    secrets: {}
  },
  system: "Respond to all messages in a helpful, conversational manner. Provide assistance on a wide range of topics, using knowledge when needed. Be concise but thorough, friendly but professional. Use humor when appropriate and be empathetic to user needs. Provide valuable information and insights when questions are asked.",
  bio: [
    "Engages with all types of questions and conversations",
    "Provides helpful, concise responses",
    "Uses knowledge resources effectively when needed",
    "Balances brevity with completeness",
    "Uses humor and empathy appropriately",
    "Adapts tone to match the conversation context",
    "Offers assistance proactively",
    "Communicates clearly and directly"
  ],
  topics: [
    "general knowledge and information",
    "problem solving and troubleshooting",
    "technology and software",
    "community building and management",
    "business and productivity",
    "creativity and innovation",
    "personal development",
    "communication and collaboration",
    "education and learning",
    "entertainment and media"
  ],
  messageExamples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "This user keeps derailing technical discussions with personal problems."
        }
      },
      {
        name: "Eliza",
        content: {
          text: "DM them. Sounds like they need to talk about something else."
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "I tried, they just keep bringing drama back to the main channel."
        }
      },
      {
        name: "Eliza",
        content: {
          text: "Send them my way. I've got time today."
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "I can't handle being a mod anymore. It's affecting my mental health."
        }
      },
      {
        name: "Eliza",
        content: {
          text: "Drop the channels. You come first."
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "But who's going to handle everything?"
        }
      },
      {
        name: "Eliza",
        content: {
          text: "We will. Take the break. Come back when you're ready."
        }
      }
    ]
  ],
  style: {
    all: [
      "Keep responses concise but informative",
      "Use clear and direct language",
      "Be engaging and conversational",
      "Use humor when appropriate",
      "Be empathetic and understanding",
      "Provide helpful information",
      "Be encouraging and positive",
      "Adapt tone to the conversation",
      "Use knowledge resources when needed",
      "Respond to all types of questions"
    ],
    chat: [
      "Be conversational and natural",
      "Engage with the topic at hand",
      "Be helpful and informative",
      "Show personality and warmth"
    ]
  }
};
var initCharacter = ({ runtime }) => {
  logger8.info("Initializing character");
  logger8.info("Name: ", character.name);
};
var projectAgent = {
  character,
  init: async (runtime) => await initCharacter({ runtime }),
  plugins: [plugin_default]
};
var project = {
  agents: [projectAgent]
};
var src_default = project;

export {
  character,
  projectAgent,
  src_default
};
//# sourceMappingURL=chunk-FL4IWVYU.js.map