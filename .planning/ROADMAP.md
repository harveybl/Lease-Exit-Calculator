# Roadmap: Lease Tracker

## Overview

This roadmap delivers a vehicle lease exit-option comparison tool in seven phases, following the critical path identified in research: accurate calculations first, then data entry, then the comparison view that is the product's core value. Market valuation, authentication, and timeline visualization build on top of a validated core. The calculation engine is built and tested before any UI because if the numbers are wrong, nothing else matters.

## Phases

- [x] **Phase 1: Foundation and Calculation Engine** - Scaffold the project and build the pure-function financial engine that powers every feature (6/6 plans complete)
- [x] **Phase 2: Lease Entry and Core UI** - Guided forms for capturing lease data with progressive disclosure and educational tooltips (4/4 plans complete)
- [x] **Phase 3: Comparison View** - Side-by-side five-option comparison with cost breakdowns and a recommended best option (4/4 plans complete)
- [x] **Phase 4: Market Value and Valuation** - Manual market value entry with service abstraction for future API integration (5/5 plans complete)
- [x] **Phase 5: ~~Authentication and~~ Multi-Lease** - Skipped auth (local app); multi-lease already works from Phase 2
- [x] **Phase 6: Timeline and Smart Recommendations** - Month-by-month cost evolution chart with decision window identification (4/4 plans complete)
- [x] **Phase 7: Polish, Export, and Growth** - PDF export, PWA, responsive optimization, accessibility, and lease transfer analysis (6/6 plans complete)

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

### Phase 5: Multi-Lease (Auth Dropped)
**Goal**: ~~Users have personal accounts so their lease data is private, portable across devices, and they can~~ track more than one vehicle.
**Status**: SKIPPED — Auth unnecessary for local/household app. Multi-lease already implemented in Phase 2 (lease list, create, edit, compare per lease).
**Reason**: App is local-only. No user accounts needed. May be shared as public repo for others to run locally.
**Multi-lease capability**: Already exists — users can create multiple leases and switch between them via the lease list at `/lease`.

Plans: Skipped (auth plans reverted in fdf4d4a)

### Phase 6: Timeline and Smart Recommendations
**Goal**: A user can see how their exit options change month-by-month over the remaining lease term, with the system identifying when financial windows open or close.
**Depends on**: Phase 3
**Requirements**: TIME-01, TIME-02, TIME-03, TIME-04
**Plans:** 4 plans
**Success Criteria** (what must be TRUE):
  1. An interactive chart shows cost curves for each exit option across remaining months of the lease term
  2. Hovering over any month on the chart shows the cost breakdown for all options at that point in time
  3. The system identifies and labels decision inflection points (e.g., "Buyout becomes cheaper than returning after month 18")
  4. A recommendation summary distinguishes between the best option today and whether waiting would produce a better outcome

Plans: 4/4 complete (06-01 ✓, 06-02 ✓, 06-03 ✓, 06-04 ✓)

### Phase 7: Polish, Export, and Growth
**Goal**: The application is production-ready with export capabilities, mobile-optimized layout, installability, accessibility compliance, and lease transfer as a sixth comparison option.
**Depends on**: Phase 3
**Requirements**: PLSH-01, PLSH-02, PLSH-03, PLSH-04, PLSH-05
**Plans:** 6 plans
**Success Criteria** (what must be TRUE):
  1. User can export a comparison summary to PDF that includes all options, cost breakdowns, and the recommendation
  2. The comparison view is usable on a phone screen (responsive layout, no horizontal scrolling of critical data)
  3. The app can be installed to a phone home screen via PWA and loads without a network connection for cached data
  4. Keyboard navigation reaches all interactive elements, screen readers announce comparison data meaningfully, and no accessibility violations remain at WCAG 2.1 AA level
  5. Lease transfer/swap appears as a sixth option in the comparison view with transfer fees, registration costs, and timeline implications included

Plans: 6/6 complete (07-01 ✓, 07-02 ✓, 07-03 ✓, 07-04 ✓, 07-05 ✓, 07-06 ✓)

### Phase 8: GitHub Pages Deployment (Client-Side Storage)
**Goal:** The application runs entirely in the browser with no server dependencies, using IndexedDB for data persistence, and deploys automatically to GitHub Pages via static export.
**Depends on**: Phase 7
**Requirements**: Deployment (new — enables GitHub Pages hosting)
**Gap Closure:** Closes pending todo from STATE.md and enables public deployment
**Success Criteria** (what must be TRUE):
  1. All data persistence uses IndexedDB (via Dexie.js) instead of Neon Postgres — no server-side database dependency
  2. All server actions converted to client-side functions — no `'use server'` directives remain
  3. Next.js configured with `output: 'export'` and the production build generates a static `/out` directory
  4. GitHub Actions workflow deploys to GitHub Pages on push to master
  5. The live site at GitHub Pages URL works end-to-end: create lease, add market value, compare options, view timeline, export PDF
  6. All 186+ existing tests continue to pass after the migration

