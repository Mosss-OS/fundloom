#!/bin/bash
# Deploy FundloomFactory to Base Sepolia
# Usage: ./scripts/deploy.sh

set -e

echo "🚀 FundloomFactory Deployment Script"
echo "=================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Source environment variables
source .env

# Check if private key is set
if [ -z "$DEPLOYER_PRIVATE_KEY" ]; then
    echo "❌ DEPLOYER_PRIVATE_KEY not set in .env"
    exit 1
fi

# Check wallet balance
echo ""
echo "📊 Checking wallet balance..."
BALANCE=$(cast balance --rpc-url base-sepolia 0x3E78Cfe4f3FEb28F8F1C56BABbF53a898b5F76DA)

if [ "$BALANCE" = "0" ]; then
    echo "❌ Wallet has 0 ETH!"
    echo ""
    echo "Please fund the deployment wallet:"
    echo "  Address: 0x3E78Cfe4f3FEb28F8F1C56BABbF53a898b5F76DA"
    echo ""
    echo "Faucets:"
    echo "  1. https://www.coinbase.com/faucets/base-sepolia-faucet"
    echo "  2. https://faucet.quicknode.com/base/sepolia"
    echo "  3. https://sepoliafaucet.com/"
    echo ""
    echo "Waiting for funds... (Ctrl+C to cancel)"
    
    # Wait for funds
    while true; do
        BALANCE=$(cast balance --rpc-url base-sepolia 0x3E78Cfe4f3FEb28F8F1C56BABbF53a898b5F76DA)
        if [ "$BALANCE" != "0" ]; then
            echo "✅ Wallet funded! Balance: $BALANCE ETH"
            break
        fi
        sleep 10
    done
fi

echo ""
echo "💰 Wallet balance: $BALANCE ETH"
echo ""

# Deploy the contract
echo "📦 Deploying FundloomFactory to Base Sepolia..."
echo ""

forge script script/DeployFundloomFactory.s.sol \
    --rpc-url base-sepolia \
    --private-key $DEPLOYER_PRIVATE_KEY \
    --broadcast \
    -vvvv

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Copy the deployed contract address from above"
echo "  2. Add to .env: VITE_FUNDLOOM_FACTORY_ADDRESS=0x..."
echo "  3. Restart your dev server: bun dev"
