// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {FundloomFactory} from "../src/FundloomFactory.sol";

/// @notice Deployment script for FundloomFactory on Base Sepolia
/// @dev Run with: forge script script/DeployFundloomFactory.s.sol --rpc-url base-sepolia --private-key $DEPLOYER_PRIVATE_KEY --broadcast --verify
contract DeployFundloomFactory is Script {
    // Base Sepolia USDC address
    address constant USDC_BASE_SEPOLIA = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        FundloomFactory factory = new FundloomFactory(USDC_BASE_SEPOLIA, address(0x036CbD53842c5426634e7929541eC2318f3dCF7e)); // Using zero address as placeholder for DAO token
        
        console2.log("FundloomFactory deployed to:", address(factory));
        console2.log("USDC address:", USDC_BASE_SEPOLIA);
        console2.log("Network: Base Sepolia");
        
        vm.stopBroadcast();
    }
}
