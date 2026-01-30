---
phase: 04-market-value-and-valuation
plan: 02
subsystem: calculations
tags: [decimal.js, tdd, scenario-evaluation, equity-calculation]

# Dependency graph
requires:
  - phase: 01-foundation-and-calculation-engine
    provides: evaluateAllScenarios orchestrator and scenario evaluation functions
provides:
  - Market value parameter support in evaluateAllScenarios and getComparisonData
  - Incomplete scenario flagging when market value missing
  - Equity calculation (market value - buyout cost)
  - Smart sorting that excludes incomplete scenarios from bestOption selection
affects: [04-03, 04-04, 05-ui-integration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Incomplete scenario pattern for equity-dependent calculations"
    - "Conditional parameter flow (estimatedSalePrice optional in evaluation)"

key-files:
  created:
    - src/__tests__/lib/calculations/evaluate-all.test.ts
  modified:
    - src/lib/types/scenario.ts
    - src/lib/calculations/evaluate-all.ts

key-decisions:
  - "Incomplete scenarios use residualValue as conservative placeholder (shows scenario but marked incomplete)"
  - "Equity calculated as marketValue - buyoutCost (not payoffAmount, which excludes tax/fees)"
  - "Incomplete scenarios sort last regardless of netCost"

patterns-established:
  - "Optional estimatedSalePrice parameter threaded through evaluation chain"
  - "Incomplete flag used for scenarios that need external data"
  - "Filter incomplete scenarios from tie detection and bestOption selection"

# Metrics
duration: 4min
completed: 2026-01-30
---

# Phase 04 Plan 02: Market Value Integration in Evaluation Orchestrator Summary

**evaluateAllScenarios accepts optional market value, marks sell-privately incomplete when missing, calculates equity, excludes incomplete from bestOption**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-30T22:03:03Z
- **Completed:** 2026-01-30T22:06:48Z
- **Tasks:** 1 (TDD: RED → GREEN → REFACTOR)
- **Files modified:** 3

## Accomplishments
- evaluateAllScenarios and getComparisonData accept optional estimatedSalePrice parameter
- Sell-privately scenario marked incomplete with warning when market value not provided
- Incomplete scenarios sort last and excluded from bestOption selection
- ComparisonData includes hasMarketValue flag and equity calculation
- Equity computed as marketValue - buyoutCost with isPositive flag

## Task Commits

TDD cycle completed with 3 atomic commits:

1. **RED: Add failing tests** - `c4c626e` (test)
   - 7 test cases covering market value handling
   - All tests failing as expected

2. **GREEN: Implement market value integration** - `340c442` (feat)
   - Added incomplete field to ScenarioResult interface
   - Updated evaluateAllScenarios signature with optional estimatedSalePrice
   - Implemented incomplete marking and sorting logic
   - Added hasMarketValue and equity to ComparisonData
   - All 10 tests passing

3. **REFACTOR: Clean up redundant conditional** - `3bfef8d` (refactor)
   - Removed redundant hasMarketValue check in equity calculation
   - Tests still passing

## Files Created/Modified
- `src/lib/types/scenario.ts` - Added optional incomplete field to ScenarioResult interface
- `src/lib/calculations/evaluate-all.ts` - Updated evaluateAllScenarios and getComparisonData with market value support, incomplete scenario handling, equity calculation
- `src/__tests__/lib/calculations/evaluate-all.test.ts` - Full test coverage for market value integration (10 tests)

## Decisions Made

**1. Incomplete scenarios use residualValue as conservative placeholder**
- Rationale: Better to show a conservative estimate (residual) than hide the scenario entirely. User sees what the scenario would look like but knows it's incomplete.

**2. Equity calculated as marketValue - buyoutCost (buyoutResult.totalCost)**
- Rationale: totalCost includes residual + tax + fees, which represents true cost to acquire vehicle. This gives accurate equity position.

**3. Incomplete scenarios sort last regardless of netCost**
- Rationale: Prevents incomplete scenarios from being selected as bestOption. Complete scenarios always prioritized in comparison.

**4. Tie detection filters out incomplete scenarios**
- Rationale: Only complete scenarios should be compared for ties. Incomplete data shouldn't influence recommendation logic.

## Deviations from Plan

None - plan executed exactly as written through TDD cycle.

## Issues Encountered

**TypeScript error in test file - wrong Lease schema fields**
- Issue: Initial test mock used userId, vehicleMake fields that don't exist in actual Lease schema
- Resolution: Updated createMockLease helper to match actual schema (make, model, year, mileageDate, etc.)
- Impact: Caught early in GREEN phase, quick fix

**TypeScript error accessing SellPrivatelyResult properties**
- Issue: TypeScript couldn't infer specific scenario type from union type
- Resolution: Added type assertion to access estimatedSalePrice and netProceeds fields
- Impact: Test compiled successfully after type assertion

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 4 Plan 3 (Manual market value entry UI)**
- ComparisonData.hasMarketValue flag ready for conditional UI rendering
- ComparisonData.equity ready to display in UI
- evaluateAllScenarios accepts estimatedSalePrice parameter
- Incomplete scenario handling working correctly

**Ready for Phase 4 Plan 4 (Market value persistence)**
- Evaluation functions ready to accept market value from database
- Equity calculation working for positive and negative equity cases

**No blockers** - Core calculation logic complete and tested

---
*Phase: 04-market-value-and-valuation*
*Completed: 2026-01-30*
