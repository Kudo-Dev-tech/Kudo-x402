import { describe, it, expect, vi, beforeAll, beforeEach, afterAll, afterEach } from 'vitest'
import { mockAPIResponse } from './constants'
import { getProveIncomeParameters, proveIncome } from '../../../src/actions/proveIncome'
import { createWalletClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { baseSepolia } from 'viem/chains'

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
  
  global.fetch = vi.fn()

describe('#getProveIncomeParameters', () => {
    describe('when the APIResponse is given completely complete', () => {
    it('should correctly transform APIResponse into prove income parameters', () => {
        const result = getProveIncomeParameters(mockAPIResponse)

        expect(result.receipts[0]).toEqual({
        fromAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        toAddress: '0x9876543210987654321098765432109876543210',
        chainId: BigInt(8453),
        txHash: '0xhash1111111111111111111111111111111111111111',
        createdAt: BigInt(1705314600), 
        amountUSDC: BigInt(1000000),
        fileURI: 'ipfs://Qm123abc',
        nonce: BigInt(1)
        })

        expect(result.receipts[1]).toEqual({
        fromAddress: '0x1111111111111111111111111111111111111111',
        toAddress: '0x2222222222222222222222222222222222222222',
        chainId: BigInt(84532),
        txHash: '0xhash2222222222222222222222222222222222222222',
        createdAt: BigInt(1708443930), 
        amountUSDC: BigInt(2500000),
        fileURI: '',
        nonce: BigInt(2)
        })

        expect(result.vs).toEqual([27, 28])
        expect(result.rs).toEqual([
        '0xrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',
        '0xrrr2222222222222222222222222222222222222'
        ])
        expect(result.ss).toEqual([
        '0xsssssssssssssssssssssssssssssssssssssssss',
        '0xsss2222222222222222222222222222222222222'
        ])
    })
})
})


describe('#proveIncomeAction', () => {  
    const mockAccountAddress = '0x1234567890123456789012345678901234567890'
    const mockContractAddress = '0x9876543210987654321098765432109876543210'
    const mockPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
    const mockHash = '0xabcdef1234567890'
    const { receipts: mockReceipts, vs: mockVS, rs: mockRS, ss: mockSS } = getProveIncomeParameters(mockAPIResponse)
  
    const mockWriteContract = vi.fn()
    const mockAccount = { address: mockAccountAddress }

    const mockRuntime = {} as any
      const mockMessage = {} as any
      const mockState = {} as any
      const mockCallback = vi.fn()
      const mockResponses = []
  
    beforeEach(() => {
      process.env.ACCOUNT_ADDR = mockPrivateKey
      process.env.CONTRACT_ADDR = mockContractAddress 
  
      vi.mocked(privateKeyToAccount).mockReturnValue(mockAccount as any)
      
      vi.mocked(createWalletClient).mockReturnValue({
        account: mockAccount,
        writeContract: mockWriteContract
      } as any)
    
      vi.mocked(fetch).mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockAPIResponse)
      } as any)
    })
  
    afterEach(() => {
      vi.clearAllMocks()
      delete process.env.ACCOUNT_ADDR
      delete process.env.CONTRACT_ADDR
    })

  describe('when the writeContract is called successfully', () => {
    it('should call writeContract with correct parameters and return success when hash is received', async () => {
      mockWriteContract.mockResolvedValue(mockHash)
  
      const result = await proveIncome.handler(
        mockRuntime,
        mockMessage,
        mockState,
        {},
        mockCallback,
        mockResponses
      )
  
      expect(createWalletClient).toHaveBeenCalledWith({
        account: mockAccount,
        chain: baseSepolia,
        transport: expect.anything()
      })
  
      expect(mockWriteContract).toHaveBeenCalledWith({
        address: mockContractAddress,
        abi: expect.any(Array), 
        functionName: 'proveIncome',
        chain: baseSepolia,
        account: mockAccount,
        args: [
            mockReceipts,
            mockVS,
            mockRS,
            mockSS
        ]
      })
  
      expect(result).toEqual({ success: true })
    })
  })

  describe('when the writeContract is called unsuccessfully  ', () => {
    it('return false success action result', async () => {
      mockWriteContract.mockRejectedValue(new Error("Transaction Failed"))
  
      const result = await proveIncome.handler(
        mockRuntime,
        mockMessage,
        mockState,
        {},
        mockCallback,
        mockResponses
      )
  
      expect(createWalletClient).toHaveBeenCalledWith({
        account: mockAccount,
        chain: baseSepolia,
        transport: expect.anything()
      })
  
      expect(mockWriteContract).toHaveBeenCalledWith({
        address: mockContractAddress,
        abi: expect.any(Array), 
        functionName: 'proveIncome',
        chain: baseSepolia,
        account: mockAccount,
        args: [
            mockReceipts,
            mockVS,
            mockRS,
            mockSS
        ]
      })
  
      expect(result).toEqual({ success: false })
    })
  })

})