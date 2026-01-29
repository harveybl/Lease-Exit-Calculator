# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-28)

**Core value:** Show the user the smartest financial move for their vehicle lease right now, and when a better window might open up.
**Current focus:** Phase 1 - Foundation and Calculation Engine

## Current Position

Phase: 1 of 7 (Foundation and Calculation Engine)
Plan: 4 of 6 in current phase
Status: In progress
Last activity: 2026-01-29 -- Completed 01-04-PLAN.md

Progress: [███░░░░░░░] 50%

## Performance Metrics

**Velocity:**
- Total plans completed: 3
- Average duration: 3m 29s
- Total execution time: 10m 27s

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation | 3/6 | 10m 27s | 3m 29s |

**Recent Trend:**
- Last 5 plans: 01-01 (4m 2s), 01-02 (1m 54s), 01-04 (4m 31s)
- Trend: Stable around 3-4 minutes per plan

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
- [01-04]: State tax rules cover top 15 US states only (65% of population)
- [01-04]: CA is only state with cap cost reduction tax applied
- [01-04]: GA TAVT and NC Highway Use Tax simplified to percentage of total payments in Phase 1

### Pending Todos

None yet.

### Blockers/Concerns

- [Research]: KBB/Edmunds have no public API docs -- B2B partnership may be required for Phase 4 valuation integration
- [Research]: Manufacturer-specific early termination formulas differ by lender -- Phase 1 engine should use generic method with strong disclaimers
- [Research]: State/local tax database scope is large (50 states + municipalities) -- consider starting with top 15 states in Phase 1
- [01-02]: DATABASE_URL environment variable required before migrations can run (Neon signup needed)

## Session Continuity

Last session: 2026-01-29 14:49 UTC
Stopped at: Completed 01-04-PLAN.md (Mileage, Equity, and Tax Calculations)
Resume file: None
