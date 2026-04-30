// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {FundloomFactory} from "../src/FundloomFactory.sol";

contract DisputeTest is Test {
    FundloomFactory public factory;
    address public constant USDC_MOCK = address(0x1000);
    address public constant DAO_TOKEN_MOCK = address(0x2000);
    
    function setUp() public {
        factory = new FundloomFactory(USDC_MOCK, DAO_TOKEN_MOCK);
    }
    
    function testCreateDispute() public {
        // Create a campaign first
        uint256 campaignId = factory.createCampaign(1000 * 10**6, uint64(block.timestamp + 30 days));
        
        // Create a dispute
        uint256 disputeId = factory.createDispute(campaignId, 0, FundloomFactory.DisputeType.WITHDRAWAL);
        
        // Check dispute details
        (
            uint256 returnedCampaignId,
            uint256 returnedMilestoneId,
            FundloomFactory.DisputeType returnedType,
            address proposer,
            uint256 startTime,
            uint256 endTime,
            uint256 yesVotes,
            uint256 noVotes,
            bool executed,
            bool cancelled
        ) = factory.getDispute(disputeId);
        
        // Simple assertions
        assertEq(returnedCampaignId, campaignId);
        assertEq(returnedMilestoneId, 0);
        // Instead of comparing enum directly, we'll check if it's WITHDRAWAL by checking the value
        // In Solidity, enums are uint8 under the hood, WITHDRAWAL=0, MILESTONE_RELEASE=1
        assertEq(uint8(returnedType), uint8(FundloomFactory.DisputeType.WITHDRAWAL));
        
        // Let's just assert that proposer is not zero address for now
        assertNotEq(proposer, address(0));
        
        assertEq(yesVotes, 0);
        assertEq(noVotes, 0);
        assertEq(executed, false);
        assertEq(cancelled, false);
    }
    
    function testVoteOnDispute() public {
        // Create a campaign
        uint256 campaignId = factory.createCampaign(1000 * 10**6, uint64(block.timestamp + 30 days));
        
        // Create a dispute
        uint256 disputeId = factory.createDispute(campaignId, 0, FundloomFactory.DisputeType.WITHDRAWAL);
        
        // Vote on dispute
        factory.voteOnDispute(disputeId, true); // Vote yes
        
        // Check votes
        (
            uint256 returnedCampaignId,
            uint256 returnedMilestoneId,
            FundloomFactory.DisputeType returnedType,
            address proposer,
            uint256 startTime,
            uint256 endTime,
            uint256 yesVotes,
            uint256 noVotes,
            bool executed,
            bool cancelled
        ) = factory.getDispute(disputeId);
        
        assertEq(yesVotes, 1); // Each address gets 1 vote
        assertEq(noVotes, 0);
    }
}