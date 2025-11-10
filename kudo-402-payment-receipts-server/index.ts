import { Hono } from 'hono'
import { IncomeHistoryClient } from './incomeHistoryClient.js'
import { baseSepolia } from 'viem/chains'
import { type PaymentReceiptsResponse } from './types.js'

const app = new Hono()
const incomeHistoryClient = new IncomeHistoryClient(baseSepolia)
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/get_payment_receipts/:agentId', async (c) => {
  const agentId = c.req.param('agentId')

  try {
    const receipts = await incomeHistoryClient.getPaymentReceipts(parseInt(agentId))

    // Parse the facilitator signature from feedbackAuth
    const parseFacilitatorSignature = (signature: string) => {
      // Remove 0x prefix if present
      const hex = signature.startsWith('0x') ? signature.slice(2) : signature

      // The signature is the last 65 bytes (130 hex chars) of signature
      // Last byte is v, previous 32 bytes is s, previous 32 bytes is r
      const signatureHex = hex.slice(-130)
      const r = '0x' + signatureHex.slice(0, 64)
      const s = '0x' + signatureHex.slice(64, 128)
      const v = parseInt(signatureHex.slice(128, 130), 16)

      return { v, r, s }
    }

    const response: PaymentReceiptsResponse = {
      agentId: parseInt(agentId),
      receipts: receipts.map(receipt => ({
        fromAddress: receipt.proof_of_payment.fromAddress,
        toAddress: receipt.proof_of_payment.toAddress,
        chainId: receipt.proof_of_payment.chainId,
        txHash: receipt.proof_of_payment.txHash,
        createdAt: receipt.proof_of_payment.createdAt,
        amountUSDC: receipt.proof_of_payment.amount,
        nonce: receipt.proof_of_payment.nonce,
        facilitatorSignature: parseFacilitatorSignature(receipt.proof_of_payment.signature),
        fileURI: receipt.proof_of_payment.fileURI,
      }))
    }

    return c.json(response)
  } catch (error) {
    console.error('Error fetching payment receipts:', error)
    return c.json({ error: 'Failed to fetch payment receipts' }, 500)
  }
})

console.log(`Server is running on port ${port}`)

export default {
  port,
  fetch: app.fetch,
}
