---
phase: 04-market-value-and-valuation
verified: 2026-01-30T20:15:00Z
status: passed
score: 4/4 must-haves verified
must_haves:
  truths:
    - "User can enter a market value manually and it immediately updates the comparison results"
    - "Manual value entry is the primary, visible path -- not hidden behind an auto-lookup button"
    - "A valuation provider interface exists so that adding KBB or Edmunds integration later does not require changing components that consume market value"
    - "The displayed market value shows when it was last updated and includes a disclaimer about estimate accuracy"
  artifacts:
    - path: "src/lib/db/schema.ts"
      provides: "marketValues table schema with Drizzle ORM relations"
    - path: "src/lib/services/valuation/provider.ts"
      provides: "ValuationProvider interface and ValuationResult type"
    - path: "src/lib/services/valuation/manual-provider.ts"
      provides: "ManualValuationProvider implementing ValuationProvider"
    - path: "src/lib/services/valuation/index.ts"
      provides: "getValuationProvider factory with switch on source"
    - path: "src/lib/validations/market-value-schema.ts"
      provides: "Zod schema for market value form data"
    - path: "src/lib/utils/staleness.ts"
      provides: "checkValueStaleness utility with relative time formatting"
    - path: "src/lib/calculations/evaluate-all.ts"
      provides: "evaluateAllScenarios accepts optional estimatedSalePrice, incomplete flagging, equity calculation"
    - path: "src/lib/types/scenario.ts"
      provides: "ScenarioResult.incomplete optional field"
    - path: "src/app/lease/actions.ts"
      provides: "createMarketValue, getLatestMarketValue, getMarketValueHistory server actions"
    - path: "src/app/lease/[id]/compare/page.tsx"
      provides: "Server component fetching latest market value and passing to ComparisonView"
    - path: "src/components/comparison/ComparisonView.tsx"
      provides: "Conditional MarketValueBanner vs MarketValueDisplay rendering"
    - path: "src/components/comparison/HeroSummary.tsx"
      provides: "EquityDisplay rendering, 'Some options are estimates' note"
    - path: "src/components/comparison/OptionCard.tsx"
      provides: "Incomplete scenario '?' badge and opacity-60 treatment"
    - path: "src/components/comparison/MarketValueBanner.tsx"
      provides: "Prominent CTA form for entering market value"
    - path: "src/components/comparison/MarketValueDisplay.tsx"
      provides: "Value display with inline edit, staleness, and disclaimer"
    - path: "src/components/comparison/EquityDisplay.tsx"
      provides: "Equity amount with positive/negative/near-zero states"
    - path: "src/__tests__/lib/calculations/evaluate-all.test.ts"
      provides: "10 tests covering market value integration, incomplete flagging, equity, sorting"
    - path: "drizzle/migrations/0001_aromatic_catseye.sql"
      provides: "SQL migration creating market_values table with FK to leases"
  key_links:
    - from: "compare/page.tsx"
      to: "actions.ts (getLatestMarketValue)"
      via: "import and await call in RSC"
    - from: "compare/page.tsx"
      to: "evaluate-all.ts (getComparisonData)"
      via: "import and call with optional estimatedSalePrice"
    - from: "ComparisonView.tsx"
      to: "MarketValueBanner / MarketValueDisplay"
      via: "conditional render based on marketValue prop"
    - from: "MarketValueBanner.tsx"
      to: "actions.ts (createMarketValue)"
      via: "import + startTransition + await in onSubmit"
    - from: "MarketValueDisplay.tsx"
      to: "actions.ts (createMarketValue)"
      via: "import + startTransition + await in handleSave"
    - from: "HeroSummary.tsx"
      to: "EquityDisplay.tsx"
      via: "conditional render when data.equity exists"
    - from: "evaluate-all.ts"
      to: "scenario.ts (incomplete field)"
      via: "sets sellPrivatelyResult.incomplete = true when no market value"
