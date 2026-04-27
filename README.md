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

| Layer | Technology |
|-------|------------|
| **Frontend** | Vite, React 19, Tailwind CSS 4, Framer Motion |
| **Authentication** | Privy (email-only, embedded wallets) |
| **Blockchain** | Base Sepolia, USDC, Ethers.js |
| **Backend** | Supabase (Postgres DB, Edge Functions) |
| **Deployment** | Vercel |
| **UI Components** | Radix UI, Lucide Icons, Recharts |

## Getting Started

### Prerequisites
- Node.js 18+
- [Bun](https://bun.sh) (recommended) or npm
- Supabase account
- Privy account

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
```

## Project Structure

```
fundloom/
├── src/
│   ├── components/       # Reusable UI components
│   ├── routes/           # Page routes (TanStack Router)
│   ├── server/           # Supabase Edge Functions
│   ├── integrations/     # Third-party integrations
│   │   └── supabase/     # Supabase client & types
│   ├── lib/              # Utilities and helpers
│   └── styles.css        # Global styles
├── supabase/
│   └── migrations/       # Database migrations
└── contracts/            # Smart contracts (future)
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
- [ ] Smart contract implementation for escrow
- [ ] Mobile app (React Native)
- [ ] Fiat on-ramp integration (Stripe)
- [ ] Social features (comments, updates)
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