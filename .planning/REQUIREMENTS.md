# Requirements: Lease Tracker

**Defined:** 2026-01-28
**Core Value:** Show the user the smartest financial move for their vehicle lease right now, and when a better window might open up.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [x] **FOUND-01**: Project scaffolded with Next.js 16, TypeScript, Neon Postgres, and Drizzle ORM
- [x] **FOUND-02**: Shared type definitions exist for Lease, Calculation, Scenario, and financial primitives
- [x] **FOUND-03**: Database schema and migrations deployed for lease storage
- [x] **FOUND-04**: Legal disclaimers drafted and integrated into the UI before any calculation results are displayed
- [x] **FOUND-05**: All monetary calculations use Decimal.js (no native floating-point for money)

### Calculation Engine

- [x] **CALC-01**: Depreciation, rent charge, monthly payment, and total cost calculated as pure functions
- [x] **CALC-02**: Mileage projection and overage cost estimation based on current mileage and lease terms
- [x] **CALC-03**: Equity calculation (market value minus buyout cost) with full line-item breakdown
- [x] **CALC-04**: Return scenario evaluation including disposition fee, excess mileage charges, and wear-and-tear estimates
- [x] **CALC-05**: Buyout scenario evaluation including residual, remaining payments, purchase fee, and taxes
- [x] **CALC-06**: Sell-privately scenario evaluation including payoff, sale proceeds, and cash-flow timing
- [x] **CALC-07**: Early termination scenario evaluation using actuarial method with lender-specific disclaimers
- [x] **CALC-08**: Keep-paying / extension scenario evaluation for month-to-month continuation
- [x] **CALC-09**: Jurisdiction-aware tax calculation supporting state-level variation (upfront vs monthly, no-tax states)
- [x] **CALC-10**: Money factor to APR conversion utility that accepts multiple input formats

### Lease Entry

- [ ] **ENTRY-01**: User can enter vehicle lease details (monthly payment, residual value, buyout amount, term, mileage allowance, disposition fee)
- [ ] **ENTRY-02**: Guided entry with progressive disclosure (5 essential fields first, then refinements)
- [ ] **ENTRY-03**: Educational tooltips explain confusing terms (residual, money factor, disposition fee, cap cost)
- [ ] **ENTRY-04**: Zod validation shared between client and server with clear error messages
- [ ] **ENTRY-05**: Lease data persisted to Postgres via Drizzle ORM (survives sessions)
- [ ] **ENTRY-06**: User can edit and delete existing lease records
- [ ] **ENTRY-07**: Current mileage tracking with date stamping for projection accuracy

### Comparison

- [ ] **COMP-01**: Side-by-side display of all five exit options (return, buyout, sell privately, early termination, keep paying)
- [ ] **COMP-02**: Transparent cost breakdown per option showing every fee line item, not just a total
- [ ] **COMP-03**: Recommended best option highlighted with reasoning text
- [ ] **COMP-04**: Quick snapshot view answering "what is the best move today?" on a single screen

### Valuation

- [ ] **VALU-01**: User can manually enter current market value for their vehicle
- [ ] **VALU-02**: Manual value override is prominent (not hidden behind auto-lookup)
- [ ] **VALU-03**: Valuation service abstraction layer exists with provider interface for future API integration
- [ ] **VALU-04**: Value display includes "last updated" timestamp and accuracy disclaimers

### Authentication and Multi-Lease

- [ ] **AUTH-01**: User can create an account and log in via Clerk authentication
- [ ] **AUTH-02**: Lease data is scoped to authenticated user (user_id foreign keys)
- [ ] **AUTH-03**: User session persists across browser sessions
- [ ] **AUTH-04**: User can store and switch between multiple leases
- [ ] **AUTH-05**: Protected routes prevent unauthenticated access to lease data

### Timeline and Recommendations

- [ ] **TIME-01**: Month-by-month timeline view showing how each exit option's cost changes over the remaining lease term
- [ ] **TIME-02**: Interactive chart with hover states showing cost details per month
- [ ] **TIME-03**: Smart recommendation algorithm that identifies the optimal exit window (today vs future months)
- [ ] **TIME-04**: Decision window identification showing when options flip (e.g., "buyout becomes better than return in month 18")

