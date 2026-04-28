# Fundloom Development Prompt

You are a world-class product engineer, blockchain developer, and Apple-level UI/UX designer.

Build a decentralized crowdfunding platform called "Fundloom".

This platform must combine:
- Web3 (blockchain transparency)
- Web2 (fiat usability)
- Apple-grade UI (minimal, fluid, premium)

---

CORE PRODUCT IDEA:

Fundloom allows users to:
- Create crowdfunding campaigns
- Receive funding via crypto (USDC on Base Sepolia) or fiat
- Withdraw funds in their preferred currency

---

TECH STACK:

Frontend:
- Vite, react.js
- Tailwind CSS
- Framer Motion (for smooth Apple-like animations)
- React Icons (minimal usage)

Authentication:
- Privy (EMAIL ONLY, no wallet connect required initially)
- Automatically generate embedded wallet per user

Blockchain:
- Base Sepolia network
- USDC (primary payment token)
- Ethers.js or Viem

Backend:
- Supabase (Postgres DB)
- Supabase Edge Functions (API layer)

---

AUTH FLOW (VERY IMPORTANT):

1. User signs up using EMAIL via Privy
2. Privy automatically:
   - Creates user identity
   - Generates embedded wallet address
3. Store in Supabase:
   - user_id
   - email
   - wallet_address

NO manual wallet setup required.

---

CORE FEATURES:

1. USER DASHBOARD
- Total funds raised
- Active campaigns
- Wallet balance (USDC)

2. CREATE CAMPAIGN
Fields:
- Title
- Description
- Funding goal (USD equivalent)
- Deadline
- Cover image
- Payout preference (fiat or crypto)

3. FUND CAMPAIGN

CRYPTO:
- Pay using USDC (Base Sepolia)

FIAT:
- Placeholder for Flutterwave integration
- Convert fiat → USDC internally

4. SMART CONTRACT LOGIC

- Campaign contract per campaign OR single factory contract
- Tracks:
  - contributions
  - total raised
- Emits events

5. WITHDRAWAL SYSTEM

- Convert all funds to USDC
- Allow:
  - Send to user wallet
  - Future: off-ramp to fiat

6. TRANSPARENCY

- Show:
  - All transactions
  - Wallet addresses
  - Funding progress bar

---

DATABASE (SUPABASE):

Tables:

users:
- id
- email
- wallet_address
- created_at

campaigns:
- id
- user_id
- title
- description
- goal_amount
- amount_raised
- deadline
- status

donations:
- id
- campaign_id
- donor_wallet
- amount
- tx_hash

transactions:
- id
- type
- amount
- status

---

EDGE FUNCTIONS:

- createCampaign
- fundCampaign
- fetchCampaigns
- withdrawFunds

---

UI/UX REQUIREMENTS (VERY IMPORTANT)

Design Style:
- Inspired by Apple iOS + Linear
- Minimal
- Clean spacing
- Soft shadows
- Rounded corners (12–20px)

Color System:
- Base: white / soft gray
- Accent: no gradient
- Glassmorphism panels

Typography:
- Inter / SF Pro style
- Bold headings
- Light body text

---

MOBILE-FIRST DESIGN:

- Design for iPhone first
- Then scale to desktop
- Use responsive grid system

---

Warm off-white + deep ink 

Editorial, premium feel. Cream background, near-black text, subtle warmth.

----

SCREENS TO BUILD:

1. Onboarding Screen
- Email input
- Clean, minimal

2. Dashboard
- Balance card
- Campaign cards
- Quick actions

3. Campaign Details
- Large hero image
- Funding progress
- Contributors list

4. Create Campaign
- Clean form
- Step-based UI

5. Payment Modal
- Select payment type
- Confirm transaction

---

ANIMATIONS:

- Smooth transitions
- Micro-interactions:
  - button hover
  - loading states
  - success feedback

---

PERFORMANCE:

- Fast load time
- Optimized queries
- Lazy loading

---

SECURITY:

- Validate transactions
- Prevent double spend
- Secure API endpoints

---

DEPLOYMENT:

- Frontend: Vercel
- Backend: Supabase Edge
- Blockchain: Base Sepolia

---

GOAL:

