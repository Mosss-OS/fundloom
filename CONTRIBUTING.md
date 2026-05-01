# Contributing to Fundloom

Thank you for considering contributing to Fundloom! We welcome contributions from the community to help improve our decentralized crowdfunding platform.

## How to Contribute

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes
4. Ensure all tests pass
5. Submit a pull request

## Development Setup

See [README.md](README.md) for detailed setup instructions.

## Smart Contract Development

### DAO Governance Implementation

The FundloomFactory.sol contract includes a comprehensive DAO governance system for dispute resolution:

#### Key Components

1. **Dispute Types**
   - WITHDRAWAL: For disputing full campaign fund withdrawals
   - MILESTONE_RELEASE: For disputing individual milestone fund releases

2. **Voting Mechanism**
   - Token-weighted voting (currently using 1 vote per address for proof-of-concept)
   - Voting delay: 1 day before voting starts
   - Voting period: 3 days for voting to occur
   - Quorum: 4% of total supply needed for dispute quorum
   - Appeal quorum: 10% of total supply needed for appeal quorum

3. **Appeal System**
   - Higher appeal fee (20 USDC vs 10 USDC for disputes)
   - Separate voting parameters for appeals
   - Multi-tier appeal process (Pending → Approved/Rejected)
   - Only dispute proposers can initiate appeals
   - Appeals can only be created after dispute execution

4. **Execution**
   - Automatic execution after voting period ends if quorum and majority requirements are met
   - Appeal execution upholds or reverses original dispute decision

#### Functions Available

- `createDispute(uint256 campaignId, uint256 milestoneId, DisputeType disputeType)`
- `voteOnDispute(uint256 disputeId, bool support)`
- `executeDispute(uint256 disputeId)`
- `cancelDispute(uint256 disputeId)`
- `createAppeal(uint256 disputeId)`
- `voteOnAppeal(uint256 disputeId, bool support)`
- `executeAppeal(uint256 disputeId)`
- `rejectAppeal(uint256 disputeId)`
- `cancelAppeal(uint256 disputeId)`

### Testing

Run tests with:
```bash
forge test
```

Specific dispute tests:
```bash
forge test -m testDispute
forge test -m testDisputeIntegration
```

### Deployment

See [DEPLOY.md](DEPLOY.md) for deployment instructions.

## Frontend Development

### Dispute System Integration

The dispute system is integrated into the frontend at:

- **Contract Integration**: `src/integrations/contract.ts`
  - Functions for creating, voting on, executing, and canceling disputes
  - Functions for appeal operations
  - Real-time event listeners for dispute updates

- **Campaign Detail Page**: `src/routes/c.$id.tsx`
  - Dispute tab showing active disputes
  - UI for creating disputes (visible to campaign creators)
  - Voting interface for dispute participation
  - Real-time polling for dispute status updates
  - Appeal system UI

### UI Components

Reusable components for dispute system:
- Dispute creation modal
- Dispute voting interface
- Dispute status display
- Appeal system components

## Code Style

- Follow existing code style in the repository
- Use Prettier for code formatting
- Solidity contracts should follow standard Ethereum development practices
- TypeScript code should follow strict typing guidelines

## Reporting Issues

Please use the GitHub issue tracker to report bugs or suggest features.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Happy coding! 🚀