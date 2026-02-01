---
phase: 07-polish-export-and-growth
verified: 2026-01-31T19:40:00Z
status: gaps_found
score: 4/5 must-haves verified
gaps:
  - truth: "Lease transfer/swap appears as a sixth option in the comparison view with transfer fees, registration costs, and timeline implications included"
    status: partial
    reason: "Lease transfer is fully wired into comparison view and timeline chart, but --chart-6 CSS variable is never defined in globals.css (only --chart-1 through --chart-5 exist). The timeline chart Line component references hsl(var(--chart-6)) which resolves to an undefined variable, so the lease transfer line may be invisible or render with an incorrect fallback color."
    artifacts:
      - path: "src/app/globals.css"
        issue: "Missing --chart-6 CSS variable definition in both :root and .dark selectors"
    missing:
      - "Add --chart-6 CSS variable to :root block in globals.css (e.g., --chart-6: 200 70% 50%;)"
      - "Add --chart-6 CSS variable to .dark block in globals.css"
---

# Phase 7: Polish, Export, and Growth Verification Report

**Phase Goal:** The application is production-ready with export capabilities, mobile-optimized layout, installability, accessibility compliance, and lease transfer as a sixth comparison option.
**Verified:** 2026-01-31T19:40:00Z
**Status:** gaps_found
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can export a comparison summary to PDF that includes all options, cost breakdowns, and the recommendation | VERIFIED | `src/lib/pdf/comparison-pdf.tsx` (285 lines) renders Document with heading, recommendation, all scenarios with line items, warnings, and disclaimers. `src/components/comparison/ExportButton.tsx` (76 lines) lazy-loads react-pdf via runtime import, generates blob, triggers download. Wired into `ComparisonView.tsx` line 79. `serializeForPDF()` converts all Decimal values to formatted strings. |
| 2 | The comparison view is usable on a phone screen (responsive layout, no horizontal scrolling of critical data) | VERIFIED | `HeroSummary.tsx` uses `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6` (line 67). `OptionCard.tsx` has `shrink-0` on cost display (line 67), `min-h-[44px]` touch target (line 77). `ComparisonView.tsx` uses `py-4 md:py-8` (line 76). `TimelineChart.tsx` uses `min-h-[300px] md:min-h-[400px]` (line 69), reduced margins (line 74). `TimelineTooltip.tsx` has `max-w-[280px]` (line 38), `truncate` on names (line 51). |
| 3 | The app can be installed to a phone home screen via PWA and loads without a network connection for cached data | VERIFIED | `src/app/manifest.ts` (18 lines) defines name, display: standalone, icons at 192/512/maskable. `src/app/sw.ts` (21 lines) uses Serwist with precaching, skipWaiting, clientsClaim, navigationPreload, defaultCache runtime caching. `next.config.ts` wraps config with withSerwist, swSrc/swDest configured, disabled in non-production. Icons exist at `public/icons/` (3 files). `@serwist/next` and `serwist` in package.json. `layout.tsx` has themeColor metadata. |
| 4 | Keyboard navigation reaches all interactive elements, screen readers announce comparison data meaningfully, and no accessibility violations remain at WCAG 2.1 AA level | VERIFIED | Skip-to-content link in `layout.tsx` (lines 18-23) with sr-only/focus:not-sr-only pattern. `id="main-content"` on all 8 page `<main>` elements. Global `*:focus-visible` style with 2px solid primary outline in `globals.css` (lines 141-144). Primary color darkened to HSL(195,85%,35%) for 4.56:1 contrast (line 60). `button.tsx` and `input.tsx` and `textarea.tsx` all have `focus-visible:ring-2`. ARIA: `section aria-label` regions in ComparisonView, `role="status"` on tie message, `role="alert"` on warnings, `aria-expanded` on collapsibles, `aria-label` on badges, `sr-only` context on cost values and credits in LineItemsBreakdown. |
| 5 | Lease transfer/swap appears as a sixth option in the comparison view with transfer fees, registration costs, and timeline implications included | PARTIAL | Calculation: `evaluateLeaseTransferScenario` (123 lines) computes transferFee + marketplaceFee + registrationFee + incentivePayments with warnings. 8 tests passing. `LeaseTransferResult` type defined in `scenario.ts` (lines 53-60). Wired into `evaluate-all.ts` (lines 121-136) with default fees, marked incomplete. Wired into `timeline.ts` (lines 98-108, 118, 151, 163) for month-by-month projection. TimelineChart has leaseTransfer Line (lines 146-153) and config entry (lines 44-47). **GAP:** `--chart-6` CSS variable used by TimelineChart is NOT defined in `globals.css`. Only `--chart-1` through `--chart-5` are defined. The lease transfer line on the timeline chart will render with an undefined/missing color. |

