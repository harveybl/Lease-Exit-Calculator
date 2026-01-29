# Phase 3: Comparison View - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Display all five exit options (return, buyout, sell privately, early termination, keep paying) side-by-side with transparent cost breakdowns and a clear recommendation for the best financial move today. Uses existing calculation engine from Phase 1 and saved lease data from Phase 2. Timeline visualization, market value entry, and authentication are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Comparison layout
- Ranked vertical list ordered best-to-worst (not cards in a row or table grid)
- Each option row shows: option name, total cost, and rank badge — minimal before expanding
- All five options shown with equal visual weight — no dimming or collapsing of worse options
- Ranking alone communicates which is best; visual emphasis reserved for the #1 option

### Recommendation presentation
- Direct financial tone — "Selling privately saves $2,400 vs. returning." Pure numbers, no conversational frills
- Best option always compared against "Return the vehicle" as the baseline (what most people would do by default)
- When two options are within ~$100: show a tie note acknowledging both are strong choices (e.g., "Buyout and selling privately are within $100 — either is a strong choice")
- Include brief practical caveats when relevant (e.g., "Selling privately is best, but requires finding a buyer")

### Cost breakdown display
- Line items grouped by category (e.g., "Lease Fees," "Taxes," "Transaction Costs") — not a flat list
- Positive amounts (money back / equity) shown in green with descriptive label: "You receive: $3,200" — plain-English, not accounting notation
- Educational tooltips on all line items, same pattern as the lease entry form (popover with plain-English explanation)
- Bottom of each breakdown shows: "Total costs: $X" and "Total credits: $Y" then "Net: $Z" — subtotals before net, making the math transparent

### Snapshot summary (hero card)
- Large hero card at the top of the page, above the ranked list — immediately visible
- Contains: best option name, its total cost, savings vs. returning, and a mini row of all 5 option totals for quick comparison
- Include brief caveat in hero card when applicable (e.g., "Sell Privately saves $2,400 — requires finding a buyer")
- Tie note appears in hero card when top options are close

### Claude's Discretion
- Visual treatment for distinguishing the #1 option from others (accent border, elevation, badge — Claude picks)
- Hero card metadata (lease name, calculation date, or neither)
- Exact category groupings for cost breakdown line items
- Threshold for "close enough" to trigger tie note (approximately $100, Claude refines)
- Expand/collapse interaction pattern for option detail rows
- Mobile responsive behavior for the ranked list and hero card

</decisions>

<specifics>
## Specific Ideas

- The comparison baseline is always "return the vehicle" — this is what a typical lessee would do, so savings are framed relative to that default action
- Tie note is important because it signals intellectual honesty — the tool acknowledges when precision has limits
- Caveats should be one-line practical notes, not disclaimers or warnings — they help the user act on the recommendation
- Educational tooltips carry forward from Phase 2's pattern: same popover component, same plain-English approach

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-comparison-view*
*Context gathered: 2026-01-29*
