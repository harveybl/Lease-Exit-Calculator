---
phase: 03-comparison-view
plan: 01
subsystem: calculations, ui
tags: [decimal.js, intl-numberformat, shadcn-ui, scenario-orchestration, currency-formatting]

# Dependency graph
requires:
  - phase: 01-foundation-and-calculation-engine
    provides: "Five scenario evaluators (return, buyout, sell-privately, early-termination, extension) and Decimal.js precision config"
  - phase: 02-lease-entry-and-core-ui
    provides: "Drizzle Lease schema with DB types and shadcn component infrastructure"
provides:
  - "evaluateAllScenarios: orchestrates all five scenario evaluators from a single lease DB record"
  - "getComparisonData: bundles sorted scenarios, best option, return baseline, savings, and tie detection"
  - "formatCurrency: Decimal-to-USD string conversion at display boundary"
  - "formatOptionName: ScenarioType-to-display-name mapper"
  - "shadcn Card, Collapsible, Badge components for comparison layout"
affects:
  - 03-comparison-view (plans 02-04 consume these utilities and components)

# Tech tracking
tech-stack:
  added: ["@radix-ui/react-collapsible"]
  patterns: ["Module-level Intl.NumberFormat singleton for currency formatting", "Orchestrator pattern mapping DB record to multiple evaluators", "Tie detection with configurable threshold ($100)"]

key-files:
  created:
    - src/lib/utils/format-currency.ts
    - src/lib/calculations/evaluate-all.ts
    - src/components/ui/card.tsx
    - src/components/ui/collapsible.tsx
    - src/components/ui/badge.tsx
  modified: []

key-decisions:
  - "Module-level Intl.NumberFormat instance reused across formatCurrency calls (performance)"
  - "Tie threshold set at $100 absolute difference between top two options"
  - "estimatedSalePrice defaults to residualValue as placeholder until Phase 4 adds market value entry"
  - "Extension defaults to 6 months; monthly tax defaults to $0 (simplified)"
  - "Return scenario is always the baseline for savings comparison"

patterns-established:
  - "Display boundary: Number conversion only in formatCurrency, never in calculation code"
  - "Orchestrator pattern: single function maps DB record to all evaluators with nullable field defaults"
  - "ComparisonData interface bundles everything the UI needs in one object"

# Metrics
duration: 2min
completed: 2026-01-29
---

# Phase 3 Plan 1: Comparison Data Layer Summary

**Currency formatter, scenario orchestrator with sorted/ranked results and tie detection, plus shadcn Card/Collapsible/Badge components for comparison UI**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-29T21:50:11Z
- **Completed:** 2026-01-29T21:51:51Z
- **Tasks:** 2
- **Files created:** 5

## Accomplishments
- Created `formatCurrency` utility that converts Decimal values to localized USD strings at the display boundary, with module-level Intl.NumberFormat singleton for performance
- Built `evaluateAllScenarios` orchestrator that maps a Drizzle Lease record to all five scenario evaluators, handling nullable DB fields with sensible defaults
- Added `checkForTie` detecting when top two options are within $100 and `getComparisonData` bundling everything the UI needs
- Installed shadcn Card, Collapsible, and Badge components for the comparison view layout

## Task Commits

Each task was committed atomically:

1. **Task 1: Install shadcn UI components and create currency formatter** - `58af0a5` (feat)
2. **Task 2: Create scenario orchestrator with sorted results and tie detection** - `7676231` (feat)

## Files Created/Modified
- `src/lib/utils/format-currency.ts` - Currency formatting (Decimal -> "$X,XXX.XX") and ScenarioType display name mapper
- `src/lib/calculations/evaluate-all.ts` - Orchestrator evaluating all five scenarios, sorting by netCost, tie detection, ComparisonData bundle
- `src/components/ui/card.tsx` - shadcn Card component with Header, Title, Content, Description, Footer
- `src/components/ui/collapsible.tsx` - shadcn Collapsible with Trigger and Content
- `src/components/ui/badge.tsx` - shadcn Badge with variant support

## Decisions Made
- Module-level `Intl.NumberFormat` singleton reused across `formatCurrency` calls for performance (not created per call)
- Tie threshold set at `$100` absolute difference between first and second ranked options
- `estimatedSalePrice` for sell-privately defaults to `residualValue` as placeholder -- Phase 4 will add actual market value entry
- Extension defaults to 6 months, monthly tax defaults to $0 (simplified until full tax integration)
- Return scenario is always the baseline for savings comparison (what most lessees would do by default)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Data layer complete: `getComparisonData` provides everything the comparison UI needs in a single call
- Plans 03-02 through 03-04 can now build the hero card, ranked list, and cost breakdown UI on top of these utilities
- All code uses Decimal from `@/lib/decimal` -- Number conversion only at display boundary in `formatCurrency`

---
*Phase: 03-comparison-view*
*Completed: 2026-01-29*
