# Roadmap: Lease Tracker

## Overview

This roadmap delivers a vehicle lease exit-option comparison tool in seven phases, following the critical path identified in research: accurate calculations first, then data entry, then the comparison view that is the product's core value. Market valuation, authentication, and timeline visualization build on top of a validated core. The calculation engine is built and tested before any UI because if the numbers are wrong, nothing else matters.

## Phases

- [x] **Phase 1: Foundation and Calculation Engine** - Scaffold the project and build the pure-function financial engine that powers every feature (6/6 plans complete)
- [x] **Phase 2: Lease Entry and Core UI** - Guided forms for capturing lease data with progressive disclosure and educational tooltips (4/4 plans complete)
- [x] **Phase 3: Comparison View** - Side-by-side five-option comparison with cost breakdowns and a recommended best option (4/4 plans complete)
- [x] **Phase 4: Market Value and Valuation** - Manual market value entry with service abstraction for future API integration (5/5 plans complete)
- [ ] **Phase 5: Authentication and Multi-Lease** - User accounts via Clerk with multi-lease support and cross-device persistence
- [ ] **Phase 6: Timeline and Smart Recommendations** - Month-by-month cost evolution chart with decision window identification
- [ ] **Phase 7: Polish, Export, and Growth** - PDF export, PWA, responsive optimization, accessibility, and lease transfer analysis

## Phase Details

### Phase 1: Foundation and Calculation Engine
**Goal**: Every financial calculation the product needs exists as a tested, pure TypeScript function with Decimal.js precision -- verified against real-world lease scenarios before any UI is built.
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, CALC-01, CALC-02, CALC-03, CALC-04, CALC-05, CALC-06, CALC-07, CALC-08, CALC-09, CALC-10
**Success Criteria** (what must be TRUE):
  1. A Next.js 16 application runs locally with TypeScript, Neon Postgres connected, and Drizzle ORM migrations applied to create the lease schema
  2. Pure calculation functions for depreciation, rent charge, monthly payment, total cost, mileage projection, overage cost, and equity produce correct results verified by unit tests against known lease scenarios
  3. All five exit scenario evaluators (return, buyout, sell privately, early termination, keep paying) produce itemized cost breakdowns with every fee line item
  4. Tax calculation accepts a state identifier and correctly distinguishes upfront-tax states, monthly-tax states, and no-tax states
  5. Legal disclaimer copy exists and is rendered before any calculation output in the UI shell

Plans: 6/6 complete (01-01 ✓, 01-02 ✓, 01-03 ✓, 01-04 ✓, 01-05 ✓, 01-06 ✓)

### Phase 2: Lease Entry and Core UI
**Goal**: A user can enter their complete lease details through a guided form that explains confusing terms, validates input, and persists data to the database.
**Depends on**: Phase 1
**Requirements**: ENTRY-01, ENTRY-02, ENTRY-03, ENTRY-04, ENTRY-05, ENTRY-06, ENTRY-07
**Success Criteria** (what must be TRUE):
  1. User can enter a lease starting with 5 essential fields (monthly payment, term, mileage allowance, residual value, current mileage) and optionally expand to provide additional details
  2. Hovering or tapping on any lease term (residual, money factor, disposition fee, cap cost) shows a plain-English explanation
  3. Invalid input (negative values, impossible terms, missing required fields) is caught with clear error messages before submission
  4. A saved lease persists across browser sessions (page refresh, close and reopen) and can be edited or deleted
  5. Current mileage entries are date-stamped so the system can project future mileage accurately

Plans: 4/4 complete (02-01 ✓, 02-02 ✓, 02-03 ✓, 02-04 ✓)

### Phase 3: Comparison View
**Goal**: A user with a saved lease sees all five exit options side-by-side with transparent cost breakdowns and a clear recommendation for the best move today.
**Depends on**: Phase 1, Phase 2
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04
**Success Criteria** (what must be TRUE):
  1. All five exit options (return, buyout, sell privately, early termination, keep paying) appear in a single side-by-side view with total cost for each
  2. Each option expands to show every fee line item (disposition fee, excess mileage, purchase fee, taxes, remaining payments, etc.) -- no black-box totals
  3. The best option is visually highlighted with a short explanation of why it wins (e.g., "Selling privately saves $2,400 vs. returning because your vehicle has positive equity")
  4. A "snapshot" summary answers "what is the best move today?" in a single glance without scrolling

