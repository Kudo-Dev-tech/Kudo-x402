export interface PaymentReceipt {
  agentRegistry: string
  agentId: number
  clientAddress: string
  createdAt: string
  feedbackAuth: string
  score: number
  tag1: string
  tag2: string
  skill: string
  context: string
  task: string
  capability: string
  name: string
  proof_of_payment: {
    fromAddress: string
    toAddress: string
    chainId: number
    txHash: string
    nonce: number
    amount: number
    signature: string
    createdAt: string
    fileURI: string
  }
}

export interface ReceiptResponse {
  fromAddress: string
  toAddress: string
  chainId: number
  txHash: string
  createdAt: string
  amountUSDC: number
  fileURI?: string
  nonce: number
  facilitatorSignature: {
    v: number
    r: string
    s: string
  }
}

export interface PaymentReceiptsResponse {
  agentId: number
  receipts: ReceiptResponse[]
}
