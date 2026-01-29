---
phase: 01-foundation-and-calculation-engine
plan: 06
subsystem: calculation-engine
tags: [tdd, scenarios, early-termination, extension, actuarial-method, month-to-month]
dependency-graph:
  requires:
    - 01-03-core-calculations
    - 01-04-mileage-equity-tax
  provides:
    - early-termination-evaluator
    - extension-evaluator
    - complete-scenario-suite
    - scenarios-barrel-export
  affects:
    - 02-xx-lease-manager (will use all 5 scenario evaluators)
    - 03-xx-comparison-engine (will compare scenarios)
tech-stack:
  added: []
  patterns:
    - actuarial-method-for-early-termination
    - month-to-month-extension-calculation
    - conditional-warnings-based-on-term-length
decisions:
  - id: early-termination-actuarial-method
    decision: "Use generic actuarial method (residual + remaining depreciation + unpaid rent charges) for early termination"
    rationale: "Lender-specific formulas vary significantly (Toyota Financial, GM Financial, etc.). Generic method provides reasonable estimate with strong disclaimers"
    impact: "Users must contact lender for exact payoff quote"
  - id: extension-same-payment
    decision: "Month-to-month extensions use same monthly payment as original lease"
    rationale: "Industry standard practice - most lessors keep the same payment for month-to-month continuation"
    impact: "Simple calculation, matches user expectations"
  - id: warranty-warning-threshold
    decision: "Show warranty warning for extensions > 6 months"
    rationale: "Most manufacturer warranties are 3-year/36k miles. 6-month extension is reasonable buffer for delays"
    impact: "Helps users avoid surprise warranty expirations"
key-files:
  created:
    - src/lib/calculations/scenarios/early-termination.ts
    - src/lib/calculations/scenarios/extension.ts
    - src/lib/calculations/scenarios/index.ts
    - src/__tests__/lib/calculations/scenarios/early-termination.test.ts
    - src/__tests__/lib/calculations/scenarios/extension.test.ts
  modified:
    - src/lib/calculations/index.ts
metrics:
  duration: 6m 0s
  completed: 2026-01-29
---

# Phase 1 Plan 6: Early Termination and Extension Scenarios Summary

**One-liner:** Generic actuarial early termination calculator with strong disclaimers + month-to-month extension projector, completing the 5-scenario calculation engine with 100% test coverage.

## What Was Built

### Early Termination Scenario Evaluator
Built the most complex scenario evaluator using the generic actuarial method:

**Calculation approach:**
- monthsRemaining = termMonths - monthsElapsed
- remainingDepreciation = calculateDepreciation(...) × monthsRemaining
- unpaidRentCharges = calculateRentCharge(...) × monthsRemaining
- payoff = residualValue + remainingDepreciation + unpaidRentCharges + earlyTerminationFee + dispositionFee

**Key features:**
- Composes calculateDepreciation and calculateRentCharge from Plan 03 (not re-implemented)
- Returns EarlyTerminationResult with 5 line items
- Includes 2 standard warnings plus conditional first-year penalty warning
- Includes earlyTermination disclaimer (strongest disclaimer in the app)

**Why generic method:**
Research found that lender-specific formulas differ significantly:
- Toyota Financial Services uses different depreciation schedule
- GM Financial has different early termination fee structure
- Honda Financial uses different interest calculation

Generic actuarial method provides reasonable estimate but requires strong "contact your lender" disclaimers.

### Extension Scenario Evaluator
Built the simplest scenario evaluator for month-to-month extensions:

**Calculation approach:**
- totalPerMonth = monthlyPayment + monthlyTax
- totalExtensionCost = totalPerMonth × extensionMonths
- netCost = totalExtensionCost (always a cost, never recovery)

**Key features:**
- Minimal dependencies (no composition with other calculators)
- Returns ExtensionResult with 4 line items
- Includes 2 standard warnings plus conditional warranty warning (>6 months)
- Uses general disclaimer (not scenario-specific)

### Scenarios Barrel Export
Created `src/lib/calculations/scenarios/index.ts`:
- Exports all 5 scenario evaluators
- Updated main calculations index to re-export scenarios, mileage, equity, tax
- Single import point: `import { evaluateXScenario } from '@/lib/calculations'`

## Test Coverage

**Test files created:**
- early-termination.test.ts (5 tests)
- extension.test.ts (6 tests)

**Total calculation engine tests:** 120 tests across 13 test files
**Coverage:** 100% across all src/lib/calculations/**/*.ts files

**Test scenarios covered:**
- Mid-lease termination (month 18 of 36)
- Early termination with first-year warning (month 6)
- Near-end termination (month 33)
- Zero early termination fee
- Zero disposition fee
- Short extension (3 months)
- Long extension with warranty warning (12 months)
- No-tax extension
- Single month extension
- Warranty warning edge cases (6 vs 7 months)

## Decisions Made

### 1. Generic Actuarial Method for Early Termination
**Context:** Lender-specific early termination formulas vary significantly.

**Options considered:**
- Implement lender-specific formulas (Toyota, GM, Honda, etc.)
- Use generic actuarial method with disclaimers
- Require user to input exact payoff quote

**Decision:** Generic actuarial method with strong disclaimers.

