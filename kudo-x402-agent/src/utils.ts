import { Address, defineChain } from "viem";

export function getPrivateKeyToAccount() {
  if (process.env.PRIVATE_KEY) {
    return process.env.PRIVATE_KEY as Address;
  } else {
    throw new Error("PRIVATE_KEY must be set in the environment variables!");
  }
}

export const forkBaseSepoliaChain = defineChain({
  id: 123123,
  name: "Fork Base Sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: [process.env.RPC_ENDPOINT],
    },
  },
});
