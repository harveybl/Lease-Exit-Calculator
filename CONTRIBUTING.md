# Contributing to Lease Exit Calculator

Thank you for your interest in contributing to the Lease Exit Calculator! This document outlines our comprehensive development workflow and quality standards.

## Table of Contents

- [Development Workflow Overview](#development-workflow-overview)
- [Test-Driven Development (TDD)](#test-driven-development-tdd)
- [Specification Review Process](#specification-review-process)
- [Code Review Process](#code-review-process)
- [Testing Requirements](#testing-requirements)
- [Security Review](#security-review)
- [Documentation Requirements](#documentation-requirements)
- [Feature Development Checklist](#feature-development-checklist)

## Development Workflow Overview

Every new feature must follow this rigorous workflow to ensure code quality, security, and maintainability:

```
Spec Review → TDD → Code Review → E2E Testing → Security Review → Documentation → Merge
```

**No feature is considered complete until ALL checklist items are addressed, including low-priority items.**

## Test-Driven Development (TDD)

All new features and bug fixes MUST follow TDD principles:

### TDD Process

1. **Write the Test First**
   - [ ] Write a failing test that describes the desired behavior
   - [ ] Ensure the test fails for the right reason
   - [ ] Review test code for clarity and completeness

2. **Implement the Minimum Code**
   - [ ] Write only enough code to make the test pass
   - [ ] Focus on functionality, not optimization
   - [ ] Keep implementations simple and readable

3. **Refactor**
   - [ ] Clean up code while keeping tests green
   - [ ] Remove duplication
   - [ ] Improve naming and structure
   - [ ] Verify all tests still pass

4. **Repeat**
   - [ ] Continue the cycle for each piece of functionality
   - [ ] Build features incrementally

### TDD Requirements

- [ ] **100% test coverage** for all calculation logic in `src/lib/calculations/`
- [ ] **Meaningful test coverage** for UI components and hooks
- [ ] Tests must be clear, focused, and test one thing at a time
- [ ] Use descriptive test names that explain what is being tested
- [ ] Include both positive and negative test cases
- [ ] Test edge cases and boundary conditions
- [ ] Mock external dependencies appropriately

### Test Types

1. **Unit Tests** (Required)
   - Pure functions and utilities
   - Individual components
   - Business logic

2. **Integration Tests** (Required for complex features)
   - Component interactions
   - Hook integration
   - Data flow between modules

3. **End-to-End Tests** (Required for user-facing features)
   - User workflows
   - Complete scenarios
   - Cross-browser testing

## Specification Review Process

Before writing any code, specifications must be reviewed:

### Pre-Development Checklist

- [ ] Feature specification document created
- [ ] Requirements clearly defined and documented
- [ ] User stories written (if applicable)
- [ ] Acceptance criteria defined
- [ ] Technical approach outlined
- [ ] API contracts defined (if applicable)
- [ ] Data models specified
- [ ] UI/UX mockups reviewed (if applicable)
- [ ] Edge cases identified
- [ ] Performance requirements specified
- [ ] Security considerations documented
- [ ] Spec reviewed and approved by at least one team member
- [ ] All spec review comments addressed

### Specification Document Should Include

1. **Overview**: What problem does this solve?
2. **Requirements**: What must the feature do?
3. **Technical Design**: How will it be implemented?
4. **Testing Strategy**: How will it be tested?
5. **Security Considerations**: What are the security implications?
6. **Performance Impact**: Will this affect performance?
7. **Documentation Needs**: What documentation is required?

## Code Review Process

All code changes require thorough review before merging:

### Code Review Checklist

#### Functionality
- [ ] Code correctly implements the specification
- [ ] All acceptance criteria met
- [ ] Edge cases handled appropriately
- [ ] Error handling is comprehensive
- [ ] No obvious bugs or logic errors

#### Code Quality
- [ ] Code is clean, readable, and maintainable
- [ ] Functions are small and focused (single responsibility)
- [ ] Variables and functions have clear, descriptive names
- [ ] No unnecessary complexity
- [ ] DRY principle followed (Don't Repeat Yourself)
- [ ] Consistent with existing codebase style
- [ ] No commented-out code
- [ ] No console.log or debug statements (unless intentional)

#### TypeScript Best Practices
- [ ] Strict TypeScript mode followed
- [ ] No use of `any` type (unless absolutely necessary with justification)
- [ ] Proper type definitions for all functions and variables
- [ ] Interfaces/types defined where appropriate
- [ ] Null/undefined handling is explicit

#### Testing
- [ ] All tests pass (100% pass rate required)
- [ ] New tests added for new functionality
- [ ] Test coverage meets requirements (100% for calculations)
- [ ] Tests are meaningful and test the right things
- [ ] No flaky tests
- [ ] Tests run quickly

#### Performance
- [ ] No performance regressions
- [ ] Efficient algorithms used
- [ ] Unnecessary re-renders avoided (React)
- [ ] Large lists/data handled efficiently
- [ ] Network requests optimized

#### Security
- [ ] No security vulnerabilities introduced
- [ ] Input validation present
- [ ] XSS prevention measures in place
- [ ] No sensitive data exposed
- [ ] Dependencies are up to date and secure

#### Accessibility
- [ ] WCAG 2.1 AA compliance maintained
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Proper ARIA labels where needed
- [ ] Color contrast requirements met
- [ ] Focus management correct

#### Documentation
- [ ] Code comments added where necessary
- [ ] Complex logic explained
- [ ] Public API documented
- [ ] README updated if needed
- [ ] CHANGELOG updated
- [ ] Type documentation complete

### Review Priority Levels

**All review items must be addressed, including low-priority items:**

- **🔴 Critical**: Must be fixed before merge (security, bugs, breaking changes)
- **🟡 Important**: Should be fixed before merge (code quality, best practices)
- **🟢 Minor**: Must still be addressed (style, typos, minor improvements)
- **💭 Question**: Requires discussion and resolution

**Even low-priority (🟢) items must be addressed.** Do not merge until all feedback is resolved.

## Testing Requirements

### Required Test Coverage

| Code Area | Coverage Requirement | Test Types |
|-----------|---------------------|------------|
| `src/lib/calculations/` | 100% (enforced) | Unit tests |
| Business logic | 90%+ | Unit + Integration |
| UI Components | 70%+ | Unit + Integration |
| Hooks | 80%+ | Unit + Integration |
| User workflows | Critical paths | E2E tests |

### Testing Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Test Requirements

- [ ] All tests must pass before merging (100% pass rate)
- [ ] No skipped tests (no `.skip()` or `.only()` in committed code)
- [ ] Tests must be deterministic (no flaky tests)
- [ ] Tests should run quickly (< 5 seconds for unit tests)
- [ ] Integration tests should be isolated
- [ ] E2E tests should test complete user workflows

### E2E Testing Guidelines

While E2E testing framework is not yet implemented, future E2E tests should:

- [ ] Test complete user scenarios
- [ ] Cover critical user paths
- [ ] Test cross-browser compatibility
- [ ] Test on mobile viewports
- [ ] Test accessibility features
- [ ] Test offline functionality (PWA)
- [ ] Test data persistence

**Note**: E2E testing framework to be implemented in future. Until then, manual testing of critical paths is required.

## Security Review

Every code change must undergo security review:

### Security Checklist

- [ ] **Input Validation**: All user inputs validated
- [ ] **XSS Prevention**: No unescaped user content rendered
- [ ] **Dependency Security**: Dependencies scanned for vulnerabilities
- [ ] **Data Privacy**: No sensitive data logged or exposed
- [ ] **Authentication/Authorization**: Proper checks in place (if applicable)
- [ ] **HTTPS Only**: All external requests use HTTPS
- [ ] **Content Security Policy**: CSP headers configured correctly
- [ ] **Secret Management**: No secrets in code or version control
- [ ] **Error Handling**: Errors don't leak sensitive information
- [ ] **Rate Limiting**: API endpoints protected (if applicable)

### Security Review Process

1. **Automated Scanning**
   - [ ] Run `npm audit` to check for vulnerable dependencies
   - [ ] Fix all high and critical vulnerabilities
   - [ ] Document any accepted low-risk vulnerabilities

2. **Manual Review**
   - [ ] Review code for security best practices
   - [ ] Check for common vulnerabilities (OWASP Top 10)
   - [ ] Verify input validation and sanitization
   - [ ] Check authentication and authorization logic

3. **Security Testing**
   - [ ] Test with malicious inputs
   - [ ] Verify XSS prevention
   - [ ] Test error handling
   - [ ] Verify data privacy

## Documentation Requirements

Documentation must be updated alongside code changes:

### Documentation Checklist

- [ ] **Code Comments**: Complex logic explained
- [ ] **Function Documentation**: Public APIs documented
- [ ] **README Updates**: Changes reflected in README.md
- [ ] **Type Definitions**: TypeScript types documented
- [ ] **User Documentation**: User-facing features documented
- [ ] **CHANGELOG**: Changes added to CHANGELOG
- [ ] **Migration Guide**: Breaking changes documented (if applicable)
- [ ] **Examples**: Usage examples provided for new APIs
- [ ] **Architecture Docs**: System design updated (if applicable)

### Documentation Standards

- Use clear, concise language
- Include code examples where appropriate
- Keep documentation close to code (co-located)
- Update documentation before merging code
- Document "why" not just "what"
- Include visual aids (diagrams, screenshots) when helpful

## Feature Development Checklist

Use this checklist for every new feature:

### Phase 1: Specification & Design
- [ ] Feature specification document created
- [ ] Requirements clearly defined
- [ ] Technical design reviewed
- [ ] Security implications considered
- [ ] Performance impact assessed
- [ ] Testing strategy defined
- [ ] Spec review completed and approved
- [ ] All spec review comments addressed (including low-priority)

### Phase 2: Test-Driven Development
- [ ] Test cases written (before implementation)
- [ ] Tests fail for the right reasons
- [ ] Minimum code implemented to pass tests
- [ ] All tests passing (100% pass rate)
- [ ] Code refactored while keeping tests green
- [ ] Coverage requirements met

### Phase 3: Code Review
- [ ] Pull request created with clear description
- [ ] All PR checklist items completed
- [ ] Code review requested
- [ ] All review comments addressed (including low-priority 🟢 items)
- [ ] No unresolved conversations
- [ ] Approval received from at least one reviewer

### Phase 4: Testing Validation
- [ ] Unit tests passing (100%)
- [ ] Integration tests passing (100%)
- [ ] E2E tests passing (or manual testing completed)
- [ ] Test coverage meets requirements
- [ ] No flaky tests

### Phase 5: Security Review
- [ ] Security checklist completed
- [ ] `npm audit` run and vulnerabilities addressed
- [ ] Manual security review completed
- [ ] Security testing completed
- [ ] No security concerns outstanding

### Phase 6: Documentation
- [ ] Code documentation complete
- [ ] README updated
- [ ] CHANGELOG updated
- [ ] User documentation updated (if needed)
- [ ] Migration guide created (if breaking changes)

### Phase 7: Final Validation
- [ ] Linter passing (`npm run lint`)
- [ ] Build successful (`npm run build`)
- [ ] All tests passing (`npm test`)
- [ ] Manual testing completed
- [ ] Performance verified
- [ ] Accessibility verified
- [ ] Cross-browser testing completed (if UI changes)
- [ ] Mobile testing completed (if UI changes)

### Phase 8: Merge
- [ ] All above phases completed
- [ ] All checklist items checked
- [ ] CI/CD pipeline passing
- [ ] Final approval received
- [ ] Code merged to main branch

## Getting Help

If you have questions or need help with any part of this process:

1. Review existing code and tests for examples
2. Check documentation and guides
3. Ask questions in pull request comments
4. Reach out to maintainers

## Quality Standards

We maintain high standards for code quality:

- **Test Coverage**: 100% for calculations, 70%+ overall
- **Build Status**: Must always pass
- **Linting**: Zero warnings or errors
- **Type Safety**: Strict TypeScript mode
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: No regressions
- **Security**: Zero known vulnerabilities

## Best Practices

- Write clear, self-documenting code
- Keep functions small and focused
- Test edge cases and error conditions
- Document complex logic
- Use meaningful variable and function names
- Follow existing code patterns
- Refactor when you see duplication
- Leave the code better than you found it

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
