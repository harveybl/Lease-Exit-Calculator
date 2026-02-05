# Quick Start: Development Workflow

> **New to the project?** This guide gets you started fast. For complete details, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## 🚀 Setup (5 minutes)

```bash
git clone https://github.com/harveybl/Lease-Exit-Calculator.git
cd Lease-Exit-Calculator
npm ci
npm test  # Should see 208 tests passing ✅
npm run dev  # Start development server
```

## 📋 Every Feature Follows This Workflow

```
Spec Review → TDD → Code Review → Testing → Security → Documentation → Merge
```

### Phase 1: Spec Review
- [ ] Write feature specification (use issue template)
- [ ] Get approval before coding

### Phase 2: Test-Driven Development (TDD)
1. **Write test first** (it should fail)
2. **Write minimal code** to pass test
3. **Refactor** while keeping tests green
4. **Repeat** for each feature piece

### Phase 3: Code Review
- [ ] Create PR using template
- [ ] Get approval from reviewer
- [ ] Address ALL comments (even low-priority 🟢 ones)

### Phase 4: Testing
- [ ] 100% of tests passing
- [ ] 100% coverage for calculations
- [ ] Manual testing completed

### Phase 5: Security Review
- [ ] Run `npm audit` (no high/critical issues)
- [ ] Review security checklist
- [ ] Input validation verified

### Phase 6: Documentation
- [ ] Update code comments
- [ ] Update README if needed
- [ ] Update CHANGELOG

## ✅ Quality Standards

| Requirement | Standard |
|-------------|----------|
| **Tests** | 100% passing, 100% coverage for calculations |
| **Build** | Must pass `npm run build` |
| **Lint** | Zero errors or warnings |
| **Security** | No high/critical vulnerabilities |
| **Review** | All comments addressed |

## 🧪 Testing Commands

```bash
npm test                # Run all tests once
npm run test:watch      # Run tests in watch mode (during dev)
npm run test:coverage   # Generate coverage report
npm run test:ui         # Interactive test UI
```

## 🔍 Before You Push

Run this checklist:

```bash
npm test              # ✅ All tests pass?
npm run build        # ✅ Build succeeds?
git diff             # ✅ Only expected changes?
```

## 📚 Key Documents

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Complete workflow guide
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Technical setup details
- **[PR Template](./.github/PULL_REQUEST_TEMPLATE.md)** - Complete checklist
- **[SECURITY.md](./SECURITY.md)** - Security reporting
- **[CHANGELOG.md](./CHANGELOG.md)** - Project history

## 💡 Tips

- **Use TDD from the start** - Write tests before code
- **Small commits** - Commit often with clear messages
- **Ask questions early** - Don't wait until PR review
- **Run tests constantly** - Use watch mode during development
- **Address all feedback** - Even minor (🟢) review comments

## 🎯 Example TDD Cycle

```typescript
// 1. Write failing test
it('calculates equity correctly', () => {
  const equity = calculateEquity(25000, 20000);
  expect(equity).toBe(5000);  // ❌ Test fails (function doesn't exist)
});

// 2. Write minimal code
export function calculateEquity(marketValue: number, payoff: number) {
  return marketValue - payoff;  // ✅ Test passes
}

// 3. Refactor if needed
export function calculateEquity(marketValue: Decimal, payoff: Decimal): Decimal {
  return marketValue.minus(payoff);  // ✅ Better implementation, tests still pass
}
```

## 🆘 Getting Help

1. Check [DEVELOPMENT.md](./DEVELOPMENT.md) troubleshooting section
2. Review existing code for examples
3. Ask in PR comments
4. Contact maintainers

## 📖 First Contribution?

Perfect! Follow these steps:

1. Read [CONTRIBUTING.md](./CONTRIBUTING.md) (15 min read)
2. Pick a "good first issue" from GitHub issues
3. Write your spec (can be brief for small changes)
4. Follow the TDD workflow
5. Use the PR template checklist
6. Be responsive to review feedback

## 🔒 Security

- Never commit secrets or API keys
- Run `npm audit` before every PR
- Report vulnerabilities privately (see [SECURITY.md](./SECURITY.md))

## ⚡ Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build           # Production build
npm start               # Start production server

# Testing
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage

# Code Quality
npm run lint            # Run linter
npx tsc --noEmit       # Type check
npm audit              # Security audit

# Git Workflow
git checkout -b feature/my-feature
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature
```

---

**Remember**: Quality over speed. Every item in the checklist exists for a reason. 100% completion required! 🎯
