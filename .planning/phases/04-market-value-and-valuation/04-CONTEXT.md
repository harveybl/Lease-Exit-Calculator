# Phase 4: Market Value and Valuation - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

User provides their vehicle's current market value through a prominent manual entry flow. The value feeds into equity-dependent comparison scenarios (buyout, sell privately). A provider interface abstracts the value source so future API integrations (KBB, Edmunds) plug in without changing downstream code. Auto-lookup via external APIs is out of scope — no public APIs exist for vehicle valuation without B2B partnerships.

</domain>

<decisions>
## Implementation Decisions

### Value entry experience
- Market value is editable from **both** the lease form and a quick-edit on the comparison page
- On comparison page: prominent call-to-action banner when no value is set ("Add your vehicle's market value for accurate results"); once set, shows display with edit capability
- Entry includes links + tips for looking up value: 2-3 links (KBB, Edmunds, Carvana instant offer) with a brief tip like "Use trade-in value, not private party"
- Educational content follows existing Popover pattern from Phase 2

### Market value freshness
- Values older than **30 days** trigger a nudge: "Your market value may be outdated — consider updating" with a link to edit
- Comparison always shows results regardless of staleness — no blocking, just the age warning
- **Store full history** of market value entries with dates (not just latest) — enables trend visibility and revert capability

### Multi-source display
- When multiple sources exist, **show all sources** with labels (e.g., "KBB Trade-In: $24,500 • Your estimate: $25,000") with the active one highlighted
- **Most recent value wins** — whichever was entered/fetched most recently is used for calculations
- Each source labeled by type with context on what it represents: "Your estimate", "KBB Trade-In", "Carvana Offer", etc.

### Impact on comparison
- **Instant recalculation on save** — user saves market value, comparison updates immediately
- If **no market value entered**, equity-dependent scenarios (buyout, sell privately) show as **incomplete/missing data** — do not use residual as a misleading fallback; prompt user to add market value
- When market value is first added (or changed), **highlight what changed** — e.g., "Sell privately moved from #3 to #1" or show before/after cost deltas
- **Prominent equity display** — show equity as a key number: "Your vehicle has $3,200 in positive equity" — helps users understand why selling wins or losing scenarios cost money

### Claude's Discretion
- Provider interface: whether to support value ranges (low/mid/high) or single point estimates
- Exact layout of multi-source display within the comparison page
- How value history is surfaced (timeline, list, or minimal)
- Loading/transition states during recalculation
- Exact placement of equity display within comparison view

</decisions>

<specifics>
## Specific Ideas

- User initially expected auto-lookup from KBB/Edmunds — research confirmed no public APIs exist (B2B only). Manual entry is the primary path with the architecture ready for future integration.
- The CTA banner pattern for missing market value should feel like a "complete your profile" nudge — helpful, not blocking
- Equity display should make the "why" behind the recommendation immediately obvious

</specifics>

<deferred>
## Deferred Ideas

- Auto-lookup via KBB/Edmunds API — requires B2B partnership, architecture supports future integration
- VIN-based vehicle identification for pre-filling make/model/year — separate capability

</deferred>

---

*Phase: 04-market-value-and-valuation*
*Context gathered: 2026-01-30*
