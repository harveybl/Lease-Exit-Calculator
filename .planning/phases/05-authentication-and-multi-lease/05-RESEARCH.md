# Phase 5: Authentication and Multi-Lease - Research

**Researched:** 2026-01-31
**Domain:** Next.js 15 App Router authentication with Clerk, multi-tenant data architecture
**Confidence:** HIGH

## Summary

This research investigates implementing authentication and multi-lease support using Clerk with Next.js 15 App Router, Drizzle ORM, and PostgreSQL. Clerk emerged as the standard solution for Next.js authentication in 2025-2026, offering first-class App Router support, Server Components integration, and comprehensive security features including middleware-based route protection.

The standard approach involves: (1) Clerk for authentication and user management, (2) webhook-based user sync to maintain a local users table, (3) user_id foreign keys on all user-scoped tables with database-level enforcement, (4) middleware-based route protection using `clerkMiddleware()`, and (5) server-side authentication checks in Server Actions and Route Handlers using the `auth()` helper.

For multi-lease navigation, the research reveals that lease list views with rich previews outperform dropdown selectors for 2-10 items, supporting faster scanning and better context awareness. Empty state best practices emphasize providing clear CTAs and optional demo content to reduce first-time user abandonment (which reaches 40-60% without proper onboarding).

**Primary recommendation:** Use Clerk with webhook sync to local database, enforce user_id foreign keys on all tables, protect routes with `clerkMiddleware()`, and implement lease-list-as-home navigation pattern for multi-lease management.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @clerk/nextjs | Latest (5.x) | Authentication & user management | First-class Next.js App Router support, Server Components integration, comprehensive security |
| Drizzle ORM | 0.45.1+ | Database ORM with migration support | Already in use, excellent PostgreSQL support, type-safe schema migrations |
| @neondatabase/serverless | 1.0.2+ | Serverless PostgreSQL client | Already in use, optimized for edge/serverless, low latency |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| svix | Latest | Webhook signature verification | Required for Clerk webhook security (Clerk uses Svix infrastructure) |
| zod | 4.3.6+ | Schema validation | Already in use for form validation, extends to webhook payload validation |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Clerk | NextAuth.js v5 | More DIY configuration, requires custom UI components, more maintenance overhead but more customizable |
| Clerk | WorkOS AuthKit | Enterprise-focused, better for B2B SaaS with SSO requirements, higher pricing |
| Webhook sync | Direct Clerk API calls | Simpler but creates tight coupling and rate limit concerns for user data queries |

**Installation:**
```bash
npm install @clerk/nextjs svix
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── middleware.ts                    # Clerk middleware for route protection
├── app/
│   ├── layout.tsx                   # Wrap with ClerkProvider
│   ├── (auth)/                      # Route group for auth pages
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── (protected)/                 # Route group for authenticated routes
│   │   ├── leases/                  # Lease list (home for authenticated users)
│   │   │   ├── page.tsx
│   │   │   └── [id]/                # Individual lease detail
│   │   └── layout.tsx               # Protected layout with user navigation
│   └── api/
│       └── webhooks/
│           └── clerk/route.ts       # User sync webhook handler
├── lib/
│   └── db/
│       ├── schema.ts                # Add users table, user_id FKs
│       └── queries/                 # User-scoped query helpers
└── drizzle/migrations/              # Generated migration files
```

### Pattern 1: Clerk Authentication Setup

**What:** Wrap root layout with ClerkProvider and configure middleware for route protection
**When to use:** Required for all Clerk integrations

**Example:**
```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}

// middleware.ts (must be at root or in /src)
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/leases(.*)',
  '/api/(?!webhooks).*'  // Protect API routes except webhooks
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()  // Redirects to sign-in if unauthenticated
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

### Pattern 2: Server-Side Authentication in Server Actions

**What:** Use `auth()` helper to verify authentication and get user ID in Server Actions
**When to use:** Every Server Action that accesses user-scoped data

**Example:**
```typescript
// app/leases/actions.ts
'use server'