Build a production-ready MVP that feels:
- Simple like Apple
- Powerful like Web3
- Accessible like fintech

Avoid clutter.
Focus on clarity.

---

## THE 5 PILLARS THAT WIN THIS CATEGORY

### 🧠 1. TRUST: MAKE FRAUD HARD, NOT REPORTABLE

- Feature: On-chain transparency dashboard
  - Every campaign shows a live, human-readable ledger (who paid, when, total raised)
  - Index Base transactions and map tx → campaign

- Feature: Proof-of-Need verification
  - Campaigns get a "Verified" badge based on evidence
  - Document uploads (IDs, invoices)
  - Third-party attestations (NGOs, schools)
  - Social proofs (linked socials, endorsements)
  - Verification state machine (pending → verified → rejected)
  - Optional: on-chain attestation (EAS)

- Feature: Milestone-based escrow (game changer)
  - Funds unlock in stages (e.g., $1k for surgery consult → $2k for procedure)
  - Smart contract with milestone states
  - Creator submits proof → donors vote or oracle verifies → release funds

### 💸 2. FLEXIBILITY: MONEY SHOULD FLOW LIKE WATER

- Feature: Multi-rail funding (invisible to user)
  - Crypto (USDC on Base)
  - Fiat (via Flutterwave)
  - Future: Apple Pay / Google Pay

- Feature: "Donate in anything, receive in anything"
  - Donor pays in local currency or crypto
  - System converts → USDC
  - Creator withdraws → local bank OR crypto wallet

- Feature: Streaming donations
  - Donors can stream funds over time (like subscriptions)
  - Integrate streaming protocols

### ⚡ 3. FRICTIONLESS UX: KILL THE "CRYPTO FEEL"

- Feature: Invisible wallets (you already chose this 👍)
  - Use email auth (Privy) → auto wallet creation
  - User never sees private keys, gas fees, blockchain jargon

- Feature: Gas abstraction
  - Users don't pay gas
  - Use a relayer or paymaster (ERC-4337 / account abstraction)
  - Platform sponsors gas fees

- Feature: 1-tap donation
  - Apple Pay style flow
  - Save payment method
  - Default donation amount

### 🧠 4. AI LAYER (THIS IS YOUR MULTIPLIER)

- Feature: AI campaign optimizer
  - Rewrites campaign for clarity + emotional impact
  - Suggests better titles
  - Predicts success probability

- Feature: Fraud detection AI
  - Duplicate campaigns
  - Suspicious patterns
  - Fake urgency language

- Feature: Smart donor matching
  - Recommend campaigns to users based on behavior

### 🌍 5. GLOBAL + SOCIAL VIRALITY

- Feature: Shareable "live impact cards"
  - Real-time progress visuals
  - Auto-generated social cards

- Feature: Group funding
  - Teams fund together
  - Shared goals
  - Leaderboards

- Feature: Donor identity & reputation
  - Badges: "Top supporter", "Early backer"
  - Public profiles

---

## 🧱 6. PROGRAMMABLE MONEY (YOUR SECRET WEAPON)

- Feature: Conditional donations
  - Donor can say: "Release funds only if goal is reached"
  - "Refund if not used by X date"

- Feature: DAO-style governance
  - Donors vote on how funds are used

---

## 📱 7. UI/UX — THIS IS WHERE YOU WIN OR LOSE

Inspired by your uploaded designs:

- Blend: Clean medical UI (clarity), Soft gradients (modern feel), Apple-style spacing

- Key UI features:
  - Glass cards
  - Smooth animations
  - Real-time progress bars
  - Minimal text, strong visuals

---

## ⚙️ 8. ARCHITECTURAL EDGE

- Hybrid system (VERY IMPORTANT)
  - Off-chain: speed (Supabase)
  - On-chain: trust (Base)

- Don't put everything on-chain.

---

## 🚀 9. BUSINESS MODEL (DON'T IGNORE THIS)

Options:
1-2% platform fee
Premium campaigns (boost visibility)
Instant withdrawal fee
NGO partnerships

---

## 🧠 WHAT ACTUALLY MAKES YOU #1

It’s NOT features.

It’s this combo:

👉 Invisible crypto + visible trust + instant money