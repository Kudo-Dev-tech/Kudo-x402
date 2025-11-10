export const FEEDBACK_CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "agentId",
        type: "uint256"
      },
      {
        indexed: true,
        name: "clientAddress",
        type: "address"
      },
      {
        indexed: false,
        name: "score",
        type: "uint8"
      },
      {
        indexed: true,
        name: "tag1",
        type: "bytes32"
      },
      {
        indexed: false,
        name: "tag2",
        type: "bytes32"
      },
      {
        indexed: false,
        name: "fileuri",
        type: "string"
      },
      {
        indexed: false,
        name: "filehash",
        type: "bytes32"
      }
    ],
    name: "NewFeedback",
    type: "event"
  }
] as const

export const getReputationRegistryAddress = (): `0x${string}` => {
  const address = process.env.REPUTATION_REGISTRY_ADDRESS
  if (!address) {
    throw new Error('REPUTATION_REGISTRY_ADDRESS not set in environment variables')
  }
  return address as `0x${string}`
}
