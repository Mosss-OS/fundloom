// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title FundloomFactory
/// @notice Single factory contract that tracks all Fundloom campaigns.
///         Donations are made in USDC (Base Sepolia: 0x036CbD53842c5426634e7929541eC2318f3dCF7e).
/// @dev Deploy once on Base Sepolia, then store the address in your Supabase project as
///      `FUNDLOOM_FACTORY_ADDRESS`. The frontend uses viem/ethers to call createCampaign /
///      contribute and listens for events to mirror state into Supabase.
interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract FundloomFactory {
    IERC20 public immutable usdc;

    struct Campaign {
        address creator;
        uint256 goal;       // in USDC base units (6 decimals)
        uint256 raised;
        uint64  deadline;   // unix seconds
        bool    withdrawn;
    }

    Campaign[] public campaigns;

    event CampaignCreated(uint256 indexed id, address indexed creator, uint256 goal, uint64 deadline);
    event Contributed(uint256 indexed id, address indexed donor, uint256 amount);
    event Withdrawn(uint256 indexed id, address indexed creator, uint256 amount);

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
    }

    function createCampaign(uint256 goal, uint64 deadline) external returns (uint256 id) {
        require(goal > 0, "goal=0");
        require(deadline > block.timestamp, "past");
        campaigns.push(Campaign(msg.sender, goal, 0, deadline, false));
        id = campaigns.length - 1;
        emit CampaignCreated(id, msg.sender, goal, deadline);
    }

    function contribute(uint256 id, uint256 amount) external {
        Campaign storage c = campaigns[id];
        require(block.timestamp <= c.deadline, "ended");
        require(amount > 0, "amount=0");
        require(usdc.transferFrom(msg.sender, address(this), amount), "xfer fail");
        c.raised += amount;
        emit Contributed(id, msg.sender, amount);
    }

    function withdraw(uint256 id) external {
        Campaign storage c = campaigns[id];
        require(msg.sender == c.creator, "not creator");
        require(!c.withdrawn, "done");
        c.withdrawn = true;
        uint256 amt = c.raised;
        require(usdc.transfer(c.creator, amt), "xfer fail");
        emit Withdrawn(id, c.creator, amt);
    }

    function campaignsCount() external view returns (uint256) {
        return campaigns.length;
    }
}