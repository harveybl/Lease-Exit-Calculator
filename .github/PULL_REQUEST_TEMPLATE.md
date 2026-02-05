## Description

<!-- Provide a clear and concise description of what this PR does -->

## Related Issue

<!-- Link to the issue this PR addresses. Use "Closes #123" to auto-close the issue when merged -->

Closes #

## Type of Change

<!-- Check all that apply -->

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🎨 Style/UI update
- [ ] ♻️ Code refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] ✅ Test updates
- [ ] 🔧 Build/config changes

## Phase 1: Specification & Design ✅

- [ ] Feature specification document created (or N/A for small changes)
- [ ] Requirements clearly defined
- [ ] Technical design reviewed
- [ ] Security implications considered
- [ ] Performance impact assessed
- [ ] Testing strategy defined
- [ ] Spec review completed and approved
- [ ] **All spec review comments addressed (including low-priority items)**

## Phase 2: Test-Driven Development ✅

- [ ] Test cases written **before** implementation
- [ ] Tests fail for the right reasons (verified)
- [ ] Minimum code implemented to pass tests
- [ ] **All tests passing (100% pass rate)**
- [ ] Code refactored while keeping tests green
- [ ] Coverage requirements met:
  - [ ] 100% coverage for `src/lib/calculations/` (if modified)
  - [ ] 70%+ coverage for other modified code

## Phase 3: Code Review ✅

- [ ] Pull request has clear, descriptive title
- [ ] Description explains what and why (not just how)
- [ ] Screenshots/videos included for UI changes
- [ ] Breaking changes clearly documented
- [ ] Code review requested from appropriate reviewers
- [ ] **All review comments addressed (including low-priority 🟢 items)**
- [ ] No unresolved conversations
- [ ] Approval received from at least one reviewer

### Code Quality Checklist

- [ ] Code correctly implements the specification
- [ ] Functions are small and focused (single responsibility)
- [ ] Variables and functions have clear, descriptive names
- [ ] No unnecessary complexity
- [ ] DRY principle followed (Don't Repeat Yourself)
- [ ] Consistent with existing codebase style
- [ ] No commented-out code
- [ ] No console.log or debug statements (unless intentional)

### TypeScript Checklist

- [ ] Strict TypeScript mode followed
- [ ] No use of `any` type (or justified with comment)
- [ ] Proper type definitions for all functions and variables
- [ ] Null/undefined handling is explicit

## Phase 4: Testing Validation ✅

- [ ] **Unit tests passing (100%)**
- [ ] Integration tests passing (if applicable, 100%)
- [ ] E2E tests passing (or manual testing completed)
- [ ] Test coverage meets requirements
- [ ] No flaky tests
- [ ] Tests run quickly (unit tests < 5 seconds)

### Test Results

```bash
# Paste output of `npm test` here

```

## Phase 5: Security Review ✅

- [ ] All user inputs validated
- [ ] No unescaped user content rendered
- [ ] `npm audit` run with no high/critical vulnerabilities
- [ ] Dependencies scanned for vulnerabilities
- [ ] No sensitive data logged or exposed
- [ ] Error handling doesn't leak sensitive information
- [ ] Security implications documented

### Security Scan Results

```bash
# Paste output of `npm audit` here

```

## Phase 6: Documentation ✅

- [ ] Code comments added where necessary
- [ ] Complex logic explained
- [ ] Public API documented
- [ ] README.md updated (if needed)
- [ ] CHANGELOG updated (or will be updated by maintainer)
- [ ] Type documentation complete
- [ ] User-facing documentation updated (if applicable)
- [ ] Migration guide created (if breaking changes)

## Phase 7: Final Validation ✅

- [ ] **Linter passing:** `npm run lint` (no warnings or errors)
- [ ] **Build successful:** `npm run build` (no errors)
- [ ] **All tests passing:** `npm test` (100% pass rate)
- [ ] Manual testing completed
- [ ] Performance verified (no regressions)
- [ ] Accessibility verified (WCAG 2.1 AA compliance)
- [ ] Cross-browser testing completed (if UI changes)
- [ ] Mobile testing completed (if UI changes)

### Build & Lint Results

```bash
# Paste output of `npm run lint` here

# Paste output of `npm run build` here

```

## Accessibility Checklist (if UI changes)

- [ ] Keyboard navigation works for all interactive elements
- [ ] Screen reader compatible
- [ ] Proper ARIA labels where needed
- [ ] Color contrast requirements met (WCAG 2.1 AA)
- [ ] Focus management correct
- [ ] Tested with at least one screen reader

## Performance Checklist (if applicable)

- [ ] No performance regressions
- [ ] Efficient algorithms used
- [ ] Unnecessary re-renders avoided
- [ ] Large lists/data handled efficiently
- [ ] Network requests optimized
- [ ] Bundle size impact assessed

## Breaking Changes

<!-- If this PR includes breaking changes, describe them here and provide migration instructions -->

- N/A

## Screenshots/Videos

<!-- For UI changes, include before/after screenshots or videos -->

## Additional Notes

<!-- Any additional information that reviewers should know -->

## Reviewer Guidelines

**All review comments must be addressed, including low-priority items.** 

Review priority levels:
- 🔴 **Critical**: Must be fixed before merge (security, bugs, breaking changes)
- 🟡 **Important**: Should be fixed before merge (code quality, best practices)
- 🟢 **Minor**: Must still be addressed (style, typos, minor improvements)
- 💭 **Question**: Requires discussion and resolution

## Pre-Merge Checklist (Maintainer)

- [ ] All checklist items above are completed and checked
- [ ] CI/CD pipeline passing
- [ ] No merge conflicts
- [ ] Branch is up to date with base branch
- [ ] Final approval given

---

**By submitting this pull request, I confirm that:**
- I have followed the TDD workflow
- All tests pass with 100% pass rate
- All review comments have been addressed
- Documentation has been updated
- Security review has been completed
- This contribution follows the project's contribution guidelines
