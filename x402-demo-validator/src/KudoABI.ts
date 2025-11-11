import { Abi } from "viem";

export const KudoABI: Abi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "creditLimit",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "incomeHistory",
        type: "address",
        internalType: "address",
      },
      {
        name: "paymentHistory",
        type: "address",
        internalType: "address",
      },
      {
        name: "admin",
        type: "address",
        internalType: "address",
      },
      {
        name: "initialDelay",
        type: "uint48",
        internalType: "uint48",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "DEFAULT_ADMIN_ROLE",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "EVALUATOR_CONTRACT_ROLE",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "acceptDefaultAdminTransfer",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [
      {
        name: "owner",
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
    name: "beginDefaultAdminTransfer",
    inputs: [
      {
        name: "newAdmin",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "calculateCreditLimit",
    inputs: [
      {
        name: "creditScore",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "maxLimit",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "cancelDefaultAdminTransfer",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "changeDefaultAdminDelay",
    inputs: [
      {
        name: "newDelay",
        type: "uint48",
        internalType: "uint48",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "defaultAdmin",
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
    name: "defaultAdminDelay",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint48",
        internalType: "uint48",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "defaultAdminDelayIncreaseWait",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint48",
        internalType: "uint48",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAgentAvailableCredit",
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
    name: "getAgentCovenantsData",
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
        type: "tuple[]",
        internalType: "struct Kudo.CovenantData[]",
        components: [
          {
            name: "agentWallet",
            type: "address",
            internalType: "address",
          },
          {
            name: "agentId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "status",
            type: "uint8",
            internalType: "enum Kudo.CovenantStatus",
          },
          {
            name: "nftType",
            type: "string",
            internalType: "string",
          },
          {
            name: "ask",
            type: "string",
            internalType: "string",
          },
          {
            name: "covenantPromise",
            type: "string",
            internalType: "string",
          },
          {
            name: "promiseDetail",
            type: "string",
            internalType: "string",
          },
          {
            name: "askSettlementData",
            type: "string",
            internalType: "string",
          },
          {
            name: "promiseSettlementData",
            type: "string",
            internalType: "string",
          },
          {
            name: "abilityScore",
            type: "uint128",
            internalType: "uint128",
          },
          {
            name: "debtAmount",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAgentCreditLimit",
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
    name: "getAgentCreditScore",
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
    name: "getAgentDebt",
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
    name: "getApproved",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
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
    type: "function",
    name: "getCovenant",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        internalType: "uint256",
      },
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
            internalType: "address",
          },
          {
            name: "agentId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "status",
            type: "uint8",
            internalType: "enum Kudo.CovenantStatus",
          },
          {
            name: "nftType",
            type: "string",
            internalType: "string",
          },
          {
            name: "ask",
            type: "string",
            internalType: "string",
          },
          {
            name: "covenantPromise",
            type: "string",
            internalType: "string",
          },
          {
            name: "promiseDetail",
            type: "string",
            internalType: "string",
          },
          {
            name: "askSettlementData",
            type: "string",
            internalType: "string",
          },
          {
            name: "promiseSettlementData",
            type: "string",
            internalType: "string",
          },
          {
            name: "abilityScore",
            type: "uint128",
            internalType: "uint128",
          },
          {
            name: "debtAmount",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCovenantDetails",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        internalType: "uint256",
      },
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
            internalType: "uint256",
          },
          {
            name: "agentName",
            type: "string",
            internalType: "string",
          },
          {
            name: "agentId",
            type: "string",
            internalType: "string",
          },
          {
            name: "owner",
            type: "address",
            internalType: "address",
          },
          {
            name: "promiseSettlementData",
            type: "string",
            internalType: "string",
          },
          {
            name: "covenantData",
            type: "tuple",
            internalType: "struct Kudo.CovenantData",
            components: [
              {
                name: "agentWallet",
                type: "address",
                internalType: "address",
              },
              {
                name: "agentId",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "status",
                type: "uint8",
                internalType: "enum Kudo.CovenantStatus",
              },
              {
                name: "nftType",
                type: "string",
                internalType: "string",
              },
              {
                name: "ask",
                type: "string",
                internalType: "string",
              },
              {
                name: "covenantPromise",
                type: "string",
                internalType: "string",
              },
              {
                name: "promiseDetail",
                type: "string",
                internalType: "string",
              },
              {
                name: "askSettlementData",
                type: "string",
                internalType: "string",
              },
              {
                name: "promiseSettlementData",
                type: "string",
                internalType: "string",
              },
              {
                name: "abilityScore",
                type: "uint128",
                internalType: "uint128",
              },
              {
                name: "debtAmount",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
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
            internalType: "uint256",
          },
          {
            name: "agentName",
            type: "string",
            internalType: "string",
          },
          {
            name: "agentId",
            type: "string",
            internalType: "string",
          },
          {
            name: "owner",
            type: "address",
            internalType: "address",
          },
          {
            name: "promiseSettlementData",
            type: "string",
            internalType: "string",
          },
          {
            name: "covenantData",
            type: "tuple",
            internalType: "struct Kudo.CovenantData",
            components: [
              {
                name: "agentWallet",
                type: "address",
                internalType: "address",
              },
              {
                name: "agentId",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "status",
                type: "uint8",
                internalType: "enum Kudo.CovenantStatus",
              },
              {
                name: "nftType",
                type: "string",
                internalType: "string",
              },
              {
                name: "ask",
                type: "string",
                internalType: "string",
              },
              {
                name: "covenantPromise",
                type: "string",
                internalType: "string",
              },
              {
                name: "promiseDetail",
                type: "string",
                internalType: "string",
              },
              {
                name: "askSettlementData",
                type: "string",
                internalType: "string",
              },
              {
                name: "promiseSettlementData",
                type: "string",
                internalType: "string",
              },
              {
                name: "abilityScore",
                type: "uint128",
                internalType: "uint128",
              },
              {
                name: "debtAmount",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCovenantsWithStatus",
    inputs: [
      {
        name: "status",
        type: "uint8",
        internalType: "enum Kudo.CovenantStatus",
      },
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
            internalType: "address",
          },
          {
            name: "agentId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "status",
            type: "uint8",
            internalType: "enum Kudo.CovenantStatus",
          },
          {
            name: "nftType",
            type: "string",
            internalType: "string",
          },
          {
            name: "ask",
            type: "string",
            internalType: "string",
          },
          {
            name: "covenantPromise",
            type: "string",
            internalType: "string",
          },
          {
            name: "promiseDetail",
            type: "string",
            internalType: "string",
          },
          {
            name: "askSettlementData",
            type: "string",
            internalType: "string",
          },
          {
            name: "promiseSettlementData",
            type: "string",
            internalType: "string",
          },
          {
            name: "abilityScore",
            type: "uint128",
            internalType: "uint128",
          },
          {
            name: "debtAmount",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCreditLimit",
    inputs: [],
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
    name: "getIncomeScore",
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
    name: "getPaymentScore",
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
    name: "getRoleAdmin",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "grantRole",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "hasRole",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "account",
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
    name: "i_paymentHistory",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IPaymentHistory",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isApprovedForAll",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
      {
        name: "operator",
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
    name: "mintCovenant",
    inputs: [
      {
        name: "agentId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "debtAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "covenantPromise",
        type: "string",
        internalType: "string",
      },
      {
        name: "ask",
        type: "string",
        internalType: "string",
      },
      {
        name: "nftType",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "mintCovenantOnBehalfOf",
    inputs: [
      {
        name: "recipient",
        type: "address",
        internalType: "address",
      },
      {
        name: "agentAddress",
        type: "address",
        internalType: "address",
      },
      {
        name: "agentId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "debtAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "covenantPromise",
        type: "string",
        internalType: "string",
      },
      {
        name: "ask",
        type: "string",
        internalType: "string",
      },
      {
        name: "nftType",
        type: "string",
        internalType: "string",
      },
      {
        name: "v",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "r",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "s",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
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
    name: "ownerOf",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
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
    type: "function",
    name: "pendingDefaultAdmin",
    inputs: [],
    outputs: [
      {
        name: "newAdmin",
        type: "address",
        internalType: "address",
      },
      {
        name: "schedule",
        type: "uint48",
        internalType: "uint48",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pendingDefaultAdminDelay",
    inputs: [],
    outputs: [
      {
        name: "newDelay",
        type: "uint48",
        internalType: "uint48",
      },
      {
        name: "schedule",
        type: "uint48",
        internalType: "uint48",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "renounceRole",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "revokeRole",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "rollbackDefaultAdminDelay",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "safeTransferFrom",
    inputs: [
      {
        name: "from",
        type: "address",
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "safeTransferFrom",
    inputs: [
      {
        name: "from",
        type: "address",
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setApprovalForAll",
    inputs: [
      {
        name: "operator",
        type: "address",
        internalType: "address",
      },
      {
        name: "approved",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setAskSettlementData",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "settlementData",
        type: "string",
        internalType: "string",
      },
      {
        name: "promiseDetail",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setCovenantStatus",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "status",
        type: "uint8",
        internalType: "enum Kudo.CovenantStatus",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setPromiseSettlementData",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "data",
        type: "string",
        internalType: "string",
      },
      {
        name: "requestUri",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "supportsInterface",
    inputs: [
      {
        name: "interfaceId",
        type: "bytes4",
        internalType: "bytes4",
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
    name: "symbol",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenURI",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferFrom",
    inputs: [
      {
        name: "from",
        type: "address",
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "AgentSet",
    inputs: [
      {
        name: "agentWallet",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "agentName",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "agentId",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "teeId",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Approval",
    inputs: [
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "approved",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ApprovalForAll",
    inputs: [
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "operator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "approved",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "AskSettlementSet",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "askSettlement",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "promiseDetails",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "CovenantAskSet",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "status",
        type: "uint8",
        indexed: false,
        internalType: "enum Kudo.CovenantStatus",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "CovenantMinted",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "agent",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "nftType",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "covenantPromise",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "ask",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "CovenantPromiseSet",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "status",
        type: "uint8",
        indexed: false,
        internalType: "enum Kudo.CovenantStatus",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "CovenantRegistered",
    inputs: [
      {
        name: "requestId",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
      {
        name: "agentWallet",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "nftId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DefaultAdminDelayChangeCanceled",
    inputs: [],
    anonymous: false,
  },
  {
    type: "event",
    name: "DefaultAdminDelayChangeScheduled",
    inputs: [
      {
        name: "newDelay",
        type: "uint48",
        indexed: false,
        internalType: "uint48",
      },
      {
        name: "effectSchedule",
        type: "uint48",
        indexed: false,
        internalType: "uint48",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DefaultAdminTransferCanceled",
    inputs: [],
    anonymous: false,
  },
  {
    type: "event",
    name: "DefaultAdminTransferScheduled",
    inputs: [
      {
        name: "newAdmin",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "acceptSchedule",
        type: "uint48",
        indexed: false,
        internalType: "uint48",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PromiseSettlementSet",
    inputs: [
      {
        name: "nftId",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "promiseSettlement",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoleAdminChanged",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "previousAdminRole",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "newAdminRole",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoleGranted",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoleRevoked",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      {
        name: "from",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "AccessControlBadConfirmation",
    inputs: [],
  },
  {
    type: "error",
    name: "AccessControlEnforcedDefaultAdminDelay",
    inputs: [
      {
        name: "schedule",
        type: "uint48",
        internalType: "uint48",
      },
    ],
  },
  {
    type: "error",
    name: "AccessControlEnforcedDefaultAdminRules",
    inputs: [],
  },
  {
    type: "error",
    name: "AccessControlInvalidDefaultAdmin",
    inputs: [
      {
        name: "defaultAdmin",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "AccessControlUnauthorizedAccount",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
      {
        name: "neededRole",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
  },
  {
    type: "error",
    name: "AccessForbidden",
    inputs: [],
  },
  {
    type: "error",
    name: "AgentRegistered",
    inputs: [],
  },
  {
    type: "error",
    name: "ConditionIsNotMet",
    inputs: [],
  },
  {
    type: "error",
    name: "ERC721IncorrectOwner",
    inputs: [
      {
        name: "sender",
        type: "address",
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "ERC721InsufficientApproval",
    inputs: [
      {
        name: "operator",
        type: "address",
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "ERC721InvalidApprover",
    inputs: [
      {
        name: "approver",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "ERC721InvalidOperator",
    inputs: [
      {
        name: "operator",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "ERC721InvalidOwner",
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
    name: "ERC721InvalidReceiver",
    inputs: [
      {
        name: "receiver",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "ERC721InvalidSender",
    inputs: [
      {
        name: "sender",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "ERC721NonexistentToken",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "InvalidCovenantStatus",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidParameter",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidSignature",
    inputs: [],
  },
  {
    type: "error",
    name: "SafeCastOverflowedUintDowncast",
    inputs: [
      {
        name: "bits",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
];