Plans: Complete (implemented without formal plan documents)

### Phase 9: Market Intelligence (v2.0)
**Goal**: Enable automated vehicle valuation, historical trend tracking, and multi-source value comparison to eliminate manual entry and improve decision confidence.
**Depends on**: Phase 4, Phase 8
**Requirements**: MKTV-01, MKTV-02, MKTV-03, MKTV-04
**GitHub Pages Compatible**: Yes (client-side API calls, IndexedDB storage)
**Success Criteria** (what must be TRUE):
  1. User can fetch market value automatically from KBB, Edmunds, or Carvana API (via user-provided API key stored in IndexedDB)
  2. Historical market values are stored in IndexedDB and displayed as a trend chart showing depreciation velocity
  3. Multiple valuation sources can be queried simultaneously and displayed as a range with consensus value
  4. Trade-in offers from dealer networks can be fetched and compared to private sale estimates
  5. All API integrations work client-side without exposing API keys (user provides their own)

Plans: 0/4 (planned: API integration, trend visualization, multi-source aggregation, dealer offers)

### Phase 10: Enhanced User Experience
**Goal**: Improve data entry and export capabilities with document scanning, additional export formats, and educational content.
**Depends on**: Phase 2, Phase 7
**Requirements**: UX-01, UX-03, UX-04
**GitHub Pages Compatible**: Yes (client-side OCR, static content, export libraries)
**Success Criteria** (what must be TRUE):
  1. User can upload lease document photo and have key fields auto-extracted via Tesseract.js OCR
  2. Educational content library provides in-app articles on lease concepts with markdown rendering
  3. Comparison results can be exported to Excel (.xlsx), CSV, and JSON formats in addition to PDF
  4. All processing happens client-side with no server dependencies

Plans: 0/3 (planned: OCR implementation, content library, export formats)

### Phase 11: Advanced Decision Support
**Goal**: Provide total cost of ownership analysis, manufacturer-specific termination rules, and browser-based decision alerts.
**Depends on**: Phase 6, Phase 8
**Requirements**: ADVN-02, ADVN-04, ADVN-01 (modified for client-side)
**GitHub Pages Compatible**: Partial (calculations yes, browser notifications yes, cross-device alerts no)
**Success Criteria** (what must be TRUE):
  1. Total cost of ownership calculator compares lease-to-own vs. buy-new vs. extend scenarios
  2. Manufacturer-specific termination formulas database (Toyota, GM, Honda, etc.) provides accurate estimates
  3. Browser Notification API alerts user when optimal exit window approaches (same-device only)
  4. Service worker checks timelines daily and triggers notifications when decision windows open
  5. Notification preferences stored in IndexedDB with user-configurable thresholds

Plans: 0/3 (planned: TCO calculator, lender database, browser notifications)

### Phase 12: Internationalization & Analytics
**Goal**: Support multiple languages and privacy-respecting analytics while maintaining GitHub Pages compatibility.
**Depends on**: Phase 7
**Requirements**: INFRA-02 (i18n), ANLY-01 (analytics)
**GitHub Pages Compatible**: Yes (client-side i18n, privacy-first analytics)
**Success Criteria** (what must be TRUE):
  1. Application supports Spanish, French, and other languages via next-intl or similar
  2. Privacy-respecting analytics (Plausible, Simple Analytics) track feature usage without PII
  3. All analytics processing is client-side and respects Do Not Track
  4. Language preference stored in IndexedDB and persists across sessions

Plans: 0/2 (planned: i18n implementation, analytics integration)

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|---------------|--------|-----------|
| 1. Foundation and Calculation Engine | 6/6 | ✓ Complete | 2026-01-29 |
| 2. Lease Entry and Core UI | 4/4 | ✓ Complete | 2026-01-29 |
| 3. Comparison View | 4/4 | ✓ Complete | 2026-01-29 |
| 4. Market Value and Valuation | 5/5 | ✓ Complete | 2026-01-30 |
| 5. Multi-Lease (Auth Dropped) | - | ✓ Skipped | 2026-01-31 |
| 6. Timeline and Smart Recommendations | 4/4 | ✓ Complete | 2026-01-31 |
| 7. Polish, Export, and Growth | 6/6 | ✓ Complete | 2026-01-31 |
| 8. GitHub Pages Deployment | Complete | ✓ Complete | 2026-01-31 |
| **v2.0 Phases** | | | |
| 9. Market Intelligence | 0/4 | Planning | — |
| 10. Enhanced User Experience | 0/3 | Planning | — |
| 11. Advanced Decision Support | 0/3 | Planning | — |
| 12. Internationalization & Analytics | 0/2 | Planning | — |