gaps: []
---

# Phase 4: Market Value and Valuation Verification Report

**Phase Goal:** A user can record their vehicle's current market value with a prominent manual entry flow, and the system architecture supports future API integration without code changes to the comparison view.
**Verified:** 2026-01-30T20:15:00Z
**Status:** PASSED
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can enter a market value manually and it immediately updates the comparison results | VERIFIED | MarketValueBanner.tsx has form with onSubmit calling createMarketValue server action via useTransition. Server action validates with Zod, inserts into market_values table, calls revalidatePath. Compare page.tsx fetches latest value and passes to getComparisonData which uses it as estimatedSalePrice. |
| 2 | Manual value entry is the primary, visible path -- not hidden behind an auto-lookup button | VERIFIED | ComparisonView.tsx renders MarketValueBanner prominently above HeroSummary when no market value exists. Banner has prominent "Add Your Vehicle's Market Value" heading with inline form. No auto-lookup UI exists. |
| 3 | A valuation provider interface exists so adding KBB/Edmunds later does not require changing components | VERIFIED | ValuationProvider interface in provider.ts defines getMarketValue(). ManualValuationProvider implements it. getValuationProvider() factory in index.ts switches on source with slots for 'kbb', 'edmunds', 'carvana'. Components consume market value via server actions and ComparisonData type -- they never import provider types directly. |
| 4 | Displayed market value shows when it was last updated and includes a disclaimer about estimate accuracy | VERIFIED | MarketValueDisplay.tsx calls checkValueStaleness(marketValue.createdAt) to get relativeTime, shows "Your estimate . Updated {relativeTime}". Shows staleness warning when > 30 days. Shows disclaimer: "Market values are estimates and may vary by condition, location, and market conditions." |

