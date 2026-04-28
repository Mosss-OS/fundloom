# Smart Contract Deployment Guide

## Pre-Deployment Steps

1. **Fund the deployment wallet** with Base Sepolia ETH:
   - Wallet address: `0x3E78Cfe4f3FEb28F8F1C56BABbF53a898b5F76DA`
   - Faucets:
     - https://www.coinbase.com/faucets/base-sepolia-faucet
     - https://faucet.quicknode.com/base/sepolia
     - https://sepoliafaucet.com/

2. **Get BaseScan API Key** (optional, for contract verification):
   - Visit https://basescan.org/apis
   - Create an account and get a free API key
   - Add to `.env`: `BASESCAN_API_KEY=your_api_key`

## Deploy Command

```bash
cd /home/moses/Desktop/fundloom

# Load environment variables
source .env

# Deploy to Base Sepolia
forge script script/DeployFundloomFactory.s.sol \
  --rpc-url base-sepolia \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --broadcast \
  --verify \
  -vvvv
```

## Post-Deployment Steps

1. **Add contract address to environment**:
   - Copy the deployed contract address from the output
   - Add to `.env`:
     ```
     VITE_FUNDLOOM_FACTORY_ADDRESS=0x...
     ```

2. **Update Supabase** (optional):
   - Store the contract address in your Supabase project settings
   - Update the `contracts` table if you have one

3. **Verify on BaseScan**:
   - Visit: `https://sepolia.basescan.org/address/<contract_address>`

## Contract Details

- **Contract**: `FundloomFactory.sol`
- **Network**: Base Sepolia (Chain ID: 84532)
- **USDC Address**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- **Compiler**: Solidity 0.8.24

## Frontend Integration

The ABI is already generated at:
- `src/integrations/FundloomFactoryABI.json`

The contract interaction layer is at:
- `src/integrations/contract.ts`

## Testing the Deployment

```bash
# Check contract deployment
cast call <contract_address> "campaignsCount()(uint256)" --rpc-url base-sepolia
```
