# Phase 2: Lease Entry and Core UI - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Guided forms for capturing lease data with progressive disclosure and educational tooltips. User can enter a lease starting with 5 essential fields, optionally expand to provide additional details, and persist data across browser sessions. Form validation catches invalid input with clear messaging. This phase does NOT include the comparison view, market value entry, authentication, or multi-lease support.

</domain>

<decisions>
## Implementation Decisions

### Form flow & structure
- Single page with progressive disclosure — 5 essential fields (monthly payment, term, mileage allowance, residual value, current mileage) visible up front
- Expandable "Add more details" section reveals optional fields without leaving the page
- Additional fields organized into grouped sub-sections by domain concept (e.g., financial terms, fees, vehicle info) — Claude determines specific groupings
- Edit in-place — editing overwrites existing lease data, no version history
- Auto-save drafts as user types — form state preserved if browser closes mid-entry, explicit save button to finalize

### Educational tooltips
- Two-layer explanation system: short inline hint text always visible below field label + (?) icon for detailed popover explanation
- Casual and friendly tone — approachable language for everyday car lessees, not finance jargon (e.g., "Think of this as what the dealer thinks your car will be worth when your lease is up")
- Include "where to find this" guidance — tooltips tell users where to find the value in their lease paperwork (e.g., "Look on page 2 of your lease agreement, under Financial Disclosure")
- Complex terms (money factor, cap cost, etc.) include external resource links for deeper dives (Edmunds, NerdWallet, etc.)

### Visual presentation
- Warm and approachable style — rounded corners, softer colors, friendly feel (think Stripe checkout or Robinhood — financial but not intimidating)
- Responsive container: centered card on desktop/tablet, expands to full-width on mobile
- Subtle completeness hint — gentle indicator like "More details improve accuracy" without being pushy or pressure-inducing

### Validation & error UX
- Hybrid validation timing — first pass is judgment-free (no errors while initially filling), real-time validation kicks in after first submit attempt
- Unusual but valid values get yellow warnings ("This seems unusual — double-check this value") but user can proceed — no hard gatekeeping
- Friendly and helpful error tone — guiding, not scolding (e.g., "Hmm, monthly payment should be a positive number. Check your lease for the amount due each month.")

### Claude's Discretion
- Post-save navigation behavior (stay on form vs. navigate to comparison)
- Color palette selection (within warm & approachable direction)
- Specific field grouping within expanded section
- Exact completeness indicator design and copy

</decisions>

<specifics>
## Specific Ideas

- Visual style reference: Stripe checkout or Robinhood — financial but not intimidating
- Tooltip location hints reference real lease document structure (page numbers, section names)
- External educational links to established resources (Edmunds, NerdWallet) for complex terms

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-lease-entry-and-core-ui*
*Context gathered: 2026-01-29*
