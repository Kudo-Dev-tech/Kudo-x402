# Kudo X402 Hackathon

A comprehensive blockchain-based credit and reputation system integrating smart contracts, payment validation, AI agents, and social media interactions.

## Overview

The Kudo X402 project demonstrates a decentralized credit scoring and payment validation system built on ERC-8004 standards. It combines on-chain reputation management with off-chain payment processing and AI-powered interactions.

## Project Structure

### 📦 Packages

- **kudo-erc-8004/** - Smart contracts implementing ERC-8004 identity, reputation, and validation registries

  - Identity Registry (upgradeable)
  - Reputation Registry (upgradeable)
  - Validation Registry (upgradeable)
  - Payment History tracking
  - Proof of Income contracts

- **kudo-x402-facilitator/** - Payment validation and credit scoring service

  - Validates payment transactions
  - Integrates with Kudo smart contracts
  - Manages credit card transaction processing

- **kudo-402-payment-receipts-server/** - Payment receipt management server

  - Handles income history tracking
  - EVM client integration
  - TypeScript-based API server

- **kudo-x402-agent/** - ElizaOS AI agent for automated interactions

  - Twitter posting capabilities
  - Credit card transaction processing
  - Kudo demo service integration

- **kudo-x402-twitter-mcp-server/** - MCP server for Twitter and Kudo integration
  - Twitter API wrapper
  - Kudo service integration
  - Evaluation and testing suite

- **x402-demo-validator/** - ElizaOS plugin for payment validation and credit scoring
  - On-chain validation checking
  - Payment history verification
  - Credit score evaluation
  - Integration with Kudo smart contracts

## Getting Started

### Prerequisites

- Node.js 18+
- Bun (for some packages)
- Foundry (for smart contracts)
- Git

### Installation

```bash
# Clone the repository
git clone git@github-kudo.com:Kudo-Dev-tech/Kudo-x402.git
cd Kudo-x402

# Install smart contract dependencies
cd kudo-erc-8004
forge install

# Install facilitator dependencies
cd ../kudo-x402-facilitator
npm install

# Install payment receipts server dependencies
cd ../kudo-402-payment-receipts-server
bun install

# Install agent dependencies
cd ../kudo-x402-agent
bun install

# Install Twitter MCP server dependencies
cd ../kudo-x402-twitter-mcp-server
npm install

# Install demo validator dependencies
cd ../x402-demo-validator
npm install
```

### Smart Contracts

```bash
cd kudo-erc-8004

# Build contracts
forge build

# Run tests
forge test

# Deploy contracts
forge script script/Deploy.s.sol --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Running Services

#### Payment Receipts Server

```bash
cd kudo-402-payment-receipts-server
bun run index.ts
```

#### Facilitator Service

```bash
cd kudo-x402-facilitator
npm start
```

#### AI Agent

```bash
cd kudo-x402-agent
npm run dev
```

#### Twitter MCP Server

```bash
cd kudo-x402-twitter-mcp-server
npm start
```

## Architecture

The system consists of multiple interconnected components:

1. **On-Chain Layer**: Smart contracts manage identity, reputation scores, and payment history
2. **Validation Layer**: Facilitator service validates transactions and updates on-chain records
3. **Data Layer**: Payment receipts server tracks and manages income history
4. **AI Layer**: ElizaOS agent automates interactions and decision-making
5. **Social Layer**: Twitter MCP server enables social media integration

## Development

### Testing

Each package includes its own test suite:

```bash
# Smart contract tests
cd kudo-erc-8004 && forge test

# Agent tests
cd kudo-x402-agent && npm test

# Twitter MCP server tests
cd kudo-x402-twitter-mcp-server && npm test

# Demo validator tests
cd x402-demo-validator && npm test
```

### Environment Variables

Each service requires specific environment variables. Refer to `.env.example` files in each package directory.

## License

See individual package directories for license information.