**Score:** 4/4 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/db/schema.ts` | marketValues table | VERIFIED | 76 lines. Table with id, leaseId (FK cascade), value (decimal), source, sourceLabel, sourceMetadata, timestamps. Relations defined for leases <-> marketValues. |
| `drizzle/migrations/0001_aromatic_catseye.sql` | SQL migration | VERIFIED | 26 lines. CREATE TABLE market_values with FK constraint. Also alters leases to make fields nullable (progressive disclosure from Phase 2). |
| `src/lib/services/valuation/provider.ts` | ValuationProvider interface | VERIFIED | 20 lines. Exports ValuationResult interface (value, source, sourceLabel, confidence, metadata) and ValuationProvider interface with getMarketValue() method. |
| `src/lib/services/valuation/manual-provider.ts` | ManualValuationProvider | VERIFIED | 19 lines. Implements ValuationProvider. getMarketValue() returns null (manual doesn't auto-fetch). createManualEntry() creates ValuationResult with Decimal value. |
| `src/lib/services/valuation/index.ts` | Provider factory | VERIFIED | 19 lines. getValuationProvider() factory with switch for manual/kbb/edmunds/carvana. Exports types and provider. |
| `src/lib/validations/market-value-schema.ts` | Zod schema | VERIFIED | 14 lines. Validates value (positive, max 500k), source enum, optional sourceLabel. Shared between client and server. |
| `src/lib/utils/staleness.ts` | Staleness utility | VERIFIED | 37 lines. STALE_THRESHOLD_DAYS=30. checkValueStaleness() returns isStale, message, relativeTime, daysSinceUpdate. formatRelativeTime() handles today/yesterday/days/weeks/months. |
| `src/lib/calculations/evaluate-all.ts` | Market value integration | VERIFIED | 219 lines. evaluateAllScenarios() accepts optional estimatedSalePrice. Sets sellPrivately.incomplete=true when missing. Sorts incomplete last. getComparisonData() calculates equity when market value provided. hasMarketValue flag in ComparisonData. |
| `src/lib/types/scenario.ts` | incomplete field | VERIFIED | 51 lines. ScenarioResult has `incomplete?: boolean` optional field. |
| `src/app/lease/actions.ts` | Market value server actions | VERIFIED | 344 lines. createMarketValue (Zod validation, Decimal conversion, DB insert, revalidatePath), getLatestMarketValue (ordered by createdAt desc, limit 1), getMarketValueHistory (limit 20). |
| `src/app/lease/[id]/compare/page.tsx` | Data fetching | VERIFIED | 61 lines. Fetches lease and getLatestMarketValue. Converts to Decimal. Passes to getComparisonData. Passes marketValue and leaseId to ComparisonView. |
| `src/components/comparison/ComparisonView.tsx` | Conditional rendering | VERIFIED | 43 lines. Renders MarketValueDisplay when marketValue exists, MarketValueBanner when null. Both above HeroSummary. |
| `src/components/comparison/HeroSummary.tsx` | Equity + incomplete note | VERIFIED | 94 lines. Renders EquityDisplay when data.equity exists. Shows "Some options are estimates" when !data.hasMarketValue. |
| `src/components/comparison/OptionCard.tsx` | Incomplete treatment | VERIFIED | 103 lines. Reads scenario.incomplete. Shows "?" badge + opacity-60 + "Needs market value" text for incomplete scenarios. |
| `src/components/comparison/MarketValueBanner.tsx` | Entry form | VERIFIED | 137 lines. Prominent card with heading, input, submit button. Validates with marketValueSchema. Calls createMarketValue via useTransition. Info popover with KBB/Edmunds/Carvana links. |
| `src/components/comparison/MarketValueDisplay.tsx` | Display + inline edit | VERIFIED | 212 lines. Shows formatted value, source label, relative time. Pencil edit button with Check/X save/cancel. Staleness warning. Accuracy disclaimer. Calls createMarketValue for edits (preserves history). |
| `src/components/comparison/EquityDisplay.tsx` | Equity visualization | VERIFIED | 56 lines. Handles positive/negative/near-zero ($50 threshold). Color-coded (primary for positive, destructive for negative). Explains equity = market value minus buyout cost. |
| `src/__tests__/lib/calculations/evaluate-all.test.ts` | Tests | VERIFIED | 210 lines, 10 tests. Covers: market value used for sell-privately, not incomplete when provided, incomplete flagging when missing, sorting incomplete last, bestOption excludes incomplete, positive equity, negative equity, hasMarketValue flag, sorting mixed complete/incomplete. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| compare/page.tsx | actions.ts (getLatestMarketValue) | import + await | WIRED | Line 4: import, Line 28: await call with lease id |
| compare/page.tsx | evaluate-all.ts (getComparisonData) | import + call | WIRED | Line 5: import, Line 33: call with lease and optional estimatedSalePrice |
| compare/page.tsx | ComparisonView | JSX render | WIRED | Lines 54-58: passes data, marketValue, leaseId props |
| ComparisonView.tsx | MarketValueBanner / MarketValueDisplay | conditional render | WIRED | Lines 24-28: ternary on marketValue prop |
| MarketValueBanner.tsx | actions.ts (createMarketValue) | import + useTransition | WIRED | Line 13: import, Lines 39-46: startTransition with await createMarketValue |
| MarketValueDisplay.tsx | actions.ts (createMarketValue) | import + useTransition | WIRED | Line 13: import, Lines 64-73: startTransition with await createMarketValue |
| MarketValueDisplay.tsx | staleness.ts | import + call | WIRED | Line 16: import, Line 37: checkValueStaleness(marketValue.createdAt) |
| HeroSummary.tsx | EquityDisplay.tsx | conditional render | WIRED | Line 11: import, Lines 80-84: renders when data.equity exists |
| evaluate-all.ts | scenario.ts (incomplete) | field assignment | WIRED | Line 97: sets sellPrivatelyResult.incomplete = true when no estimatedSalePrice |
| MarketValueBanner.tsx | market-value-schema.ts | import + validation | WIRED | Line 14: import, Line 30: safeParse before submit |
| MarketValueDisplay.tsx | market-value-schema.ts | import + validation | WIRED | Line 14: import, Line 55: safeParse before save |
| actions.ts (createMarketValue) | market-value-schema.ts | import + validation | WIRED | Line 7: import, Line 266: safeParse server-side |

### Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| VALU-01: User can manually enter current market value | SATISFIED | None -- MarketValueBanner form calls createMarketValue, page revalidates |
| VALU-02: Manual value override is prominent | SATISFIED | None -- MarketValueBanner renders first in ComparisonView, prominent heading and form |
| VALU-03: Valuation service abstraction layer with provider interface | SATISFIED | None -- ValuationProvider interface, ManualValuationProvider, getValuationProvider factory |
| VALU-04: Value display includes last updated timestamp and accuracy disclaimers | SATISFIED | None -- relativeTime display, staleness warning, accuracy disclaimer text |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | - | - | - | No anti-patterns detected across all 17 Phase 4 artifacts |

No TODO/FIXME comments, no placeholder content, no empty implementations, no stub patterns found. The only `return null` (ManualValuationProvider.getMarketValue()) is intentional design -- manual provider does not auto-fetch.

### Human Verification Required

### 1. Visual Appearance of Market Value Flow

**Test:** Navigate to a lease comparison page with no market value. Verify the MarketValueBanner is visually prominent with clear CTA.
**Expected:** Card with border-primary, "Add Your Vehicle's Market Value" heading, dollar-sign input, Save button. Should be the first thing visible above the HeroSummary.
**Why human:** Visual prominence and layout cannot be verified programmatically.

### 2. End-to-End Market Value Entry

**Test:** Enter a market value (e.g., $25,000) in the banner form and click Save.
**Expected:** Banner disappears, replaced by MarketValueDisplay showing "$25,000.00 / Your estimate / Updated today". Sell Privately scenario updates from incomplete to complete with new ranking. EquityDisplay appears in HeroSummary.
**Why human:** Full server action round-trip with revalidation requires a running app with database.

### 3. Inline Edit Flow

**Test:** Click the pencil icon on MarketValueDisplay, change value, click check to save.
**Expected:** Input appears with current value pre-filled. Saving shows updated value. Cancel (X) reverts without saving.
**Why human:** Stateful edit interaction requires browser testing.

### 4. Staleness Warning

**Test:** Create a market value entry with a date > 30 days ago (or wait/modify DB).
**Expected:** Amber warning appears: "Your market value may be outdated -- consider updating".
**Why human:** Requires time-dependent state or DB manipulation.

### Gaps Summary

No gaps found. All four observable truths from the ROADMAP success criteria are verified at all three levels (exists, substantive, wired):

1. **Manual market value entry with immediate comparison update** -- Full data flow verified from MarketValueBanner form through createMarketValue server action to database insert to page revalidation to getComparisonData with estimatedSalePrice to updated scenario results.

2. **Prominent manual entry path** -- MarketValueBanner renders first in ComparisonView above HeroSummary with clear heading and inline form. No auto-lookup UI exists anywhere.

3. **Provider abstraction for future API integration** -- ValuationProvider interface with ManualValuationProvider implementation and getValuationProvider factory. Components consume market value through server actions and ComparisonData, never touching provider internals. Adding KBB/Edmunds requires only a new class implementing ValuationProvider.

4. **Last updated timestamp and accuracy disclaimer** -- MarketValueDisplay uses checkValueStaleness for relative time, shows source label, staleness warning when > 30 days, and static disclaimer about estimate variability.

Test coverage: 141 tests all passing (15 suites), including 10 new tests covering market value integration, incomplete scenario flagging, equity calculation, and sorting behavior.

---

*Verified: 2026-01-30T20:15:00Z*
*Verifier: Claude (gsd-verifier)*
