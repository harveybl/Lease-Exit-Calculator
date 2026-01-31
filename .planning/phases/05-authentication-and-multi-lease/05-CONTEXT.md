# Phase 5: Authentication and Multi-Lease - Context

**Gathered:** 2026-01-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Users get personal accounts via Clerk so their lease data is private, portable across devices, and they can track more than one vehicle. Unauthenticated visitors cannot access lease data or comparison views. This phase adds auth, user-scoped data, and multi-lease support. Timeline visualization, export, and PWA are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion

The user delegated all implementation decisions for this phase to Claude. The following areas were discussed and Claude has flexibility to choose the best approach for each:

**Existing data migration:**
- How to handle leases created before auth existed (claim prompt, fresh start, or auto-association)
- Whether unauthenticated visitors can use the app at all or if the entire app is behind a login wall
- First-time user empty state (simple CTA vs guided onboarding)
- Clerk sign-in method selection (email + Google, Google only, etc.)

**Multi-lease navigation:**
- How users switch between leases (lease list as home, dropdown selector, etc.)
- Whether to impose a lease count limit
- How expired leases are handled (stay visible, archive section, etc.)
- Level of detail shown on lease list entries (rich preview vs minimal identifiers)

**Auth flow and gates:**
- Whether to include a landing/marketing page or go straight to login
- Where account controls live (header avatar, sidebar, etc.)
- Whether to use Clerk's pre-built components or custom-styled forms
- Post-login landing destination (lease list, last viewed lease, etc.)

**Lease identity and display:**
- How leases are identified (structured vehicle fields, user-given name, or both)
- Visual differentiation between leases (colors, icons, text only)
- Delete behavior (hard delete with existing two-click confirmation vs soft delete)
- Whether to add optional vehicle info fields (VIN, make, model, year, trim) for future API lookups

</decisions>

<specifics>
## Specific Ideas

No specific requirements -- open to standard approaches. User trusts Claude to make pragmatic choices that fit the existing design language and UX patterns established in Phases 1-4.

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope.

</deferred>

---

*Phase: 05-authentication-and-multi-lease*
*Context gathered: 2026-01-31*
