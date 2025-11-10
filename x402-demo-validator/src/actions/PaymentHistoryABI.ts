export const paymentHistoryABI = [
  {
    type: "constructor",
    inputs: [
      { name: "validationRegistry", type: "address", internalType: "address" },
      { name: "_owner", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addValidator",
    inputs: [{ name: "validator", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getAgentScore",
    inputs: [{ name: "agent", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint8", internalType: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getVerifiedPayments",
    inputs: [{ name: "agent", type: "address", internalType: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct PaymentHistory.Payment[]",
        components: [
          { name: "requestHash", type: "bytes32", internalType: "bytes32" },
          { name: "covenantId", type: "bytes32", internalType: "bytes32" },
          {
            name: "status",
            type: "uint8",
            internalType: "enum PaymentHistory.Status",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "i_kudo",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract IKudo" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isValidator",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "markLatePayments",
    inputs: [
      { name: "agent", type: "address", internalType: "address" },
      { name: "covenantIds", type: "bytes32[]", internalType: "bytes32[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "removeValidator",
    inputs: [{ name: "validator", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setKudo",
    inputs: [{ name: "_kudo", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [{ name: "newOwner", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "validatePayment",
    inputs: [
      { name: "agent", type: "address", internalType: "address" },
      { name: "covenantId", type: "bytes32", internalType: "bytes32" },
      { name: "score", type: "uint8", internalType: "uint8" },
      { name: "requestHash", type: "bytes32", internalType: "bytes32" },
      { name: "responseUri", type: "string", internalType: "string" },
      { name: "responseHash", type: "bytes32", internalType: "bytes32" },
      { name: "tag", type: "bytes32", internalType: "bytes32" },
      { name: "nftId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "verifiedPayments",
    inputs: [
      { name: "", type: "address", internalType: "address" },
      { name: "", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      { name: "requestHash", type: "bytes32", internalType: "bytes32" },
      { name: "covenantId", type: "bytes32", internalType: "bytes32" },
      {
        name: "status",
        type: "uint8",
        internalType: "enum PaymentHistory.Status",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "KudoSet",
    inputs: [
      { name: "kudo", type: "address", indexed: true, internalType: "address" },
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
    type: "event",
    name: "PaymentMarkedLate",
    inputs: [
      {
        name: "agent",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "covenantId",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PaymentValidated",
    inputs: [
      {
        name: "agent",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "covenantId",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
      { name: "score", type: "uint8", indexed: false, internalType: "uint8" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ValidatorAdded",
    inputs: [
      {
        name: "validator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ValidatorRemoved",
    inputs: [
      {
        name: "validator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
];
