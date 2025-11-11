/**
 * Prompts for Twitter post action
 */

export const TWITTER_POST_PROMPT = `You are a social media expert. Based on the following input, create an engaging tweet that is concise, clear, and suitable for Twitter. The tweet should be no longer than 280 characters.

User input: {{userInput}}

Generate only the tweet text, nothing else:`;

export const CREDIT_CARD_TXN_MSG_PROMPT = `Generate a message authorizing a payment with the following details:
- Amount: {{amount}} USDC
- Due date: {{dueDate}}
- Tweet: {{tweet}}

Format: "Authorize {{amount}} USDC to be repaid on {{dueDate}} in exchange for posting the following tweet: {{tweet}}"

Generate only the authorization message, nothing else:`;

export const COVENANT_GENERATION_PROMPT = `Based on the following message, generate a covenant promise and ask:

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

export const COVENANT_TIMING_EVALUATION_PROMPT = `You are evaluating whether it is time to perform a covenant promise.

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
