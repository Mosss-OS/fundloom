# Contributing to Fundloom

Thank you for your interest in contributing to Fundloom! We welcome contributions from the community.

## How to Contribute

### Reporting Bugs
- Use the GitHub issue tracker
- Label the issue as "bug"
- Provide clear steps to reproduce
- Include screenshots if applicable
- Specify your environment (browser, OS, etc.)

### Suggesting Features
- Use the GitHub issue tracker
- Label the issue as "enhancement"
- Provide a clear description of the feature
- Explain why this feature would be valuable
- Include any relevant mockups or designs

### Submitting Pull Requests
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Ensure your code follows our style guidelines
5. Add tests for new functionality
6. Run the test suite to ensure everything passes
7. Commit your changes (`git commit -am 'Add some feature'`)
8. Push to the branch (`git push origin feature/your-feature-name`)
9. Create a new Pull Request

## Development Setup

### Prerequisites
- Node.js >= 18
- Git
- Foundry (for smart contract development)
- Supabase CLI

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/fundloom.git
cd fundloom

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Install Foundry
curl -L https://foundry.paradigm.xyz | bash

# Install Supabase CLI
npm install -g supabase
```

### Running Tests
```bash
# Run smart contract tests
forge test

# Run frontend tests (when implemented)
npm test
```

## Code Style

### Solidity
- Follow the [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Use 4 spaces for indentation
- Limit lines to 120 characters
- Import ordering: external imports first, then internal

### TypeScript/JavaScript
- Follow Airbnb JavaScript Style Guide with TypeScript extensions
- Use Prettier for code formatting
- Use ESLint for linting
- Limit lines to 100 characters
- Use meaningful variable and function names

### Commit Messages
- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally
- Start with a capital letter
- Do not end the first line with a period

## Reporting Security Issues

Please do not disclose security-related issues publicly. Instead, send an email to security@fundloom.io.

## Getting Help

If you need help, please:
- Check the documentation
- Look through existing issues
- Ask in the community forums
- Reach out to maintainers

Thank you again for contributing to Fundloom!