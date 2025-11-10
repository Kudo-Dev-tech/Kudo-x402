import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createWalletClient } from 'viem'
import { baseSepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { registerAgent } from '../../src/registerAgentFunction'

vi.mock('viem', () => ({
  createWalletClient: vi.fn(),
  http: vi.fn(() => ({}))
}))

vi.mock('viem/accounts', () => ({
  privateKeyToAccount: vi.fn()
}))

vi.mock('viem/chains', () => ({
  baseSepolia: {}
}))

// Mock the logger
vi.mock('./your-logger', () => ({
  logger: {
    info: vi.fn()
  }
}))

describe('registerAgent', () => {
  const mockAccountAddress = '0x1234567890123456789012345678901234567890'
  const mockContractAddress = '0x9876543210987654321098765432109876543210'
  const mockPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
  const mockHash = '0xabcdef1234567890'

  const mockWriteContract = vi.fn()
  const mockAccount = { address: mockAccountAddress }

  beforeEach(() => {
    // Set up environment variables
    process.env.ACCOUNT_ADDR = mockPrivateKey
    process.env.CONTRACT_ADDR = mockContractAddress

    // Mock privateKeyToAccount
    vi.mocked(privateKeyToAccount).mockReturnValue(mockAccount as any)

    // Mock createWalletClient
    vi.mocked(createWalletClient).mockReturnValue({
      account: mockAccount,
      writeContract: mockWriteContract
    } as any)
  })

  afterEach(() => {
    vi.clearAllMocks()
    delete process.env.ACCOUNT_ADDR
    delete process.env.CONTRACT_ADDR
  })

  it('should successfully register an agent', async () => {
    mockWriteContract.mockResolvedValue(mockHash)

    await registerAgent()

    expect(createWalletClient).toHaveBeenCalledWith({
      account: mockAccount,
      chain: baseSepolia,
      transport: expect.anything()
    })


    expect(mockWriteContract).toHaveBeenCalledWith({
      address: mockContractAddress,
      abi: expect.any(Array), 
      functionName: 'register',
      chain: baseSepolia,
      account: mockAccount
    })

  })
})