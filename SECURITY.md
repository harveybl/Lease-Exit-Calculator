# Security Policy

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in the Lease Exit Calculator, please report it privately.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please send an email to the repository owner or use GitHub's private vulnerability reporting feature:

1. Go to the [Security tab](https://github.com/harveybl/Lease-Exit-Calculator/security)
2. Click "Report a vulnerability"
3. Provide details about the vulnerability

### What to Include

When reporting a vulnerability, please include:

- Type of vulnerability
- Location of the affected source code (file path, line numbers)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability
- Suggested fix (if you have one)

### Response Timeline

- **Initial Response**: Within 48 hours of report
- **Status Update**: Within 1 week
- **Resolution**: Varies by severity and complexity

### Security Update Process

1. **Acknowledgment**: We'll confirm receipt of your report
2. **Investigation**: We'll investigate and validate the issue
3. **Fix Development**: We'll develop and test a fix
4. **Disclosure**: We'll coordinate disclosure with you
5. **Release**: We'll release a security update
6. **Credit**: We'll credit you for the discovery (unless you prefer anonymity)

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Security Best Practices

This project follows security best practices:

### Development
- Strict TypeScript mode
- Input validation with Zod
- XSS prevention
- No sensitive data in client-side code
- Regular dependency updates
- Security audits via `npm audit`

### Dependencies
- Regular security updates
- Automated vulnerability scanning
- Minimal dependency footprint
- Only trusted, well-maintained packages

### Code Review
- All changes require review
- Security checklist for every PR
- Automated security scanning in CI

### Data Privacy
- No server-side storage
- Client-side only (IndexedDB)
- No data collection or tracking
- No external API calls with user data

## Security Checklist for Contributors

When contributing code, ensure:

- [ ] All user inputs are validated
- [ ] No use of `dangerouslySetInnerHTML` without sanitization
- [ ] No eval() or similar unsafe functions
- [ ] Proper error handling (no sensitive info in errors)
- [ ] Dependencies are up to date
- [ ] `npm audit` shows no high/critical vulnerabilities
- [ ] No secrets or API keys in code
- [ ] XSS prevention measures in place
- [ ] HTTPS only for external resources

## Known Security Considerations

### Client-Side Storage
- Data stored in IndexedDB is accessible to JavaScript
- Users should not store sensitive information
- IndexedDB data persists until explicitly cleared

### Third-Party Dependencies
- We regularly update dependencies
- We monitor security advisories
- We use `npm audit` to catch vulnerabilities

### Browser Security
- Content Security Policy headers recommended
- HTTPS deployment recommended
- Modern browser required for security features

## Security Features

### Input Validation
- Zod schemas validate all form inputs
- Type safety enforced by TypeScript
- Decimal.js prevents floating-point errors

### XSS Prevention
- React's built-in XSS protection
- No unsafe HTML rendering
- Content Security Policy ready

### Dependency Security
- Regular updates via Dependabot (recommended)
- Automated vulnerability scanning
- Minimal dependency surface

## Contact

For security concerns, please contact the repository maintainers through:
- GitHub Security Advisories (preferred)
- Repository owner's email (see GitHub profile)

## Acknowledgments

We appreciate security researchers who responsibly disclose vulnerabilities and help keep this project secure.
