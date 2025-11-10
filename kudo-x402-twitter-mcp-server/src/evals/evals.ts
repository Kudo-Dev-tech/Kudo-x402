//evals.ts

import { EvalConfig } from 'mcp-evals';
import { openai } from '@ai-sdk/openai';
import { grade, EvalFunction } from 'mcp-evals';

const post_tweetEval: EvalFunction = {
  name: 'post_tweet Evaluation',
  description: 'Evaluates the functionality of posting a new tweet to Twitter',
  run: async () => {
    const result = await grade(
      openai('gpt-4'),
      "Please post a tweet saying: 'Excited to announce our new feature launch! #NewFeature'"
    );
    return JSON.parse(result);
  },
};

const search_tweetsEval: EvalFunction = {
  name: 'search_tweets Tool Evaluation',
  description: 'Evaluates the search_tweets tool functionality',
  run: async () => {
    const result = await grade(
      openai('gpt-4'),
      "Please search for tweets about '#AI' with 15 results."
    );
    return JSON.parse(result);
  },
};

const config: EvalConfig = {
  model: openai('gpt-4'),
  evals: [post_tweetEval, search_tweetsEval],
};

export default config;

export const evals = [post_tweetEval, search_tweetsEval];
