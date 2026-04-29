// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/FundloomFactory.sol";

contract FundloomFactoryTest is Test {
    FundloomFactory public factory;

    function setUp() public {
        factory = new FundloomFactory(address(0x1)); // dummy USDC address for test
    }

    function test_deploy() public {
        assertTrue(address(factory) != address(0));
    }

    function test_campaignsStartAtZero() public {
        assertEq(factory.campaignsCount(), 0);
    }
}