import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db/client'
import { leases } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function createLease(data: NewLease) {
  const { userId, redirectToSignIn } = await auth()

  if (!userId) {
    return redirectToSignIn()
  }

  // Insert with user_id - enforces ownership
  const [lease] = await db.insert(leases).values({
    ...data,
    userId  // Associate lease with authenticated user
  }).returning()

  return { success: true, lease }
}

export async function getUserLeases() {
  const { userId, redirectToSignIn } = await auth()

  if (!userId) {
    return redirectToSignIn()
  }

  // Query scoped to user_id
  const userLeases = await db.query.leases.findMany({
    where: eq(leases.userId, userId),
    orderBy: (leases, { desc }) => [desc(leases.createdAt)]
  })

  return userLeases
}
```

### Pattern 3: Webhook-Based User Sync

**What:** Sync Clerk user events (create/update/delete) to local database via webhooks
**When to use:** When you need to query user data, enforce foreign keys, or display user info from other users

**Example:**
```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SIGNING_SECRET')
  }

  // Get headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', { status: 400 })
  }

  // Get body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Verify webhook signature
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error: Verification failed', { status: 400 })
  }

  // Handle events
  const { id, email_addresses, first_name, last_name } = evt.data
  const eventType = evt.type

  if (eventType === 'user.created' || eventType === 'user.updated') {
    // Upsert pattern - handles both create and update
    await db.insert(users)
      .values({
        id,  // Clerk user ID
        email: email_addresses[0]?.email_address,
        firstName: first_name,
        lastName: last_name,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: email_addresses[0]?.email_address,
          firstName: first_name,
          lastName: last_name,
          updatedAt: new Date(),
        }
      })
  }

  if (eventType === 'user.deleted') {
    // Cascade delete will handle related records if FK configured
    await db.delete(users).where(eq(users.id, id))
  }

  return new Response('Success', { status: 200 })
}
```

### Pattern 4: Multi-Lease Navigation (Lease List as Home)

**What:** Display all user leases in a scannable list with rich preview cards
**When to use:** 2-10 leases (research shows lists outperform dropdowns for this range)

**Example:**
```typescript
// app/(protected)/leases/page.tsx
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db/client'
import { leases } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'