**Score:** 4/5 truths verified (1 partial)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/calculations/scenarios/lease-transfer.ts` | Lease transfer scenario evaluator | VERIFIED | 123 lines, pure function, calculates all fees, conditional warnings, exports properly |
| `src/__tests__/lib/calculations/scenarios/lease-transfer.test.ts` | Tests for lease transfer | VERIFIED | 189 lines, 8 test cases, all passing |
| `src/lib/types/scenario.ts` | ScenarioType includes 'lease-transfer', LeaseTransferResult interface | VERIFIED | 'lease-transfer' in union (line 4), LeaseTransferResult interface (lines 53-60) |
| `src/lib/calculations/evaluate-all.ts` | Calls evaluateLeaseTransferScenario | VERIFIED | Lines 121-136, default fees ($400/$100/$150), marked incomplete |
| `src/lib/calculations/timeline.ts` | Lease transfer in timeline projections | VERIFIED | Lines 98-108 evaluates, line 118 adds to costs, line 151 converts, line 163 in scenarios array |
| `src/components/timeline/TimelineChart.tsx` | Lease transfer line in chart | PARTIAL | leaseTransfer config (lines 44-47), Line component (lines 146-153), but references undefined `--chart-6` |
| `src/lib/pdf/comparison-pdf.tsx` | PDF document component | VERIFIED | 285 lines, renders all scenarios with line items, recommendation, warnings, disclaimers |
| `src/components/comparison/ExportButton.tsx` | Export button with lazy loading | VERIFIED | 76 lines, runtime dynamic import, blob download, loading states |
| `src/components/comparison/ComparisonView.tsx` | Wires ExportButton and serializeForPDF | VERIFIED | ExportButton imported and rendered (lines 7, 78-80), serializeForPDF helper (lines 17-56) |
| `src/app/manifest.ts` | PWA manifest | VERIFIED | 18 lines, name/display/icons/theme_color properly configured |
| `src/app/sw.ts` | Service worker | VERIFIED | 21 lines, Serwist with precaching, skipWaiting, clientsClaim, navigationPreload, defaultCache |
| `next.config.ts` | withSerwist wrapping, serverExternalPackages | VERIFIED | 17 lines, both Serwist and react-pdf configurations present |
| `public/icons/icon-192.png` | PWA icon 192x192 | VERIFIED | Exists, 1248 bytes |
| `public/icons/icon-512.png` | PWA icon 512x512 | VERIFIED | Exists, 3303 bytes |
| `public/icons/icon-maskable.png` | Maskable PWA icon | VERIFIED | Exists, 3322 bytes |
| `src/components/comparison/HeroSummary.tsx` | Responsive grid layout | VERIFIED | `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6` (line 67) |
| `src/components/comparison/OptionCard.tsx` | Touch targets, ARIA | VERIFIED | `min-h-[44px]` (line 77), aria-expanded, aria-label, role="alert" |
| `src/app/layout.tsx` | Skip nav, themeColor | VERIFIED | Skip-to-content link (lines 18-23), themeColor metadata (line 7) |
| `src/app/globals.css` | Focus styles, color contrast | VERIFIED | focus-visible 2px (lines 141-144), primary HSL(195,85%,35%) (line 60) |
| `src/components/ui/button.tsx` | focus-visible:ring-2 | VERIFIED | Line 8 includes `focus-visible:ring-2` |
| `src/components/ui/input.tsx` | focus-visible:ring-2 | VERIFIED | Line 14 includes `focus-visible:ring-2` |
| `src/components/ui/textarea.tsx` | focus-visible:ring-2 | VERIFIED | Line 13 includes `focus-visible:ring-2` |
| `src/app/globals.css` (--chart-6) | Chart color for lease transfer | MISSING | `--chart-6` is not defined in :root or .dark. Only --chart-1 through --chart-5 exist |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| ExportButton | ComparisonPDF | Runtime dynamic import | WIRED | `import('@/lib/pdf/comparison-pdf')` in useEffect (line 31), calls `pdf(<ComparisonPDF data={data} />)` |
| ComparisonView | ExportButton | JSX render | WIRED | Import (line 7), render (line 79), serializeForPDF passes data |
| evaluate-all.ts | evaluateLeaseTransferScenario | Function call | WIRED | Import (line 10), call (lines 121-130), result in scenarios array (line 145) |
| timeline.ts | evaluateLeaseTransferScenario | Function call | WIRED | Import (line 11), call (lines 99-108), cost in return object (line 118) |
| TimelineChart | leaseTransfer data | Recharts Line dataKey | WIRED | Config entry (line 44), Line component (line 148), dataKey="leaseTransfer" |
| TimelineChart | --chart-6 CSS var | hsl(var(--chart-6)) | NOT WIRED | CSS variable never defined in globals.css |
| layout.tsx | #main-content | Skip nav href | WIRED | `href="#main-content"` (line 19), id present on all 8 page main elements |
| next.config.ts | Serwist | withSerwist wrapper | WIRED | Import (line 2), init (lines 4-8), wrap (line 17) |
| manifest.ts | PWA icons | src paths | WIRED | Icons exist at /public/icons/ with matching filenames |

### Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| PLSH-01: Export comparison results to PDF | SATISFIED | None |
| PLSH-02: Responsive layout for desktop and mobile | SATISFIED | None |
| PLSH-03: PWA support for add to home screen | SATISFIED | None |
| PLSH-04: Accessibility audit (ARIA, keyboard, screen reader) | SATISFIED | None |
| PLSH-05: Lease transfer/swap as additional exit option | PARTIAL | Missing --chart-6 CSS variable causes lease transfer timeline line to have undefined color |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/app/globals.css` | N/A | Missing `--chart-6` variable | Warning | Lease transfer line in timeline chart has undefined color |
| `src/lib/calculations/evaluate-all.ts` | 81 | Comment says "conservative placeholder" | Info | Not a code issue, just a comment about default value strategy |

