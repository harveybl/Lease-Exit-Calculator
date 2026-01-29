---
phase: 01-foundation-and-calculation-engine
plan: 05
subsystem: scenario-evaluation
tags: [tdd, scenarios, return, buyout, sell-privately, integration]
completed: 2026-01-29
duration: 4m 27s

dependencies:
  requires:
    - 01-03 # Core lease calculations (depreciation, rent charge, monthly payment)
    - 01-04 # Mileage, equity, and tax calculations
  provides:
    - Return scenario evaluator with mileage projection integration
    - Buyout scenario evaluator with state-aware tax calculation
    - Sell-privately scenario evaluator with net proceeds calculation
  affects:
    - 03-02 # Comparison view will display these scenario results side-by-side

tech-stack:
  added: []
  patterns:
    - Function composition (scenarios compose lower-level calculations)
    - Discriminated unions (ScenarioResult type with specific extensions)
    - Line item generation with sub-items (indented buyout breakdown)

key-files:
  created:
    - src/lib/calculations/scenarios/return.ts
    - src/lib/calculations/scenarios/buyout.ts
    - src/lib/calculations/scenarios/sell-privately.ts
    - src/__tests__/lib/calculations/scenarios/return.test.ts
    - src/__tests__/lib/calculations/scenarios/buyout.test.ts
    - src/__tests__/lib/calculations/scenarios/sell-privately.test.ts
  modified: []

decisions: []

metrics:
  tests: 19 total (6 return + 6 buyout + 7 sell-privately)
  coverage: 100% (all scenario files)
  commits: 6 (2 per scenario: test + feat)
---

# Phase 1 Plan 05: Return, Buyout, and Sell-Privately Scenarios Summary

**One-liner:** Three exit scenario evaluators with itemized cost breakdowns, state-aware tax integration, mileage projection, and net proceeds calculation.

## What Was Built

Built three lease exit scenario evaluators following TDD RED-GREEN-REFACTOR cycle:

1. **Return Scenario** (`evaluateReturnScenario`)
   - Composes `projectMileage` from Plan 04 for excess mileage cost calculation
   - Itemizes: remaining payments, disposition fee, excess mileage (projected), wear and tear estimate
   - Warns about excess mileage and user-estimated wear costs
   - Returns `ReturnScenarioResult` with type='return'

2. **Buyout Scenario** (`evaluateBuyoutScenario`)
   - Composes `getStateTaxRule` from Plan 04 for state-specific sales tax on residual value
   - Calculates remaining payments from monthly payment and months remaining
   - Itemizes: residual value, remaining payments, purchase fee, sales tax
   - Warns when remaining payments exist (timing consideration)
   - Returns `BuyoutScenarioResult` with type='buyout'

3. **Sell-Privately Scenario** (`evaluateSellPrivatelyScenario`)
   - Calculates buyout payoff (same logic as buyout scenario)
   - Computes net proceeds: sale price - payoff (positive = profit, negative = loss)
   - Itemizes: sale price, total buyout cost, then indented sub-items (residual, remaining, fee, tax), net proceeds
   - Warns when sale price is less than payoff (user must cover difference)
   - Warns about timing when remaining payments exist (must buy out before selling)
   - Returns `SellPrivatelyResult` with type='sell-privately'

All scenarios return `ScenarioResult` with:
- `lineItems[]` - Itemized breakdown with labels, amounts, descriptions, types
- `warnings[]` - Context-specific warnings (excess mileage, negative equity, timing)
- `disclaimers[]` - Legal disclaimers (general, tax, mileage, marketValue)
- `totalCost` - Total out-of-pocket cost
- `netCost` - Cost after sale (for sell-privately, negative = profit)

## Test Coverage

**19 tests, 100% coverage:**

**Return scenario (6 tests):**
- Clean return (no penalties)
- Over mileage projection
- With wear and tear estimate
- At lease end (zero remaining payments)
- Combined penalties
- Line items structure

**Buyout scenario (6 tests):**
- End-of-lease buyout (TX upfront tax)
- Mid-lease buyout (CA monthly tax state)
- No-tax state (OR)
- Many remaining payments warning
- Zero purchase fee
- Line items structure

**Sell-privately scenario (7 tests):**
- Profitable sale (positive net proceeds)
- Loss sale (negative net proceeds)
- Mid-lease sale with remaining payments
- Break-even scenario
- Profitable with timing warnings
- No-tax state
- Line items structure with sub-items

## TDD Execution

Followed RED-GREEN-REFACTOR for each scenario:

**RED phase (write failing tests):**
- Created comprehensive test suites with all edge cases
- Ran tests to confirm failure (module not found)
- Committed test file

**GREEN phase (implement to pass):**
- Implemented scenario evaluator composing lower-level functions
- Ran tests to confirm pass
- Committed implementation file

**REFACTOR phase:**
- No refactoring needed - code was clean after GREEN
- All implementations followed composition pattern

**Total commits:** 6 (2 per scenario)

## Integration Points

**Composes from Plan 03:**
- None directly (03 functions used by 04)

**Composes from Plan 04:**
- `projectMileage` - Return scenario uses for excess mileage cost
- `getStateTaxRule` - Buyout and sell-privately use for state tax rates
- `calculateEquity` - Not used (sell-privately calculates net proceeds directly)

**Uses from Plan 01:**
- `Decimal` - All monetary calculations
- `ReturnScenarioResult`, `BuyoutScenarioResult`, `SellPrivatelyResult` - Type safety
- `LineItem` - Itemized breakdown structure
- `DISCLAIMERS` - Legal disclaimers

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

None - implementation followed existing patterns from Plans 01-04.

## Next Phase Readiness

**Ready for Phase 3 (Comparison View):**
- All three scenario evaluators return consistent `ScenarioResult` interface
- Line items provide itemized breakdowns for display
- Warnings and disclaimers ready for UI presentation
- Type discriminated unions enable type-safe scenario handling

**Blocked/Concerns:**
- None

## Notes

**Parallel execution context:**
- Plan 01-06 was executing in parallel, creating early-termination and extension scenarios
- No file conflicts - each plan had its own scenario files
- Both plans passed all tests independently and together

**Key implementation pattern:**
Scenarios are **composition functions** - they don't re-implement formulas. They call lower-level calculation functions (projectMileage, getStateTaxRule) and assemble results into user-facing scenario evaluations with warnings and disclaimers.

**Coverage achievement:**
All scenario files achieved 100% statement, branch, function, and line coverage on first GREEN implementation. No additional test cases needed after REFACTOR.