export default async function LeasesPage() {
  const { userId } = await auth()

  const userLeases = await db.query.leases.findMany({
    where: eq(leases.userId, userId!),
    with: {
      marketValues: true  // Include related data for rich preview
    },
    orderBy: (leases, { desc }) => [desc(leases.updatedAt)]
  })

  if (userLeases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-2xl font-semibold">No leases yet</h2>
        <p className="text-muted-foreground">Get started by adding your first vehicle lease</p>
        <Link href="/leases/new" className="btn-primary">
          Add Your First Lease
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Leases</h1>
        <Link href="/leases/new" className="btn-primary">
          Add Lease
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {userLeases.map((lease) => (
          <Link
            key={lease.id}
            href={`/leases/${lease.id}`}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="card-header">
              <h3 className="font-semibold">
                {lease.year} {lease.make} {lease.model}
              </h3>
            </div>
            <div className="card-body">
              <div className="text-sm text-muted-foreground">
                Monthly: ${lease.monthlyPayment.toString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {lease.monthsElapsed} of {lease.termMonths} months
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

### Pattern 5: Database Schema with User Scoping

**What:** Add users table and user_id foreign keys to all user-scoped tables
**When to use:** Required for multi-tenant data isolation

**Example:**
```typescript
// lib/db/schema.ts additions
import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID (not UUID)
  email: varchar('email', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Updated leases table with user_id FK
export const leases = pgTable('leases', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, {
    onDelete: 'cascade'  // Delete leases when user is deleted
  }),
  // ... existing fields
})

// Updated marketValues maintains cascade through leases
export const marketValues = pgTable('market_values', {
  id: uuid('id').primaryKey().defaultRandom(),
  leaseId: uuid('lease_id').notNull().references(() => leases.id, {
    onDelete: 'cascade'
  }),
  // ... existing fields
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  leases: many(leases),
}))

export const leasesRelations = relations(leases, ({ one, many }) => ({
  user: one(users, {
    fields: [leases.userId],
    references: [users.id],
  }),
  marketValues: many(marketValues),
}))
```

### Anti-Patterns to Avoid

- **Relying solely on middleware for Server Action security** - Middleware is bypassed when Server Actions are called from unprotected routes. Always verify `auth()` within the action itself.
- **Storing Clerk tokens in localStorage** - Vulnerable to XSS attacks. Clerk handles httpOnly cookies automatically; don't override this behavior.
- **Using `auth()` in Client Components** - The `auth()` helper only works server-side. Use `useAuth()` hook for client components.
- **Forgetting webhook verification** - Unverified webhooks expose your database to arbitrary writes. Always verify Svix signatures.
- **Blocking webhook routes with middleware** - Webhooks must be publicly accessible to receive Clerk events. Exclude `/api/webhooks` from protected routes.
- **Syncing data without upsert pattern** - Users may access your app before webhook arrives. Use upsert (ON CONFLICT DO UPDATE) to handle race conditions.
- **Using soft delete for GDPR compliance** - Soft delete is not sufficient for "right to be forgotten". Implement hard delete or anonymization for user deletion.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Authentication UI | Custom login forms, session management | Clerk's pre-built components (`<SignIn />`, `<SignUp />`) | Production-ready accessibility, security, MFA support, social providers, email verification |
| Webhook signature verification | Custom HMAC validation | Svix SDK's `verify()` method | Timing-safe comparison, handles edge cases, maintained by Clerk's webhook provider |
| User session management | Custom JWT handling, refresh logic | Clerk's automatic session management | Short-lived tokens (60s), automatic refresh, httpOnly cookies, CSRF protection |
| Route protection | Custom authentication checks in each component | `clerkMiddleware()` with `auth.protect()` | Centralized security, handles redirects, supports authorization rules, edge-optimized |
| Multi-tenant data queries | Manual WHERE userId = X in every query | Drizzle query helpers with default user scope | Prevents accidental data leaks, enforced at DB layer, consistent across codebase |

**Key insight:** Authentication is a security-critical domain where custom solutions typically have vulnerabilities that only surface under attack. Clerk handles session lifecycle, token rotation, security headers, rate limiting, account takeover prevention, and compliance requirements that would take hundreds of hours to implement correctly.

## Common Pitfalls

### Pitfall 1: CVE-2025-29927 - Middleware Authorization Bypass
**What goes wrong:** Next.js versions 11.1.4 through 15.2.2 allow attackers to bypass middleware authentication by adding the `x-middleware-subrequest` header, completely circumventing route protection.

**Why it happens:** Next.js uses this header internally for subrequests but didn't validate that external requests shouldn't include it.

**How to avoid:**
- Upgrade to Next.js 15.2.3+ immediately (or 14.2.25+, 13.5.9+, 12.3.5+ for older versions)
- If upgrading isn't possible, configure load balancer/web server to strip this header from incoming requests
- Always verify authentication in Server Actions with `auth()`, don't rely on middleware alone

**Warning signs:**
- Unauthenticated access to protected routes despite middleware configuration
- Unexpected admin access in logs
- Security scanner reports showing middleware bypass

### Pitfall 2: Webhook Race Condition - User Access Before Sync
**What goes wrong:** User signs up, webhook fires, but user reaches protected page before webhook completes. Database query for user data fails because user record doesn't exist yet.

**Why it happens:** Webhooks are eventually consistent. Network latency, processing delays, or webhook retries can cause user to access app before local database sync completes.

**How to avoid:**
- Use upsert pattern in webhooks (ON CONFLICT DO UPDATE)
- Implement fallback logic in pages: if user_id from Clerk exists but not in local DB, trigger manual sync or use Clerk data directly
- Consider lazy user creation: create user record on first app interaction instead of relying solely on webhooks
- Handle "user not found" gracefully with retry logic or temporary Clerk-only data access

**Warning signs:**
- "Foreign key constraint violation" errors on user_id
- "User not found" errors immediately after signup
- Webhook retry notifications in Clerk dashboard

### Pitfall 3: Missing User ID in Server Actions Called from Client
**What goes wrong:** Server Action is called from an unprotected page or client component without proper authentication context, resulting in null userId.

**Why it happens:** Server Actions are HTTP endpoints that can be called from anywhere. If the route isn't protected by middleware, auth context may not be established.

**How to avoid:**
- Always check `auth()` result in Server Actions: `if (!userId) return redirectToSignIn()`
- Don't assume middleware protection extends to Server Actions - verify explicitly
- Use TypeScript to enforce auth checks: create a wrapper function that guarantees userId exists
- Consider auth wrapper pattern:
  ```typescript
  async function withAuth<T>(
    action: (userId: string) => Promise<T>
  ): Promise<T> {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    return action(userId)
  }
  ```

**Warning signs:**
- TypeError: Cannot read property 'id' of null in Server Actions
- Successful actions creating records without user_id
- Data showing up for wrong users

### Pitfall 4: Forgetting to Exclude Webhook Routes from Middleware
**What goes wrong:** Clerk webhooks receive 401/403 responses because middleware requires authentication for `/api/webhooks/*` routes.

**Why it happens:** Default middleware protection patterns often catch all `/api/*` routes, which includes webhook endpoints that must be publicly accessible.

**How to avoid:**
- Explicitly exclude webhook routes in middleware matcher: `/api/(?!webhooks).*`
- Use `createRouteMatcher` to define protected routes, leaving webhooks public
- Test webhook delivery in Clerk dashboard after deploying middleware changes
- Monitor webhook delivery logs for failed attempts

**Warning signs:**
- Clerk dashboard shows webhook delivery failures
- User sync doesn't work in production but works locally
- Webhook endpoint returns 401 Unauthorized in logs

### Pitfall 5: Database Migration with Existing Data
**What goes wrong:** Adding non-nullable `user_id` foreign key column to existing tables fails because existing records have no user to associate with.

**Why it happens:** Schema migration requires valid foreign key references, but pre-auth data has no user_id value.

**How to avoid:**
- Multi-step migration approach:
  1. Add `user_id` column as NULLABLE first
  2. Decide strategy for existing data: delete, assign to test user, or preserve with null
  3. Populate user_id for records you want to keep
  4. Alter column to NOT NULL (or keep nullable if supporting legacy data)
- Alternative: Create separate archive table for pre-auth data
- For this app: likely fresh start (personal use MVP with minimal production data)

**Warning signs:**
- Migration fails with "column contains null values"
- Foreign key constraint violations during migration
- Data loss after migration

### Pitfall 6: Not Handling User Deletion
**What goes wrong:** User deletes their Clerk account but local database records remain orphaned, or cascade delete removes data that should be preserved for legal/compliance reasons.

**Why it happens:** Mismatch between Clerk's user lifecycle and app's data retention requirements.

**How to avoid:**
- Configure `onDelete: 'cascade'` on foreign keys if user deletion should remove all data
- For data retention requirements, use soft delete pattern with anonymization instead of cascade
- Implement `user.deleted` webhook to handle cleanup logic
- Consider compliance requirements (GDPR right to erasure requires hard delete of personal data)

**Warning signs:**
- Orphaned records with invalid user_id references
- GDPR compliance audit failures
- Unexpected data loss after user account deletion

## Code Examples

Verified patterns from official sources:

### Environment Variables Setup
```bash
# .env.local
# Source: https://clerk.com/docs/nextjs/getting-started/quickstart

# Public keys (available on client)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/leases
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/leases

# Secret keys (server-only)
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
```

### Creating Protected Auth Routes with Catch-All
```typescript
// app/(auth)/sign-in/[[...sign-in]]/page.tsx
// Source: https://clerk.com/docs/nextjs/getting-started/quickstart
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn />
    </div>
  )
}

// app/(auth)/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp />
    </div>
  )
}
```

### Conditional Rendering Based on Auth State
```typescript
// Source: https://clerk.com/docs/nextjs/getting-started/quickstart
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton
} from '@clerk/nextjs'

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4">
      <div className="logo">Lease Tracker</div>

      <div>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="btn-secondary">Sign In</button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-10 w-10"
              }
            }}
          />
        </SignedIn>
      </div>
    </header>
  )
}
```

### Migration Generation with Drizzle
```bash
# Source: https://orm.drizzle.team/docs/migrations

# Generate migration SQL files from schema changes
npx drizzle-kit generate

# Apply migrations to database
npx drizzle-kit migrate

# Or use push for rapid prototyping (bypasses SQL files)
npx drizzle-kit push
```

### Accessing User Data in Server Components
```typescript
// Source: https://clerk.com/docs/reference/nextjs/app-router/auth
import { auth, currentUser } from '@clerk/nextjs/server'

export default async function DashboardPage() {
  // Option 1: Get auth state and userId
  const { userId, sessionId } = await auth()

  // Option 2: Get full user object (makes API call to Clerk)
  const user = await currentUser()

  if (!userId) {
    // This shouldn't happen if route is protected, but good to check
    return <div>Not authenticated</div>
  }

  return (
    <div>
      <h1>Welcome {user?.firstName}!</h1>
      <p>Your user ID: {userId}</p>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| NextAuth.js (Auth.js v4) | Clerk or Auth.js v5 | 2024-2025 | Auth.js v5 beta brought App Router support; Clerk became preferred for managed solution |
| Pages Router middleware | App Router middleware with Edge Runtime | Next.js 13-14 | Middleware now runs on Edge by default (changed in 15.2), affecting database access patterns |
| Database sessions | JWT-only sessions | 2024-2025 | Shift to stateless auth for serverless/edge deployments; Clerk uses 60s JWT expiry |
| Email/password only | Passkeys (WebAuthn) as default | 2025-2026 | Passkeys becoming standard for security; Clerk supports out of box |
| Manual user sync | Webhook-driven sync with Svix | 2024-2025 | Clerk standardized on Svix for reliable webhook delivery with retry logic |
| Serial columns | Identity columns | 2025 | PostgreSQL and Drizzle recommend identity columns over serial types |

**Deprecated/outdated:**
- **`createNextApp` proxy.ts filename**: Use `middleware.ts` for Next.js 15 and below
- **NextAuth.js v4**: Superseded by Auth.js v5 with breaking changes for App Router
- **Manual JWT refresh logic**: Clerk handles automatically with sliding sessions
- **`getServerSideProps` for auth**: App Router uses Server Components with `auth()` helper
- **Global middleware protection by default**: Clerk now requires explicit opt-in to protection with `auth.protect()` or route matchers

## Open Questions

Things that couldn't be fully resolved:

1. **Existing Lease Data Migration Strategy**
   - What we know: Current implementation has no authentication, so existing production leases have no user_id
   - What's unclear: Volume of production data, whether to preserve or reset
   - Recommendation: Assume fresh start for MVP (personal use context suggests minimal production data). If preservation needed, create one-time migration script to assign all existing leases to first authenticated user, or add UI prompt on first login: "Claim existing data?"

2. **Webhook Delivery Guarantees**
   - What we know: Webhooks are eventually consistent and may fail; Clerk retries with exponential backoff
   - What's unclear: Exact retry policy duration and max attempts
   - Recommendation: Implement graceful fallback in app - if user exists in Clerk but not in local DB, create user record on-demand via `currentUser()` API call

3. **Lease Count Limits**
   - What we know: Most personal users track 1-2 leases; research shows list UI works well up to ~10 items
   - What's unclear: Whether to impose artificial limit or allow unlimited
   - Recommendation: No limit for MVP. Monitor usage and add pagination/search if users exceed ~20 leases (unlikely for personal use case)

4. **Pre-Auth Landing Page Strategy**
   - What we know: App is personal-use tool, not public marketing site
   - What's unclear: Whether to show marketing landing page or redirect directly to sign-in
   - Recommendation: Direct to sign-in for MVP. Landing page adds development time without clear value for personal tool. Revisit if pivoting to public SaaS.

5. **Soft Delete for Leases**
   - What we know: Current design uses hard delete with two-click confirmation
   - What's unclear: Whether users expect "undo" capability or if hard delete is acceptable
   - Recommendation: Keep hard delete for MVP (simpler). Data loss risk is low due to two-click confirmation. Add soft delete + archive view only if users request it.

## Sources

### Primary (HIGH confidence)
- [Clerk Next.js Quickstart - App Router](https://clerk.com/docs/nextjs/getting-started/quickstart)
- [Clerk Middleware Reference](https://clerk.com/docs/reference/nextjs/clerk-middleware)
- [Clerk auth() Helper Reference](https://clerk.com/docs/reference/nextjs/app-router/auth)
- [Clerk Webhook Syncing Guide](https://clerk.com/docs/guides/development/webhooks/syncing)
- [Clerk + Neon + Drizzle Integration](https://clerk.com/docs/guides/development/integrations/databases/neon)
- [Drizzle ORM Migrations Documentation](https://orm.drizzle.team/docs/migrations)
- [Next.js Official Authentication Guide](https://nextjs.org/docs/app/guides/authentication)
- [Drizzle ORM PostgreSQL Getting Started](https://orm.drizzle.team/docs/get-started/postgresql-new)

### Secondary (MEDIUM confidence)
- [Next.js Security Update: CVE-2025-29927](https://nextjs.org/blog/security-update-2025-12-11) - Critical middleware bypass vulnerability
- [WorkOS: Top Authentication Solutions for Next.js 2026](https://workos.com/blog/top-authentication-solutions-nextjs-2026) - Ecosystem comparison
- [Multi-tenancy with PostgreSQL - Logto Blog](https://blog.logto.io/implement-multi-tenancy) - Multi-tenant architecture patterns
- [Crunchy Data: Postgres Multi-tenancy Design](https://www.crunchydata.com/blog/designing-your-postgres-database-for-multi-tenancy)
- [Frontend Masters: Drizzle Database Migrations](https://frontendmasters.com/blog/drizzle-database-migrations/)
- [Userpilot: Empty State in SaaS Applications](https://userpilot.com/blog/empty-state-saas/) - UX patterns
- [NN/G: Listboxes vs Dropdowns](https://www.nngroup.com/articles/listbox-dropdown/) - UI pattern research

### Tertiary (LOW confidence - mark for validation)
- WebSearch results on GDPR soft delete compliance - community consensus favors hard delete or anonymization, but legal interpretation varies by jurisdiction
- WebSearch results on SaaS onboarding statistics (40-60% abandonment) - widely cited but original research source unclear

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Clerk documentation is comprehensive, current, and official; Drizzle ORM documentation verified via Context7 and official sources
- Architecture: HIGH - Patterns verified across multiple official sources (Clerk docs, Next.js docs, Drizzle docs) with consistent recommendations
- Pitfalls: HIGH - CVE-2025-29927 from official Next.js security advisory; webhook patterns from official Clerk docs; other pitfalls verified across multiple developer resources
- Multi-tenant patterns: MEDIUM - PostgreSQL RLS and tenant_id patterns well-documented but implementation varies by scale and requirements
- UX patterns: MEDIUM - Empty state and navigation research based on established UX sources (NN/G, Userpilot) but specific recommendations may vary by use case

**Research date:** 2026-01-31
**Valid until:** ~2026-02-28 (30 days - stable authentication domain, but security patches like CVE fixes may emerge)
