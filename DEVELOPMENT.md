# Development Guide

This guide provides technical details for setting up your development environment and understanding the development workflow.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Building](#building)
- [Code Quality](#code-quality)
- [Continuous Integration](#continuous-integration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)
- **Git**: For version control
- **A code editor**: VS Code recommended with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/harveybl/Lease-Exit-Calculator.git
cd Lease-Exit-Calculator
```

### 2. Install Dependencies

```bash
npm ci
```

> **Note**: Use `npm ci` instead of `npm install` for reproducible builds based on `package-lock.json`.

### 3. Environment Variables

Create a `.env.local` file if needed (currently not required for basic development):

```bash
cp .env.example .env.local
```

### 4. Verify Installation

Run tests to verify everything is set up correctly:

```bash
npm test
```

You should see all 208 tests passing.

## Project Structure

```
Lease-Exit-Calculator/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # React components
│   │   ├── ui/                # shadcn/ui components
│   │   └── ...                # Feature components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Core business logic
│   │   ├── calculations/      # Financial calculations (100% coverage required)
│   │   ├── recommendations/   # Decision logic
│   │   ├── storage/          # IndexedDB wrapper
│   │   └── validation/       # Zod schemas
│   └── __tests__/            # Test files (mirrors src structure)
├── public/                    # Static assets
├── .github/                   # GitHub Actions workflows
├── CONTRIBUTING.md           # Contribution guidelines
├── DEVELOPMENT.md           # This file
├── README.md               # Project overview
├── package.json           # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vitest.config.ts     # Test configuration
└── next.config.ts      # Next.js configuration
```

### Key Directories

- **`src/lib/calculations/`**: Pure TypeScript functions for financial calculations. 100% test coverage enforced.
- **`src/components/`**: React components built with shadcn/ui and Radix UI.
- **`src/__tests__/`**: Test files that mirror the source structure.
- **`src/hooks/`**: Custom React hooks for reusable logic.

## Development Workflow

### Starting Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Development Cycle

1. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Follow TDD** (see [CONTRIBUTING.md](./CONTRIBUTING.md)):
   - Write tests first
   - Implement code to pass tests
   - Refactor while keeping tests green

3. **Run tests continuously**:
   ```bash
   npm run test:watch
   ```

4. **Commit frequently** with clear messages:
   ```bash
   git add .
   git commit -m "feat: add lease transfer calculation"
   ```

5. **Push and create a pull request**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Adding or updating tests
- `refactor:` Code refactoring
- `style:` Code style changes (formatting)
- `chore:` Maintenance tasks
- `perf:` Performance improvements

## Testing

### Test Stack

- **Vitest**: Fast unit test runner
- **@vitest/ui**: Interactive test UI
- **@vitest/coverage-v8**: Code coverage reporting

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (recommended during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with interactive UI
npm run test:ui
```

### Test File Organization

Test files should be located in `src/__tests__/` and mirror the source structure:

```
src/lib/calculations/equity.ts
src/__tests__/lib/calculations/equity.test.ts
```

### Writing Tests

#### Example Unit Test

```typescript
import { describe, it, expect } from 'vitest';
import { calculateEquity } from '@/lib/calculations/equity';
import Decimal from 'decimal.js';

describe('calculateEquity', () => {
  it('calculates positive equity when market value exceeds payoff', () => {
    const marketValue = new Decimal('25000');
    const payoff = new Decimal('20000');
    
    const equity = calculateEquity(marketValue, payoff);
    
    expect(equity.toNumber()).toBe(5000);
  });

  it('calculates negative equity when payoff exceeds market value', () => {
    const marketValue = new Decimal('20000');
    const payoff = new Decimal('25000');
    
    const equity = calculateEquity(marketValue, payoff);
    
    expect(equity.toNumber()).toBe(-5000);
  });
});
```

### Test Coverage Requirements

| Directory | Coverage Requirement |
|-----------|---------------------|
| `src/lib/calculations/` | 100% (enforced by Vitest config) |
| Other source files | 70%+ recommended |

The vitest.config.ts enforces 100% coverage for calculation logic:

```typescript
coverage: {
  thresholds: {
    lines: 100,
    functions: 100,
    branches: 100,
    statements: 100,
  },
}
```

### Coverage Reports

After running `npm run test:coverage`, view the HTML report:

```bash
open coverage/index.html
```

## Building

### Development Build

```bash
npm run dev
```

Uses Turbopack for fast hot-reloading during development.

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `out/` directory (static export).

### Testing the Production Build

```bash
npm run build
npm run start
```

## Code Quality

### Linting

```bash
npm run lint
```

Uses ESLint with Next.js config. Fix issues automatically when possible:

```bash
npm run lint -- --fix
```

### Type Checking

TypeScript is configured in strict mode. The build process will fail on type errors:

```bash
npx tsc --noEmit
```

### Code Style

- Use TypeScript strict mode
- Follow existing code patterns
- Use Decimal.js for all financial calculations
- Prefer functional programming patterns
- Keep functions small and focused

## Continuous Integration

### GitHub Actions

The repository uses GitHub Actions for CI/CD (`.github/workflows/deploy.yml`):

**Current workflow:**
- Triggers on push to `master` branch
- Runs on Ubuntu latest
- Installs dependencies with `npm ci`
- Builds the project
- Deploys to GitHub Pages

**Future enhancements (recommended):**
- Add automated test running
- Add linting checks
- Add security scanning
- Add coverage reporting

### CI Checklist

Before merging, ensure:

- [ ] All tests pass locally
- [ ] Build succeeds locally
- [ ] Linter passes with no warnings
- [ ] Type checking passes
- [ ] Coverage meets requirements

## Troubleshooting

### Common Issues

#### 1. Tests Failing After npm install

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. Type Errors in Editor

```bash
# Restart TypeScript server in VS Code
# Command Palette: "TypeScript: Restart TS Server"
```

#### 3. Build Failures

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### 4. Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

#### 5. Vitest Hangs

```bash
# Run with a single worker
npm test -- --no-threads
```

### Getting Help

1. Check existing issues on GitHub
2. Review documentation in README.md and CONTRIBUTING.md
3. Ask questions in pull request comments
4. Contact maintainers

## Performance Best Practices

- Use `React.memo()` for expensive components
- Implement proper dependency arrays in hooks
- Use `useMemo()` and `useCallback()` appropriately
- Avoid unnecessary re-renders
- Profile with React DevTools

## Accessibility Testing

- Use keyboard navigation to test all features
- Test with screen readers (VoiceOver, NVDA)
- Verify color contrast ratios
- Check ARIA labels and roles
- Use axe DevTools browser extension

## Security Best Practices

- Never commit secrets or API keys
- Keep dependencies up to date
- Run `npm audit` regularly
- Validate all user inputs
- Use Content Security Policy headers

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

## Version Support

- **Node.js**: 18.x or higher (20.x recommended)
- **npm**: 9.x or higher
- **Browsers**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **TypeScript**: 5.x

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
