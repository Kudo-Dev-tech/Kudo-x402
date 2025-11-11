import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { KudoValidatorService } from "../../../src/services/KudoValidatorService";
import type { IAgentRuntime } from "@elizaos/core";
import { createPublicClient, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { Address } from "viem";

// Mock viem modules
vi.mock("viem", () => ({
  createPublicClient: vi.fn(),
  createWalletClient: vi.fn(),
  http: vi.fn(),
}));

vi.mock("viem/accounts", () => ({
  privateKeyToAccount: vi.fn(),
}));

vi.mock("viem/chains", () => ({
  baseSepolia: {
    id: 84532,
    name: "Base Sepolia",
  },
}));

// Mock the logger from @elizaos/core
vi.mock("@elizaos/core", async () => {
  const actual = await vi.importActual("@elizaos/core");
  return {
    ...actual,
    logger: {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    },
  };
});

describe("KudoValidatorService", () => {
  // Test data
  const mockEnvVars = {
    PAYMENT_HISTORY_ADDR: "0x1234567890123456789012345678901234567890" as Address,
    VALIDATION_REGISTRY_ADDR: "0x0987654321098765432109876543210987654321" as Address,
    PRIVATE_KEY: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" as Address,
    RPC_ENDPOINT: "https://sepolia.base.org",
  };

  const mockEventParams = {
    agent: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as Address,
    covenantId: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as Address,
    score: 95,
    requestHash: "0xcccccccccccccccccccccccccccccccccccccccc" as Address,
    responseUri: "ipfs://QmExampleHash",
    responseHash: "0xdddddddddddddddddddddddddddddddddddddddd" as Address,
    tag: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" as Address,
    nftId: BigInt(12345),
  };

  const mockEventLog = {
    args: mockEventParams,
    eventName: "ValidationRequest",
    address: mockEnvVars.VALIDATION_REGISTRY_ADDR,
  };

  // Mock runtime
  let mockRuntime: IAgentRuntime;
  let mockPublicClient: any;
  let mockWalletClient: any;
  let mockAccount: any;
  let service: KudoValidatorService;

  beforeEach(() => {
    // Set up environment variables
    process.env.PAYMENT_HISTORY_ADDR = mockEnvVars.PAYMENT_HISTORY_ADDR;
    process.env.VALIDATION_REGISTRY_ADDR = mockEnvVars.VALIDATION_REGISTRY_ADDR;
    process.env.PRIVATE_KEY = mockEnvVars.PRIVATE_KEY;
    process.env.RPC_ENDPOINT = mockEnvVars.RPC_ENDPOINT;

    // Create mock runtime
    mockRuntime = {
      agentId: "test-agent-id",
      serverUrl: "http://localhost:3000",
      character: {} as any,
      modelProvider: "openai" as any,
      databaseAdapter: {} as any,
      token: "test-token",
    } as IAgentRuntime;

    // Create mock account
    mockAccount = {
      address: "0x1111111111111111111111111111111111111111",
      signMessage: vi.fn(),
      signTransaction: vi.fn(),
    };

    // Mock privateKeyToAccount
    (privateKeyToAccount as any).mockReturnValue(mockAccount);

    // Create mock public client with all necessary methods
    mockPublicClient = {
      watchContractEvent: vi.fn().mockReturnValue(vi.fn()), // Returns unwatch function
      simulateContract: vi.fn(),
      readContract: vi.fn(),
      getBlockNumber: vi.fn(),
    };

    // Create mock wallet client with writeContract method
    mockWalletClient = {
      account: mockAccount,
      writeContract: vi.fn(),
      signMessage: vi.fn(),
    };

    // Mock the viem client creation functions
    (createPublicClient as any).mockReturnValue(mockPublicClient);
    (createWalletClient as any).mockReturnValue(mockWalletClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Clean up environment variables
    delete process.env.PAYMENT_HISTORY_ADDR;
    delete process.env.VALIDATION_REGISTRY_ADDR;
    delete process.env.PRIVATE_KEY;
    delete process.env.RPC_ENDPOINT;
  });

  describe("initialization", () => {
    it("should initialize the service with correct configuration", () => {
      service = new KudoValidatorService(mockRuntime);

      expect(privateKeyToAccount).toHaveBeenCalledWith(mockEnvVars.PRIVATE_KEY);
      expect(createWalletClient).toHaveBeenCalled();
      expect(createPublicClient).toHaveBeenCalled();
    });

    it("should throw error if PAYMENT_HISTORY_ADDR is missing", () => {
      delete process.env.PAYMENT_HISTORY_ADDR;

      expect(() => new KudoValidatorService(mockRuntime)).toThrow(
        "PAYMENT_HISTORY_ADDR is required"
      );
    });

    it("should throw error if PRIVATE_KEY is missing", () => {
      delete process.env.PRIVATE_KEY;

      expect(() => new KudoValidatorService(mockRuntime)).toThrow(
        "PRIVATE_KEY is required"
      );
    });

    it("should throw error if RPC_ENDPOINT is missing", () => {
      delete process.env.RPC_ENDPOINT;

      expect(() => new KudoValidatorService(mockRuntime)).toThrow(
        "RPC_ENDPOINT is required"
      );
    });
  });

  describe("handleEvent", () => {
    beforeEach(async () => {
      // Mock successful contract simulation
      const mockSimulateResult = {
        result: "0x123456",
        request: {
          address: mockEnvVars.PAYMENT_HISTORY_ADDR,
          abi: [],
          functionName: "validatePayment",
          args: [
            mockEventParams.agent,
            mockEventParams.covenantId,
            mockEventParams.score,
            mockEventParams.requestHash,
            mockEventParams.responseUri,
            mockEventParams.responseHash,
            mockEventParams.tag,
            mockEventParams.nftId,
          ],
        },
      };

      mockPublicClient.simulateContract.mockResolvedValue(mockSimulateResult);

      // Mock successful transaction hash
      const mockTxHash = "0x9876543210987654321098765432109876543210987654321098765432109876";
      mockWalletClient.writeContract.mockResolvedValue(mockTxHash);

      // Initialize service
      service = new KudoValidatorService(mockRuntime);
    });

    it("should handle event and validate payment successfully", async () => {
      // Access the private handleEvent method through the event listener
      // We need to trigger it manually for testing
      await (service as any).handleEvent(mockEventLog);

      // Verify extractEventParameters was called correctly
      const extractedParams = (service as any).extractEventParameters(mockEventLog);
      expect(extractedParams).toEqual(mockEventParams);

      // Verify simulateContract was called with correct parameters
      expect(mockPublicClient.simulateContract).toHaveBeenCalledWith({
        address: mockEnvVars.PAYMENT_HISTORY_ADDR,
        abi: expect.any(Array),
        functionName: "validatePayment",
        chain: expect.objectContaining({ id: 84532 }),
        account: mockAccount,
        args: [
          mockEventParams.agent,
          mockEventParams.covenantId,
          mockEventParams.score,
          mockEventParams.requestHash,
          mockEventParams.responseUri,
          mockEventParams.responseHash,
          mockEventParams.tag,
          mockEventParams.nftId,
        ],
      });

      // Verify writeContract was called
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: mockEnvVars.PAYMENT_HISTORY_ADDR,
          functionName: "validatePayment",
        })
      );
    });

    it("should verify all event parameters are passed correctly to validatePayment", async () => {
      await (service as any).handleEvent(mockEventLog);

      // Verify that simulateContract receives all parameters in the correct order
      const simulateCall = mockPublicClient.simulateContract.mock.calls[0][0];
      
      expect(simulateCall.args[0]).toBe(mockEventParams.agent);
      expect(simulateCall.args[1]).toBe(mockEventParams.covenantId);
      expect(simulateCall.args[2]).toBe(mockEventParams.score);
      expect(simulateCall.args[3]).toBe(mockEventParams.requestHash);
      expect(simulateCall.args[4]).toBe(mockEventParams.responseUri);
      expect(simulateCall.args[5]).toBe(mockEventParams.responseHash);
      expect(simulateCall.args[6]).toBe(mockEventParams.tag);
      expect(simulateCall.args[7]).toBe(mockEventParams.nftId);
    });

    it("should log success message with transaction hash", async () => {
      const mockTxHash = "0x9876543210987654321098765432109876543210987654321098765432109876";
      mockWalletClient.writeContract.mockResolvedValue(mockTxHash);

      const { logger } = await import("@elizaos/core");

      await (service as any).handleEvent(mockEventLog);

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining(`Validating payment for covenantId ${mockEventParams.covenantId}`)
      );
      
      expect(logger.info).toHaveBeenCalledWith(
        "Validation is successful, with hash:",
        mockTxHash
      );

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining(`Validate Payment has been completed for ${mockEventParams.covenantId}`)
      );
    });

    it("should handle writeContract errors gracefully", async () => {
      const mockError = new Error("Transaction failed: insufficient funds");
      mockWalletClient.writeContract.mockRejectedValue(mockError);

      const { logger } = await import("@elizaos/core");

      await (service as any).handleEvent(mockEventLog);

      expect(logger.info).toHaveBeenCalledWith(
        "Validation is unsuccesful:",
        mockError
      );

      // Verify that the error doesn't propagate and break the service
      expect(mockPublicClient.simulateContract).toHaveBeenCalled();
    });

    it("should extract event parameters correctly from event log", () => {
      const extracted = (service as any).extractEventParameters(mockEventLog);

      expect(extracted).toEqual(mockEventParams);
      expect(extracted.agent).toBe(mockEventParams.agent);
      expect(extracted.covenantId).toBe(mockEventParams.covenantId);
      expect(extracted.score).toBe(mockEventParams.score);
      expect(extracted.nftId).toBe(mockEventParams.nftId);
    });

    it("should use correct contract addresses", async () => {
      await (service as any).handleEvent(mockEventLog);

      const simulateCall = mockPublicClient.simulateContract.mock.calls[0][0];
      expect(simulateCall.address).toBe(mockEnvVars.PAYMENT_HISTORY_ADDR);
    });

    it("should call validatePayment with correct function name", async () => {
      await (service as any).handleEvent(mockEventLog);

      const simulateCall = mockPublicClient.simulateContract.mock.calls[0][0];
      expect(simulateCall.functionName).toBe("validatePayment");
    });
  });

  describe("service lifecycle", () => {
    it("should start service and initialize event listener", async () => {
      const startedService = await KudoValidatorService.start(mockRuntime);

      expect(startedService).toBeInstanceOf(KudoValidatorService);
      expect(mockPublicClient.watchContractEvent).toHaveBeenCalledWith({
        address: mockEnvVars.VALIDATION_REGISTRY_ADDR,
        abi: expect.any(Array),
        eventName: "ValidationRequest",
        onLogs: expect.any(Function),
        pollingInterval: 10000,
      });
    });

    it("should stop service and cleanup event listener", async () => {
      const mockUnwatch = vi.fn();
      mockPublicClient.watchContractEvent.mockReturnValue(mockUnwatch);

      service = new KudoValidatorService(mockRuntime);
      await (service as any).initialize();

      await service.stop();

      expect(mockUnwatch).toHaveBeenCalled();
    });

    it("should handle stop when no listener is active", async () => {
      service = new KudoValidatorService(mockRuntime);

      // Don't initialize, just try to stop
      await expect(service.stop()).resolves.not.toThrow();
    });
  });

  describe("static properties", () => {
    it("should have correct serviceType", () => {
      expect(KudoValidatorService.serviceType).toBe("s");
    });

    it("should have correct capability description", () => {
      service = new KudoValidatorService(mockRuntime);
      
      expect(service.capabilityDescription).toBe(
        "The agent can listen to and respond to smart contract events"
      );
    });
  });
});