export const KudoABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "identityRegistry",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "validationRegistry",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "admin",
        "type": "address"
      },
      {
        "internalType": "uint48",
        "name": "initialDelay",
        "type": "uint48"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AccessControlBadConfirmation",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint48",
        "name": "schedule",
        "type": "uint48"
      }
    ],
    "name": "AccessControlEnforcedDefaultAdminDelay",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "AccessControlEnforcedDefaultAdminRules",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "defaultAdmin",
        "type": "address"
      }
    ],
    "name": "AccessControlInvalidDefaultAdmin",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "neededRole",
        "type": "bytes32"
      }
    ],
    "name": "AccessControlUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "AccessForbidden",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "AgentRegistered",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ConditionIsNotMet",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "ERC721IncorrectOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ERC721InsufficientApproval",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "approver",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidApprover",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidOperator",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidReceiver",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidSender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ERC721NonexistentToken",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidCovenantStatus",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidParameter",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidSignature",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint8",
        "name": "bits",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "SafeCastOverflowedUintDowncast",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "agentWallet",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "agentName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "agentId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "teeId",
        "type": "string"
      }
    ],
    "name": "AgentSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "approved",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "ApprovalForAll",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "nftId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "askSettlement",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "promiseDetails",
        "type": "string"
      }
    ],
    "name": "AskSettlementSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "nftId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "enum Kudo.CovenantStatus",
        "name": "status",
        "type": "uint8"
      }
    ],
    "name": "CovenantAskSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "nftId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "agent",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "nftType",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "covenantPromise",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "ask",
        "type": "string"
      }
    ],
    "name": "CovenantMinted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "nftId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "enum Kudo.CovenantStatus",
        "name": "status",
        "type": "uint8"
      }
    ],
    "name": "CovenantPromiseSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "requestId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "agentWallet",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "nftId",
        "type": "uint256"
      }
    ],
    "name": "CovenantRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "DefaultAdminDelayChangeCanceled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint48",
        "name": "newDelay",
        "type": "uint48"
      },
      {
        "indexed": false,
        "internalType": "uint48",
        "name": "effectSchedule",
        "type": "uint48"
      }
    ],
    "name": "DefaultAdminDelayChangeScheduled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "DefaultAdminTransferCanceled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "newAdmin",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint48",
        "name": "acceptSchedule",
        "type": "uint48"
      }
    ],
    "name": "DefaultAdminTransferScheduled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "nftId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "promiseSettlement",
        "type": "string"
      }
    ],
    "name": "PromiseSettlementSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "previousAdminRole",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "newAdminRole",
        "type": "bytes32"
      }
    ],
    "name": "RoleAdminChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "EVALUATOR_CONTRACT_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "acceptDefaultAdminTransfer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newAdmin",
        "type": "address"
      }
    ],
    "name": "beginDefaultAdminTransfer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "cancelDefaultAdminTransfer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint48",
        "name": "newDelay",
        "type": "uint48"
      }
    ],
    "name": "changeDefaultAdminDelay",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "defaultAdmin",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "defaultAdminDelay",
    "outputs": [
      {
        "internalType": "uint48",
        "name": "",
        "type": "uint48"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "defaultAdminDelayIncreaseWait",
    "outputs": [
      {
        "internalType": "uint48",
        "name": "",
        "type": "uint48"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "requestHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "nftId",
        "type": "uint256"
      },
      {
        "internalType": "enum Kudo.CovenantStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "uint8",
        "name": "response",
        "type": "uint8"
      },
      {
        "internalType": "string",
        "name": "responseUri",
        "type": "string"
      },
      {
        "internalType": "bytes32",
        "name": "tag",
        "type": "bytes32"
      }
    ],
    "name": "evaluateSettlementData",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "agent",
        "type": "address"
      }
    ],
    "name": "getAgentCovenantsData",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "agentWallet",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "agentId",
            "type": "uint256"
          },
          {
            "internalType": "enum Kudo.CovenantStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "string",
            "name": "nftType",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "ask",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "covenantPromise",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "promiseDetail",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "promiseSettlementData",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "askSettlementData",
            "type": "string"
          },
          {
            "internalType": "uint128",
            "name": "abilityScore",
            "type": "uint128"
          }
        ],
        "internalType": "struct Kudo.CovenantData[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getApproved",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "nftId",
        "type": "uint256"
      }
    ],
    "name": "getCovenant",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "agentWallet",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "agentId",
            "type": "uint256"
          },
          {
            "internalType": "enum Kudo.CovenantStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "string",
            "name": "nftType",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "ask",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "covenantPromise",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "promiseDetail",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "promiseSettlementData",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "askSettlementData",
            "type": "string"
          },
          {
            "internalType": "uint128",
            "name": "abilityScore",
            "type": "uint128"
          }
        ],
        "internalType": "struct Kudo.CovenantData",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "nftId",
        "type": "uint256"
      }
    ],
    "name": "getCovenantDetails",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "nftId",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "agentName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "agentId",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "promiseSettlementData",
            "type": "string"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "agentWallet",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "agentId",
                "type": "uint256"
              },
              {
                "internalType": "enum Kudo.CovenantStatus",
                "name": "status",
                "type": "uint8"
              },
              {
                "internalType": "string",
                "name": "nftType",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "ask",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "covenantPromise",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "promiseDetail",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "promiseSettlementData",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "askSettlementData",
                "type": "string"
              },
              {
                "internalType": "uint128",
                "name": "abilityScore",
                "type": "uint128"
              }
            ],
            "internalType": "struct Kudo.CovenantData",
            "name": "covenantData",
            "type": "tuple"
          }
        ],
        "internalType": "struct Kudo.CovenantDetails",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCovenantsDetails",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "nftId",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "agentName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "agentId",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "promiseSettlementData",
            "type": "string"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "agentWallet",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "agentId",
                "type": "uint256"
              },
              {
                "internalType": "enum Kudo.CovenantStatus",
                "name": "status",
                "type": "uint8"
              },
              {
                "internalType": "string",
                "name": "nftType",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "ask",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "covenantPromise",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "promiseDetail",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "promiseSettlementData",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "askSettlementData",
                "type": "string"
              },
              {
                "internalType": "uint128",
                "name": "abilityScore",
                "type": "uint128"
              }
            ],
            "internalType": "struct Kudo.CovenantData",
            "name": "covenantData",
            "type": "tuple"
          }
        ],
        "internalType": "struct Kudo.CovenantDetails[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      }
    ],
    "name": "getRoleAdmin",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasRole",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "i_identityRegistry",
    "outputs": [
      {
        "internalType": "contract IIdentityRegistry",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "i_validationRegistry",
    "outputs": [
      {
        "internalType": "contract IValidationRegistry",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "isApprovedForAll",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "agentId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "covenantPromise",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "ask",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "nftType",
        "type": "string"
      }
    ],
    "name": "mintCovenant",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "agentAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "agentId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "covenantPromise",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "ask",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "nftType",
        "type": "string"
      },
      {
        "internalType": "uint8",
        "name": "v",
        "type": "uint8"
      },
      {
        "internalType": "bytes32",
        "name": "r",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "s",
        "type": "bytes32"
      }
    ],
    "name": "mintCovenantOnBehalfOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pendingDefaultAdmin",
    "outputs": [
      {
        "internalType": "address",
        "name": "newAdmin",
        "type": "address"
      },
      {
        "internalType": "uint48",
        "name": "schedule",
        "type": "uint48"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pendingDefaultAdminDelay",
    "outputs": [
      {
        "internalType": "uint48",
        "name": "newDelay",
        "type": "uint48"
      },
      {
        "internalType": "uint48",
        "name": "schedule",
        "type": "uint48"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "renounceRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rollbackDefaultAdminDelay",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "nftId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "settlementData",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "promiseDetail",
        "type": "string"
      }
    ],
    "name": "setAskSettlementData",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "nftId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "data",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "requestUri",
        "type": "string"
      }
    ],
    "name": "setPromiseSettlementData",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "tokenURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]