# Project Research Summary

**Project:** Vehicle Lease Tracker
**Domain:** Personal Finance / Automotive Lease-End Decision Support
**Researched:** 2026-01-28
**Confidence:** HIGH

## Executive Summary

The Vehicle Lease Tracker is a financial decision tool that helps lease holders compare all exit paths (return, buyout, sell privately, early termination, lease extension) side-by-side at any point during their lease. Research confirms a clear market gap: existing tools like Edmunds and KBB focus on new lease acquisition, Leasehackr targets expert negotiators, and LeaseEnd AI only covers buyout-vs-return. No tool compares all five exit options with transparent cost breakdowns. The recommended approach is a Next.js 16 full-stack application with a pure-function calculation engine, client-first data persistence via Neon Postgres, and Clerk authentication -- delivering a modern, type-safe stack optimized for financial accuracy and rapid development.

The most critical technical challenge is calculation accuracy. Lease finance math is deceptively complex: early termination uses actuarial (not linear) formulas, sales tax rules vary dramatically across 50 states, and three commonly-confused values (residual, buyout amount, payoff balance) must be carefully distinguished in both code and UI. The research strongly recommends building the calculation engine as isolated, pure TypeScript functions with Decimal.js for arbitrary-precision arithmetic -- tested against real dealer quotes before any UI work begins. This engine is the product's credibility; if the numbers are wrong, nothing else matters.

Key risks center on (1) calculation accuracy for early termination and tax implications, (2) vehicle valuation API availability since KBB/Edmunds require B2B partnerships with no public API docs found, and (3) scope creep from the rich feature landscape. The mitigation strategy is clear: start with manual value entry (not API-dependent), build the calculation engine with comprehensive tests first, and defer authentication, timeline visualization, and smart recommendations until the core comparison view is validated. Legal disclaimers must be designed into the UI from day one, not bolted on later.

## Key Findings

### Recommended Stack

The stack centers on Next.js 16 with React 19, TypeScript, and Neon Postgres -- the mainstream 2026 full-stack React approach. The critical library choice is Decimal.js for all monetary calculations, preventing floating-point errors that are unacceptable in financial tools. Drizzle ORM was chosen over Prisma for superior serverless performance, and Clerk was chosen over Auth0/NextAuth for faster integration and sub-millisecond JWT validation.

