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
    function totalSupply() external view returns (uint256);
}

contract FundloomFactory {
    // Dispute Resolution
    enum DisputeType { WITHDRAWAL, MILESTONE_RELEASE }
    // Appeal status for disputes
    enum AppealStatus { None, Pending, Approved, Rejected }

    // Events
    event CampaignCreated(uint256 indexed campaignId, address indexed creator, uint256 goal, uint64 deadline);
    event MilestoneAdded(uint256 indexed campaignId, uint256 indexed milestoneId, string description, uint256 amount);
    event Contributed(uint256 indexed campaignId, address indexed contributor, uint256 amount);
    event Withdrawn(uint256 indexed campaignId, address indexed creator, uint256 amount);
    event MilestoneReleased(uint256 indexed campaignId, uint256 indexed milestoneId, uint256 amount);
    event DisputeCreated(uint256 indexed disputeId, address indexed proposer, DisputeType disputeType);
    event DisputeVoted(uint256 indexed disputeId, address indexed voter, bool support);
    event DisputeExecuted(uint256 indexed disputeId);
    event DisputeAppealed(uint256 indexed disputeId, address indexed appellant);
    event AppealVoted(uint256 indexed disputeId, address indexed voter, bool support);
    event AppealExecuted(uint256 indexed disputeId, bool upheld); // true = upheld, false = rejected
    event AppealCancelled(uint256 indexed disputeId);
    event DisputeCancelled(uint256 indexed disputeId);
    IERC20 public immutable USDC;
    address public daoToken; // Simple governance token for voting
    
    // Dispute fees
    uint256 public constant DISPUTE_FEE = 10 * 10**6; // 10 USDC (6 decimals)
    address public disputeFeeRecipient; // Who receives dispute fees
    
    // DAO Governance Parameters
    uint256 public constant VOTING_DELAY = 1 days; // Time before voting starts
    uint256 public constant VOTING_PERIOD = 3 days; // Time for voting to occur
    uint256 public constant QUORUM_PERCENTAGE = 4; // 4% of total supply needed for quorum
    uint256 public constant MIN_DELAY = 1 days; // Minimum delay after vote passes before execution
    
    /// @notice Constructor
    /// @param _usdc Address of the USDC token
    /// @param _daoToken Address of the DAO governance token
    /// @param _disputeFeeRecipient Address to receive dispute fees
    constructor(address _usdc, address _daoToken, address _disputeFeeRecipient) {
        USDC = IERC20(_usdc);
        daoToken = _daoToken;
        disputeFeeRecipient = _disputeFeeRecipient;
    }

    // Dispute Resolution and Appeal status enums are defined globally above
    
    // Extend Dispute struct to include appeal information
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
        // Appeal information
        AppealStatus appealStatus;
        address appealer;
        uint256 appealStartTime;
        uint256 appealEndTime;
        uint256 appealYesVotes;
        uint256 appealNoVotes;
        bool appealExecuted;
    }

    Dispute[] public disputes;
    mapping(uint256 => bool) public disputeExists; // disputeId -> exists

    // Milestone and Campaign
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

    /// @notice Create a new campaign
    /// @param goal Funding goal in USDC (6 decimals)
    /// @param deadline Unix timestamp for campaign deadline
    /// @return id ID of the newly created campaign
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
    /// @param campaignId ID of the campaign
    /// @param description Description of the milestone
    /// @param amount Amount in USDC (6 decimals) for this milestone
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
        emit MilestoneAdded(campaignId, milestoneId, description, amount);
    }

    /// @notice Contribute USDC to a campaign
    /// @param campaignId ID of the campaign to contribute to
    /// @param amount Amount of USDC (6 decimals) to contribute
    function contribute(uint256 campaignId, uint256 amount) external {
        Campaign storage c = campaigns[campaignId];
        require(block.timestamp <= c.deadline, "ended");
        require(amount > 0, "amount=0");
        require(USDC.transferFrom(msg.sender, address(this), amount), "xfer fail");
        c.raised += amount;
        emit Contributed(campaignId, msg.sender, amount);
    }

    /// @notice Legacy: Withdraw all raised funds (without milestones)
    /// @param campaignId ID of the campaign to withdraw from
    function withdraw(uint256 campaignId) external {
        Campaign storage c = campaigns[campaignId];
        require(msg.sender == c.creator, "not creator");
        require(!c.withdrawn, "done");
        c.withdrawn = true;
        uint256 amt = c.raised;
        c.raised = 0;
        require(USDC.transfer(c.creator, amt), "xfer fail");
        emit Withdrawn(campaignId, c.creator, amt);
    }

    /// @notice Release funds for an approved milestone
    /// @param campaignId ID of the campaign
    /// @param milestoneId ID of the milestone to release
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
        require(USDC.transfer(c.creator, releaseAmount), "xfer fail");
        emit MilestoneReleased(campaignId, milestoneId, releaseAmount);
    }

    /// @notice Create a new dispute for a campaign or milestone
    /// @param campaignId ID of the campaign
    /// @param milestoneId ID of the milestone (0 for withdrawal disputes)
    /// @param disputeType Type of dispute (WITHDRAWAL or MILESTONE_RELEASE)
    /// @return disputeId ID of the newly created dispute
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
        // Appeal fields are initialized to default values
        
        disputeExists[disputeId] = true;
        
        // Require dispute fee payment
        require(USDC.transferFrom(msg.sender, disputeFeeRecipient, DISPUTE_FEE), "dispute fee not paid");
        
        emit DisputeCreated(disputeId, msg.sender, disputeType);
    }

    /// @notice Vote on a dispute (yes = support the proposer, no = oppose the proposer)
    /// @param disputeId ID of the dispute to vote on
    /// @param support True to vote yes (support proposer), false to vote no (oppose proposer)
    function voteOnDispute(uint256 disputeId, bool support) external {
        Dispute storage d = disputes[disputeId];
        require(disputeExists[disputeId], "dispute does not exist");
        require(!d.executed, "dispute already executed");
        require(!d.cancelled, "dispute cancelled");
        require(block.timestamp >= d.startTime, "voting not started yet");
        require(block.timestamp <= d.endTime, "voting period ended");
        
        uint256 votingPower = getVotingPower(msg.sender);
        require(votingPower > 0, "no voting power");
        
        if (support) {
            d.yesVotes += votingPower;
        } else {
            d.noVotes += votingPower;
        }
        
        emit DisputeVoted(disputeId, msg.sender, support);
    }

    // Appeal parameters
    uint256 public constant APPEAL_VOTING_DELAY = 1 days; // Time before appeal voting starts
    uint256 public constant APPEAL_VOTING_PERIOD = 3 days; // Time for appeal voting to occur
    uint256 public constant APPEAL_QUORUM_PERCENTAGE = 10; // 10% of total supply needed for appeal quorum
    uint256 public constant APPEAL_FEE = 20 * 10**6; // 20 USDC for appeal fee (higher than dispute fee)

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
            // Execute withdrawal dispute - transfer funds to campaign creator
            Campaign storage c = campaigns[d.campaignId];
            require(!c.withdrawn, "already withdrawn");
            uint256 amt = c.raised;
            c.withdrawn = true;
            require(USDC.transfer(c.creator, amt), "transfer failed");
            emit Withdrawn(d.campaignId, c.creator, amt);
        } else if (d.disputeType == DisputeType.MILESTONE_RELEASE) {
            // Execute milestone release dispute
            Campaign storage c = campaigns[d.campaignId];
            require(d.milestoneId < c.milestonesCount, "invalid milestone");
            Milestone storage m = c.milestones[d.milestoneId];
            require(m.exists, "milestone does not exist");
            require(m.status == MilestoneStatus.Approved, "milestone not approved");
            require(m.amount > 0, "nothing to release");
            m.status = MilestoneStatus.Released;
            uint256 releaseAmount = m.amount;
            m.amount = 0;
            require(USDC.transfer(c.creator, releaseAmount), "transfer failed");
            emit MilestoneReleased(d.campaignId, d.milestoneId, releaseAmount);
        }
        
        d.executed = true;
        emit DisputeExecuted(disputeId);
    }

    /// @notice Create an appeal for an executed dispute (only after dispute execution)
    function createAppeal(uint256 disputeId) external returns (uint256 appealId) {
        Dispute storage d = disputes[disputeId];
        require(disputeExists[disputeId], "dispute does not exist");
        require(d.executed, "dispute not executed yet");
        require(d.appealStatus == AppealStatus.None, "appeal already exists or in progress");
        require(msg.sender == d.proposer, "only proposer can appeal");
        
        // Require appeal fee payment (higher than dispute fee)
        require(USDC.transferFrom(msg.sender, disputeFeeRecipient, APPEAL_FEE), "appeal fee not paid");
        
        // Set up appeal parameters
        d.appealStatus = AppealStatus.Pending;
        d.appealer = msg.sender;
        d.appealStartTime = block.timestamp;
        d.appealEndTime = block.timestamp + APPEAL_VOTING_DELAY + APPEAL_VOTING_PERIOD;
        d.appealYesVotes = 0;
        d.appealNoVotes = 0;
        d.appealExecuted = false;
        
        emit DisputeAppealed(disputeId, msg.sender);
    }

    /// @notice Vote on an appeal (yes = support keeping the original execution, no = support reversing it)
    function voteOnAppeal(uint256 disputeId, bool support) external {
        Dispute storage d = disputes[disputeId];
        require(disputeExists[disputeId], "dispute does not exist");
        require(d.executed, "dispute not executed yet");
        require(d.appealStatus == AppealStatus.Pending, "appeal not in voting period");
        require(block.timestamp >= d.appealStartTime, "appeal voting not started yet");
        require(block.timestamp <= d.appealEndTime, "appeal voting period ended");
        require(!d.appealExecuted, "appeal already executed");
        
        uint256 votingPower = getVotingPower(msg.sender);
        require(votingPower > 0, "no voting power");
        
        if (support) {
            d.appealYesVotes += votingPower;
        } else {
            d.appealNoVotes += votingPower;
        }
        
        emit AppealVoted(disputeId, msg.sender, support);
    }

    /// @notice Execute an appeal if it passes (only after appeal voting period ends)
    function executeAppeal(uint256 disputeId) external {
        Dispute storage d = disputes[disputeId];
        require(disputeExists[disputeId], "dispute does not exist");
        require(d.executed, "dispute not executed yet");
        require(d.appealStatus == AppealStatus.Pending, "appeal not in voting period");
        require(block.timestamp >= d.appealEndTime, "appeal voting period not ended");
        require(!d.appealExecuted, "appeal already executed");
        
        uint256 totalVotes = d.appealYesVotes + d.appealNoVotes;
        require(totalVotes > 0, "no votes cast");
        
        // Check quorum: at least APPEAL_QUORUM_PERCENTAGE% of total supply must have voted
        uint256 totalSupply = getTotalSupply();
        require(totalVotes * 100 >= totalSupply * APPEAL_QUORUM_PERCENTAGE, "appeal quorum not reached");
        
        // Check if majority voted yes (to keep original execution)
        require(d.appealYesVotes > d.appealNoVotes, "appeal majority did not uphold original execution");
        
        // Appeal upheld - original execution stands
        d.appealStatus = AppealStatus.Approved;
        d.appealExecuted = true;
        emit AppealExecuted(disputeId, true); // true = appeal upheld
    }

    /// @notice Reject an appeal if it fails (appeal execution reverses the original decision)
    function rejectAppeal(uint256 disputeId) external {
        Dispute storage d = disputes[disputeId];
        require(disputeExists[disputeId], "dispute does not exist");
        require(d.executed, "dispute not executed yet");
        require(d.appealStatus == AppealStatus.Pending, "appeal not in voting period");
        require(block.timestamp >= d.appealEndTime, "appeal voting period not ended");
        require(!d.appealExecuted, "appeal already executed");
        
        uint256 totalVotes = d.appealYesVotes + d.appealNoVotes;
        require(totalVotes > 0, "no votes cast");
        
        // Check quorum: at least APPEAL_QUORUM_PERCENTAGE% of total supply must have voted
        uint256 totalSupply = getTotalSupply();
        require(totalVotes * 100 >= totalSupply * APPEAL_QUORUM_PERCENTAGE, "appeal quorum not reached");
        
        // Appeal rejected - original execution is reversed
        // Note: In a real implementation, we would reverse the original action here
        // For simplicity, we're just marking it as rejected
        d.appealStatus = AppealStatus.Rejected;
        d.appealExecuted = true;
        emit AppealExecuted(disputeId, false); // false = appeal rejected
    }

    /// @notice Cancel an appeal (only appellant can cancel before voting ends)
    function cancelAppeal(uint256 disputeId) external {
        Dispute storage d = disputes[disputeId];
        require(disputeExists[disputeId], "dispute does not exist");
        require(d.executed, "dispute not executed yet");
        require(d.appealStatus == AppealStatus.Pending, "appeal not in voting period");
        require(msg.sender == d.appealer, "only appealer can cancel");
        require(block.timestamp < d.appealEndTime, "cannot cancel after appeal voting ends");
        require(!d.appealExecuted, "cannot cancel executed appeal");
        
        d.appealStatus = AppealStatus.None;
        emit AppealCancelled(disputeId);
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

    /// @notice Get dispute details (individual getters below)
    // Function removed due to stack too deep - use individual getters

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

    // ========== DISPUTE QUERY FUNCTIONS ==========

    /// @notice Get all dispute IDs for a campaign
    function getDisputesForCampaign(uint256 campaignId) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < disputes.length; i++) {
            if (disputes[i].campaignId == campaignId && disputeExists[i]) {
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < disputes.length; i++) {
            if (disputes[i].campaignId == campaignId && disputeExists[i]) {
                result[index] = i;
                index++;
            }
        }
        return result;
    }

    /// @notice Get total number of disputes
    function getTotalDisputes() external view returns (uint256) {
        return disputes.length;
    }

    // ========== HELPER FUNCTIONS ==========

    /// @notice Get the total number of campaigns
    function campaignsCount() external view returns (uint256) {
        return campaigns.length;
    }

    function getVotingPower(address account) internal view returns (uint256) {
        // Query the actual DAO token balance for voting power
        // Requires daoToken to be a standard ERC20
        return IERC20(daoToken).balanceOf(account);
    }

    function getTotalSupply() internal view returns (uint256) {
        // Query the actual DAO token total supply
        return IERC20(daoToken).totalSupply();
    }
}
