# Lease Tracker

## What This Is

A web application that helps vehicle lease holders understand their financial options at any point during their lease. It compares all exit paths side-by-side — return the vehicle, sell it privately, buy it out, terminate early, or keep paying — with a month-by-month timeline showing how each option's cost shifts over the life of the lease.

## Core Value

Show the user the smartest financial move for their vehicle lease right now, and when a better window might open up.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Enter and store vehicle lease details (monthly payment, residual value, buyout amount, term, mileage allowance, disposition fee)
- [ ] Guided entry that explains each lease cost (disposition fee, excess mileage, wear charges) with ability to override
- [ ] Get current market value via auto-lookup (KBB/Edmunds) with manual override
- [ ] Side-by-side comparison of all exit options: return, sell privately, buy out, early termination, keep paying
- [ ] Month-by-month timeline showing how each option's financial outcome changes over the remaining lease term
- [ ] Quick snapshot view — "what's the best move today?"
- [ ] Full early termination analysis: penalties, remaining payments, total cost vs. riding out the lease
- [ ] Track multiple leases over time
- [ ] Persistent data storage — saved between sessions
- [ ] User accounts (personal tool, potentially shareable later)

### Out of Scope

- Native mobile app — web-first, mobile can come later
- Multi-user/public platform features — starting as a personal tool
- Dealer negotiation tools — focused on the math, not the negotiation
- Lease shopping/new lease comparison — this is about managing existing leases

## Context

- The user is currently in a 3-year GMC Sierra lease, less than a year in, and already wants out
- The core frustration: not knowing whether it's financially smarter to eat the early termination cost, wait for a better window, or ride it out
- Vehicle market values fluctuate — the app needs to account for the fact that a vehicle might be worth more or less than the residual at different points
- Key financial variables: remaining payments, early termination penalty, disposition fee, excess mileage charges, wear-and-tear charges, current market value, residual value, buyout price
- This is a problem most lease holders face but few tools address comprehensively

## Constraints

- **Platform**: Web application (accessible from any browser)
- **Data**: Needs persistent storage for lease tracking over time
- **Market Data**: Requires vehicle valuation source (KBB, Edmunds, or similar) — API availability and cost TBD during research
- **Auth**: Lightweight auth needed for data persistence, but no complex user management initially

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web-first, no mobile app | Reduce scope, browser works everywhere | — Pending |
| Personal tool before public | Solve own problem first, validate before scaling | — Pending |
| Auto-lookup + manual override for market value | Best of both worlds — convenience with accuracy control | — Pending |
| Guided lease entry with overrides | Not everyone knows what a disposition fee is, but experts shouldn't be slowed down | — Pending |

---
*Last updated: 2026-01-28 after initialization*
