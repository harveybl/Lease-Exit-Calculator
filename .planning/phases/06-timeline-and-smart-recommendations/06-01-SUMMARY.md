---
phase: 06
plan: 01
subsystem: calculations
tags: [timeline, projections, tdd, decimal-precision]
requires: [01-01, 01-05, 01-06]
provides:
  - Month-by-month cost projections for all 5 scenarios
  - Timeline data foundation for chart visualization
  - Decimal-to-number conversion at export boundary
affects: [06-02, 06-03, 06-04]
tech-stack:
  added: []
  patterns:
    - TDD red-green-refactor workflow
    - Decimal precision maintained during calculation, converted at boundary
    - Null handling for incomplete scenarios (no market value, extension mid-lease)
key-files:
  created:
    - src/lib/types/timeline.ts
    - src/lib/calculations/timeline.ts
    - src/__tests__/lib/calculations/timeline.test.ts
  modified: []
decisions:
  - slug: timeline-decimal-boundary
    title: Decimal-to-number conversion at export boundary
    rationale: Maintain full Decimal precision during calculations, convert to number only when building TimelineDataPoint for chart consumption
    impact: Chart libraries work with numbers, but financial accuracy preserved during computation
  - slug: extension-only-at-lease-end
    title: Extension scenario only available at lease end
    rationale: Month-to-month extensions only make sense after original term expires
    impact: extension field is null for all months except monthsRemaining = 0
  - slug: null-incomplete-scenarios
    title: Null values for incomplete scenarios
    rationale: sellPrivately requires market value; extension requires lease end
    impact: Null instead of placeholder/zero for missing data
  - slug: default-extension-params
    title: Default 6-month extension with zero tax
    rationale: Timeline projections need consistent defaults for comparison
    impact: Extension scenarios show simplified cost (actual extension terms vary)
metrics:
  duration: 2m 18s
  completed: 2026-01-31
---

# Phase 6 Plan 1: Timeline Calculation Engine Summary

**One-liner:** Month-by-month cost projections for all 5 scenarios using Decimal precision with conversion at export boundary

## What Was Built

### Core Functions

1. **projectScenarioCosts(lease, monthOffset, estimatedSalePrice?)**
   - Projects costs at a specific month offset from now
   - Adjusts monthsElapsed by offset to simulate future state
   - Recalculates remaining payments as months advance
   - Returns MonthlyProjection with full Decimal precision

2. **buildTimelineData(lease, estimatedSalePrice?)**
   - Builds complete timeline from month 0 to monthsRemaining (inclusive)
   - Converts Decimal costs to numbers rounded to 2 decimal places
   - Returns TimelineSeries with metadata (monthsRemaining, hasMarketValue, active scenarios)

### Types

- **TimelineDataPoint**: Single month's costs (all numbers, rounded to 2 decimals)
- **MonthlyProjection**: Internal type with Decimal precision before conversion
- **TimelineSeries**: Complete timeline wrapper with metadata

### Test Coverage

14 test cases covering:
- Scenario projection at various month offsets
- Market value presence/absence handling
- Extension availability only at lease end
- Decimal-to-number conversion and rounding
- Decreasing cost trends over time (return, buyout)
- Active scenarios list based on data availability

## Technical Approach

### TDD Red-Green-Refactor

1. **RED**: Created comprehensive test suite (14 tests) describing expected behavior
2. **GREEN**: Implemented types and calculation engine to pass all tests
3. **REFACTOR**: Code was clean, no refactoring needed

### Key Implementation Details

**Month Offset Simulation:**
- For each month offset, adjusts `monthsElapsed = (lease.monthsElapsed ?? 0) + monthOffset`
- Recalculates `monthsRemaining = termMonths - monthsElapsed`
- Recalculates `remainingPayments = monthlyPayment.times(monthsRemaining)`

**Scenario-Specific Logic:**
- **Return**: Remaining payments decrease, mileage projection adjusts (fewer months = less projected overage)
- **Buyout**: Payoff amount decreases as book value amortizes (constant yield method)
- **Sell privately**: Same as buyout but subtracts estimatedSalePrice (null when no market value)
- **Early termination**: Remaining depreciation and rent charges shrink each month
- **Extension**: Only at monthsRemaining = 0, uses default 6-month extension

