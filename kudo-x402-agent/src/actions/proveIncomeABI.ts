export const proveIncomeABI = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addFacilitator",
    inputs: [
      {
        name: "facilitator",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "canonicalReceiptHash",
    inputs: [
      {
        name: "r",
        type: "tuple",
        internalType: "struct ProofOfIncome.ReceiptInput",
        components: [
          {
            name: "fromAddress",
            type: "address",
            internalType: "address",
          },
          {
            name: "toAddress",
            type: "address",
            internalType: "address",
          },
          {
            name: "chainId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "txHash",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "createdAt",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "amountUSDC",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "fileURI",
            type: "string",
            internalType: "string",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "getIsFacilitator",
    inputs: [
      {
        name: "facilitator",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMonthlyIncomeUSDC",
    inputs: [
      {
        name: "agent",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isFacilitator",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "monthlyIncomeUSDC",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "proveIncome",
    inputs: [
      {
        name: "receipts",
        type: "tuple[]",
        internalType: "struct ProofOfIncome.ReceiptInput[]",
        components: [
          {
            name: "fromAddress",
            type: "address",
            internalType: "address",
          },
          {
            name: "toAddress",
            type: "address",
            internalType: "address",
          },
          {
            name: "chainId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "txHash",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "createdAt",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "amountUSDC",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "fileURI",
            type: "string",
            internalType: "string",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
      {
        name: "vs",
        type: "uint8[]",
        internalType: "uint8[]",
      },
      {
        name: "rs",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "ss",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "removeFacilitator",
    inputs: [
      {
        name: "facilitator",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [
      {
        name: "newOwner",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "usedNonces",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "verifyReceipt",
    inputs: [
      {
        name: "r",
        type: "tuple",
        internalType: "struct ProofOfIncome.ReceiptInput",
        components: [
          {
            name: "fromAddress",
            type: "address",
            internalType: "address",
          },
          {
            name: "toAddress",
            type: "address",
            internalType: "address",
          },
          {
            name: "chainId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "txHash",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "createdAt",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "amountUSDC",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "fileURI",
            type: "string",
            internalType: "string",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
      {
        name: "v",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "sigR",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "sigS",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "FacilitatorAdded",
    inputs: [
      {
        name: "facilitator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "FacilitatorRemoved",
    inputs: [
      {
        name: "facilitator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "IncomeProven",
    inputs: [
      {
        name: "agent",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "validCount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "monthlyIncomeUSDC",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "OwnableInvalidOwner",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "OwnableUnauthorizedAccount",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
  },
];
