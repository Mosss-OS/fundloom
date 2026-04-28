// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title FundloomFactory
/// @notice Factory contract with milestone-based escrow for crowdfunding campaigns.
///         Donations are made in USDC (Base Sepolia: 0x036CbD53842c5426634e7929541eC2318f3dCF7e).
/// @dev Deploy once and store the address in VITE_FUNDLOOM_FACTORY_ADDRESS env var.
interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract FundloomFactory {
    IERC20 public immutable usdc;

    enum MilestoneStatus { Pending, Approved, Released }

    struct Milestone {
        string description;
        uint256 amount;           // USDC amount for this milestone
        MilestoneStatus status;
        bool exists;
    }

    struct Campaign {
        address creator;
        uint256 goal;             // total goal in USDC (6 decimals)
        uint256 raised;
        uint64 deadline;           // unix seconds
        bool withdrawn;            // legacy: full withdrawal flag
        uint256 milestonesCount;
        mapping(uint256 => Milestone) milestones;
    }

    Campaign[] public campaigns;

    event CampaignCreated(uint256 indexed id, address indexed creator, uint256 goal, uint64 deadline);
    event Contributed(uint256 indexed id, address indexed donor, uint256 amount);
    event Withdrawn(uint256 indexed id, address indexed creator, uint256 amount);
    event MilestoneAdded(uint256 indexed campaignId, uint256 indexed milestoneId, uint256 amount);
    event MilestoneApproved(uint256 indexed campaignId, uint256 indexed milestoneId);
    event MilestoneReleased(uint256 indexed campaignId, uint256 indexed milestoneId, uint256 amount);

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
    }

    /// @notice Create a new campaign
    function createCampaign(uint256 goal, uint64 deadline) external returns (uint256 id) {
        require(goal > 0, "goal=0");
        require(deadline > block.timestamp, "past");
        Campaign storage c = campaigns.push();
        c.creator = msg.sender;
        c.goal = goal;
        c.raised = 0;
        c.deadline = deadline;
        c.withdrawn = false;
        c.milestonesCount = 0;
        id = campaigns.length - 1;
        emit CampaignCreated(id, msg.sender, goal, deadline);
    }

    /// @notice Add a milestone to a campaign (only creator)
    function addMilestone(uint256 campaignId, string calldata description, uint256 amount) external {
        Campaign storage c = campaigns[campaignId];
        require(msg.sender == c.creator, "not creator");
        require(amount > 0, "amount=0");
        
        uint256 milestoneId = c.milestonesCount;
        c.milestones[milestoneId] = Milestone({
            description: description,
            amount: amount,
            status: MilestoneStatus.Pending,
            exists: true
        });
        c.milestonesCount++;
        
        emit MilestoneAdded(campaignId, milestoneId, amount);
    }

    /// @notice Approve a milestone (only creator - simulates milestone completion)
    function approveMilestone(uint256 campaignId, uint256 milestoneId) external {
        Campaign storage c = campaigns[campaignId];
        require(msg.sender == c.creator, "not creator");
        Milestone storage m = c.milestones[milestoneId];
        require(m.exists, "no milestone");
        require(m.status == MilestoneStatus.Pending, "not pending");
        
        m.status = MilestoneStatus.Approved;
        emit MilestoneApproved(campaignId, milestoneId);
    }

    /// @notice Release funds for an approved milestone
    function releaseMilestone(uint256 campaignId, uint256 milestoneId) external {
        Campaign storage c = campaigns[campaignId];
        require(msg.sender == c.creator, "not creator");
        Milestone storage m = c.milestones[milestoneId];
        require(m.exists, "no milestone");
        require(m.status == MilestoneStatus.Approved, "not approved");
        require(m.amount > 0, "nothing to release");
        
        m.status = MilestoneStatus.Released;
        uint256 releaseAmount = m.amount;
        m.amount = 0;
        
        require(usdc.transfer(c.creator, releaseAmount), "xfer fail");
        emit MilestoneReleased(campaignId, milestoneId, releaseAmount);
    }

    /// @notice Contribute USDC to a campaign
    function contribute(uint256 id, uint256 amount) external {
        Campaign storage c = campaigns[id];
        require(block.timestamp <= c.deadline, "ended");
        require(amount > 0, "amount=0");
        require(usdc.transferFrom(msg.sender, address(this), amount), "xfer fail");
        c.raised += amount;
        emit Contributed(id, msg.sender, amount);
    }

    /// @notice Legacy: Withdraw all raised funds (without milestones)
    function withdraw(uint256 id) external {
        Campaign storage c = campaigns[id];
        require(msg.sender == c.creator, "not creator");
        require(!c.withdrawn, "done");
        c.withdrawn = true;
        uint256 amt = c.raised;
        require(usdc.transfer(c.creator, amt), "xfer fail");
        emit Withdrawn(id, c.creator, amt);
    }

    /// @notice Get campaign details
    function getCampaign(uint256 id) external view returns (
        address creator,
        uint256 goal,
        uint256 raised,
        uint64 deadline,
        bool withdrawn,
        uint256 milestonesCount
    ) {
        Campaign storage c = campaigns[id];
        return (c.creator, c.goal, c.raised, c.deadline, c.withdrawn, c.milestonesCount);
    }

    /// @notice Get milestone details
    function getMilestone(uint256 campaignId, uint256 milestoneId) external view returns (
        string memory description,
        uint256 amount,
        MilestoneStatus status,
        bool exists
    ) {
        Milestone storage m = campaigns[campaignId].milestones[milestoneId];
        return (m.description, m.amount, m.status, m.exists);
    }

    function campaignsCount() external view returns (uint256) {
        return campaigns.length;
    }
}
