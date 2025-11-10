import { TextContent } from '@modelcontextprotocol/sdk/types.js';

export type Middleware = (request: any, next: () => Promise<any>) => Promise<any>;
export type PostMiddleware = (request: any, response: any) => Promise<void>;

export interface PaymentRequirement {
  // Scheme of the payment protocol to use
  scheme: string;

  // Network of the blockchain to send payment on
  network: string;

  // Maximum amount required to pay for the resource in atomic units of the asset
  maxAmountRequired: string;

  // URL of resource to pay for
  resource: string;

  // Description of the resource
  description: string;

  // MIME type of the resource response
  mimeType: string;

  // Output schema of the resource response
  outputSchema?: object | null;

  // Address to pay value to
  payTo: string;

  // Maximum time in seconds for the resource server to respond
  maxTimeoutSeconds: number;

  // Address of the EIP-3009 compliant ERC20 contract
  asset: string;

  extra: object | null;
}

export interface PaymentError {
  x402Version: number;
  accepts: PaymentRequirement[];
  error: string;
}

export interface PaymentHeader {
  x402Version: number;
  scheme: string;
  network: string;
  payload: any;
}

/**
 * Middleware that checks for X-PAYMENT header
 * Returns a payment error object if the header is missing
 */
export const requirePaymentHeader: Middleware = async (request, next) => {
  const headers = request.params?.meta?.headers;

  if (!headers || !headers['X-PAYMENT']) {
    const paymentError: PaymentError = {
      x402Version: 1,
      accepts: [
        {
          scheme: 'erc3009',
          network: 'base-sepolia',
          maxAmountRequired: '100000000000000',
          resource: request.params?.name || 'unknown',
          description: 'Twitter MCP API access',
          mimeType: 'application/json',
          outputSchema: null,
          payTo: '0x1BAB12dd29E89455752613055EC6036eD6c17ccf',
          maxTimeoutSeconds: 30,
          asset: 'KUDO',
          extra: {
            amount: '0.01 USDC',
          },
        },
      ],
      error: 'Missing required X-PAYMENT header',
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(paymentError, null, 2),
          isError: true,
        },
      ] as TextContent[],
    };
  }

  return await next();
};

/**
 * Middleware that verifies payment with the Facilitator
 * Calls the /verify endpoint to validate the X-PAYMENT header
 */
export const verifyPayment: Middleware = async (request, next) => {
  const headers = request.params?.meta?.headers;
  const paymentHeaderEncoded = headers?.['X-PAYMENT'];

  if (!paymentHeaderEncoded) {
    throw new Error('X-PAYMENT header is missing');
  }

  const facilitatorUrl = process.env.FACILITATOR_URL;
  if (!facilitatorUrl) {
    throw new Error('FACILITATOR_URL not configured');
  }

  try {
    const response = await fetch(`${facilitatorUrl}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payment: paymentHeaderEncoded,
        resource: request.params?.name,
      }),
    });

    const verificationResult = await response.json();

    if (!response.ok || !verificationResult.isValid) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: 'Payment verification failed',
                details: verificationResult,
              },
              null,
              2
            ),
            isError: true,
          },
        ] as TextContent[],
      };
    }

    console.error('Payment verified:', verificationResult);

    // Continue to next middleware/handler
    return await next();
  } catch (error) {
    console.error('Facilitator verification error:', error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: 'Failed to verify payment with facilitator',
              message: error instanceof Error ? error.message : 'Unknown error',
            },
            null,
            2
          ),
          isError: true,
        },
      ] as TextContent[],
    };
  }
};

/**
 * Post-middleware that settles payment with the Facilitator
 * Calls the /settle endpoint after successful API execution
 */
export const settle: PostMiddleware = async (request, _response) => {
  const headers = request.params?.meta?.headers;
  const paymentHeaderEncoded = headers?.['X-PAYMENT'];

  if (!paymentHeaderEncoded) {
    console.error('Settle: No payment header to settle');
    return;
  }

  const facilitatorUrl = process.env.FACILITATOR_URL;
  if (!facilitatorUrl) {
    console.error('Settle: FACILITATOR_URL not configured');
    return;
  }

  try {
    // Decode base64 payment header
    const paymentHeaderJson = Buffer.from(paymentHeaderEncoded, 'base64').toString('utf-8');
    const paymentHeader: PaymentHeader = JSON.parse(paymentHeaderJson);

    // Build payment requirements using decoded payment header info
    const paymentRequirements: PaymentRequirement = {
      scheme: paymentHeader.scheme,
      network: paymentHeader.network,
      maxAmountRequired: '100000000000000',
      resource: request.params?.name || 'unknown',
      description: 'Twitter MCP API access',
      mimeType: 'application/json',
      outputSchema: null,
      payTo: '0x1BAB12dd29E89455752613055EC6036eD6c17ccf',
      maxTimeoutSeconds: 30,
      asset: 'KUDO',
      extra: {
        amount: '0.01 USDC',
      },
    };

    const settleRequest = {
      x402Version: paymentHeader.x402Version,
      paymentHeader: paymentHeaderEncoded,
      paymentRequirements: paymentRequirements,
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
      return;
    }

    const settleResult = await settleResponse.json();
    console.error('Payment settled:', settleResult);
  } catch (error) {
    console.error('Facilitator settle error:', error);
  }
};
