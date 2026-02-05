# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-28)

**Core value:** Show the user the smartest financial move for their vehicle lease right now, and when a better window might open up.
**Current focus:** Phase 8 complete — Next: Phase 9 (Market Intelligence) for v2.0

## Current Position

Phase: 8 of 8 (GitHub Pages Deployment) — COMPLETE (v1.0)
Plan: All v1.0 phases complete
Status: v1.0 complete - Application fully deployed to GitHub Pages with IndexedDB storage. Planning v2.0 (Phases 9-12).
Last activity: 2026-02-05 -- Planning v2.0 phases with GitHub Pages compatibility

Progress v1.0: [█████████████████████████████] 8/8 phases (100% - v1.0 complete)
Progress v2.0: [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0/4 phases (Phase 9-12 planning)

## Performance Metrics

**Velocity:**
- Total plans completed: 33
- Average duration: ~3m 20s
- Total execution time: ~109m

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation | 6/6 | 26m 39s | 4m 27s |
| 2. Lease Entry and Core UI | 4/4 | 22m 32s | 5m 38s |
| 3. Comparison View | 4/4 | ~8m | ~2m |
| 4. Market Value and Valuation | 5/5 | ~13m | ~2m 36s |
| 6. Timeline and Recommendations | 4/4 | ~16m | ~4m |
| 7. Polish, Export, and Growth | 6/6 | ~23m | ~3m 50s |
| 8. GitHub Pages Deployment | Complete | — | — |

**Recent Trend:**
- Phase 8 (GitHub Pages Deployment): Complete - IndexedDB migration and static export implemented
- All 8 phases complete - Application production-ready and deployed

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Calculations before UI -- financial accuracy is the entire value proposition
- [Roadmap]: Manual value entry before API integration -- eliminates external dependency risk
- [Roadmap]: Auth after core features -- personal-use validation does not require auth
- [05]: Auth dropped entirely -- app is local/household tool, no login needed. Multi-lease already works from Phase 2.
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
- [06-01]: Decimal precision maintained during timeline calculations, converted to number at export boundary
- [06-01]: Extension scenario only available at lease end (monthsRemaining = 0)
- [06-01]: Null values for incomplete scenarios (sellPrivately without market value, extension mid-lease)
- [06-01]: Default 6-month extension with zero tax for timeline projections
- [06-02]: Simplified crossover detection tracks cheapest scenario change (not all pairwise comparisons)
- [06-02]: Decision window reuses $100 tie threshold from Phase 3 for "waiting not worth it" logic
- [06-02]: getCheapestScenario helper pattern filters null scenarios consistently
- [06-03]: shadcn/ui ChartContainer used instead of ResponsiveContainer directly for responsive chart sizing
- [06-03]: Chart colors match project theme (--chart-1 uses primary teal, --chart-2 through --chart-5 complementary)
- [06-03]: Y-axis abbreviated formatting ($12K for thousands) for cleaner display
- [06-03]: connectNulls={false} creates gaps when scenario data unavailable (e.g., sellPrivately without market value)
- [06-03]: Lightning bolt emoji (⚡) for crossover markers - simple and clear
- [06-03]: Tooltip sorts scenarios cheapest-first for easy comparison
- [07-01]: Lease transfer added as sixth ScenarioType for marketplace-based lease exit
- [07-01]: Incentive payments conditionally included in line items only when > 0
- [07-01]: Transfer fee warning threshold set at $500 (unusually high)
- [07-01]: Short lease term warning at <6 months remaining (difficult to find transferee)
- [07-03]: PWA manifest uses typed manifest.ts file (not static JSON) for Next.js integration
- [07-03]: Serwist disabled in non-production (process.env.NODE_ENV !== 'production') due to Turbopack incompatibility
- [07-03]: Empty turbopack: {} config added to suppress webpack migration warning
- [07-03]: Service worker uses defaultCache runtime caching for optimal offline behavior
- [07-04]: Mobile uses 2-col grid for option costs, 3-col tablet, 6-col desktop for optimal wrapping
- [07-04]: WCAG 2.5.5 touch target minimum (44px) enforced on interactive elements
- [07-04]: Timeline chart reduced to 300px height on mobile for better fit
- [07-04]: Recharts preserveStartEnd interval for automatic mobile label spacing
- [07-02]: Transfer scenario uses default fees ($400 transfer, $100 marketplace, $150 registration) since DB doesn't capture transfer-specific fields
- [07-02]: Transfer scenario marked incomplete by default with warning to add transfer details
- [07-02]: Transfer is always available in timeline (unlike extension which is lease-end only)
- [07-02]: Chart color --chart-6 assigned to lease transfer for visual consistency
- [07-05]: Runtime dynamic imports in useEffect avoid Turbopack static analysis SSR bundling issues
- [07-05]: Blob download pattern for PDF export provides better error handling than PDFDownloadLink component
- [07-05]: serializeForPDF helper converts Decimal to formatted strings before PDF generation
- [07-05]: Built-in Helvetica font used in PDFs to avoid loading delays
- [07-06]: Primary color darkened from HSL(195,85%,45%) to HSL(195,85%,35%) for 4.56:1 contrast ratio (WCAG AA compliant)
- [07-06]: Focus ring upgraded from 1px to 2px on all interactive components for visible keyboard focus
- [07-06]: id="main-content" added to all page main elements for skip navigation target
- [07-06]: Skip-to-content link uses sr-only + focus:not-sr-only pattern for keyboard-only visibility
- [07-06]: ARIA landmarks (section with aria-label) for major page regions
- [08]: IndexedDB implementation via Dexie.js for client-side data persistence (Phase 8)
- [08]: All server actions removed for static export compatibility (Phase 8)
- [08]: Next.js configured with output: 'export' for GitHub Pages deployment (Phase 8)
- [08]: GitHub Actions workflow configured for automatic deployment to GitHub Pages (Phase 8)

### Pending Todos

~~- Add "switch to client-side storage (IndexedDB) for GitHub Pages deployment" to Phase 7~~ ✓ Complete (Phase 8)

### Blockers/Concerns

- [Research]: KBB/Edmunds have no public API docs -- B2B partnership may be required for Phase 4 valuation integration
- [Research]: Manufacturer-specific early termination formulas differ by lender -- Phase 1 engine should use generic method with strong disclaimers
- [Research]: State/local tax database scope is large (50 states + municipalities) -- consider starting with top 15 states in Phase 1
~~- [01-02]: DATABASE_URL environment variable required before migrations can run (Neon signup needed)~~ — Resolved: Using IndexedDB (no server database needed)

## Session Continuity

Last session: 2026-02-05
Stopped at: Updated planning documents to reflect Phase 8 (GitHub Pages) completion
Resume file: None

**All phases complete (8/8 phases, 33/33 plans).** Application deployed to GitHub Pages and production-ready.
