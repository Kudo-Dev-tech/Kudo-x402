import { Address } from "viem";

export interface ValidationRequestParams {
  validatorAddress: Address;
  agentId: bigint;
  requestUri: string;
  requestHash: Address;
}