Plans: 4/4 complete (03-01 ✓, 03-02 ✓, 03-03 ✓, 03-04 ✓)

### Phase 4: Market Value and Valuation
**Goal**: A user can record their vehicle's current market value with a prominent manual entry flow, and the system architecture supports future API integration without code changes to the comparison view.
**Depends on**: Phase 2
**Requirements**: VALU-01, VALU-02, VALU-03, VALU-04
**Success Criteria** (what must be TRUE):
  1. User can enter a market value manually and it immediately updates the comparison results
  2. Manual value entry is the primary, visible path -- not hidden behind an auto-lookup button
  3. A valuation provider interface exists in code so that adding KBB or Edmunds integration later does not require changing components that consume market value
  4. The displayed market value shows when it was last updated and includes a disclaimer about estimate accuracy

Plans: 5/5 complete (04-01 ✓, 04-02 ✓, 04-03 ✓, 04-04 ✓, 04-05 ✓)

### Phase 5: Authentication and Multi-Lease
**Goal**: Users have personal accounts so their lease data is private, portable across devices, and they can track more than one vehicle.
**Depends on**: Phase 2
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**Success Criteria** (what must be TRUE):
  1. User can create an account and log in through Clerk (email, Google, or other configured provider)
  2. Lease data is tied to the authenticated user -- logging in on a different device shows the same leases
  3. User can add a second lease and switch between leases to see separate comparison results for each
  4. Unauthenticated visitors cannot access lease data or comparison views (protected routes redirect to login)

Plans: 5 plans
- [ ] 05-01-PLAN.md -- Clerk installation, ClerkProvider, middleware, auth pages
- [ ] 05-02-PLAN.md -- Database schema: users table and user_id FK on leases
- [ ] 05-03-PLAN.md -- Webhook handler and auth-gated Server Actions
- [ ] 05-04-PLAN.md -- Route restructuring, Header, lease list, multi-lease navigation
- [ ] 05-05-PLAN.md -- Browser verification of all auth and multi-lease flows

### Phase 6: Timeline and Smart Recommendations
**Goal**: A user can see how their exit options change month-by-month over the remaining lease term, with the system identifying when financial windows open or close.
**Depends on**: Phase 3
**Requirements**: TIME-01, TIME-02, TIME-03, TIME-04
**Success Criteria** (what must be TRUE):
  1. An interactive chart shows cost curves for each exit option across remaining months of the lease term
  2. Hovering over any month on the chart shows the cost breakdown for all options at that point in time
  3. The system identifies and labels decision inflection points (e.g., "Buyout becomes cheaper than returning after month 18")
  4. A recommendation summary distinguishes between the best option today and whether waiting would produce a better outcome

Plans: TBD

### Phase 7: Polish, Export, and Growth
**Goal**: The application is production-ready with export capabilities, mobile-optimized layout, installability, accessibility compliance, and lease transfer as a sixth comparison option.
**Depends on**: Phase 3, Phase 5
**Requirements**: PLSH-01, PLSH-02, PLSH-03, PLSH-04, PLSH-05
**Success Criteria** (what must be TRUE):
  1. User can export a comparison summary to PDF that includes all options, cost breakdowns, and the recommendation
  2. The comparison view is usable on a phone screen (responsive layout, no horizontal scrolling of critical data)
  3. The app can be installed to a phone home screen via PWA and loads without a network connection for cached data
  4. Keyboard navigation reaches all interactive elements, screen readers announce comparison data meaningfully, and no accessibility violations remain at WCAG 2.1 AA level
  5. Lease transfer/swap appears as a sixth option in the comparison view with transfer fees, registration costs, and timeline implications included

Plans: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|---------------|--------|-----------|
| 1. Foundation and Calculation Engine | 6/6 | ✓ Complete | 2026-01-29 |
| 2. Lease Entry and Core UI | 4/4 | ✓ Complete | 2026-01-29 |
| 3. Comparison View | 4/4 | ✓ Complete | 2026-01-29 |
| 4. Market Value and Valuation | 5/5 | ✓ Complete | 2026-01-30 |
| 5. Authentication and Multi-Lease | 0/5 | Planned | - |
| 6. Timeline and Smart Recommendations | 0/TBD | Not started | - |
| 7. Polish, Export, and Growth | 0/TBD | Not started | - |
