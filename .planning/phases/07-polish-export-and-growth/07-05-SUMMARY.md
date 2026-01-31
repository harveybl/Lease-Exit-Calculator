---
phase: 07-polish-export-and-growth
plan: 05
subsystem: export
tags: [react-pdf, pdf-export, lazy-loading, dynamic-import]

# Dependency graph
requires:
  - phase: 07-01
    provides: LeaseTransferResult type for 6th scenario in comparisons
  - phase: 03-03
    provides: ComparisonView and comparison data structure
  - phase: 04-04
    provides: Market value display and complete comparison data
provides:
  - PDF export capability with lazy-loaded @react-pdf/renderer
  - PDFComparisonData serializable interface for Decimal-to-string conversion
  - ExportButton with runtime dynamic imports avoiding SSR bundling issues
  - ComparisonPDF document template with teal-themed professional layout
affects: [future export features, reporting, print functionality]

# Tech tracking
tech-stack:
  added: [@react-pdf/renderer]
  patterns: [runtime dynamic imports for client-only libraries, blob download pattern, Decimal serialization for PDF export]

key-files:
  created:
    - src/lib/pdf/comparison-pdf.tsx
    - src/components/comparison/ExportButton.tsx
  modified:
    - src/components/comparison/ComparisonView.tsx
    - src/app/lease/[id]/compare/page.tsx
    - next.config.ts

key-decisions:
  - "Runtime dynamic imports in useEffect avoid Turbopack static analysis SSR bundling issues"
  - "Blob download pattern instead of PDFDownloadLink component for better error handling"
  - "serializeForPDF helper converts all Decimal values to formatted strings before export"
  - "Built-in Helvetica font avoids font loading delays in PDF generation"
  - "serverExternalPackages config marks @react-pdf/renderer as client-only"

patterns-established:
  - "Runtime dynamic imports: Use import() inside useEffect for libraries incompatible with SSR"
  - "PDF serialization: Pre-format all monetary values and complex types before passing to PDF generator"
  - "Lazy export pattern: Load heavy libraries only on user action, not page load"

# Metrics
duration: 4min 20s
completed: 2026-01-31
---

# Phase 07 Plan 05: PDF Export Summary

**PDF export with lazy-loaded @react-pdf/renderer using runtime dynamic imports and blob download pattern**

## Performance

- **Duration:** 4min 20s
- **Started:** 2026-01-31T22:22:51Z
- **Completed:** 2026-01-31T22:27:11Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Users can export complete comparison analysis as downloadable PDF
- PDF library loads on demand (not in main bundle) via runtime imports
- Professional PDF layout with vehicle heading, recommendation, all scenarios, line items, and disclaimers
- Turbopack SSR compatibility achieved using useEffect dynamic imports

## Task Commits

Each task was committed atomically:

1. **Task 1: Install react-pdf and create PDF document template** - `f3866e1` (chore)
2. **Task 2: Create ExportButton and wire into ComparisonView** - `39f066b` (feat)

## Files Created/Modified
- `src/lib/pdf/comparison-pdf.tsx` - React PDF document component with PDFComparisonData interface
- `src/components/comparison/ExportButton.tsx` - Client component with runtime dynamic imports and blob download
- `src/components/comparison/ComparisonView.tsx` - Added heading prop, serializeForPDF helper, ExportButton integration
- `src/app/lease/[id]/compare/page.tsx` - Pass vehicle heading to ComparisonView
- `next.config.ts` - Added serverExternalPackages for @react-pdf/renderer

## Decisions Made

**Runtime dynamic imports over next/dynamic:**
- Initial approach using `dynamic()` from next/dynamic failed with Turbopack SSR bundling error
- Switched to runtime `import()` inside useEffect (client-side only execution) to avoid static analysis
- Rationale: Turbopack analyzes all imports even with ssr: false, but runtime imports in useEffect only execute client-side

**Blob download pattern:**
- Generate PDF blob on button click, download via createElement('a')
- Alternative PDFDownloadLink component caused SSR issues
- Rationale: More control over loading states and error handling

**Serialization boundary:**
- Created PDFComparisonData interface with string monetary values
- serializeForPDF helper pre-formats all Decimal amounts using formatCurrency
- Rationale: @react-pdf/renderer can't serialize Decimal objects; strings are portable

**Built-in font:**
- Use Helvetica (built-in PDF font) instead of custom fonts
- Rationale: Zero font loading overhead, instant rendering

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Turbopack SSR bundling error with dynamic imports**
- **Found during:** Task 2 (Build verification)
- **Issue:** Turbopack static analysis tried to bundle @react-pdf/renderer during SSR even with `dynamic(..., { ssr: false })`
- **Fix:** Replaced next/dynamic with runtime `import()` inside useEffect; added serverExternalPackages config
- **Files modified:** src/components/comparison/ExportButton.tsx, next.config.ts
- **Verification:** `npm run build` succeeds without Turbopack errors
- **Committed in:** 39f066b (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential fix for build compatibility with Turbopack. Runtime imports cleaner than next/dynamic for client-only libraries.

## Issues Encountered
- Turbopack doesn't support next/dynamic with ssr:false for external packages that import Node.js modules (e.g., @react-pdf/renderer uses canvas, which requires native bindings)
- Solution: Runtime imports + serverExternalPackages configuration
- Alternative approaches tried: PDFDownloadLink (SSR issues), wrapped dynamic imports with default export (still analyzed statically)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- PDF export complete and working end-to-end
- Pattern established for lazy-loading heavy client-only libraries
- Ready for additional export formats (CSV, Excel) if needed in future phases
- No blockers for remaining Phase 7 plans

---
*Phase: 07-polish-export-and-growth*
*Completed: 2026-01-31*
