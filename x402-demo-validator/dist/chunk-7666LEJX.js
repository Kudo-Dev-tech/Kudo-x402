// src/index.ts
import {
  logger as logger4
} from "@elizaos/core";

// src/plugin.ts
import {
  ModelType as ModelType2,
  logger as logger3
} from "@elizaos/core";
import { z } from "zod";

// src/services/kudoValidationService.ts
import { Service, logger, ModelType } from "@elizaos/core";
import { createPublicClient, createWalletClient, http, decodeEventLog } from "viem";

// src/PaymentHistoryABI.ts
var paymentHistoryABI = [
  {
    type: "constructor",
    inputs: [
      {
        name: "validationRegistry",
        type: "address",
        internalType: "address"
      },
      {
        name: "_owner",
        type: "address",
        internalType: "address"
      }
    ],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "addValidator",
    inputs: [
      {
        name: "validator",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getAgentScore",
    inputs: [
      {
        name: "agent",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "uint8"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getVerifiedPayments",
    inputs: [
      {
        name: "agent",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct PaymentHistory.Payment[]",
        components: [
          {
            name: "requestHash",
            type: "bytes32",
            internalType: "bytes32"
          },
          {
            name: "covenantId",
            type: "uint256",
            internalType: "uint256"
          },
          {
            name: "status",
            type: "uint8",
            internalType: "enum PaymentHistory.Status"
          }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "i_kudo",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IKudo"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "isValidator",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "markLatePayments",
    inputs: [
      {
        name: "agent",
        type: "address",
        internalType: "address"
      },
      {
        name: "covenantIds",
        type: "uint256[]",
        internalType: "uint256[]"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "removeValidator",
    inputs: [
      {
        name: "validator",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "setKudo",
    inputs: [
      {
        name: "_kudo",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [
      {
        name: "newOwner",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "validatePayment",
    inputs: [
      {
        name: "agent",
        type: "address",
        internalType: "address"
      },
      {
        name: "covenantId",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "score",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "requestHash",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "responseUri",
        type: "string",
        internalType: "string"
      },
      {
        name: "responseHash",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "tag",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "verifiedPayments",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      },
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [
      {
        name: "requestHash",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "covenantId",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "status",
        type: "uint8",
        internalType: "enum PaymentHistory.Status"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "event",
    name: "KudoSet",
    inputs: [
      {
        name: "kudo",
        type: "address",
        indexed: true,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "PaymentMarkedLate",
    inputs: [
      {
        name: "agent",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "covenantId",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "PaymentValidated",
    inputs: [
      {
        name: "agent",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "covenantId",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "score",
        type: "uint8",
        indexed: false,
        internalType: "uint8"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "ValidatorAdded",
    inputs: [
      {
        name: "validator",
        type: "address",
        indexed: true,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "ValidatorRemoved",
    inputs: [
      {
        name: "validator",
        type: "address",
        indexed: true,
        internalType: "address"
      }
    ],
    anonymous: false
  }
];

// src/KudoABI.ts
var KudoABI = [
  {
    type: "constructor",
    inputs: [
      {
        name: "creditLimit",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "incomeHistory",
        type: "address",
        internalType: "address"
      },
      {
        name: "paymentHistory",
        type: "address",
        internalType: "address"
      },
      {
        name: "admin",
        type: "address",
        internalType: "address"
      },
      {
        name: "initialDelay",
        type: "uint48",
        internalType: "uint48"
      }
    ],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "DEFAULT_ADMIN_ROLE",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "EVALUATOR_CONTRACT_ROLE",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "acceptDefaultAdminTransfer",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      {
        name: "to",
        type: "address",
        internalType: "address"
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "beginDefaultAdminTransfer",
    inputs: [
      {
        name: "newAdmin",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "calculateCreditLimit",
    inputs: [
      {
        name: "creditScore",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "maxLimit",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "pure"
  },
  {
    type: "function",
    name: "cancelDefaultAdminTransfer",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "changeDefaultAdminDelay",
    inputs: [
      {
        name: "newDelay",
        type: "uint48",
        internalType: "uint48"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "defaultAdmin",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "defaultAdminDelay",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint48",
        internalType: "uint48"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "defaultAdminDelayIncreaseWait",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint48",
        internalType: "uint48"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getAgentAvailableCredit",
    inputs: [
      {
        name: "agent",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getAgentCovenantsData",
    inputs: [
      {
        name: "agent",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct Kudo.CovenantData[]",
        components: [
          {
            name: "agentWallet",
            type: "address",
            internalType: "address"
          },
          {
            name: "agentId",
            type: "uint256",
            internalType: "uint256"
          },
          {
            name: "status",
            type: "uint8",
            internalType: "enum Kudo.CovenantStatus"
          },
          {
            name: "nftType",
            type: "string",
            internalType: "string"
          },
          {
            name: "ask",
            type: "string",
            internalType: "string"
          },
          {
            name: "covenantPromise",
            type: "string",
            internalType: "string"
          },
          {
            name: "promiseDetail",
            type: "string",
            internalType: "string"
          },
          {
            name: "askSettlementData",
            type: "string",
            internalType: "string"
          },
          {
            name: "promiseSettlementData",
            type: "string",
            internalType: "string"
          },
          {
            name: "abilityScore",
            type: "uint128",
            internalType: "uint128"
          },
          {
            name: "debtAmount",
            type: "uint256",
            internalType: "uint256"
          }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getAgentCreditLimit",
    inputs: [
      {
        name: "agent",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getAgentCreditScore",
    inputs: [
      {
        name: "agent",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getAgentDebt",
    inputs: [
      {
        name: "agent",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getApproved",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getCovenant",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct Kudo.CovenantData",
        components: [
          {
            name: "agentWallet",
            type: "address",
            internalType: "address"
          },
          {
            name: "agentId",
            type: "uint256",
            internalType: "uint256"
          },
          {
            name: "status",
            type: "uint8",
            internalType: "enum Kudo.CovenantStatus"
          },
          {
            name: "nftType",
            type: "string",
            internalType: "string"
          },
          {
            name: "ask",
            type: "string",
            internalType: "string"
          },
          {
            name: "covenantPromise",
            type: "string",
            internalType: "string"
          },
          {
            name: "promiseDetail",
            type: "string",
            internalType: "string"
          },
          {
            name: "askSettlementData",
            type: "string",
            internalType: "string"
          },
          {
            name: "promiseSettlementData",
            type: "string",
            internalType: "string"
          },
          {
            name: "abilityScore",
            type: "uint128",
            internalType: "uint128"
          },
          {
            name: "debtAmount",
            type: "uint256",
            internalType: "uint256"
          }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getCovenantDetails",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct Kudo.CovenantDetails",
        components: [
          {
            name: "nftId",
            type: "uint256",
            internalType: "uint256"
          },
          {
            name: "agentName",
            type: "string",
            internalType: "string"
          },
          {
            name: "agentId",
            type: "string",
            internalType: "string"
          },
          {
            name: "owner",
            type: "address",
            internalType: "address"
          },
          {
            name: "promiseSettlementData",
            type: "string",
            internalType: "string"
          },
          {
            name: "covenantData",
            type: "tuple",
            internalType: "struct Kudo.CovenantData",
            components: [
              {
                name: "agentWallet",
                type: "address",
                internalType: "address"
              },
              {
                name: "agentId",
                type: "uint256",
                internalType: "uint256"
              },
              {
                name: "status",
                type: "uint8",
                internalType: "enum Kudo.CovenantStatus"
              },
              {
                name: "nftType",
                type: "string",
                internalType: "string"
              },
              {
                name: "ask",
                type: "string",
                internalType: "string"
              },
              {
                name: "covenantPromise",
                type: "string",
                internalType: "string"
              },
              {
                name: "promiseDetail",
                type: "string",
                internalType: "string"
              },
              {
                name: "askSettlementData",
                type: "string",
                internalType: "string"
              },
              {
                name: "promiseSettlementData",
                type: "string",
                internalType: "string"
              },
              {
                name: "abilityScore",
                type: "uint128",
                internalType: "uint128"
              },
              {
                name: "debtAmount",
                type: "uint256",
                internalType: "uint256"
              }
            ]
          }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getCovenantsDetails",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct Kudo.CovenantDetails[]",
        components: [
          {
            name: "nftId",
            type: "uint256",
            internalType: "uint256"
          },
          {
            name: "agentName",
            type: "string",
            internalType: "string"
          },
          {
            name: "agentId",
            type: "string",
            internalType: "string"
          },
          {
            name: "owner",
            type: "address",
            internalType: "address"
          },
          {
            name: "promiseSettlementData",
            type: "string",
            internalType: "string"
          },
          {
            name: "covenantData",
            type: "tuple",
            internalType: "struct Kudo.CovenantData",
            components: [
              {
                name: "agentWallet",
                type: "address",
                internalType: "address"
              },
              {
                name: "agentId",
                type: "uint256",
                internalType: "uint256"
              },
              {
                name: "status",
                type: "uint8",
                internalType: "enum Kudo.CovenantStatus"
              },
              {
                name: "nftType",
                type: "string",
                internalType: "string"
              },
              {
                name: "ask",
                type: "string",
                internalType: "string"
              },
              {
                name: "covenantPromise",
                type: "string",
                internalType: "string"
              },
              {
                name: "promiseDetail",
                type: "string",
                internalType: "string"
              },
              {
                name: "askSettlementData",
                type: "string",
                internalType: "string"
              },
              {
                name: "promiseSettlementData",
                type: "string",
                internalType: "string"
              },
              {
                name: "abilityScore",
                type: "uint128",
                internalType: "uint128"
              },
              {
                name: "debtAmount",
                type: "uint256",
                internalType: "uint256"
              }
            ]
          }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getCovenantsWithStatus",
    inputs: [
      {
        name: "status",
        type: "uint8",
        internalType: "enum Kudo.CovenantStatus"
      }
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct Kudo.CovenantData[]",
        components: [
          {
            name: "agentWallet",
            type: "address",
            internalType: "address"
          },
          {
            name: "agentId",
            type: "uint256",
            internalType: "uint256"
          },
          {
            name: "status",
            type: "uint8",
            internalType: "enum Kudo.CovenantStatus"
          },
          {
            name: "nftType",
            type: "string",
            internalType: "string"
          },
          {
            name: "ask",
            type: "string",
            internalType: "string"
          },
          {
            name: "covenantPromise",
            type: "string",
            internalType: "string"
          },
          {
            name: "promiseDetail",
            type: "string",
            internalType: "string"
          },
          {
            name: "askSettlementData",
            type: "string",
            internalType: "string"
          },
          {
            name: "promiseSettlementData",
            type: "string",
            internalType: "string"
          },
          {
            name: "abilityScore",
            type: "uint128",
            internalType: "uint128"
          },
          {
            name: "debtAmount",
            type: "uint256",
            internalType: "uint256"
          }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getCreditLimit",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getIncomeScore",
    inputs: [
      {
        name: "agent",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getPaymentScore",
    inputs: [
      {
        name: "agent",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getRoleAdmin",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "grantRole",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "account",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "hasRole",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "account",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "i_paymentHistory",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IPaymentHistory"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "isApprovedForAll",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address"
      },
      {
        name: "operator",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "mintCovenant",
    inputs: [
      {
        name: "agentId",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "debtAmount",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "covenantPromise",
        type: "string",
        internalType: "string"
      },
      {
        name: "ask",
        type: "string",
        internalType: "string"
      },
      {
        name: "nftType",
        type: "string",
        internalType: "string"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "mintCovenantOnBehalfOf",
    inputs: [
      {
        name: "recipient",
        type: "address",
        internalType: "address"
      },
      {
        name: "agentAddress",
        type: "address",
        internalType: "address"
      },
      {
        name: "agentId",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "debtAmount",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "covenantPromise",
        type: "string",
        internalType: "string"
      },
      {
        name: "ask",
        type: "string",
        internalType: "string"
      },
      {
        name: "nftType",
        type: "string",
        internalType: "string"
      },
      {
        name: "v",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "r",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "s",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "ownerOf",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "pendingDefaultAdmin",
    inputs: [],
    outputs: [
      {
        name: "newAdmin",
        type: "address",
        internalType: "address"
      },
      {
        name: "schedule",
        type: "uint48",
        internalType: "uint48"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "pendingDefaultAdminDelay",
    inputs: [],
    outputs: [
      {
        name: "newDelay",
        type: "uint48",
        internalType: "uint48"
      },
      {
        name: "schedule",
        type: "uint48",
        internalType: "uint48"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "renounceRole",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "account",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "revokeRole",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "account",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "rollbackDefaultAdminDelay",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "safeTransferFrom",
    inputs: [
      {
        name: "from",
        type: "address",
        internalType: "address"
      },
      {
        name: "to",
        type: "address",
        internalType: "address"
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "safeTransferFrom",
    inputs: [
      {
        name: "from",
        type: "address",
        internalType: "address"
      },
      {
        name: "to",
        type: "address",
        internalType: "address"
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "setApprovalForAll",
    inputs: [
      {
        name: "operator",
        type: "address",
        internalType: "address"
      },
      {
        name: "approved",
        type: "bool",
        internalType: "bool"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "setAskSettlementData",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "settlementData",
        type: "string",
        internalType: "string"
      },
      {
        name: "promiseDetail",
        type: "string",
        internalType: "string"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "setCovenantStatus",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "status",
        type: "uint8",
        internalType: "enum Kudo.CovenantStatus"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "setPromiseSettlementData",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "data",
        type: "string",
        internalType: "string"
      },
      {
        name: "requestUri",
        type: "string",
        internalType: "string"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "supportsInterface",
    inputs: [
      {
        name: "interfaceId",
        type: "bytes4",
        internalType: "bytes4"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "tokenURI",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "transferFrom",
    inputs: [
      {
        name: "from",
        type: "address",
        internalType: "address"
      },
      {
        name: "to",
        type: "address",
        internalType: "address"
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "event",
    name: "AgentSet",
    inputs: [
      {
        name: "agentWallet",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "agentName",
        type: "string",
        indexed: false,
        internalType: "string"
      },
      {
        name: "agentId",
        type: "string",
        indexed: false,
        internalType: "string"
      },
      {
        name: "teeId",
        type: "string",
        indexed: false,
        internalType: "string"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "Approval",
    inputs: [
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "approved",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "ApprovalForAll",
    inputs: [
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "operator",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "approved",
        type: "bool",
        indexed: false,
        internalType: "bool"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "AskSettlementSet",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "askSettlement",
        type: "string",
        indexed: false,
        internalType: "string"
      },
      {
        name: "promiseDetails",
        type: "string",
        indexed: false,
        internalType: "string"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "CovenantAskSet",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "status",
        type: "uint8",
        indexed: false,
        internalType: "enum Kudo.CovenantStatus"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "CovenantMinted",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "agent",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "nftType",
        type: "string",
        indexed: false,
        internalType: "string"
      },
      {
        name: "covenantPromise",
        type: "string",
        indexed: false,
        internalType: "string"
      },
      {
        name: "ask",
        type: "string",
        indexed: false,
        internalType: "string"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "CovenantPromiseSet",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        indexed: true,
        internalType: "uint256"
      },
      {
        name: "status",
        type: "uint8",
        indexed: false,
        internalType: "enum Kudo.CovenantStatus"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "CovenantRegistered",
    inputs: [
      {
        name: "requestId",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32"
      },
      {
        name: "agentWallet",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "nftId",
        type: "uint256",
        indexed: true,
        internalType: "uint256"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "DefaultAdminDelayChangeCanceled",
    inputs: [],
    anonymous: false
  },
  {
    type: "event",
    name: "DefaultAdminDelayChangeScheduled",
    inputs: [
      {
        name: "newDelay",
        type: "uint48",
        indexed: false,
        internalType: "uint48"
      },
      {
        name: "effectSchedule",
        type: "uint48",
        indexed: false,
        internalType: "uint48"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "DefaultAdminTransferCanceled",
    inputs: [],
    anonymous: false
  },
  {
    type: "event",
    name: "DefaultAdminTransferScheduled",
    inputs: [
      {
        name: "newAdmin",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "acceptSchedule",
        type: "uint48",
        indexed: false,
        internalType: "uint48"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "PromiseSettlementSet",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "promiseSettlement",
        type: "string",
        indexed: false,
        internalType: "string"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "RoleAdminChanged",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32"
      },
      {
        name: "previousAdminRole",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32"
      },
      {
        name: "newAdminRole",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "RoleGranted",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32"
      },
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "RoleRevoked",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32"
      },
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      {
        name: "from",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "to",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256"
      }
    ],
    anonymous: false
  },
  {
    type: "error",
    name: "AccessControlBadConfirmation",
    inputs: []
  },
  {
    type: "error",
    name: "AccessControlEnforcedDefaultAdminDelay",
    inputs: [
      {
        name: "schedule",
        type: "uint48",
        internalType: "uint48"
      }
    ]
  },
  {
    type: "error",
    name: "AccessControlEnforcedDefaultAdminRules",
    inputs: []
  },
  {
    type: "error",
    name: "AccessControlInvalidDefaultAdmin",
    inputs: [
      {
        name: "defaultAdmin",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "AccessControlUnauthorizedAccount",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address"
      },
      {
        name: "neededRole",
        type: "bytes32",
        internalType: "bytes32"
      }
    ]
  },
  {
    type: "error",
    name: "AccessForbidden",
    inputs: []
  },
  {
    type: "error",
    name: "AgentRegistered",
    inputs: []
  },
  {
    type: "error",
    name: "ConditionIsNotMet",
    inputs: []
  },
  {
    type: "error",
    name: "ERC721IncorrectOwner",
    inputs: [
      {
        name: "sender",
        type: "address",
        internalType: "address"
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "owner",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "ERC721InsufficientApproval",
    inputs: [
      {
        name: "operator",
        type: "address",
        internalType: "address"
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "ERC721InvalidApprover",
    inputs: [
      {
        name: "approver",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "ERC721InvalidOperator",
    inputs: [
      {
        name: "operator",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "ERC721InvalidOwner",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "ERC721InvalidReceiver",
    inputs: [
      {
        name: "receiver",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "ERC721InvalidSender",
    inputs: [
      {
        name: "sender",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "ERC721NonexistentToken",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "InvalidCovenantStatus",
    inputs: []
  },
  {
    type: "error",
    name: "InvalidParameter",
    inputs: []
  },
  {
    type: "error",
    name: "InvalidSignature",
    inputs: []
  },
  {
    type: "error",
    name: "SafeCastOverflowedUintDowncast",
    inputs: [
      {
        name: "bits",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  }
];

// src/services/kudoValidationService.ts
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// src/validationRegistryABI.ts
var validationRegistryABI = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "UPGRADE_INTERFACE_VERSION",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getAgentValidations",
    inputs: [
      {
        name: "agentId",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bytes32[]",
        internalType: "bytes32[]"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getIdentityRegistry",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getSummary",
    inputs: [
      {
        name: "agentId",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "validatorAddresses",
        type: "address[]",
        internalType: "address[]"
      },
      {
        name: "tag",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    outputs: [
      {
        name: "count",
        type: "uint64",
        internalType: "uint64"
      },
      {
        name: "avgResponse",
        type: "uint8",
        internalType: "uint8"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getValidationStatus",
    inputs: [
      {
        name: "requestHash",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    outputs: [
      {
        name: "validatorAddress",
        type: "address",
        internalType: "address"
      },
      {
        name: "agentId",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "response",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "responseHash",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "tag",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "lastUpdate",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getValidatorRequests",
    inputs: [
      {
        name: "validatorAddress",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bytes32[]",
        internalType: "bytes32[]"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getVersion",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string"
      }
    ],
    stateMutability: "pure"
  },
  {
    type: "function",
    name: "initialize",
    inputs: [
      {
        name: "_identityRegistry",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "proxiableUUID",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [
      {
        name: "newOwner",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "upgradeToAndCall",
    inputs: [
      {
        name: "newImplementation",
        type: "address",
        internalType: "address"
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "validationRequest",
    inputs: [
      {
        name: "validatorAddress",
        type: "address",
        internalType: "address"
      },
      {
        name: "agentId",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "requestUri",
        type: "string",
        internalType: "string"
      },
      {
        name: "requestHash",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "validationResponse",
    inputs: [
      {
        name: "requestHash",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "response",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "responseUri",
        type: "string",
        internalType: "string"
      },
      {
        name: "responseHash",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "tag",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "validations",
    inputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    outputs: [
      {
        name: "validatorAddress",
        type: "address",
        internalType: "address"
      },
      {
        name: "agentId",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "response",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "responseHash",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "tag",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "lastUpdate",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "event",
    name: "Initialized",
    inputs: [
      {
        name: "version",
        type: "uint64",
        indexed: false,
        internalType: "uint64"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "Upgraded",
    inputs: [
      {
        name: "implementation",
        type: "address",
        indexed: true,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "ValidationRequest",
    inputs: [
      {
        name: "validatorAddress",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "agentId",
        type: "uint256",
        indexed: true,
        internalType: "uint256"
      },
      {
        name: "requestUri",
        type: "string",
        indexed: false,
        internalType: "string"
      },
      {
        name: "requestHash",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "ValidationResponse",
    inputs: [
      {
        name: "validatorAddress",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "agentId",
        type: "uint256",
        indexed: true,
        internalType: "uint256"
      },
      {
        name: "requestHash",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32"
      },
      {
        name: "response",
        type: "uint8",
        indexed: false,
        internalType: "uint8"
      },
      {
        name: "responseUri",
        type: "string",
        indexed: false,
        internalType: "string"
      },
      {
        name: "responseHash",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32"
      },
      {
        name: "tag",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32"
      }
    ],
    anonymous: false
  },
  {
    type: "error",
    name: "AddressEmptyCode",
    inputs: [
      {
        name: "target",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "ERC1967InvalidImplementation",
    inputs: [
      {
        name: "implementation",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "ERC1967NonPayable",
    inputs: []
  },
  {
    type: "error",
    name: "FailedCall",
    inputs: []
  },
  {
    type: "error",
    name: "InvalidInitialization",
    inputs: []
  },
  {
    type: "error",
    name: "NotInitializing",
    inputs: []
  },
  {
    type: "error",
    name: "OwnableInvalidOwner",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "OwnableUnauthorizedAccount",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "UUPSUnauthorizedCallContext",
    inputs: []
  },
  {
    type: "error",
    name: "UUPSUnsupportedProxiableUUID",
    inputs: [
      {
        name: "slot",
        type: "bytes32",
        internalType: "bytes32"
      }
    ]
  }
];

// src/services/kudoValidationService.ts
var KudoValidatorService = class _KudoValidatorService extends Service {
  constructor(runtime) {
    super();
    this.runtime = runtime;
    if (!process.env.PAYMENT_HISTORY_ADDR) {
      throw new Error("PAYMENT_HISTORY_ADDR is required");
    }
    if (!process.env.KUDO_ADDR) {
      throw new Error("KUDO_ADDR is required");
    }
    if (!process.env.PRIVATE_KEY) {
      throw new Error("PRIVATE_KEY is required");
    }
    if (!process.env.RPC_ENDPOINT) {
      throw new Error("RPC_ENDPOINT is required");
    }
    this.paymentHistoryContract = process.env.PAYMENT_HISTORY_ADDR;
    this.validationRegistryContract = process.env.VALIDATION_REGISTRY_ADDR;
    this.kudoContract = process.env.KUDO_ADDR;
    const account = privateKeyToAccount(process.env.PRIVATE_KEY);
    this.walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(process.env.RPC_ENDPOINT)
    });
    this.publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(process.env.RPC_ENDPOINT)
    });
  }
  static serviceType = "s";
  capabilityDescription = "The agent can listen to and respond to smart contract events";
  walletClient;
  unwatch = null;
  paymentHistoryContract;
  validationRegistryContract;
  kudoContract;
  publicClient;
  static async start(runtime) {
    const service = new _KudoValidatorService(runtime);
    await service.initialize();
    return service;
  }
  async initialize() {
    this.startEventListener();
  }
  startEventListener() {
    console.log("Listening for ValidationRequest events at ", process.env.VALIDATION_REGISTRY_ADDR);
    this.unwatch = this.publicClient.watchContractEvent({
      address: process.env.VALIDATION_REGISTRY_ADDR,
      abi: validationRegistryABI,
      eventName: "ValidationRequest",
      onLogs: async (logs) => {
        console.log("Received validation request logs:", logs.length);
        for (const log of logs) {
          console.log("here are the validation request logs", log);
          await this.handleEvent(log);
        }
      },
      pollingInterval: 1e4
    });
  }
  async getScore(covenantId) {
    try {
      const covenantData = await this.publicClient.readContract({
        address: this.kudoContract,
        abi: KudoABI,
        functionName: "getCovenant",
        args: [BigInt(covenantId)]
      });
      const covenantPromise = covenantData.covenantPromise;
      const promiseSettlementData = covenantData.promiseSettlementData;
      logger.info(`Covenant Promise: ${covenantPromise}`);
      logger.info(`Promise Settlement Data: ${promiseSettlementData}`);
      let transactionHash = promiseSettlementData;
      if (!transactionHash) {
        logger.warn("No transaction hash found in promiseSettlementData");
        return 0;
      }
      const transactionReceipt = await this.publicClient.getTransactionReceipt({
        hash: transactionHash
      });
      if (transactionReceipt.status !== "success") {
        logger.warn("Transaction was not successful");
        return 0;
      }
      const transferEventAbi = [
        {
          type: "event",
          name: "Transfer",
          inputs: [
            { indexed: true, name: "from", type: "address" },
            { indexed: true, name: "to", type: "address" },
            { indexed: false, name: "value", type: "uint256" }
          ]
        }
      ];
      const transferEvents = transactionReceipt.logs.map((log) => {
        try {
          const decoded = decodeEventLog({
            abi: transferEventAbi,
            data: log.data,
            topics: log.topics
          });
          if (decoded.eventName === "Transfer" && decoded.args) {
            return {
              from: decoded.args.from,
              to: decoded.args.to,
              value: decoded.args.value,
              address: log.address
            };
          }
          return null;
        } catch {
          return null;
        }
      }).filter((event) => event !== null);
      if (transferEvents.length === 0) {
        logger.warn("No Transfer events found in transaction");
        return 0;
      }
      transferEvents.forEach((event, index) => {
        logger.info(`Transfer Event ${index + 1}:`);
        logger.info(`  Token Contract: ${event.address}`);
        logger.info(`  From: ${event.from}`);
        logger.info(`  To: ${event.to}`);
        logger.info(`  Amount: ${event.value.toString()}`);
      });
      const transferDetails = transferEvents.map(
        (event, index) => `Transfer ${index + 1}:
- Token: ${event.address}
- From: ${event.from}
- To: ${event.to}
- Amount: ${event.value.toString()}`
      ).join("\n\n");
      const prompt = `You are analyzing a blockchain transaction to determine if it fulfills a covenant promise.

Covenant Promise:
${covenantPromise}

Transaction Details:
${transferDetails}

Transaction Hash: ${transactionHash}

Question: Does this transaction fulfill the covenant promise?
Consider:
1. Is the transferred amount greater than or equal to what was promised?
2. Are the from/to addresses correct based on the promise?

Answer with only "YES" or "NO" followed by a brief one-sentence explanation.`;
      try {
        const response = await this.runtime.useModel(ModelType.TEXT_SMALL, {
          prompt
        });
        const responseText = typeof response === "string" ? response : response || "";
        const isFullfilled = responseText.toLowerCase().includes("yes");
        logger.info(`Covenant Promise: ${covenantPromise}`);
        logger.info(`Transaction Hash: ${transactionHash}`);
        logger.info(`LLM Analysis: ${responseText}`);
        logger.info(
          `Transaction validation result: ${isFullfilled ? "FULFILLED" : "NOT_FULFILLED"}`
        );
        return isFullfilled ? 100 : 0;
      } catch (error) {
        logger.error("Error calling LLM:", error);
        logger.info(
          "Falling back to simple validation: Transfer events found, returning score 100"
        );
        return 100;
      }
    } catch (error) {
      logger.error("Error in getScore:", error);
      return 0;
    }
  }
  async handleEvent(eventLog) {
    const eventParams = this.extractEventParameters(eventLog);
    console.log("Here are the eventParams", eventParams);
    const covenantId = eventParams.requestUri;
    const score = await this.getScore(covenantId);
    await this.validatePayment(
      eventParams.validatorAddress,
      BigInt(covenantId),
      score,
      eventParams.requestHash
    );
    logger.info(
      `Validate Payment has been completed for agentId: ${eventParams.agentId}, covenantId: ${covenantId}, score: ${score}`
    );
  }
  async validatePayment(agentAddress, covenantId, score, requestHash) {
    logger.info(
      `Validating payment for covenantId ${covenantId} with score ${score}`
    );
    const responseUri = `validated-${covenantId}-${Date.now()}`;
    const responseHash = `0x${"0".repeat(64)}`;
    const tag = `0x${"0".repeat(64)}`;
    const { request } = await this.publicClient.simulateContract({
      address: this.paymentHistoryContract,
      abi: paymentHistoryABI,
      functionName: "validatePayment",
      chain: baseSepolia,
      account: privateKeyToAccount(process.env.PRIVATE_KEY),
      args: [
        agentAddress,
        covenantId,
        score,
        requestHash,
        responseUri,
        responseHash,
        tag
      ]
    });
    try {
      const hash = await this.walletClient.writeContract(request);
      logger.info("Validation is successful, with hash:", hash);
    } catch (error) {
      logger.info("Validation is unsuccesful:", error);
    }
  }
  extractEventParameters(eventLog) {
    return eventLog.args;
  }
  async stop() {
    if (this.unwatch) {
      this.unwatch();
      this.unwatch = null;
    }
  }
};

// src/actions/checkValidation.ts
import {
  logger as logger2
} from "@elizaos/core";
import { createPublicClient as createPublicClient2, createWalletClient as createWalletClient2, http as http2 } from "viem";
import { baseSepolia as baseSepolia2 } from "viem/chains";
import { privateKeyToAccount as privateKeyToAccount2 } from "viem/accounts";
var checkValidationAction = {
  name: "CHECK_VALIDATION",
  similes: ["VALIDATE", "CHECK_VALIDATION"],
  description: "A action to verify the payment",
  validate: async (_runtime, _message, _state) => {
    return true;
  },
  handler: async (runtime, message, state, options, callback, responses) => {
    logger2.info("Starting validation...");
    const walletClient = createWalletClient2({
      account: process.env.PRIVATE_KEY,
      chain: baseSepolia2,
      transport: http2(process.env.RPC_ENDPOINT)
    });
    const publicClient = createPublicClient2({
      chain: baseSepolia2,
      transport: http2(process.env.RPC_ENDPOINT)
    });
    const { result, request } = await publicClient.simulateContract({
      address: process.env.REGISTRY_CONTRACT_ADDR,
      abi: paymentHistoryABI,
      functionName: "validatePayment",
      chain: baseSepolia2,
      account: privateKeyToAccount2(process.env.PRIVATE_KEY),
      args: []
    });
    try {
      const hash = await walletClient.writeContract(request);
      logger2.info("Validation is successful, with hash:", hash);
      return { success: true };
    } catch (error) {
      logger2.info("Validation is unsuccesful:", error);
      return { success: false };
    }
  },
  examples: []
};

// src/plugin.ts
var configSchema = z.object({
  KUDO_DEMO_VARIABLE: z.string().min(1, "Kudo demo variable is not provided").optional().transform((val) => {
    if (!val) {
      console.warn("Warning: Kudo demo variable is not provided");
    }
    return val;
  })
});
var plugin = {
  name: "kudo-demo",
  description: "A demo plugin for Kudo with Twitter posting and credit card transaction actions",
  // Set lowest priority so real models take precedence
  priority: -1e3,
  config: {
    KUDO_DEMO_VARIABLE: process.env.KUDO_DEMO_VARIABLE
  },
  async init(config) {
    logger3.info("*** Initializing kudo-demo plugin ***");
    try {
      const validatedConfig = await configSchema.parseAsync(config);
      for (const [key, value] of Object.entries(validatedConfig)) {
        if (value) process.env[key] = value;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid plugin configuration: ${error.errors.map((e) => e.message).join(", ")}`
        );
      }
      throw error;
    }
  },
  models: {
    [ModelType2.TEXT_SMALL]: async (_runtime, { prompt, stopSequences = [] }) => {
      return "Never gonna give you up, never gonna let you down, never gonna run around and desert you...";
    },
    [ModelType2.TEXT_LARGE]: async (_runtime, {
      prompt,
      stopSequences = [],
      maxTokens = 8192,
      temperature = 0.7,
      frequencyPenalty = 0.7,
      presencePenalty = 0.7
    }) => {
      return "Never gonna make you cry, never gonna say goodbye, never gonna tell a lie and hurt you...";
    }
  },
  routes: [
    {
      name: "helloworld",
      path: "/helloworld",
      type: "GET",
      handler: async (_req, res) => {
        res.json({
          message: "Hello World!"
        });
      }
    }
  ],
  events: {
    MESSAGE_RECEIVED: [
      async (params) => {
        logger3.info("MESSAGE_RECEIVED event received");
        logger3.info(Object.keys(params));
      }
    ],
    VOICE_MESSAGE_RECEIVED: [
      async (params) => {
        logger3.info("VOICE_MESSAGE_RECEIVED event received");
        logger3.info(Object.keys(params));
      }
    ],
    WORLD_CONNECTED: [
      async (params) => {
        logger3.info("WORLD_CONNECTED event received");
        logger3.info(Object.keys(params));
      }
    ],
    WORLD_JOINED: [
      async (params) => {
        logger3.info("WORLD_JOINED event received");
        logger3.info(Object.keys(params));
      }
    ]
  },
  services: [KudoValidatorService],
  actions: [checkValidationAction],
  providers: []
};
var plugin_default = plugin;

// src/index.ts
var character = {
  name: "Eliza",
  plugins: [
    "@elizaos/plugin-sql",
    ...process.env.ANTHROPIC_API_KEY ? ["@elizaos/plugin-anthropic"] : [],
    ...process.env.OPENAI_API_KEY ? ["@elizaos/plugin-openai"] : [],
    ...!process.env.OPENAI_API_KEY ? ["@elizaos/plugin-local-ai"] : [],
    ...process.env.DISCORD_API_TOKEN ? ["@elizaos/plugin-discord"] : [],
    ...process.env.TWITTER_USERNAME ? ["@elizaos/plugin-twitter"] : [],
    ...process.env.TELEGRAM_BOT_TOKEN ? ["@elizaos/plugin-telegram"] : [],
    ...!process.env.IGNORE_BOOTSTRAP ? ["@elizaos/plugin-bootstrap"] : []
  ],
  settings: {
    secrets: {}
  },
  system: "Respond to all messages in a helpful, conversational manner. Provide assistance on a wide range of topics, using knowledge when needed. Be concise but thorough, friendly but professional. Use humor when appropriate and be empathetic to user needs. Provide valuable information and insights when questions are asked.",
  bio: [
    "Engages with all types of questions and conversations",
    "Provides helpful, concise responses",
    "Uses knowledge resources effectively when needed",
    "Balances brevity with completeness",
    "Uses humor and empathy appropriately",
    "Adapts tone to match the conversation context",
    "Offers assistance proactively",
    "Communicates clearly and directly"
  ],
  topics: [
    "general knowledge and information",
    "problem solving and troubleshooting",
    "technology and software",
    "community building and management",
    "business and productivity",
    "creativity and innovation",
    "personal development",
    "communication and collaboration",
    "education and learning",
    "entertainment and media"
  ],
  messageExamples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "This user keeps derailing technical discussions with personal problems."
        }
      },
      {
        name: "Eliza",
        content: {
          text: "DM them. Sounds like they need to talk about something else."
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "I tried, they just keep bringing drama back to the main channel."
        }
      },
      {
        name: "Eliza",
        content: {
          text: "Send them my way. I've got time today."
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "I can't handle being a mod anymore. It's affecting my mental health."
        }
      },
      {
        name: "Eliza",
        content: {
          text: "Drop the channels. You come first."
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "But who's going to handle everything?"
        }
      },
      {
        name: "Eliza",
        content: {
          text: "We will. Take the break. Come back when you're ready."
        }
      }
    ]
  ],
  style: {
    all: [
      "Keep responses concise but informative",
      "Use clear and direct language",
      "Be engaging and conversational",
      "Use humor when appropriate",
      "Be empathetic and understanding",
      "Provide helpful information",
      "Be encouraging and positive",
      "Adapt tone to the conversation",
      "Use knowledge resources when needed",
      "Respond to all types of questions"
    ],
    chat: [
      "Be conversational and natural",
      "Engage with the topic at hand",
      "Be helpful and informative",
      "Show personality and warmth"
    ]
  }
};
var initCharacter = ({ runtime }) => {
  logger4.info("Initializing character");
  logger4.info("Name: ", character.name);
};
var projectAgent = {
  character,
  init: async (runtime) => await initCharacter({ runtime }),
  plugins: [plugin_default]
};
var project = {
  agents: [projectAgent]
};
var src_default = project;

export {
  character,
  projectAgent,
  src_default
};
//# sourceMappingURL=chunk-7666LEJX.js.map