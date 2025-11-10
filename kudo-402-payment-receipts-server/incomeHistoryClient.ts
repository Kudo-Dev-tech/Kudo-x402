import { EVMClient } from './evmClient.js'
import { type PaymentReceipt } from './types.js'
import { type Chain } from 'viem'
import { FEEDBACK_CONTRACT_ABI, getReputationRegistryAddress } from './contract.js'
import { create } from 'ipfs-http-client'

export class IncomeHistoryClient {
  private evmClient: EVMClient

  constructor(chain?: Chain, rpcUrl?: string) {
    console.log('[IncomeHistoryClient] Initializing client', { chain: chain?.name, rpcUrl })
    this.evmClient = new EVMClient(chain, rpcUrl)
    // Default to a public IPFS gateway
    const ipfsUrl = process.env.IPFS_URL || 'https://ipfs.io'
    console.log('[IncomeHistoryClient] Client initialized with IPFS URL:', ipfsUrl)
  }

  async getPaymentReceipts(agentId: number): Promise<PaymentReceipt[]> {
    console.log('[IncomeHistoryClient] Fetching payment receipts for agentId:', agentId)
    const contractAddress = getReputationRegistryAddress()
    console.log('[IncomeHistoryClient] Using contract address:', contractAddress)
    const client = this.evmClient.getClient()

    // Get NewFeedback events for this agentId
    console.log('[IncomeHistoryClient] Querying blockchain logs...')
    const logs = await client.getLogs({
      address: contractAddress,
      event: FEEDBACK_CONTRACT_ABI[0],
      args: {
        agentId: BigInt(agentId)
      },
      fromBlock: BigInt(`${process.env.START_BLOCK || 0}`),
      toBlock: 'latest'
    })
    console.log(`[IncomeHistoryClient] Found ${logs.length} logs for agentId ${agentId}`)

    // Fetch payment receipts from IPFS for each event concurrently
    const logsWithUri = logs.filter(log => log.args && log.args.fileuri)
    console.log(`[IncomeHistoryClient] ${logsWithUri.length} logs have IPFS URIs`)

    const receiptPromises = logsWithUri
      .map(async (log) => {
        try {
          console.log(`[IncomeHistoryClient] Fetching from IPFS: ${log.args!.fileuri}`)
          return await this.fetchFromIPFS(log.args!.fileuri!)
        } catch (error) {
          console.error(`[IncomeHistoryClient] Failed to fetch IPFS file ${log.args!.fileuri}:`, error)
          return null
        }
      })
    

    const receipts = (await Promise.all(receiptPromises)).filter(
      (receipt): receipt is PaymentReceipt => receipt !== null
    )

    console.log(`[IncomeHistoryClient] Successfully fetched ${receipts.length} payment receipts`)

    return receipts
  }

  private async fetchFromIPFS(uri: string): Promise<PaymentReceipt | null> {
    try {
      console.log(`[IncomeHistoryClient] Fetching URI: ${uri}`)
      const response = await fetch(uri)

      if (!response.ok) {
        console.error(`[IncomeHistoryClient] IPFS fetch failed with status ${response.status}: ${response.statusText}`)
        throw new Error(`Failed to fetch: ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`[IncomeHistoryClient] Successfully parsed receipt from ${uri}`)
      return data as PaymentReceipt
    } catch (error) {
      console.error(`[IncomeHistoryClient] Error fetching from IPFS (${uri}):`, error)
      return null
    }
  }

  getEVMClient(): EVMClient {
    return this.evmClient
  }
}
