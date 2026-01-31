---
phase: 05-authentication-and-multi-lease
plan: 02
subsystem: database
tags: [drizzle, postgres, clerk, schema, migration, foreign-key]

# Dependency graph
requires:
  - phase: 01-foundation-and-calculation-engine
    provides: Database schema with leases and marketValues tables
  - phase: 02-lease-entry-and-core-ui
    provides: Lease creation and management flows
provides:
  - users table with Clerk-compatible text ID
  - userId foreign key on leases table (nullable, cascade delete)
  - Database schema ready for user-scoped data isolation
  - Drizzle migration ready to apply
affects: [05-03-migrate-existing-data, 05-04-clerk-setup, 05-05-auth-middleware, 05-06-user-scoped-queries]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Clerk user ID stored as text (not UUID) for external auth provider compatibility
    - Nullable foreign keys for gradual migration from pre-auth to auth-enabled state
    - Cascade delete configured at schema level (deleting user removes their data)

key-files:
  created:
    - drizzle/migrations/0002_nasty_sister_grimm.sql
  modified:
    - src/lib/db/schema.ts
    - src/__tests__/lib/calculations/evaluate-all.test.ts

key-decisions:
  - "userId is nullable initially - existing test leases can be claimed or deleted"
  - "Cascade delete from users to leases to marketValues (via existing FK) ensures clean data removal"
  - "Text ID for users.id (not UUID) matches Clerk's string-based user IDs"

patterns-established:
  - "External auth provider IDs stored as text primary keys (not UUIDs)"
  - "Relations defined bidirectionally (users→leases, leases→user) for Drizzle query capabilities"

# Metrics
duration: 1m 30s
completed: 2026-01-31
---

# Phase 05 Plan 02: Database Schema - Users and User ID Summary

**Users table with Clerk-compatible text ID and nullable userId foreign key on leases, ready for user-scoped data isolation**

## Performance

- **Duration:** 1m 30s
- **Started:** 2026-01-31T20:27:40Z
- **Completed:** 2026-01-31T20:29:10Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Users table added to schema with Clerk-compatible text ID (string, not UUID)
- Nullable userId column added to leases with cascade delete foreign key
- Drizzle migration generated and ready to apply
- All TypeScript types compile cleanly with new schema

## Task Commits

Each task was committed atomically:

1. **Task 1: Add users table and user_id FK to schema** - `1b34e28` (feat)
2. **Task 2: Generate database migration** - `3a697d6` (feat)

**Plan metadata:** Will be committed after SUMMARY.md creation

## Files Created/Modified
- `src/lib/db/schema.ts` - Added users table, userId FK on leases, bidirectional relations, User/NewUser types
- `drizzle/migrations/0002_nasty_sister_grimm.sql` - CREATE users table, ALTER leases ADD user_id, FK constraint with cascade
- `src/__tests__/lib/calculations/evaluate-all.test.ts` - Updated mock lease to include nullable userId field

## Decisions Made

**userId nullable initially:** Existing test leases created before authentication have no user. This plan establishes the schema; Plan 03 will handle the migration strategy (claim or delete existing data on first user login).

**Cascade delete configured:** Deleting a user cascades to their leases, which further cascades to marketValues via the existing FK. This ensures clean data removal without orphaned records.

**Text ID for Clerk compatibility:** Clerk user IDs are strings (e.g., `user_2abc...`), not UUIDs. Using `text('id')` as primary key ensures direct compatibility without conversion logic.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated test mock to include userId field**
- **Found during:** Task 1 (TypeScript compilation verification)
- **Issue:** Test mock lease missing new userId field, causing TypeScript compilation error
- **Fix:** Added `userId: null` to createMockLease helper function
- **Files modified:** src/__tests__/lib/calculations/evaluate-all.test.ts
- **Verification:** `npx tsc --noEmit` passes
- **Committed in:** 1b34e28 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Test data update required for compilation. No scope creep.

## Issues Encountered
None

## User Setup Required

None - no external service configuration required yet. Migration will be applied in Plan 04 (Clerk Setup) after environment variables are configured.

## Next Phase Readiness

**Ready for Plan 03 (Migrate Existing Data):** Schema is in place. Migration SQL is generated. Next plan will establish migration strategy for existing leases.

**Blockers:** None. Database schema changes are local and do not require external services yet.

**Note:** The generated migration (`drizzle/migrations/0002_nasty_sister_grimm.sql`) is NOT applied yet. It will be applied after Clerk environment variables are configured in Plan 04.

---
*Phase: 05-authentication-and-multi-lease*
*Completed: 2026-01-31*