### Polish and Growth

- [ ] **PLSH-01**: Export comparison results to PDF
- [ ] **PLSH-02**: Responsive layout optimized for both desktop (comparison tables) and mobile (quick status check)
- [ ] **PLSH-03**: PWA support for "add to home screen" without native app
- [ ] **PLSH-04**: Accessibility audit complete (ARIA labels, keyboard navigation, screen reader support)
- [ ] **PLSH-05**: Lease transfer/swap analysis included as an additional exit option with all hidden costs

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Market Intelligence

- **MKTV-01**: KBB/Edmunds API integration for automated vehicle valuation lookup
- **MKTV-02**: Market value trend tracking over time with historical data
- **MKTV-03**: Value range display from multiple valuation sources
- **MKTV-04**: Trade-in offer aggregation from dealer networks

### Advanced Features

- **ADVN-01**: Decision window alerts via email or push notification
- **ADVN-02**: Total cost of ownership projections (lease vs buy vs keep)
- **ADVN-03**: Shareable comparison links (auth-gated, expiring)
- **ADVN-04**: Manufacturer-specific early termination rule database (Toyota Financial, GM Financial, Honda Financial)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Native mobile app | Web-first with PWA covers mobile use cases |
| Multi-user/public platform | Starting as personal tool; sharing deferred to v2 |
| Dealer negotiation tools | Focused on the math, not the negotiation |
| New lease shopping/comparison | This is about managing existing leases |
| Automatic OBD-II mileage tracking | Privacy concerns, hardware costs, connection issues |
| Credit check/financing integration | Regulatory compliance, requires financial institution partnerships |
| Insurance cost comparisons | Out of scope, duplicates existing car apps |
| Vehicle condition AI assessment | Requires photo uploads, subjective analysis, liability |
| Real-time dealer inventory matching | Complex dealer integrations, regional variations, stale data |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 1 | Complete |
| FOUND-04 | Phase 1 | Complete |
| FOUND-05 | Phase 1 | Complete |
| CALC-01 | Phase 1 | Complete |
| CALC-02 | Phase 1 | Complete |
| CALC-03 | Phase 1 | Complete |
| CALC-04 | Phase 1 | Complete |
| CALC-05 | Phase 1 | Complete |
| CALC-06 | Phase 1 | Complete |
| CALC-07 | Phase 1 | Complete |
| CALC-08 | Phase 1 | Complete |
| CALC-09 | Phase 1 | Complete |
| CALC-10 | Phase 1 | Complete |
| ENTRY-01 | Phase 2 | Pending |
| ENTRY-02 | Phase 2 | Pending |
| ENTRY-03 | Phase 2 | Pending |
| ENTRY-04 | Phase 2 | Pending |
| ENTRY-05 | Phase 2 | Pending |
| ENTRY-06 | Phase 2 | Pending |
| ENTRY-07 | Phase 2 | Pending |
| COMP-01 | Phase 3 | Pending |
| COMP-02 | Phase 3 | Pending |
| COMP-03 | Phase 3 | Pending |
| COMP-04 | Phase 3 | Pending |
| VALU-01 | Phase 4 | Pending |
| VALU-02 | Phase 4 | Pending |
| VALU-03 | Phase 4 | Pending |
| VALU-04 | Phase 4 | Pending |
| AUTH-01 | Phase 5 | Pending |
| AUTH-02 | Phase 5 | Pending |
| AUTH-03 | Phase 5 | Pending |
| AUTH-04 | Phase 5 | Pending |
| AUTH-05 | Phase 5 | Pending |
| TIME-01 | Phase 6 | Pending |
| TIME-02 | Phase 6 | Pending |
| TIME-03 | Phase 6 | Pending |
| TIME-04 | Phase 6 | Pending |
| PLSH-01 | Phase 7 | Pending |
| PLSH-02 | Phase 7 | Pending |
| PLSH-03 | Phase 7 | Pending |
| PLSH-04 | Phase 7 | Pending |
| PLSH-05 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 40 total
- Mapped to phases: 40
- Unmapped: 0

---
*Requirements defined: 2026-01-28*
*Last updated: 2026-01-29 — Phase 1 requirements marked Complete*
