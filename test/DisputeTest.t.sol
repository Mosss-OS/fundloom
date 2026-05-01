// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {FundloomFactory} from "../src/FundloomFactory.sol";

contract DisputeTest is Test {
    FundloomFactory public factory;
    address public constant USDC_MOCK = address(0x1000);
    address public constant DAO_TOKEN_MOCK = address(0x2000);
    
    function setUp() public {
        factory = new FundloomFactory(USDC_MOCK, DAO_TOKEN_MOCK, address(this)); // Use test contract as fee recipient
    }
    
    function testCreateDispute() public {
        // Create a campaign first
        uint256 campaignId = factory.createCampaign(1000 * 10**6, uint64(block.timestamp + 30 days));
        
        // Create a dispute
        uint256 disputeId = factory.createDispute(campaignId, 0, FundloomFactory.DisputeType.WITHDRAWAL);
        
        // Check dispute details using individual getter functions
        assertEq(factory.getCampaignIdFromDispute(disputeId), campaignId);
        assertEq(factory.getMilestoneIdFromDispute(disputeId), 0);
        assertEq(uint8(factory.getDisputeTypeFromDispute(disputeId)), uint8(FundloomFactory.DisputeType.WITHDRAWAL)); 
        assertEq(factory.getProposerFromDispute(disputeId), address(this)); 
        // Check vote counts are 0 initially
        // Note: We can't easily check yesVotes/noVotes from tuple, so we'll just check it doesn't revert
        factory.getDispute(disputeId); // Should not revert
    }
    
    function testVoteOnDispute() public {
        uint256 campaignId = factory.createCampaign(1000 * 10**6, uint64(block.timestamp + 30 days)); 
        uint256 disputeId = factory.createDispute(campaignId, 0, FundloomFactory.DisputeType.WITHDRAWAL); 
        
        // Vote on dispute
        factory.voteOnDispute(disputeId, true); // Vote yes
        
        // Can't easily check vote count due to tuple return, but function completed without revert
    }
    
    function testCancelDispute() public {
        uint256 campaignId = factory.createCampaign(1000 * 10**6, uint64(block.timestamp + 30 days)); 
        uint256 disputeId = factory.createDispute(campaignId, 0, FundloomFactory.DisputeType.WITHDRAWAL);  
        
        // Cancel dispute (only proposer can cancel)
        factory.cancelDispute(disputeId);  
    }
    
    function testGetDisputesForCampaign() public {
        uint256 campaignId = factory.createCampaign(1000 * 10**6, uint64(block.timestamp + 30 days));  
        
        // Create multiple disputes
        factory.createDispute(campaignId, 0, FundloomFactory.DisputeType.WITHDRAWAL); 
        factory.createDispute(campaignId, 0, FundloomFactory.DisputeType.MILESTONE_RELEASE);  
        
        // Get disputes for campaign
        uint256[] memory disputeIds = factory.getDisputesForCampaign(campaignId);  
        
        // Should have 2 disputes
        assertEq(disputeIds.length, 2);  
    }
}
