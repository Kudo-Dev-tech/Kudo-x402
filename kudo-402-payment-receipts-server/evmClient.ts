import { createPublicClient, http, type PublicClient, type Chain } from 'viem'
import { mainnet, polygon, arbitrum, optimism, base } from 'viem/chains'
import 'dotenv/config'

export class EVMClient {
  private client: PublicClient

  constructor(chain: Chain = mainnet, rpcUrl?: string) {
    const url = rpcUrl || process.env.RPC_URL
    this.client = createPublicClient({
      chain,
      transport: http(url)
    })
  }

  async getBlockNumber(): Promise<bigint> {
    return await this.client.getBlockNumber()
  }

  async getBalance(address: `0x${string}`): Promise<bigint> {
    return await this.client.getBalance({ address })
  }

  async getTransaction(hash: `0x${string}`) {
    return await this.client.getTransaction({ hash })
  }

  async getTransactionReceipt(hash: `0x${string}`) {
    return await this.client.getTransactionReceipt({ hash })
  }

  async readContract(params: {
    address: `0x${string}`
    abi: any
    functionName: string
    args?: readonly any[]
  }) {
    return await this.client.readContract({
      ...params,
      args: params.args || []
    })
  }

  getClient(): PublicClient {
    return this.client
  }
}

export const chains = {
  mainnet,
  polygon,
  arbitrum,
  optimism,
  base
}