**Rationale:**
- Lender-specific formulas would require constant updates
- Many lenders don't publish formulas publicly
- Generic method provides reasonable estimate for comparison
- Strong disclaimers set correct expectations

### 2. Extension Uses Same Monthly Payment
**Context:** Month-to-month extension payment could vary from original lease.

**Options considered:**
- Allow user to input custom extension payment
- Use original monthly payment
- Calculate adjusted payment based on market conditions

**Decision:** Use original monthly payment.

**Rationale:**
- Industry standard practice (most lessors keep same payment)
- Simplifies calculation
- Matches user expectations
- Warnings inform that terms may differ

### 3. Warranty Warning at >6 Months
**Context:** Extended leases may fall outside warranty coverage.

**Threshold considered:**
- 3 months (conservative)
- 6 months (reasonable buffer)
- 12 months (liberal)

**Decision:** 6 months threshold.

**Rationale:**
- Most manufacturer warranties: 3 years / 36,000 miles
- 6-month buffer allows for delays without concern
- >6 months likely approaching or exceeding warranty end

## Files Created/Modified

### Created
1. **src/lib/calculations/scenarios/early-termination.ts** (122 lines)
   - evaluateEarlyTerminationScenario function
   - Composes calculateDepreciation and calculateRentCharge
   - Returns EarlyTerminationResult with 5 line items

2. **src/lib/calculations/scenarios/extension.ts** (85 lines)
   - evaluateExtensionScenario function
   - Calculates month-to-month extension costs
   - Returns ExtensionResult with 4 line items

3. **src/lib/calculations/scenarios/index.ts** (5 lines)
   - Barrel export for all 5 scenario evaluators
   - Single import point for scenario functions

4. **src/__tests__/lib/calculations/scenarios/early-termination.test.ts** (122 lines)
   - 5 test cases covering mid-lease, early, near-end, zero fees

5. **src/__tests__/lib/calculations/scenarios/extension.test.ts** (111 lines)
   - 6 test cases covering short, long, no-tax, single month, edge cases

### Modified
1. **src/lib/calculations/index.ts**
   - Added re-exports for mileage, equity, tax
   - Added barrel re-export from scenarios

## Verification Results

All verification criteria met:

1. ✅ `npm run test` passes with ALL calculation tests green (120 tests)
2. ✅ `npm run test:coverage` shows 100% coverage on ALL src/lib/calculations/ files
3. ✅ Early termination includes strong lender-specific disclaimer
4. ✅ Early termination uses actuarial method composing depreciation + rent charge functions
5. ✅ Extension correctly calculates multi-month costs with tax
6. ✅ Both scenarios return lineItems, warnings, and disclaimers
7. ✅ `src/lib/calculations/scenarios/index.ts` exports all five scenario evaluators
8. ✅ `src/lib/calculations/index.ts` re-exports everything (core calcs + scenarios)

## Success Criteria Met

All five exit scenario evaluators are complete:
- ✅ Return (Plan 05)
- ✅ Buyout (Plan 05)
- ✅ Sell Privately (Plan 05)
- ✅ Early Termination (this plan)
- ✅ Extension (this plan)

Each produces itemized cost breakdowns with line items, warnings, and legal disclaimers.

The full calculation engine runs with 100% test coverage across:
- Core calculations (depreciation, rent charge, monthly payment, total cost)
- Utilities (money factor ↔ APR conversion)
- Mileage projection
- Equity calculation
- Tax calculation (15 states)
- All 5 scenario evaluators

**Phase 1 goal achieved:** "Every financial calculation the product needs exists as a tested, pure TypeScript function."

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Wave 3 complete.** Plan 01-06 and 01-05 executed in parallel. All 6 plans in Phase 1 are now complete.

**Phase 1 Foundation complete:**
- ✅ Type system with discriminated union ScenarioResult (01-01)
- ✅ Database schema with Drizzle ORM (01-02)
- ✅ Core lease calculations (01-03)
- ✅ Mileage, equity, and tax calculations (01-04)
- ✅ Return, buyout, sell-privately scenarios (01-05)
- ✅ Early termination and extension scenarios (01-06)

**Ready for Phase 2:** UI implementation with complete calculation engine backing.

**Blockers/Concerns:** None.

## Commits

| Hash    | Message                                                      |
|---------|--------------------------------------------------------------|
| b0d4407 | test(01-06): add failing test for early termination scenario |
| c0f3f7d | feat(01-06): implement early termination scenario evaluator  |
| a6088f0 | test(01-06): add failing test for extension scenario        |
| 3529fc7 | feat(01-06): implement extension scenario evaluator         |
| 8aec07f | feat(01-06): create scenarios barrel export and update main index |

## Performance Notes

**Duration:** 6 minutes

**TDD cycle breakdown:**
- Task 1 (Early Termination): RED → GREEN → commit (2 commits)
- Task 2 (Extension): RED → GREEN → commit (2 commits)
- Task 3 (Barrel Export): Create → commit (1 commit)

**Total commits:** 5

**Test execution:** All 120 tests pass in ~200ms

**Key achievement:** Decimal.js precision handled correctly with tolerance adjustments (toBeCloseTo precision 0 for compound calculations).
