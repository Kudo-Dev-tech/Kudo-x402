import { Address } from "viem";

export interface FacilitatorSignature {
  v: number;
  r: Address;
  s: Address;
}

export interface Receipt {
  fromAddress: Address;
  toAddress: Address;
  chainId: number;
  txHash: Address;
  createdAt: string;
  amountUSDC: number;
  fileURI?: string;
  nonce: number;
  facilitatorSignature: FacilitatorSignature;
}

export interface APIResponse {
  agentId: number;
  agentAddress: Address;
  receipts: Receipt[];
}