### Human Verification Required

### 1. PDF Export End-to-End
**Test:** Navigate to a lease comparison page, click "Export PDF", wait for "Download PDF" button, click again to download. Open the PDF.
**Expected:** PDF contains vehicle heading, recommendation with best option name and savings description, all 6 scenarios with line items and costs, warnings for incomplete scenarios, and disclaimers.
**Why human:** Cannot verify PDF rendering and download flow programmatically. Need to confirm layout, readability, and completeness of generated PDF.

### 2. Mobile Responsive Layout
**Test:** Open comparison page and timeline page on a phone (or browser at 375px width). Scroll through all content.
**Expected:** No horizontal scrollbar on critical data. Option costs wrap in 2-column grid. Timeline chart is visible and properly sized. Tooltip is readable. Touch targets are large enough to tap.
**Why human:** CSS breakpoints and responsive behavior require visual verification. Grep can confirm classes exist but not their visual rendering.

### 3. PWA Installation
**Test:** Build production app (`npm run build && npm start`), open in Chrome/Safari on a phone, look for "Add to Home Screen" prompt or install option in browser menu.
**Expected:** App installs to home screen with teal icon. Opens in standalone mode (no browser chrome). Subsequent visits after going offline still load the app shell with cached data.
**Why human:** PWA installation and offline behavior require a real device or production build. Service worker is disabled in development.

### 4. Screen Reader Announcement
**Test:** Use VoiceOver (macOS/iOS) or NVDA (Windows) to navigate the comparison page.
**Expected:** Skip-to-content link is announced on Tab. ARIA landmarks (Recommendation summary, Exit options comparison, Disclaimers) are navigable. Badge ranks and cost values have context (e.g., "Ranked 1 of available options", "Buyout total cost: $25,000"). Collapsible triggers announce expanded/collapsed state.
**Why human:** Screen reader behavior depends on assistive technology implementation. ARIA attributes are present but announcement quality needs human evaluation.

### 5. Lease Transfer Timeline Line Color
**Test:** Navigate to a lease timeline page and check if the lease transfer line is visible on the chart.
**Expected:** Lease transfer should appear as a distinctly colored line. Currently `--chart-6` is undefined, so the line may be invisible or render in a browser default.
**Why human:** Unclear what browsers do with `hsl()` when the CSS variable is undefined. May render black, transparent, or not at all.

### Gaps Summary

One gap was identified: the `--chart-6` CSS custom property is referenced in `TimelineChart.tsx` for the lease transfer scenario line but is never defined in `globals.css`. The CSS file defines `--chart-1` through `--chart-5` in both `:root` and `.dark` selectors, but omits `--chart-6`. This means `hsl(var(--chart-6))` resolves to `hsl()` with empty arguments, causing the lease transfer line on the timeline chart to render with an undefined or fallback color (potentially invisible).

The fix is minimal: add two lines to `globals.css` -- one `--chart-6` definition in `:root` and one in `.dark`. This is a CSS-only change that does not affect any logic, tests, or other components.

All other Phase 7 deliverables are fully verified:
- PDF export is substantive and completely wired (lazy-loaded, serialization boundary, blob download)
- PWA manifest, service worker, and icons are properly configured
- Mobile responsiveness uses proper breakpoint classes and touch targets
- Accessibility has skip navigation on all pages, 2px focus rings, 4.56:1 contrast ratio, comprehensive ARIA attributes, and semantic HTML

**Test suite:** 182/182 tests passing (19 test files, 0 failures).

---

_Verified: 2026-01-31T19:40:00Z_
_Verifier: Claude (gsd-verifier)_
