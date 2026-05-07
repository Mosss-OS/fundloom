// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {FundloomFactory} from "../src/FundloomFactory.sol";
import {IERC20} from "../src/FundloomFactory.sol";


contract MockERC20 is IERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "insufficient");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        if (allowance[from][msg.sender] < amount) {
            require(balanceOf[from] >= amount, "insufficient");
        }
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
    }
}

contract FundloomFactoryTest is Test {
    FundloomFactory public factory;
    MockERC20 public usdc;
    MockERC20 public daoToken;
    address public disputeFeeRecipient;
    address public creator;
    address public contributor;
    address public voter1;
    address public voter2;

    uint256 public constant GOAL = 1000 * 10**6;
    uint64 public constant DEADLINE = 2000000000;

    function setUp() public {
        usdc = new MockERC20("USD Coin", "USDC", 6);
        daoToken = new MockERC20("Governance Token", "GOV", 18);
        disputeFeeRecipient = address(0x999);
        creator = address(0x1);
        contributor = address(0x2);
        voter1 = address(0x3);
        voter2 = address(0x4);

        factory = new FundloomFactory(address(usdc), address(daoToken), disputeFeeRecipient);

        daoToken.mint(voter1, 1000 * 10**18);
        daoToken.mint(voter2, 2000 * 10**18);
        usdc.mint(contributor, 5000 * 10**6);
        usdc.mint(creator, 100 * 10**6);
    }

    function test_createCampaign() public {
        vm.prank(creator);
        uint256 campaignId = factory.createCampaign(GOAL, DEADLINE);
        assertEq(campaignId,0);
        assertEq(factory.campaignsCount(), 1);
    }

    function test_createMultipleCampaigns() public {
        vm.startPrank(creator);
        uint256 id1 = factory.createCampaign(GOAL, DEADLINE);
        uint256 id2 = factory.createCampaign(GOAL * 2, DEADLINE);
        vm.stopPrank();
        assertEq(id1, 0);
        assertEq(id2, 1);
        assertEq(factory.campaignsCount(), 2);
    }

    function test_addMilestone() public {
        vm.prank(creator);
        uint256 campaignId = factory.createCampaign(GOAL, DEADLINE);
        vm.prank(creator);
        factory.addMilestone(campaignId, "Build MVP", 500 * 10**6);
    }

    function test_contribute() public {
        vm.prank(creator);
        uint256 campaignId = factory.createCampaign(GOAL, DEADLINE);
        uint256 contribution = 500 * 10**6;
        usdc.mint(contributor, contribution);
        vm.startPrank(contributor);
        usdc.approve(address(factory), contribution);
        factory.contribute(campaignId, contribution);
        vm.stopPrank();
    }

    function test_withdraw() public {
        vm.prank(creator);
        uint256 campaignId = factory.createCampaign(GOAL, DEADLINE);
        uint256 contribution = 500 * 10**6;
        usdc.mint(contributor, contribution);
        vm.startPrank(contributor);
        usdc.approve(address(factory), contribution);
        factory.contribute(campaignId, contribution);
        vm.stopPrank();
        vm.prank(creator);
        factory.withdraw(campaignId);
    }

    function test_createDispute() public {
        vm.prank(creator);
        uint256 campaignId = factory.createCampaign(GOAL, DEADLINE);
        usdc.mint(creator, factory.DISPUTE_FEE());
        vm.startPrank(creator);
        usdc.approve(address(factory), factory.DISPUTE_FEE());
        uint256 disputeId = factory.createDispute(campaignId, 0, FundloomFactory.DisputeType.WITHDRAWAL);
        vm.stopPrank();
        assertEq(disputeId, 0);
        assertEq(factory.getTotalDisputes(), 1);
    }

    function test_voteOnDispute() public {
        vm.prank(creator);
        uint256 campaignId = factory.createCampaign(GOAL, DEADLINE);
        usdc.mint(creator, factory.DISPUTE_FEE());
        vm.startPrank(creator);
        usdc.approve(address(factory), factory.DISPUTE_FEE());
        uint256 disputeId = factory.createDispute(campaignId, 0, FundloomFactory.DisputeType.WITHDRAWAL);
        vm.stopPrank();
        vm.warp(block.timestamp + factory.VOTING_DELAY() + 1);
        vm.prank(voter1);
        factory.voteOnDispute(disputeId, true);
    }

    function test_executeDispute() public {
        vm.prank(creator);
        uint256 campaignId = factory.createCampaign(GOAL, DEADLINE);
        usdc.mint(contributor, 500 * 10**6);
        vm.startPrank(contributor);
        usdc.approve(address(factory), 500 * 10**6);
        factory.contribute(campaignId, 500 * 10**6);
        vm.stopPrank();
        usdc.mint(creator, factory.DISPUTE_FEE());
        vm.startPrank(creator);
        usdc.approve(address(factory), factory.DISPUTE_FEE());
        uint256 disputeId = factory.createDispute(campaignId, 0, FundloomFactory.DisputeType.WITHDRAWAL);
        vm.stopPrank();
        vm.warp(block.timestamp + factory.VOTING_DELAY() + 1);
        vm.prank(voter1);
        factory.voteOnDispute(disputeId, true);
        vm.warp(block.timestamp + factory.VOTING_PERIOD() + 1);
        factory.executeDispute(disputeId);
    }

    function test_cancelDispute() public {
        vm.prank(creator);
        uint256 campaignId = factory.createCampaign(GOAL, DEADLINE);
        usdc.mint(creator, factory.DISPUTE_FEE());
        vm.startPrank(creator);
        usdc.approve(address(factory), factory.DISPUTE_FEE());
        uint256 disputeId = factory.createDispute(campaignId, 0, FundloomFactory.DisputeType.WITHDRAWAL);
        vm.stopPrank();
        vm.prank(creator);
        factory.cancelDispute(disputeId);
    }

    function test_createAppeal() public {
        vm.prank(creator);
        uint256 campaignId = factory.createCampaign(GOAL, DEADLINE);
        usdc.mint(creator, factory.DISPUTE_FEE() + factory.APPEAL_FEE());
        vm.startPrank(creator);
        usdc.approve(address(factory), factory.DISPUTE_FEE() + factory.APPEAL_FEE());
        uint256 disputeId = factory.createDispute(campaignId, 0, FundloomFactory.DisputeType.WITHDRAWAL);
        vm.stopPrank();
        vm.warp(block.timestamp + factory.VOTING_DELAY() + 1);
        vm.prank(voter1);
        factory.voteOnDispute(disputeId, true);
        vm.warp(block.timestamp + factory.VOTING_PERIOD() + 1);
        factory.executeDispute(disputeId);
        vm.prank(creator);
        factory.createAppeal(disputeId);
    }

    function test_executeAppeal() public {
        vm.prank(creator);
        uint256 campaignId = factory.createCampaign(GOAL, DEADLINE);
        usdc.mint(creator, factory.DISPUTE_FEE() + factory.APPEAL_FEE());
        vm.startPrank(creator);
        usdc.approve(address(factory), factory.DISPUTE_FEE() + factory.APPEAL_FEE());
        uint256 disputeId = factory.createDispute(campaignId, 0, FundloomFactory.DisputeType.WITHDRAWAL);
        vm.stopPrank();
        vm.warp(block.timestamp + factory.VOTING_DELAY() + 1);
        vm.prank(voter1);
        factory.voteOnDispute(disputeId, true);
        vm.warp(block.timestamp + factory.VOTING_PERIOD() + 1);
        factory.executeDispute(disputeId);
        vm.prank(creator);
        factory.createAppeal(disputeId);
        vm.warp(block.timestamp + factory.APPEAL_VOTING_DELAY() + 1);
        vm.prank(voter1);
        factory.voteOnAppeal(disputeId, true);
        vm.warp(block.timestamp + factory.APPEAL_VOTING_PERIOD() + 1);
        factory.executeAppeal(disputeId);
    }

    function test_getDisputesForCampaign() public {
        vm.prank(creator);
        uint256 campaignId = factory.createCampaign(GOAL, DEADLINE);
        usdc.mint(creator, factory.DISPUTE_FEE() * 2);
        vm.startPrank(creator);
        usdc.approve(address(factory), factory.DISPUTE_FEE() * 2);
        factory.createDispute(campaignId, 0, FundloomFactory.DisputeType.WITHDRAWAL);
        factory.createDispute(campaignId, 0, FundloomFactory.DisputeType.MILESTONE_RELEASE);
        vm.stopPrank();
        uint256[] memory disputes = factory.getDisputesForCampaign(campaignId);
        assertEq(disputes.length, 2);
    }

    function test_getTotalDisputes() public {
        assertEq(factory.getTotalDisputes(),0);
        vm.prank(creator);
        uint256 campaignId = factory.createCampaign(GOAL, DEADLINE);
        usdc.mint(creator, factory.DISPUTE_FEE());
        vm.startPrank(creator);
        usdc.approve(address(factory), factory.DISPUTE_FEE());
        factory.createDispute(campaignId, 0, FundloomFactory.DisputeType.WITHDRAWAL);
        vm.stopPrank();
        assertEq(factory.getTotalDisputes(), 1);
    }
}
