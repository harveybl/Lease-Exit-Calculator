# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive development workflow documentation
  - CONTRIBUTING.md with TDD, code review, and security review processes
  - DEVELOPMENT.md with technical setup and workflow details
  - Pull request template with complete quality checklist
  - Enhanced CI/CD pipeline with automated quality checks
- Development best practices enforcement:
  - 100% test passing requirement for all changes
  - All review items must be addressed (including low-priority)
  - Security review mandatory for all changes
  - Documentation updates required with code changes
  - Spec reviews before implementation
  - E2E testing guidelines (framework TBD)
- CI/CD improvements:
  - Automated linting checks
  - Type checking in CI
  - Test coverage verification
  - Security audit scanning
  - Build verification
  - PR comment with check results
- README badges for build status and coverage

### Changed
- Updated README.md with contributing section and badges
- Enhanced GitHub Actions workflow with comprehensive quality gates

## [0.1.0] - Previous Release

### Features
- Lease exit option comparison
- Timeline visualization
- PDF export
- PWA functionality
- 208 tests with 100% calculation coverage
- Responsive design
- WCAG 2.1 AA accessibility compliance

[Unreleased]: https://github.com/harveybl/Lease-Exit-Calculator/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/harveybl/Lease-Exit-Calculator/releases/tag/v0.1.0
