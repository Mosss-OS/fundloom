// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {FundloomFactory} from "../src/FundloomFactory.sol";
import {GovernanceToken} from "../src/GovernanceToken.sol";

/// @notice Deployment script for FundloomFactory on Base Sepolia
/// @dev Run with: forge script script/DeployFundloomFactory.s.sol --rpc-url base-sepolia --private-key $DEPLOYER_PRIVATE_KEY --broadcast --verify
contract DeployFundloomFactory is Script {
    // Base Sepolia USDC address
    address constant USDC_BASE_SEPOLIA = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;
    // Governance token parameters
    string constant GOVERNANCE_TOKEN_NAME = "Fundloom Governance Token";
    string constant GOVERNANCE_TOKEN_SYMBOL = "FGOV";
    uint256 constant INITIAL_TOKEN_SUPPLY = 1_000_000 * 10 ** 18; // 1 million tokens with 18 decimals

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy governance token
        GovernanceToken govToken = new GovernanceToken(
            GOVERNANCE_TOKEN_NAME,
            GOVERNANCE_TOKEN_SYMBOL,
            INITIAL_TOKEN_SUPPLY
        );
        
        // Deploy FundloomFactory with USDC, governance token, and deployer as fee recipient
        FundloomFactory factory = new FundloomFactory(
            USDC_BASE_SEPOLIA,
            address(govToken),
            address(this)
        ); 
        
        console2.log("GovernanceToken deployed to:", address(govToken));
        console2.log("FundloomFactory deployed to:", address(factory));
        console2.log("USDC address:", USDC_BASE_SEPOLIA);
        console2.log("Dispute fee recipient:", address(this));
        console2.log("Network: Base Sepolia");
        
        vm.stopBroadcast();
    }
}