**Core technologies:**
- **Next.js 16 + React 19:** Full-stack framework with Server Actions, App Router, and Server Components for optimal data fetching in financial apps
- **TypeScript 5.3+:** Non-negotiable for financial calculations where type errors cause real monetary losses
- **Neon Postgres:** Serverless Postgres (Vercel's official replacement) with auto-scaling free tier for relational lease data
- **Decimal.js:** Arbitrary-precision arithmetic -- prevents `0.1 + 0.2 = 0.30000000000000004` in money math
- **Drizzle ORM:** Code-first TypeScript ORM with superior serverless performance over Prisma
- **Clerk:** Drop-in auth with free tier supporting 10K MAU, optimized for Next.js
- **shadcn/ui + Tailwind 4:** Modern component system with full code ownership
- **Recharts:** Declarative React charting for cost timeline visualization
- **Zod + React Hook Form:** Type-safe validation shared between client and server

**Critical version requirement:** Next.js 16 requires React 19.2+. Do not mix React 18 with Next.js 16.

### Expected Features

**Must have (table stakes -- users assume these exist):**
- Lease data entry form (monthly payment, term, mileage limit, residual, overage fees)
- Current mileage tracking with projection
- Market value lookup (manual entry initially)
- Buyout cost and equity calculation
- Overage cost estimation
- Return option summary with disposition fees

**Should have (the differentiators -- this is the product's reason to exist):**
- Five-option side-by-side comparison (Return / Buyout / Sell / Early Termination / Extension)
- Transparent cost breakdowns showing every fee, not just a total
- Guided lease entry with educational tooltips for confusing terms
- Smart recommendation engine highlighting the optimal choice with reasoning

**Defer to v1.x (after validation):**
- Multiple lease tracking, month-by-month timeline view, KBB/Edmunds API integration, visual charts, export/share, decision window alerts

**Defer to v2+ (after product-market fit):**
- Market value trend tracking, trade-in offer aggregation, total cost of ownership projections, native mobile apps, notification system

### Architecture Approach

The architecture follows a layered pattern: Presentation (React components) > Business Logic (pure calculation functions) > State Management (hybrid Zustand + TanStack Query + Context) > Data Persistence (Neon Postgres as primary, with potential IndexedDB for offline). The most important architectural decision is isolating the calculation engine as pure, framework-agnostic TypeScript functions -- no React imports, no side effects, no state dependencies. This enables exhaustive unit testing of financial logic independent of UI, which is essential for a tool where calculation accuracy is the entire value proposition. Feature-based code organization (leases/, calculations/, comparison/, valuation/) keeps boundaries clean.

**Major components:**
1. **Calculation Engine** -- Pure functions for depreciation, rent charge, total cost, and all five exit scenario evaluations. Uses Decimal.js. Zero framework dependencies.
2. **Comparison Engine** -- Evaluates all exit paths in parallel, identifies optimal choice, and produces structured data for the comparison view.
3. **Lease Entry System** -- Guided forms with React Hook Form + Zod validation, progressive disclosure (start with 5 fields, expand for accuracy), educational tooltips.
4. **Valuation Service** -- Abstraction layer over multiple providers (KBB/Edmunds) with fallback chain, TanStack Query caching (24hr TTL), and prominent manual override.
5. **State Layer** -- Zustand for lease data (persisted to Postgres), TanStack Query for API cache, React Context for auth.

### Critical Pitfalls

1. **Simplified early termination formulas** -- Most calculators assume linear depreciation. Real early termination uses actuarial interest logic that varies by lender (Toyota Financial vs. GM Financial vs. Honda Financial). Must implement both Standard Balance and True Payoff Balance methods, and include disclaimers that actual payoff requires confirmation with the leasing company.

2. **Confusing residual value, buyout amount, and payoff balance** -- Three different values that even industry professionals conflate. Residual is set at signing; buyout = residual + remaining payments + purchase fee + taxes; payoff = actuarial calculation for early exit. The UI must define and distinguish these consistently throughout.

3. **Jurisdiction-specific tax variations** -- Six states tax on full vehicle value upfront; most tax monthly payments; five have no sales tax; Pennsylvania adds a 3% motor vehicle lease tax on top of 6% sales tax. A calculator without jurisdiction-aware tax logic produces wildly wrong comparisons. Must ask for user location early in the flow.

4. **Over-reliance on valuation APIs** -- KBB and Edmunds are "educated guesses" that can diverge from actual market prices. Manual value override must be prominent (not hidden), multiple sources should be shown as a range, and users should be encouraged to input real dealer/Carvana/CarMax offers.

5. **Missing legal disclaimers** -- Financial calculators without proper disclaimers create legal liability. Must include explicit disclaimers stating the tool is educational, not financial advice, displayed prominently before calculations -- not buried in terms of service. Address this before writing any calculation code.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Project Foundation and Calculation Engine
**Rationale:** The calculation engine is the product's core credibility. Architecture research identifies Storage > Calculations > Lease Entry as the critical path. Pitfalls research demands calculation accuracy be proven before any UI work. Every other feature depends on correct math.
**Delivers:** Project scaffolding (Next.js 16, TypeScript, Neon Postgres, Drizzle ORM), shared type definitions (Lease, Calculation, Scenario types), database schema and migrations, and a comprehensive pure-function calculation engine covering depreciation, rent charge, monthly payment, total cost, mileage projection, overage cost, equity calculation, and all five exit scenario evaluations. Legal disclaimer copy drafted.
**Addresses features:** Buyout cost calculation, equity calculation, mileage projection, overage estimation (all computational foundations)
**Avoids pitfalls:** Simplified early termination formulas (implement actuarial method), residual/buyout/payoff confusion (establish clear type system), money factor conversion errors (build conversion utilities), jurisdiction tax errors (build tax rules structure)

### Phase 2: Lease Entry and Core UI
**Rationale:** Can't compare anything without lease data. Guided entry is a P1 differentiator that reduces confusion -- critical because lease terminology is the #1 UX pitfall identified in research. Forms depend on the data model and calculation engine being ready.
**Delivers:** Guided lease entry form with progressive disclosure (5 essential fields first, then refinements), educational tooltips for confusing terms (residual, money factor, disposition fee, cap cost), Zod validation shared client/server, lease CRUD operations persisted to Postgres, mileage tracking with date stamping.
**Addresses features:** Basic lease entry, current mileage tracking, guided entry tooltips, single lease storage
**Avoids pitfalls:** Industry jargon confusion (tooltips), asking 15+ fields upfront (progressive disclosure), money factor format confusion (accept both formats, show APR equivalent)

### Phase 3: Comparison View (Core Value Proposition)
**Rationale:** This is the product -- the side-by-side comparison of all exit options is the market gap identified in competitor analysis. Depends on calculation engine (Phase 1) and lease data (Phase 2) being solid.
**Delivers:** Five-option side-by-side comparison table (return, buyout, sell privately, early termination, extension), transparent cost breakdowns per option showing every line item, equity highlight, recommended best option with reasoning, legal disclaimers integrated naturally into comparison results.
**Addresses features:** Side-by-side option comparison, cost breakdown per option, return option summary, equity calculation display
**Avoids pitfalls:** Black-box calculations (show formulas and breakdowns), analysis paralysis (highlight best 1-2 options), missing disclaimers (integrated before results)

### Phase 4: Market Value and Valuation
**Rationale:** Accurate market value improves comparison quality but is NOT a launch blocker -- manual entry works for MVP. Architecture research identifies valuation as independent (can be built in parallel). Pitfalls research warns against API over-reliance. Building this after core comparison ensures the product works without external dependencies.
**Delivers:** Manual market value entry (prominent, not secondary), valuation service abstraction layer with provider interface, KBB/Edmunds API integration if B2B access secured (fallback to manual), TanStack Query caching with 24hr TTL, value range display from multiple sources, "last updated" timestamps.
**Addresses features:** Current market value lookup, KBB/Edmunds API integration
**Avoids pitfalls:** Single valuation source (multi-provider with fallback), treating API values as gospel (show as range, encourage real offers), tight coupling to specific API (abstraction layer)

### Phase 5: Authentication and Multi-Lease Support
**Rationale:** Auth is independent and not needed for personal use / initial validation. Add it when the core product works to enable multi-user and data persistence across devices. Multiple lease tracking is a P2 feature triggered by user demand.
**Delivers:** Clerk authentication integration, user-scoped lease data (user_id foreign keys), multiple lease storage and switching, protected routes, session management.
**Addresses features:** Multiple lease storage, authentication
**Avoids pitfalls:** Premature backend complexity (auth only when needed), storing PII unnecessarily (minimum data, encrypt at rest)

### Phase 6: Timeline Visualization and Smart Recommendations
**Rationale:** High-complexity features that enhance the core comparison but are not required for launch validation. Timeline is the biggest differentiator vs. competitors (none offer it) but is computationally expensive and depends on comparison engine maturity.
**Delivers:** Month-by-month timeline view showing cost evolution across exit options, interactive chart with hover states and scenario filtering, smart recommendation algorithm with confidence levels, decision window identification ("best option today" vs. "best in 3 months"), Recharts integration.
**Addresses features:** Month-by-month timeline view, smart recommendation engine, visual cost breakdowns, decision timeline alerts
**Avoids pitfalls:** Recalculating on every render (memoization, potentially Web Workers), performance at scale (progressive calculation -- visible months first)

### Phase 7: Polish, Export, and Growth Features
**Rationale:** Polish comes after functionality works. Export/share enables organic growth. These are P2-P3 features that improve retention and expand market.
**Delivers:** Export to PDF / shareable links, responsive mobile optimization, PWA "add to home screen", error boundaries and loading states, accessibility audit (ARIA, keyboard nav), performance optimization (Lighthouse), lease transfer/swap analysis option.
**Addresses features:** Export/share, lease transfer option, responsive design, PWA
**Avoids pitfalls:** Lease transfer hidden costs (include all fees in calculation), sharing via unprotected URLs (auth-gated, expiring links)

### Phase Ordering Rationale

- **Calculations before UI:** Financial accuracy is the product's entire value. Testing pure functions is faster and more reliable than testing through UI. If the math is wrong, nothing else matters.
- **Manual value entry before API integration:** Eliminates external dependency risk. KBB/Edmunds B2B access is uncertain (no public API docs found). The product must work without any API.
- **Comparison view before timeline:** The comparison table validates the core value proposition with simpler UI. Timeline adds visual richness but is HIGH complexity. Validate the concept before investing in expensive visualization.
- **Auth after core features:** Personal-use validation does not require auth. Adding auth earlier creates unnecessary friction for the builder and early testers.
- **Feature grouping follows architecture boundaries:** Each phase maps to architectural components (calculation engine, lease entry system, comparison engine, valuation service, auth layer, visualization layer).

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (Calculation Engine):** Needs research into manufacturer-specific early termination formulas (Toyota Financial, GM Financial, Honda Financial all differ). Also needs state-by-state tax rules database -- 50 states plus local municipalities.
- **Phase 4 (Market Value):** Needs research into KBB/Edmunds B2B API access requirements, pricing, and rate limits. No public API documentation was found during initial research -- may need third-party aggregators like SteadyAPI's AutoHub.
- **Phase 6 (Timeline):** Needs research into computational performance of generating 36-month x 5-scenario timeline data and whether Web Workers are needed.

Phases with standard patterns (skip deep research):
- **Phase 2 (Lease Entry):** Well-documented React Hook Form + Zod + Next.js Server Actions patterns. shadcn/ui provides form components.
- **Phase 3 (Comparison View):** Standard data table/comparison layout. No novel patterns required.
- **Phase 5 (Auth):** Clerk has extensive Next.js documentation and examples. Drop-in integration.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official docs verified for all major choices (Next.js 16, React 19, Drizzle, Clerk). Version compatibility confirmed. Clear alternatives documented. |
| Features | MEDIUM | Strong competitor analysis confirms market gap. Feature prioritization based on multiple sources. However, user validation has not occurred -- MVP definition is research-informed but untested. |
| Architecture | HIGH | Patterns well-documented across multiple 2026 sources. Pure-function calculation engine is established best practice for financial apps. Feature-based organization is 2026 consensus. |
| Pitfalls | HIGH | Domain-specific pitfalls verified through multiple financial and automotive sources. Early termination formula complexity, tax jurisdiction variations, and terminology confusion are well-documented industry challenges. |

**Overall confidence:** HIGH

### Gaps to Address

- **Vehicle valuation API access:** No public API docs found for KBB or Edmunds. B2B partnerships may be required. During Phase 4 planning, research third-party aggregators or plan for manual-entry-only indefinitely.
- **Manufacturer-specific early termination rules:** Research confirmed that different captive lenders calculate payoffs differently, but specific formulas per lender were not obtained. During Phase 1 planning, consider building a generic engine with lender-specific overrides, and include strong disclaimers.
- **State/local tax database:** The scope of tax variation is documented but a complete database was not compiled. During Phase 1 planning, evaluate third-party tax APIs (e.g., TaxJar, Avalara) vs. building a manual lookup table for the ~15 most common states first.
- **User validation:** All feature prioritization is based on competitor analysis and domain research, not user interviews. The MVP should be treated as a hypothesis to validate, not a confirmed spec.

## Sources

### Primary (HIGH confidence)
- Next.js 15/16 Release Blog and Docs -- framework features, Turbopack, React 19 support
- React 19 Release Blog -- Actions API, new hooks, Server Components
- Neon Postgres Vercel Integration Docs -- serverless Postgres setup
- Drizzle ORM Official Docs -- code-first approach, serverless optimization
- LeaseGuide.com -- early termination formulas, lease payment calculations, mileage overage rules
- Credit Finance Plus Lease-End Calculator -- exit option calculation methodology
- KBB/Edmunds Official Tools -- valuation methodology and limitations
- FINRA Tools and Calculators Disclaimer -- financial disclaimer requirements
- LeaseGuide Car Lease Tax Rules by State -- jurisdiction-specific tax variations

### Secondary (MEDIUM confidence)
- Clerk vs Auth0 comparison articles -- performance and DX analysis
- Prisma vs Drizzle 2026 comparisons -- serverless performance benchmarks
- React architecture pattern articles (Bacancy, ProFy, Medium) -- feature-based organization consensus
- State management comparison articles -- Zustand + TanStack Query hybrid pattern
- Car and Driver / JD Power / Edmunds editorial content -- residual vs buyout, money factor explanations
- Competitor tools (LeaseEnd AI, Leasehackr, LeaseTrack) -- feature landscape analysis

### Tertiary (LOW confidence)
- KBB InfoDriver Web Service (IDWS) -- B2B API reference found but no public documentation. Actual access requirements, pricing, and rate limits unknown.
- Third-party valuation aggregators (SteadyAPI AutoHub) -- mentioned in search results but not verified. Needs direct investigation during Phase 4 planning.

---
*Research completed: 2026-01-28*
*Ready for roadmap: yes*
