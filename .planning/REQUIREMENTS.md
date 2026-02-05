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

- [x] **ENTRY-01**: User can enter vehicle lease details (monthly payment, residual value, buyout amount, term, mileage allowance, disposition fee)
- [x] **ENTRY-02**: Guided entry with progressive disclosure (5 essential fields first, then refinements)
- [x] **ENTRY-03**: Educational tooltips explain confusing terms (residual, money factor, disposition fee, cap cost)
- [x] **ENTRY-04**: Zod validation shared between client and server with clear error messages
- [x] **ENTRY-05**: Lease data persisted to Postgres via Drizzle ORM (survives sessions)
- [x] **ENTRY-06**: User can edit and delete existing lease records
- [x] **ENTRY-07**: Current mileage tracking with date stamping for projection accuracy

### Comparison

- [x] **COMP-01**: Side-by-side display of all five exit options (return, buyout, sell privately, early termination, keep paying)
- [x] **COMP-02**: Transparent cost breakdown per option showing every fee line item, not just a total
- [x] **COMP-03**: Recommended best option highlighted with reasoning text
- [x] **COMP-04**: Quick snapshot view answering "what is the best move today?" on a single screen

### Valuation

- [x] **VALU-01**: User can manually enter current market value for their vehicle
- [x] **VALU-02**: Manual value override is prominent (not hidden behind auto-lookup)
- [x] **VALU-03**: Valuation service abstraction layer exists with provider interface for future API integration
- [x] **VALU-04**: Value display includes "last updated" timestamp and accuracy disclaimers

### Authentication and Multi-Lease

- [x] ~~**AUTH-01**: User can create an account and log in via Clerk authentication~~ — DROPPED (local app, no auth needed)
- [x] ~~**AUTH-02**: Lease data is scoped to authenticated user (user_id foreign keys)~~ — DROPPED (local app, no auth needed)
- [x] ~~**AUTH-03**: User session persists across browser sessions~~ — DROPPED (local app, no auth needed)
- [x] **AUTH-04**: User can store and switch between multiple leases — Already implemented in Phase 2
- [x] ~~**AUTH-05**: Protected routes prevent unauthenticated access to lease data~~ — DROPPED (local app, no auth needed)

### Timeline and Recommendations

- [x] **TIME-01**: Month-by-month timeline view showing how each exit option's cost changes over the remaining lease term
- [x] **TIME-02**: Interactive chart with hover states showing cost details per month
- [x] **TIME-03**: Smart recommendation algorithm that identifies the optimal exit window (today vs future months)
- [x] **TIME-04**: Decision window identification showing when options flip (e.g., "buyout becomes better than return in month 18")

### Polish and Growth

- [x] **PLSH-01**: Export comparison results to PDF
- [x] **PLSH-02**: Responsive layout optimized for both desktop (comparison tables) and mobile (quick status check)
- [x] **PLSH-03**: PWA support for "add to home screen" without native app
- [x] **PLSH-04**: Accessibility audit complete (ARIA labels, keyboard navigation, screen reader support)
- [x] **PLSH-05**: Lease transfer/swap analysis included as an additional exit option with all hidden costs

## v2 Requirements

Requirements for version 2.0 release. Each maps to roadmap phases 9-12.

**Architecture Constraint:** All features must be compatible with GitHub Pages (static hosting, client-side only, no server dependencies).

### Market Intelligence (Phase 9)

- [ ] **MKTV-01**: KBB/Edmunds/Carvana API integration for automated vehicle valuation lookup (user-provided API keys)
- [ ] **MKTV-02**: Market value trend tracking over time with historical data stored in IndexedDB
- [ ] **MKTV-03**: Value range display from multiple valuation sources with consensus calculation
- [ ] **MKTV-04**: Trade-in offer aggregation from dealer networks (Carvana, CarMax, Vroom)

**GitHub Pages Compatibility:** ✓ Yes
- Client-side API calls with CORS handling
- IndexedDB for historical value storage
- Chart component for trend visualization
- User provides own API keys (stored securely in IndexedDB)

### Enhanced User Experience (Phase 10)

- [ ] **UX-01**: Lease document scanning with OCR via Tesseract.js for auto-extraction of lease terms
- [ ] **UX-03**: Educational content library with markdown articles on lease concepts
- [ ] **UX-04**: Additional export formats (Excel .xlsx, CSV, JSON) beyond PDF

**GitHub Pages Compatibility:** ✓ Yes
- Tesseract.js runs entirely in browser
- Markdown content served as static files
- Export libraries (xlsx.js, papaparse) are client-side

**Deferred (Server Required):**
- ~~**UX-02**: Mileage tracking integration~~ — Requires manufacturer API partnerships and server proxy

### Advanced Decision Support (Phase 11)

