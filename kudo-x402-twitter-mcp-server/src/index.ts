#!/usr/bin/env node
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { TwitterClient } from './twitter-api.js';
import { ResponseFormatter } from './formatter.js';
import {
  Config,
  ConfigSchema,
  PostTweetSchema,
  SearchTweetsSchema,
  TwitterError,
} from './types.js';
import { PaymentError } from './middlewares.js';
import { KudoService } from './KudoService.js';
import dotenv from 'dotenv';

dotenv.config();

let cachedTweetURL = ""

export class TwitterServer {
  private app: Hono;
  private client: TwitterClient;

  constructor(config: Config) {
    // Validate config
    const result = ConfigSchema.safeParse(config);
    if (!result.success) {
      throw new Error(`Invalid configuration: ${result.error.message}`);
    }

    this.client = new TwitterClient(config);
    this.app = new Hono();

    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/', (c) => {
      console.log('"/" called');
      return c.json({
        name: 'twitter-mcp-http',
        version: '1.0.0',
        endpoints: [
          { method: 'POST', path: '/post_tweet', description: 'Post a new tweet to Twitter' },
          { method: 'POST', path: '/search_tweets', description: 'Search for tweets on Twitter' },
        ],
      });
    });

    // Payment verification middleware
    const paymentMiddleware = async (c: any, next: any) => {
      const paymentHeader = c.req.header('X-PAYMENT');

      if (!paymentHeader) {
        const dueDateMinutes = process.env.DUE_DATE_MIN ? parseInt(process.env.DUE_DATE_MIN) : 5;

        if (!process.env.KUDO_ADDRESS) {
          throw new Error('KUDO_ADDRESS not configured in environment variables');
        }

        const paymentError: PaymentError = {
          x402Version: 1,
          accepts: [
            {
              scheme: 'kudo',
              network: 'base-sepolia',
              maxAmountRequired: '100000000000000',
              resource: c.req.path,
              description: 'Twitter MCP API access',
              mimeType: 'application/json',
              outputSchema: null,
              payTo: '0x1BAB12dd29E89455752613055EC6036eD6c17ccf',
              maxTimeoutSeconds: 30,
              asset: process.env.KUDO_ADDRESS,
              extra: {
                amount: process.env.PAYMENT_AMOUNT || '0.01 USDC',
                dueDateMinutes: dueDateMinutes,
              },
            },
          ],
          error: 'Missing required X-PAYMENT header',
        };

        return c.json(paymentError, 402);
      }

      // Verify payment with facilitator
      const facilitatorUrl = process.env.FACILITATOR_URL;
      if (!facilitatorUrl) {
        return c.json({ error: 'FACILITATOR_URL not configured' }, 500);
      }

      try {
        // Decode base64 payment header
        const paymentHeaderJson = Buffer.from(paymentHeader, 'base64').toString('utf-8');
        const paymentRequirements = JSON.parse(paymentHeaderJson);

        const response = await fetch(`${facilitatorUrl}/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            x402Version: paymentRequirements.x402Version,
            paymentHeader: paymentHeader,
            paymentRequirements,
          }),
        });

        const verificationResult = await response.json();

        if (!response.ok || !verificationResult.isValid) {
          return c.json(
            {
              error: 'Payment verification failed',
              details: verificationResult,
            },
            402
          );
        }

        console.log('Payment verified:', verificationResult);

        // Store payment header for settlement
        c.set('paymentHeader', paymentHeader);
        c.set('paymentPath', c.req.path);

        await next();

        console.log('Settling payment...');
        // Settle payment after successful request
        const nftId = await this.settlePayment(paymentHeader, c.req.path);

        // Get the tweet URL from the response if available
        if (nftId && cachedTweetURL) {
          console.log('Setting ask settlement data...');
          await this.setAskSettlementData(nftId, cachedTweetURL);
        }
      } catch (error) {
        console.error('Facilitator verification error:', error);
        return c.json(
          {
            error: 'Failed to verify payment with facilitator',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
          500
        );
      }
    };

    // Post tweet endpoint
    this.app.post('/post_tweet', paymentMiddleware, async (c) => {
      console.log('"/post_tweet" called');

      const body = await c.req.json();
      console.log('Request body:', body);
      const result = PostTweetSchema.safeParse(body);

      if (!result.success) {
        return c.json(
          {
            error: 'Invalid parameters',
            details: result.error.message,
          },
          400
        );
      }

      console.log('Posting tweet...');
      const tweet = await this.client.postTweet(result.data.text, result.data.reply_to_tweet_id);
      console.log('Tweet posted:');

      const tweetUrl = `https://twitter.com/mouri4599/status/${tweet.id}`;
      cachedTweetURL = tweetUrl;
      
      return c.json({
        success: true,
        message: 'Tweet posted successfully!',
        url: tweetUrl,
        tweet,
      });
    });

    // Search tweets endpoint
    this.app.post('/search_tweets', paymentMiddleware, async (c) => {
      console.log('"/search_tweets" called');
      try {
        const body = await c.req.json();
        const result = SearchTweetsSchema.safeParse(body);

        if (!result.success) {
          return c.json(
            {
              error: 'Invalid parameters',
              details: result.error.message,
            },
            400
          );
        }

        const { tweets, users } = await this.client.searchTweets(
          result.data.query,
          result.data.count
        );

        const formattedResponse = ResponseFormatter.formatSearchResponse(
          result.data.query,
          tweets,
          users
        );

        return c.json({
          success: true,
          query: result.data.query,
          results: formattedResponse,
        });
      } catch (error) {
        return this.handleError(c, error);
      }
    });
  }

  private async settlePayment(paymentHeader: string, resource: string): Promise<bigint | null> {
    const facilitatorUrl = process.env.FACILITATOR_URL;
    if (!facilitatorUrl) {
      console.error('Settle: FACILITATOR_URL not configured');
      return null;
    }

    try {
      // Decode base64 payment header
      const serializedPaymentRequirements = Buffer.from(paymentHeader, 'base64').toString('utf-8');

      const settleRequest = {
        x402Version: "1.0",
        paymentHeader: paymentHeader,
        paymentRequirements: JSON.parse(serializedPaymentRequirements),
      };

      const settleResponse = await fetch(`${facilitatorUrl}/settle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settleRequest),
      });

      if (!settleResponse.ok) {
        const errorData = await settleResponse.json();
        console.error('Settle failed:', errorData);
        return null;
      }

      const settleResult = await settleResponse.json();
      console.log('Payment settled:', settleResult);

      // Extract nftId from Transfer event in the transaction
      if (settleResult.txHash) {
        const nftId = await this.extractNftIdFromTx(settleResult.txHash);
        return nftId;
      }

      return null;
    } catch (error) {
      console.error('Facilitator settle error:', error);
      return null;
    }
  }

  private async extractNftIdFromTx(txHash: string): Promise<bigint | null> {
    try {
      const rpcUrl = process.env.RPC_URL;
      const kudoAddress = process.env.KUDO_ADDRESS;

      if (!rpcUrl || !kudoAddress) {
        console.error('Missing RPC_URL or KUDO_ADDRESS for transaction query');
        return null;
      }

      const { JsonRpcProvider, Contract, Interface } = await import('ethers');
      const { KudoABI } = await import('./KudoABI.js');

      const provider = new JsonRpcProvider(rpcUrl);
      const contract = new Contract(kudoAddress, KudoABI, provider);

      // Get transaction receipt
      const receipt = await provider.getTransactionReceipt(txHash);

      if (!receipt) {
        console.error('Transaction receipt not found');
        return null;
      }

      // Parse logs using the contract interface
      const iface = new Interface(KudoABI);

      for (const log of receipt.logs) {
        if (log.address.toLowerCase() === kudoAddress.toLowerCase()) {
          try {
            const parsedLog = iface.parseLog({ topics: log.topics as string[], data: log.data });

            if (parsedLog && parsedLog.name === 'Transfer') {
              const tokenId = parsedLog.args.tokenId;
              console.log('Extracted NFT ID:', tokenId.toString());
              return tokenId;
            }
          } catch (e) {
            // Skip logs that don't match any event in the ABI
            continue;
          }
        }
      }

      console.error('Transfer event not found in transaction');
      return null;
    } catch (error) {
      console.error('Error extracting NFT ID from transaction:', error);
      return null;
    }
  }

  private async setAskSettlementData(nftId: bigint, tweetUrl: string): Promise<void> {
    try {
      const kudoAddress = process.env.KUDO_ADDRESS;
      const privateKey = process.env.PRIVATE_KEY;
      const rpcUrl = process.env.RPC_URL;

      if (!kudoAddress || !privateKey || !rpcUrl) {
        console.error('Missing required environment variables for KudoService');
        return;
      }

      const kudoService = new KudoService(kudoAddress, privateKey, rpcUrl);
      await kudoService.setAskSettlementData(nftId, tweetUrl, '');
      console.log('Ask settlement data set successfully');
    } catch (error) {
      console.error('Error setting ask settlement data:', error);
    }
  }

  private handleError(c: any, error: unknown) {
    if (error instanceof TwitterError) {
      if (TwitterError.isRateLimit(error)) {
        return c.json(
          {
            error: 'Rate limit exceeded',
            message: 'Please wait a moment before trying again.',
          },
          429
        );
      }

      return c.json(
        {
          error: 'Twitter API error',
          message: (error as TwitterError).message,
        },
        500
      );
    }

    console.error('Unexpected error:', error);
    return c.json(
      {
        error: 'An unexpected error occurred',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }

  start(port: number = 3000): void {
    serve({
      fetch: this.app.fetch,
      port,
    });
    console.log(`Twitter HTTP server running on http://localhost:${port}`);
  }
}

// Start the server
const config = {
  apiKey: process.env.TWITTER_API_KEY!,
  apiSecretKey: process.env.TWITTER_API_SECRET_KEY!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
};

const server = new TwitterServer(config);
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
server.start(port);
