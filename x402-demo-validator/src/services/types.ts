import { Address } from "viem";

export interface PaymentData {
  validatorAddress: Address;
  agentId: bigint;
  requestUri: string;
  requestHash: Address;
}