- [ ] **ADVN-01**: Decision window alerts via browser Notification API (same-device only, no email/push)
- [ ] **ADVN-02**: Total cost of ownership projections (lease-to-own vs. buy vs. extend scenarios)
- [ ] **ADVN-04**: Manufacturer-specific early termination rule database (static JSON data file)

**GitHub Pages Compatibility:** ✓ Partial
- Browser Notification API works for same-device alerts
- Service worker can schedule daily checks
- All calculations client-side
- **Limitation:** No cross-device notifications (email/push requires server)

**Deferred (Server Required):**
- ~~**ADVN-03**: Shareable comparison links~~ — Requires server for temporary data storage and token generation

### Internationalization & Analytics (Phase 12)

- [ ] **INFRA-02**: Multi-language support (i18n) for Spanish, French, etc. via next-intl
- [ ] **ANLY-01**: Anonymous usage analytics with privacy-respecting service (Plausible, Simple Analytics)

**GitHub Pages Compatibility:** ✓ Yes
- next-intl supports static export
- Client-side analytics scripts
- No PII collection, respects Do Not Track

**Deferred (Server Required):**
- ~~**ANLY-02**: Aggregated market insights~~ — Requires central database to aggregate across users

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
| ENTRY-01 | Phase 2 | Complete |
| ENTRY-02 | Phase 2 | Complete |
| ENTRY-03 | Phase 2 | Complete |
| ENTRY-04 | Phase 2 | Complete |
| ENTRY-05 | Phase 2 | Complete |
| ENTRY-06 | Phase 2 | Complete |
| ENTRY-07 | Phase 2 | Complete |
| COMP-01 | Phase 3 | Complete |
| COMP-02 | Phase 3 | Complete |
| COMP-03 | Phase 3 | Complete |
| COMP-04 | Phase 3 | Complete |
| VALU-01 | Phase 4 | Complete |
| VALU-02 | Phase 4 | Complete |
| VALU-03 | Phase 4 | Complete |
| VALU-04 | Phase 4 | Complete |
| AUTH-01 | Phase 5 | Dropped |
| AUTH-02 | Phase 5 | Dropped |
| AUTH-03 | Phase 5 | Dropped |
| AUTH-04 | Phase 2 | Complete |
| AUTH-05 | Phase 5 | Dropped |
| TIME-01 | Phase 6 | Complete |
| TIME-02 | Phase 6 | Complete |
| TIME-03 | Phase 6 | Complete |
| TIME-04 | Phase 6 | Complete |
| PLSH-01 | Phase 7 | Complete |
| PLSH-02 | Phase 7 | Complete |
| PLSH-03 | Phase 7 | Complete |
| PLSH-04 | Phase 7 | Complete |
| PLSH-05 | Phase 7 | Complete |

**Coverage:**
- v1 requirements: 40 total
- Mapped to phases: 40
- Unmapped: 0

---
*Requirements defined: 2026-01-28*
*Last updated: 2026-02-05 — All v1 requirements complete (40/40 mapped, 35 complete, 5 dropped). v2 requirements defined for Phases 9-12 with GitHub Pages compatibility noted.*

## v2 Traceability

| Requirement | Phase | Status | GitHub Pages Compatible |
|-------------|-------|--------|------------------------|
| MKTV-01 | Phase 9 | Planning | ✓ Yes (client-side API calls) |
| MKTV-02 | Phase 9 | Planning | ✓ Yes (IndexedDB + charts) |
| MKTV-03 | Phase 9 | Planning | ✓ Yes (client-side aggregation) |
| MKTV-04 | Phase 9 | Planning | ✓ Yes (API integration) |
| UX-01 | Phase 10 | Planning | ✓ Yes (Tesseract.js) |
| UX-02 | Deferred | Out of scope | ✗ Requires server proxy |
| UX-03 | Phase 10 | Planning | ✓ Yes (static markdown) |
| UX-04 | Phase 10 | Planning | ✓ Yes (client-side export) |
| ADVN-01 | Phase 11 | Planning | ⚠ Partial (browser API only) |
| ADVN-02 | Phase 11 | Planning | ✓ Yes (calculations only) |
| ADVN-03 | Deferred | Out of scope | ✗ Requires server storage |
| ADVN-04 | Phase 11 | Planning | ✓ Yes (static data file) |
| INFRA-02 | Phase 12 | Planning | ✓ Yes (next-intl static) |
| ANLY-01 | Phase 12 | Planning | ✓ Yes (client-side scripts) |
| ANLY-02 | Deferred | Out of scope | ✗ Requires central database |

**Coverage:**
- v2 requirements: 15 total
- GitHub Pages compatible: 11 full + 1 partial = 12
- Deferred (server required): 3
- Mapped to phases: 12
- Unmapped: 0
