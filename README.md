# Fundloom

> Decentralized crowdfunding platform combining Web3 blockchain transparency with Web2 fiat usability and Apple-grade UI.

![Fundloom](https://img.shields.io/badge/Status-Active-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue) ![Web3](https://img.shields.io/badge/Web3-USDC%20on%20Base%20Sepolia-purple)

## Overview

Fundloom bridges the gap between traditional crowdfunding and decentralized finance. Campaign creators can raise funds using crypto (USDC) or fiat, while backers benefit from blockchain-verified transparency and milestone-based escrow protection.

## Features

### Core Features

- **Multi-Rail Funding** — Accept both crypto (USDC on Base Sepolia) and fiat payments
- **Milestone-Based Escrow** — Funds released progressively as campaign goals are achieved
- **Gas Abstraction** — Zero gas fees for users; gas costs are abstracted away
- **Embedded Wallets** — Auto-generated wallets for seamless onboarding without browser extensions

### User Experience

- **Email-Only Authentication** — Simple login with just email (powered by Privy)
- **Apple-Grade UI** — Premium, polished interface built with Tailwind CSS and Framer Motion
- **Real-Time Progress** — Live funding updates and campaign status tracking
- **Social Virality** — ShareRow component for easy campaign promotion

### Trust & Security

- **On-Chain Transparency** — Every transaction verifiable on Base Sepolia blockchain
- **Fraud Detection** — AI-powered system to identify and flag suspicious campaigns
- **Verified Badges** — Trust indicators for verified campaign creators

## Tech Stack

| Layer               | Technology                                    |
| ------------------- | --------------------------------------------- |
| **Frontend**        | Vite, React 19, Tailwind CSS 4, Framer Motion |
| **Authentication**  | Privy (email-only, embedded wallets)          |
| **Blockchain**      | Base Sepolia, USDC, Ethers.js, Foundry        |
| **Smart Contracts** | Solidity (FundloomFactory.sol)                |
| **Backend**         | Supabase (Postgres DB, Edge Functions)        |
| **Deployment**      | Vercel                                        |
| **UI Components**   | Radix UI, Lucide Icons, Recharts              |

## Getting Started

### Prerequisites

- Node.js 18+
- [Bun](https://bun.sh) (recommended) or npm
- Supabase account
- Privy account
- Foundry (for smart contract development)

### Installation

```bash
# Clone the repository
git clone https://github.com/Mosss-OS/fundloom.git
cd fundloom

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase and Privy credentials

# Start development server
bun dev
```

### Environment Variables

```env
# Supabase (provided)
VITE_SUPABASE_URL=https://xoaminsmueojehukspae.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key

# Privy (get from dashboard.privy.io)
VITE_PRIVY_APP_ID=your_privy_app_id

# Smart Contract (after deployment)
VITE_FUNDLOOM_FACTORY_ADDRESS=0x...
```

## Smart Contract Deployment

The FundloomFactory smart contract is ready for deployment to Base Sepolia.

### Quick Start

1. **Fund the deployment wallet** with Base Sepolia ETH:
   - Wallet: `0x3E78Cfe4f3FEb28F8F1C56BABbF53a898b5F76DA`
   - Faucets: https://www.coinbase.com/faucets/base-sepolia-faucet

2. **Deploy the contract**:

   ```bash
   source .env
   forge script script/DeployFundloomFactory.s.sol \
     --rpc-url base-sepolia \
     --private-key $DEPLOYER_PRIVATE_KEY \
     --broadcast \
     --verify
   ```

3. **Add contract address** to `.env`:
   ```
   VITE_FUNDLOOM_FACTORY_ADDRESS=0x...
   ```

See [DEPLOY.md](DEPLOY.md) for detailed instructions.

## Project Structure

```
fundloom/
├── src/
│   ├── components/       # Reusable UI components
│   ├── routes/           # Page routes (TanStack Router)
│   ├── server/           # Server functions
│   ├── integrations/     # Third-party integrations
│   │   └── supabase/     # Supabase client & types
│   │   └── contract.ts   # Smart contract integration
│   ├── auth/            # Authentication (Privy)
│   ├── lib/             # Utilities and helpers
│   └── styles.css       # Global styles
├── contracts/            # Smart contracts (Foundry)
│   ├── src/             # Solidity contracts
│   ├── script/          # Deployment scripts
│   └── out/             # Compiled contracts
├── supabase/
│   └── migrations/       # Database migrations
└── public/              # Static assets
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login and deploy
vercel login
vercel --prod
```

## How It Works

### For Campaign Creators

1. **Sign Up** — Login with just your email (wallet auto-created)
2. **Create Campaign** — Set funding goal, milestones, and campaign details
3. **Receive Funding** — Accept USDC or fiat contributions
4. **Withdraw Funds** — Release milestone funds to your wallet

### For Backers

1. **Discover Campaigns** — Browse verified campaigns on the explore page
2. **Contribute** — Fund campaigns using USDC or fiat
3. **Track Progress** — Monitor milestone completion in real-time
4. **Verify Impact** — All transactions visible on-chain

## Roadmap

- [ ] Mainnet deployment with USDC
- [x] Smart contract implementation for escrow
- [ ] Mobile app (React Native)
- [ ] Fiat on-ramp integration (Stripe/Flutterwave)
- [x] Social features (comments, updates)
- [ ] DAO governance for disputes

## Contributing

Contributions are welcome! Please read our development guidelines before submitting PRs.

```bash
# After cloning, install dev dependencies
bun install

# Run linting
bun lint

# Type check
bun typecheck
```

## License

MIT License — see [LICENSE](LICENSE) for details.

## Links

- **Live App**: https://fundloom.vercel.app
- **GitHub**: https://github.com/Mosss-OS/fundloom
- **Issues**: https://github.com/Mosss-OS/fundloom/issues

---

Built with 🔗 by [Mosss-OS](https://github.com/Mosss-OS)

## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

### Documentation

https://book.getfoundry.sh/

### Quick Start

```bash
# Build contracts
forge build

# Run tests
forge test

# Format code
forge fmt

# Start local node
anvil
```
