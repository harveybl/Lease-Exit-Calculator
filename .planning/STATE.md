# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-28)

**Core value:** Show the user the smartest financial move for their vehicle lease right now, and when a better window might open up.
**Current focus:** Phase 3 complete — Comparison View

## Current Position

Phase: 4 of 7 (Market Value and Valuation) — IN PROGRESS
Plan: 4 of 5 in current phase — COMPLETE
Status: In progress
Last activity: 2026-01-30 -- Completed 04-04-PLAN.md (Manual Market Value Entry UI)

Progress: [████████████████░] 18/19 plans (95% - phases 1-3 complete, phase 4 in progress)

## Performance Metrics

**Velocity:**
- Total plans completed: 18
- Average duration: ~3m 11s
- Total execution time: ~67m 23s

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation | 6/6 | 26m 39s | 4m 27s |
| 2. Lease Entry and Core UI | 4/4 | 22m 32s | 5m 38s |
| 3. Comparison View | 4/4 | ~8m | ~2m |
| 4. Market Value and Valuation | 4/5 | ~10m 23s | ~2m 36s |

**Recent Trend:**
- Last 5 plans: 03-04 (~4m), 04-01 (3m), 04-02 (4m), 04-03 (1m 34s), 04-04 (1m 53s)
- Trend: Component plans consistently fast (~2m), data layer plans similar

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
- [03-01]: Module-level Intl.NumberFormat singleton reused for formatCurrency performance
- [03-01]: Tie threshold is $100 absolute difference between top two ranked options
- [03-01]: estimatedSalePrice defaults to residualValue until Phase 4 adds market value entry
- [03-01]: Return scenario is always the baseline for savings comparison (default lessee action)
- [03-02]: Popover with Info icon for line item educational descriptions (consistent with Phase 2 Popover decision)
- [03-02]: Collapsible (not Accordion) for independent expand/collapse per option card
- [03-02]: Green text for credits always paired with "You receive:" prefix for color-blind accessibility
- [03-02]: Category display order: liability, fee, tax, asset, other (costs before credits)
- [03-03]: HeroSummary is server component -- only renders data, no interactivity needed
- [03-03]: ComparisonView deduplicates disclaimers with Set for clean display
- [03-03]: OptionsList preserves pre-sorted order from evaluate-all (no re-sorting)
- [03-04]: RSC serialization boundary -- Decimal.toJSON() returns strings across server→client boundary; formatCurrency and LeaseCard accept Decimal | number | string
- [04-01]: ValuationProvider interface pattern for swappable valuation sources (manual, KBB, Edmunds, Carvana)
- [04-01]: 30-day staleness threshold for market value freshness detection
- [04-01]: Native relative time formatting (no date-fns) for simple use cases reduces bundle size
- [04-01]: Source stored as varchar(50) enum for flexibility with type safety
- [04-02]: Incomplete scenarios use residualValue as conservative placeholder (shows scenario but marked incomplete)
- [04-02]: Equity calculated as marketValue - buyoutCost (not payoffAmount, which excludes tax/fees)
- [04-02]: Incomplete scenarios sort last regardless of netCost and excluded from bestOption selection
- [04-03]: Server actions follow ActionResult pattern for consistent error handling
- [04-03]: revalidatePath called after createMarketValue for instant comparison page updates
- [04-03]: Market value history limited to last 20 entries to prevent over-fetching
- [04-04]: MarketValueBanner uses inline form with educational popover for immediate value entry
- [04-04]: MarketValueDisplay toggles between display and edit modes with Check/X buttons
- [04-04]: Near-zero equity threshold set at $50 for neutral display
- [04-04]: Inline edit pattern with useTransition for server action pending states

### Pending Todos

None yet.

### Blockers/Concerns

- [Research]: KBB/Edmunds have no public API docs -- B2B partnership may be required for Phase 4 valuation integration
- [Research]: Manufacturer-specific early termination formulas differ by lender -- Phase 1 engine should use generic method with strong disclaimers
- [Research]: State/local tax database scope is large (50 states + municipalities) -- consider starting with top 15 states in Phase 1
- [01-02]: DATABASE_URL environment variable required before migrations can run (Neon signup needed)

## Session Continuity

Last session: 2026-01-30
Stopped at: Completed 04-04-PLAN.md (Manual Market Value Entry UI)
Resume file: None

**Phase 4 in progress.** Next: 04-05 (Comparison Page Integration)
