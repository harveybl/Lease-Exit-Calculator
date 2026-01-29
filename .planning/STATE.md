# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-28)

**Core value:** Show the user the smartest financial move for their vehicle lease right now, and when a better window might open up.
**Current focus:** Phase 2 complete — ready for Phase 3

## Current Position

Phase: 2 of 7 (Lease Entry and Core UI)
Plan: 4 of 4 in current phase
Status: Phase complete, pending verification
Last activity: 2026-01-29 -- Completed 02-04-PLAN.md (Visual Verification)

Progress: [██████████] 10/10 plans (100%)

## Performance Metrics

**Velocity:**
- Total plans completed: 10
- Average duration: 4m 39s
- Total execution time: 49m 11s

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation | 6/6 | 26m 39s | 4m 27s |
| 2. Lease Entry and Core UI | 4/4 | 22m 32s | 5m 38s |

**Recent Trend:**
- Last 5 plans: 01-06 (6m 0s), 02-01 (5m 32s), 02-02 (4m 45s), 02-03 (4m 15s), 02-04 (8m 0s)
- Trend: UI plans slightly longer due to CSS debugging and visual verification

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Calculations before UI -- financial accuracy is the entire value proposition
- [Roadmap]: Manual value entry before API integration -- eliminates external dependency risk
- [Roadmap]: Auth after core features -- personal-use validation does not require auth
- [01-01]: Decimal.js precision=20, ROUND_HALF_UP for all financial calculations
- [01-01]: All monetary types use Decimal, never number (enforced by type system)
- [01-01]: Import Decimal from @/lib/decimal (not 'decimal.js') to guarantee config consistency
- [01-01]: 100% coverage thresholds only on src/lib/calculations/**/*.ts (core value)
- [01-01]: ScenarioResult base interface + 5 extending interfaces for type-safe discriminated union
- [01-02]: Custom Drizzle type decimalNumber maps Decimal.js to PostgreSQL numeric with configurable precision/scale
- [01-02]: Money factor uses numeric(10, 6) for high precision, standard monetary fields use numeric(10, 2)
- [01-02]: General disclaimer appears BEFORE calculation output area (FOUND-04 requirement)
- [01-03]: TDD test precision expectations adjusted for Decimal.js precision=20 (20 significant digits)
- [01-03]: Calculation functions composed (monthly payment uses depreciation + rent charge)
- [01-04]: State tax rules cover top 15 US states only (65% of population)
- [01-04]: CA is only state with cap cost reduction tax applied
- [01-04]: GA TAVT and NC Highway Use Tax simplified to percentage of total payments in Phase 1
- [01-05]: Sell privately scenario includes 7% buffer for private sale transaction friction
- [01-05]: Return scenario calculates excess mileage costs using user-provided per-mile rate
- [01-06]: Early termination uses generic actuarial method with strong disclaimers (lender-specific formulas vary)
- [01-06]: Extension assumes same monthly payment as original lease (industry standard)
- [01-06]: Warranty warning threshold set at >6 months for extensions
- [02-01]: shadcn/ui New York style with neutral base color for warm, refined aesthetic
- [02-01]: Warm color palette: teal primary (195 85% 45%), warm off-white background (28 20% 98%)
- [02-01]: Separate warning function (checkLeaseWarnings) for non-blocking unusual-value warnings
- [02-01]: z.coerce for all numeric/date fields to simplify form handling
- [02-01]: Tooltip content includes 'whereToFind' guidance for lease paperwork navigation
- [02-02]: Popover (not Tooltip) for educational content with rich formatting and interactive links
- [02-02]: useWatch for optional field tracking instead of form.watch() for performance
- [02-02]: Empty string defaults for required number fields, coerced by Zod
- [02-02]: Absolute positioned prefix/suffix labels within input containers for clean layout
- [02-02]: Warning check on form.watch subscription for immediate feedback
- [02-03]: Optional fields store NULL in database (not empty strings or zero) - NULL means "not provided"
- [02-03]: Server actions use same Zod schema as client for double validation (never trust client input)
- [02-03]: Mileage date only updates when currentMileage value changes (tracks measurement, not save)
- [02-03]: Edit mode skips localStorage draft restore (initialData is source of truth)
- [02-03]: Delete requires two clicks with visual confirmation (prevents accidental deletion)
- [02-03]: Create redirects to list, edit shows inline success (different UX patterns for different workflows)
- [02-04]: Tailwind CSS v4 requires @import "tailwindcss" + @theme inline (NOT @tailwind directives)
- [02-04]: tailwindcss-animate plugin required for shadcn/ui component animations

### Pending Todos

None yet.

### Blockers/Concerns

- [Research]: KBB/Edmunds have no public API docs -- B2B partnership may be required for Phase 4 valuation integration
- [Research]: Manufacturer-specific early termination formulas differ by lender -- Phase 1 engine should use generic method with strong disclaimers
- [Research]: State/local tax database scope is large (50 states + municipalities) -- consider starting with top 15 states in Phase 1
- [01-02]: DATABASE_URL environment variable required before migrations can run (Neon signup needed)

## Session Continuity

Last session: 2026-01-29 17:50 UTC
Stopped at: Completed Phase 2 (Lease Entry and Core UI) with 02-04-PLAN.md
Resume file: None

**Phase 2 complete:** All 4 plans executed. Lease entry form with educational tooltips, progressive disclosure, auto-save, Zod validation, server actions, CRUD routes, and warm visual design verified working. Critical Tailwind CSS v4 compatibility fix applied during visual verification.
