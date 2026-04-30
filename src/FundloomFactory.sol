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
    address public daoToken; // Simple governance token for voting

    // DAO Governance Parameters
    uint256 public constant VOTING_DELAY = 1 days; // Time before voting starts
    uint256 public constant VOTING_PERIOD = 3 days; // Time for voting to occur
    uint256 public constant QUORUM_PERCENTAGE = 4; // 4% of total supply needed for quorum
    uint256 public constant MIN_DELAY = 1 days; // Minimum delay after vote passes before execution

    // Dispute Resolution
    enum DisputeType { WITHDRAWAL, MILESTONE_RELEASE }
    struct Dispute {
        uint256 campaignId;
        uint256 milestoneId; // For milestone disputes, 0 for withdrawal disputes
        DisputeType disputeType;
        address proposer;
        uint256 startTime;
        uint256 endTime;
        uint256 yesVotes;
        uint256 noVotes;
        bool executed;
        bool cancelled;
    }

    Dispute[] public disputes;
    mapping(uint256 => bool) public disputeExists; // disputeId -> exists

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
    event DisputeCreated(uint256 indexed disputeId, uint256 campaignId, DisputeType disputeType);
    event DisputeVoted(uint256 indexed disputeId, address voter, bool support);
    event DisputeExecuted(uint256 indexed disputeId);
    event DisputeCancelled(uint256 indexed disputeId);

    constructor(address _usdc, address _daoToken) {
        usdc = IERC20(_usdc);
        daoToken = _daoToken;
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

    // ========== DAO GOVERNANCE FUNCTIONS ==========

    /// @notice Create a dispute for a withdrawal or milestone release
    function createDispute(uint256 campaignId, uint256 milestoneId, DisputeType disputeType) external returns (uint256 disputeId) {
        Campaign storage c = campaigns[campaignId];
        require(msg.sender == c.creator, "only creator can create dispute");
        
        disputes.push();
        disputeId = disputes.length - 1;
        
        Dispute storage d = disputes[disputeId];
        d.campaignId = campaignId;
        d.milestoneId = milestoneId;
        d.disputeType = disputeType;
        d.proposer = msg.sender;
        d.startTime = block.timestamp;
        d.endTime = block.timestamp + VOTING_DELAY + VOTING_PERIOD;
        d.yesVotes = 0;
        d.noVotes = 0;
        d.executed = false;
        d.cancelled = false;
        
        disputeExists[disputeId] = true;
        
        emit DisputeCreated(disputeId, campaignId, disputeType);
    }

    /// @notice Vote on a dispute (yes = support the action, no = oppose it)
    function voteOnDispute(uint256 disputeId, bool support) external {
        Dispute storage d = disputes[disputeId];
        require(disputeExists[disputeId], "dispute does not exist");
        require(block.timestamp >= d.startTime, "voting not started yet");
        require(block.timestamp <= d.endTime, "voting period ended");
        require(!d.executed, "dispute already executed");
        require(!d.cancelled, "dispute cancelled");
        
        uint256 votingPower = getVotingPower(msg.sender);
        require(votingPower > 0, "no voting power");
        
        if (support) {
            d.yesVotes += votingPower;
        } else {
            d.noVotes += votingPower;
        }
        
        emit DisputeVoted(disputeId, msg.sender, support);
    }

    /// @notice Execute a dispute if it passes (only after voting period ends)
    function executeDispute(uint256 disputeId) external {
        Dispute storage d = disputes[disputeId];
        require(disputeExists[disputeId], "dispute does not exist");
        require(block.timestamp >= d.endTime, "voting period not ended");
        require(!d.executed, "dispute already executed");
        require(!d.cancelled, "dispute cancelled");
        
        uint256 totalVotes = d.yesVotes + d.noVotes;
        require(totalVotes > 0, "no votes cast");
        
        // Check quorum: at least QUORUM_PERCENTAGE% of total supply must have voted
        uint256 totalSupply = getTotalSupply();
        require(totalVotes * 100 >= totalSupply * QUORUM_PERCENTAGE, "quorum not reached");
        
        // Check if majority voted yes
        require(d.yesVotes > d.noVotes, "majority did not approve");
        
        // Execute based on dispute type
        if (d.disputeType == DisputeType.WITHDRAWAL) {
            executeWithdrawalDispute(d);
        } else if (d.disputeType == DisputeType.MILESTONE_RELEASE) {
            executeMilestoneReleaseDispute(d);
        }
        
        d.executed = true;
        emit DisputeExecuted(disputeId);
    }

    /// @notice Cancel a dispute (only proposer can cancel before voting ends)
    function cancelDispute(uint256 disputeId) external {
        Dispute storage d = disputes[disputeId];
        require(disputeExists[disputeId], "dispute does not exist");
        require(msg.sender == d.proposer, "only proposer can cancel");
        require(block.timestamp < d.endTime, "cannot cancel after voting ends");
        require(!d.executed, "cannot cancel executed dispute");
        require(!d.cancelled, "already cancelled");
        
        d.cancelled = true;
        emit DisputeCancelled(disputeId);
    }

    /// @notice Get dispute details
    function getDispute(uint256 disputeId) external view returns (
        uint256 campaignId,
        uint256 milestoneId,
        DisputeType disputeType,
        address proposer,
        uint256 startTime,
        uint256 endTime,
        uint256 yesVotes,
        uint256 noVotes,
        bool executed,
        bool cancelled
    ) {
        Dispute storage d = disputes[disputeId];
        return (
            d.campaignId,
            d.milestoneId,
            d.disputeType,
            d.proposer,
            d.startTime,
            d.endTime,
            d.yesVotes,
            d.noVotes,
            d.executed,
            d.cancelled
        );
    }

    /// @notice Get campaign ID from dispute (helper for testing)
    function getCampaignIdFromDispute(uint256 disputeId) external view returns (uint256) {
        return disputes[disputeId].campaignId;
    }

    /// @notice Get milestone ID from dispute (helper for testing)
    function getMilestoneIdFromDispute(uint256 disputeId) external view returns (uint256) {
        return disputes[disputeId].milestoneId;
    }

    /// @notice Get dispute type from dispute (helper for testing)
    function getDisputeTypeFromDispute(uint256 disputeId) external view returns (DisputeType) {
        return disputes[disputeId].disputeType;
    }

    /// @notice Get proposer from dispute (helper for testing)
    function getProposerFromDispute(uint256 disputeId) external view returns (address) {
        return disputes[disputeId].proposer;
    }

    // ========== HELPER FUNCTIONS ==========

    function executeWithdrawalDispute(Dispute storage d) internal {
        Campaign storage c = campaigns[d.campaignId];
        require(msg.sender == c.creator, "only creator can execute");
        require(!c.withdrawn, "already withdrawn");
        
        uint256 amt = c.raised;
        c.withdrawn = true;
        
        require(usdc.transfer(c.creator, amt), "transfer failed");
        
        emit Withdrawn(d.campaignId, c.creator, amt);
    }

    function executeMilestoneReleaseDispute(Dispute storage d) internal {
        Campaign storage c = campaigns[d.campaignId];
        require(msg.sender == c.creator, "only creator can execute");
        require(d.milestoneId < c.milestonesCount, "invalid milestone");
        
        Milestone storage m = c.milestones[d.milestoneId];
        require(m.exists, "milestone does not exist");
        require(m.status == MilestoneStatus.Approved, "milestone not approved");
        require(m.amount > 0, "nothing to release");
        
        m.status = MilestoneStatus.Released;
        uint256 releaseAmount = m.amount;
        m.amount = 0;
        
        require(usdc.transfer(c.creator, releaseAmount), "transfer failed");
        
        emit MilestoneReleased(d.campaignId, d.milestoneId, releaseAmount);
    }

    function getVotingPower(address account) internal view returns (uint256) {
        // Simple ERC20 balance check - in reality this would be more complex
        // For now, we'll assume the daoToken is a standard ERC20
        // This is a simplified implementation
        return 1; // Each address gets 1 vote for simplicity in this PoC
    }

    function getTotalSupply() internal view returns (uint256) {
        // Simplified - in a real implementation this would query the daoToken contract
        return 1000; // Assume 1000 total voting power for simplicity
    }
}
