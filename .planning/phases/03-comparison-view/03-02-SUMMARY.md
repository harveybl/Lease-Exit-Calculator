---
phase: 03-comparison-view
plan: 02
subsystem: ui
tags: [react, shadcn-ui, collapsible, popover, lucide-react, comparison-components]

# Dependency graph
requires:
  - phase: 03-comparison-view
    plan: 01
    provides: "formatCurrency, formatOptionName, Card, Collapsible, Badge, Popover components"
  - phase: 01-foundation-and-calculation-engine
    provides: "LineItem and ScenarioResult type definitions with Decimal amounts"
provides:
  - "LineItemsBreakdown: grouped cost breakdown with category headers, educational tooltips, and totals/credits/net summary"
  - "OptionCard: single scenario row with rank badge, collapsible cost breakdown, and warning display"
affects:
  - 03-comparison-view (plans 03-04 compose these leaf components into the full comparison page)

# Tech tracking
tech-stack:
  added: []
  patterns: ["Grouped line items by type with display-order array", "Popover for per-line-item educational descriptions", "Controlled Collapsible with rotating ChevronDown indicator", "Accessibility: color + text label for credits (never color alone)"]

key-files:
  created:
    - src/components/comparison/LineItemsBreakdown.tsx
    - src/components/comparison/OptionCard.tsx
  modified: []

key-decisions:
  - "Popover with Info icon for line item educational descriptions (consistent with Phase 2 Popover decision)"
  - "Collapsible (not Accordion) for independent expand/collapse per option card"
  - "Green text for credits always paired with 'You receive:' prefix for color-blind accessibility"
  - "Category display order: liability, fee, tax, asset, other (costs before credits)"

patterns-established:
  - "Accessibility pattern: color indicators always paired with text labels"
  - "Leaf component pattern: LineItemsBreakdown and OptionCard are composable building blocks"
  - "Category grouping with reduce + ordered render via display array"

# Metrics
duration: 1min
completed: 2026-01-29
---

# Phase 3 Plan 2: Comparison Leaf Components Summary

**LineItemsBreakdown and OptionCard components with grouped cost categories, educational Popovers, rank badges, and Collapsible cost breakdowns**

## Performance

- **Duration:** 1 min
- **Started:** 2026-01-29T21:53:38Z
- **Completed:** 2026-01-29T21:54:59Z
- **Tasks:** 2
- **Files created:** 2

## Accomplishments
- Created `LineItemsBreakdown` component that groups line items by type (liability, fee, tax, asset, other) with category headers, Info icon Popovers for educational descriptions, and a summary section showing total costs, total credits, and net amount
- Created `OptionCard` component with rank Badge (filled for #1, outline for others), scenario name, net cost display, Collapsible cost breakdown with rotating ChevronDown, and amber warning box for scenario warnings
- Ensured accessibility by pairing green color for credit amounts with "You receive:" text prefix (never relying on color alone)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create LineItemsBreakdown component** - `3d88403` (feat)
2. **Task 2: Create OptionCard component** - `0e171ee` (feat)

## Files Created/Modified
- `src/components/comparison/LineItemsBreakdown.tsx` - Grouped cost breakdown with category headers, Popover tooltips per line item, and totals/credits/net summary section
- `src/components/comparison/OptionCard.tsx` - Option card with rank badge, scenario name, net cost, Collapsible breakdown using LineItemsBreakdown, and amber warning display

## Decisions Made
- Used Popover with Info icon (size 14) for line item educational descriptions, consistent with Phase 2 Popover-over-Tooltip decision
- Collapsible (not Accordion) for independent expand/collapse per option card -- multiple options can be open simultaneously
- Green text for credits always paired with "You receive:" prefix for color-blind accessibility
- Category display order fixed as liability, fee, tax, asset, other -- costs appear before credits for clear reading flow
- Summary section conditionally shows "Total credits" row only when credits exist (cleaner for scenarios with no equity)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Both leaf components ready for composition in plans 03-03 (HeroSummary, OptionsList) and 03-04 (ComparisonView page)
- OptionCard accepts `{ scenario, rank, isFirst }` props -- the orchestrating OptionsList will map sorted scenarios to these props
- All components use `"use client"` directive for interactive features (Popover, Collapsible, useState)

---
*Phase: 03-comparison-view*
*Completed: 2026-01-29*