**Decimal Precision:**
- All calculations use Decimal.js (precision=20, ROUND_HALF_UP)
- Only convert to number when building TimelineDataPoint: `.toDP(2).toNumber()`
- Chart consumption gets clean number values with 2 decimal places

## Decisions Made

### Timeline Decimal Boundary Pattern

**Decision:** Maintain Decimal precision during calculations, convert to number only at export boundary

**Context:** Chart libraries (Recharts, etc.) expect numeric data, but financial calculations require precision.

**Chosen approach:**
- Internal calculations use Decimal exclusively
- MonthlyProjection type uses `Record<ScenarioType, Decimal | null>`
- TimelineDataPoint type uses number (for chart consumption)
- Conversion happens in buildTimelineData when creating data points

**Alternatives considered:**
- Use number throughout (rejected: loses precision during multi-step calculations)
- Use Decimal throughout including export (rejected: incompatible with chart libraries)

**Impact:** Best of both worlds - accurate calculations, chart-compatible output

### Extension Scenario Availability

**Decision:** Extension only available at lease end (monthsRemaining = 0)

**Rationale:** Month-to-month extensions are a post-lease-end option, not a mid-lease scenario. It doesn't make sense to show "extension cost at month 12" when the lease hasn't ended yet.

**Implementation:**
- projectScenarioCosts returns null for extension when monthsRemaining > 0
- Only at monthsRemaining = 0 does it call evaluateExtensionScenario
- TimelineDataPoint.extension is null for all months except the final month

### Null for Incomplete Scenarios

**Decision:** Use null instead of placeholder values for incomplete scenarios

**Rationale:**
- sellPrivately requires market value - if user hasn't provided it, scenario is incomplete
- extension requires lease end - mid-lease, extension isn't available
- Null is semantic "not applicable" vs. zero/placeholder which could mislead

**Chart handling:** Chart components will need to handle null gracefully (skip series, show "incomplete" indicator)

## File Manifest

```
src/lib/types/timeline.ts (32 lines)
├─ TimelineDataPoint: Chart-ready data point with numbers
├─ MonthlyProjection: Internal calculation type with Decimals
├─ TimelineSeries: Complete timeline wrapper
└─ ScenarioType re-export for convenience

src/lib/calculations/timeline.ts (161 lines)
├─ projectScenarioCosts: Project all scenarios at month offset
├─ buildTimelineData: Build complete timeline series
└─ Imports all 5 scenario evaluators

src/__tests__/lib/calculations/timeline.test.ts (213 lines)
├─ projectScenarioCosts suite (5 tests)
└─ buildTimelineData suite (9 tests)
```

## Integration Points

### Dependencies (Imports)

- `@/lib/decimal` - Decimal.js for precision
- `@/lib/db/schema` - Lease type
- `@/lib/types/scenario` - ScenarioType
- `@/lib/calculations/scenarios/*` - All 5 scenario evaluators

### Exports (For Downstream Use)

- `buildTimelineData(lease, estimatedSalePrice?)` - Main API for timeline feature
- `projectScenarioCosts(lease, monthOffset, estimatedSalePrice?)` - Lower-level API for custom projections
- Timeline types exported from `@/lib/types/timeline`

### Next Phase Dependencies

This plan provides the data foundation for:
- **06-02**: Timeline chart component (will consume TimelineSeries)
- **06-03**: Crossover detection (will analyze TimelineDataPoint[] for intersections)
- **06-04**: Smart recommendations (will use timeline to find optimal timing)

## Deviations from Plan

None - plan executed exactly as written.

## Tests and Verification

✅ All 14 tests passing
✅ `npm test -- --run src/__tests__/lib/calculations/timeline.test.ts` succeeds
✅ Decimal precision maintained during calculations
✅ Number conversion at boundary produces 2 decimal places
✅ Null handling for incomplete scenarios works correctly
✅ Cost trends (decreasing over time) verified
✅ Extension only at lease end verified

## Next Phase Readiness

**Ready for 06-02 (Timeline Chart):**
- ✅ TimelineSeries structure defined
- ✅ Data points are chart-ready numbers
- ✅ Null handling defined for incomplete scenarios
- ✅ Active scenarios list provided

**Blockers:** None

**Recommendations:**
- Chart component should handle null values gracefully (skip series or show "incomplete" indicator)
- Consider adding tooltip data to TimelineDataPoint if chart needs detailed breakdowns
- Chart should respect the scenarios array to determine which series to render
