# Security Policy

Last updated: April 2026

## Supported Versions

We provide security updates for the following versions of Fundloom:
- Current stable release: v1.0.0 (Base Sepolia testnet)
- Development branch: main

## Reporting a Vulnerability

We take the security of our platform seriously. If you believe you have found a security vulnerability in Fundloom, please report it to us as described below.

### How to Report

Please **do not** disclose security-related issues publicly until we have had a chance to address them. Instead, send an email to:

**security@fundloom.io**

Your report should include:
- A clear description of the vulnerability
- Steps to reproduce the issue
- Proof of concept or exploit code (if available)
- The version of the software affected
- Any potential impact or severity assessment

### What Happens After You Report

We will:
1. Acknowledge receipt of your report within 48 hours
2. Provide a more detailed response within 5 business days
3. Keep you informed of our progress towards fixing the issue
4. Notify you when we have released a fix
5. Offer credit in our release notes or changelog (if desired)

## Scope

This security policy covers:
- Fundloom smart contracts
- Frontend web application
- Backend serverless functions
- API endpoints
- Infrastructure and deployment processes

## Security Practices

### Smart Contract Security
- All smart contracts undergo formal verification and testing
- Use of established libraries (OpenZeppelin) where possible
- Comprehensive test suite with high coverage
- Formal audit before mainnet deployment
- Bug bounty program (planned)

### Application Security
- Regular dependency updates and vulnerability scanning
- Input validation and sanitization on all endpoints
- Authentication and authorization checks
- Secure handling of private keys and secrets
- Protection against common web vulnerabilities (XSS, CSRF, etc.)

### Infrastructure Security
- Secure configuration of all cloud services
- Principle of least privilege for all services
- Network segmentation and firewalls
- Regular security scanning and penetration testing
- Encryption at rest and in transit

### Data Protection
- GDPR compliance for user data
- Minimal data collection and retention
- Secure storage of sensitive information
- Regular backups and disaster recovery plans

## Responsible Disclosure

We follow responsible disclosure practices and ask that reporters do the same. We will not pursue legal action against researchers who:
- Make a good faith effort to avoid privacy violations
- Do not destroy or corrupt data
- Only interact with systems they have permission to test
- Provide us reasonable time to resolve any issues before public disclosure

## Bounty Program

We plan to launch a security bounty program in the future to reward researchers who help us improve our security. Details will be announced when the program launches.

## Contact

If you have any questions about our security practices, please contact us at:
security@fundloom.io

## Policy Updates

We may update this Security Policy from time to time. We will notify you of any changes by posting the updated policy on this page.