import { APIResponse } from '../../../src/actions/index'

export const mockAPIResponse: APIResponse = {
    agentId: 1,
    agentAddress: '0x1234567890123456789012345678901234567890',
    receipts: [
      {
        fromAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        toAddress: '0x9876543210987654321098765432109876543210',
        chainId: 8453,
        txHash: '0xhash1111111111111111111111111111111111111111',
        createdAt: '2024-01-15T10:30:00.000Z',
        amountUSDC: 1000000,
        fileURI: 'ipfs://Qm123abc',
        nonce: 1,
        facilitatorSignature: {
          v: 27,
          r: '0xrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',
          s: '0xsssssssssssssssssssssssssssssssssssssssss'
        }
      },
      {
        fromAddress: '0x1111111111111111111111111111111111111111',
        toAddress: '0x2222222222222222222222222222222222222222',
        chainId: 84532,
        txHash: '0xhash2222222222222222222222222222222222222222',
        createdAt: '2024-02-20T15:45:30.000Z',
        amountUSDC: 2500000,
        nonce: 2,
        facilitatorSignature: {
          v: 28,
          r: '0xrrr2222222222222222222222222222222222222',
          s: '0xsss2222222222222222222222222222222222222'
        }
      }
    ]
  }