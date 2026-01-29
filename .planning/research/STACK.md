# Stack Research

**Domain:** Vehicle Lease Tracking & Financial Comparison Web Application
**Researched:** 2026-01-28
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.1+ | Full-stack React framework | Industry standard for React SSR/SSG in 2026. Built-in routing, API routes, Server Actions for form handling, and optimized deployment. 71% of React job postings require Next.js experience. App Router with React Server Components provides optimal data fetching patterns for financial apps. |
| React | 19.2+ | UI library | Latest stable version with Actions API for simplified async state management, automatic compiler for performance optimization without manual memoization, and native `useActionState` for form handling—critical for lease entry workflows. |
| TypeScript | 5.3+ | Type safety | Essential for financial calculations where type errors can cause real-world monetary losses. Prevents entire categories of bugs in payment/valuation logic. Next.js 15+ supports `next.config.ts` natively. |
| Neon Postgres | Latest | Serverless database | Official Vercel Postgres replacement as of Q4 2024. Auto-scaling serverless Postgres with generous free tier, database branching for preview deployments, and full Postgres feature set for relational lease data (vehicles, leases, calculations, user data). |
| Tailwind CSS | 4.0+ | Utility-first styling | 2026 standard for rapid UI development. v4 uses OKLCH color space and new `@theme` directive. Pairs perfectly with shadcn/ui for component system. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui | Latest | Component system | Copy-paste React components built on Radix UI + Tailwind. Full ownership of code, no package dependency. Updated for React 19 and Tailwind v4 (OKLCH colors, removed forwardRefs). Use for forms, date pickers (lease dates), dialogs, and data tables. |
| Zod | 3.23+ | Schema validation | Type-safe runtime validation for lease entry forms and server actions. Shared schema between client/server prevents data inconsistencies in financial calculations. Integrates with React Hook Form via `@hookform/resolvers`. |
| React Hook Form | 7.51+ | Form state management | Fast, ergonomic client-side form handling with minimal re-renders. Perfect for multi-step lease entry workflow. Use with Zod for validation and Next.js Server Actions for submission. |
| Decimal.js | 10.4+ | Arbitrary-precision arithmetic | Critical for financial calculations (lease payments, depreciation, interest). Prevents floating-point errors in money math. 18M+ weekly downloads, battle-tested. Use instead of native JS numbers for all monetary values. |
| Recharts | 2.12+ | Charting library | Declarative React charts built on D3. Perfect for month-by-month timeline visualization showing cost shifts across exit options. Drop-in, batteries-included with minimal configuration. Better DX than raw D3 for standard financial charts. |
| TanStack Query | 5.90+ | Server state management | Caching, background updates, and optimistic UI for vehicle valuation API calls (KBB/Edmunds). v5 is 20% smaller than v4, works seamlessly with React Server Components. Use for market value lookups with stale-while-revalidate pattern. |
| Drizzle ORM | 0.36+ | TypeScript ORM | Code-first approach keeps schema in TypeScript (no separate DSL). Superior serverless performance vs Prisma—critical for edge/serverless functions. SQL-like query builder for complex lease comparison queries. Excellent Next.js integration. |
| Clerk | Latest | Authentication | Drop-in auth solution optimized for Next.js. Sub-millisecond JWT validation vs Auth0's 5-10 second cold starts. Production deployments in hours, not weeks. Lightweight auth needed per requirements—Clerk's free tier supports social login, MFA, and user management. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Turbopack | Next.js dev server | Stable in Next.js 15+. 76.7% faster local server startup, 96.3% faster code updates vs Webpack. Use `next dev --turbo`. |
| Vercel | Deployment & hosting | Optimal Next.js deployment with zero-config. Alternatives: Netlify (similar DX), Railway/Render (if you need backend services), Cloudflare Pages (cost-conscious, requires OpenNext adapter). Vercel free tier prohibits commercial use—consider paid tier or alternatives if monetizing. |
| ESLint | Code linting | Next.js 15+ supports ESLint 9. Use `next lint` for React/Next.js-specific rules. |
| Prettier | Code formatting | Standard code formatter. Configure for 2-space indent, single quotes to match Next.js conventions. |

## Installation

```bash
# Create Next.js app with TypeScript and Tailwind
npx create-next-app@latest lease-tracker --typescript --tailwind --app --no-src-dir

# Core dependencies
npm install zod react-hook-form @hookform/resolvers decimal.js recharts @tanstack/react-query drizzle-orm @neondatabase/serverless

# Clerk authentication
npm install @clerk/nextjs

# Dev dependencies
npm install -D drizzle-kit @types/node tsx

# shadcn/ui (interactive CLI adds components as needed)
npx shadcn@latest init
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js 16 | Vite + React Router | If you need client-only SPA with no SSR requirements. Not recommended—lease app benefits from SER for initial load performance. |
| Neon Postgres | Supabase Postgres | If you need built-in auth, storage, and realtime subscriptions in one platform. Overkill for this use case—Clerk + Neon is more modular. |
| Drizzle ORM | Prisma | If you prefer schema-first approach with auto-generated migrations and GUI (Prisma Studio). Prisma has better DX for rapid prototyping, but Drizzle has superior serverless performance. |
| Decimal.js | Dinero.js | If you need built-in currency formatting and multi-currency support. Dinero.js is money-specific (113K weekly downloads) vs Decimal.js general-purpose (18M+ downloads). For single-currency lease tracking, Decimal.js is lighter and more flexible. |
| Recharts | Visx (@visx/visx) | If you need highly customized, D3-powered visualizations beyond standard charts. Visx gives full control but steep learning curve. For timeline cost comparisons, Recharts' declarative API is sufficient. |
| Recharts | Nivo | If you need multiple rendering methods (SVG, Canvas, server-side). Recharts is simpler for this use case. |
| TanStack Query | SWR | If you prefer Vercel's official data-fetching library. SWR is lighter (5KB) but TanStack Query has more features (mutations, infinite queries, devtools). For API-heavy valuation lookups, TanStack Query is more robust. |
| Clerk | Auth0 | If you need enterprise SSO, SAML, granular permissions. Auth0 is overkill for "lightweight auth" requirement. Clerk's free tier and Next.js integration is superior for this use case. |
| Clerk | NextAuth.js (Auth.js) | If you want full control and self-hosted auth. NextAuth v5 is production-ready but requires more configuration. Clerk's managed service reduces maintenance burden. |
| shadcn/ui | Radix UI (direct) | If you want full control without component abstractions. shadcn/ui IS Radix UI + Tailwind—you own the code, so customization is trivial. |
| shadcn/ui | Material UI | If you need Google Material Design. MUI is heavier and requires theme configuration. Tailwind-based shadcn/ui is more modern and lightweight. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Create React App | Deprecated by React team. No built-in SSR, routing, or API routes. Slow builds. | Next.js (recommended) or Vite for client-only SPA |
| JavaScript numbers for money | Floating-point errors: `0.1 + 0.2 = 0.30000000000000004`. Unacceptable for financial calculations. | Decimal.js or Dinero.js |
| Chart.js | Imperative API not idiomatic for React. Requires manual ref management and lifecycle handling. | Recharts (declarative React components) |
| Redux | Overkill for this app's state complexity. React 19 Actions + TanStack Query handles async state better. | React 19 `useActionState` + TanStack Query + URL state |
| Firebase Firestore | NoSQL not ideal for relational lease data (vehicles → leases → calculations). Vendor lock-in. | Neon Postgres (relational, portable) |
| Styled Components / Emotion | CSS-in-JS has runtime performance cost. Tailwind's utility-first approach is 2026 standard. | Tailwind CSS + shadcn/ui |
| Pages Router (Next.js) | Legacy. App Router is production-ready with better data fetching patterns (Server Components, Server Actions). | Next.js App Router |
| Moment.js | 2.29.4 (2022) is in maintenance mode. Heavy bundle size (67KB). | date-fns (2KB per function, tree-shakeable) or native `Intl.DateTimeFormat` |

## Stack Patterns by Variant

**If building MVP for personal use only:**
- Skip Clerk authentication initially
- Use Next.js Server Actions with simple password check in middleware
- Deploy on Vercel free tier (prohibits commercial use but fine for personal)
- Defer API integrations—start with manual vehicle value entry
- Use local-first pattern: store lease data in localStorage initially, add Postgres when ready to scale

**If planning to share publicly:**
- Implement Clerk authentication from day one (free tier supports up to 10K monthly active users)
- Use Vercel Pro ($20/mo) or Netlify (similar pricing) to avoid free tier commercial restrictions
- Design for multi-tenancy: user_id foreign keys in lease tables
- Rate-limit vehicle valuation API calls (KBB/Edmunds likely have request limits)
- Add sharing features: public read-only links via UUID, social meta tags for previews

**If prioritizing offline capability:**
- Consider PowerSync (syncs Postgres ↔ SQLite in browser)
- Use IndexedDB via Dexie.js for local-first storage
- Defer to server for API calls and auth only
- Note: Adds significant complexity—only if offline is critical requirement

**If cost is primary constraint:**
- Cloudflare Pages (free tier more generous than Vercel, but requires OpenNext adapter)
- Self-hosted on Railway/Render (more control, ~$5-10/mo for small projects)
- Consider SQLite via Turso (edge-hosted SQLite-as-a-service) instead of Postgres
- Skip TanStack Query devtools in production (development-only)

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| next@16.1+ | react@19.2+, react-dom@19.2+ | Next.js 16 requires React 19.2+. Do not use React 18 with Next.js 16. |
| @clerk/nextjs@latest | next@15+ | Clerk supports Next.js 15+ App Router. Use `<ClerkProvider>` wrapper in root layout. |
| @tanstack/react-query@5.90+ | react@18.0+ | TanStack Query v5 requires React 18+ (uses `useSyncExternalStore`). Fully compatible with React 19. |
| drizzle-orm@0.36+ | @neondatabase/serverless | Neon's serverless driver works with Drizzle's Postgres dialect. Use `drizzle(sql)` wrapper. |
| tailwindcss@4.0+ | next@15+ | Tailwind v4 works with Next.js 15+. Use `@theme` directive in globals.css. |
| shadcn/ui@latest | react@19, tailwindcss@4 | Updated for React 19 (removed forwardRefs) and Tailwind v4 (OKLCH colors). |
| recharts@2.12+ | react@16.8+ | Compatible with React 19. No breaking changes needed. |

## Sources

**High Confidence (Official Docs & Context7):**
- [Next.js 15 Release](https://nextjs.org/blog/next-15) — Core framework features, Turbopack, React 19 support
- [React 19 Release](https://react.dev/blog/2024/12/05/react-19) — Actions, new hooks, Server Components
- [Neon Postgres Vercel Integration](https://neon.com/docs/guides/vercel-overview) — Vercel Postgres transition to Neon
- [TanStack Query v5 Docs](https://tanstack.com/query/latest) — Version 5.90+ features, React 19 compatibility
- [Drizzle ORM Docs](https://orm.drizzle.team) — Code-first approach, serverless optimization
- [Tailwind CSS v4](https://ui.shadcn.com/docs/tailwind-v4) — OKLCH colors, @theme directive
- [shadcn/ui Docs](https://ui.shadcn.com/) — React 19 and Tailwind v4 updates

**Medium Confidence (Multiple Credible Sources):**
- [Clerk vs Auth0 for Next.js](https://clerk.com/articles/clerk-vs-auth0-for-nextjs) — Performance comparison, DX analysis
- [Prisma vs Drizzle ORM in 2026](https://medium.com/@thebelcoder/prisma-vs-drizzle-orm-in-2026-what-you-really-need-to-know-9598cf4eaa7c) — Serverless performance, approach comparison
- [Comparing Best React Timeline Libraries](https://blog.logrocket.com/comparing-best-react-timeline-libraries/) — Recharts vs Visx vs D3 for charting
- [Decimal.js vs Dinero.js Comparison](https://miladezzat.medium.com/mastering-money-calculations-in-javascript-the-best-libraries-compared-8e4ae03dac58) — Money handling libraries
- [Type-Safe Form Validation in Next.js 15](https://www.abstractapi.com/guides/email-validation/type-safe-form-validation-in-next-js-15-with-zod-and-react-hook-form) — Zod + React Hook Form integration
- [React & Next.js in 2025 - Modern Best Practices](https://strapi.io/blog/react-and-nextjs-in-2025-modern-best-practices) — Industry patterns
- [Top 10 Vercel Alternatives for 2026](https://www.digitalocean.com/resources/articles/vercel-alternatives) — Deployment platform comparison

**Low Confidence (Single Source or Unverified):**
- Vehicle valuation API (KBB/Edmunds) integration details — Found B2B API references but no public API docs. May require third-party aggregators like SteadyAPI's AutoHub or direct B2B partnerships. Flag for Phase-specific research.

---
*Stack research for: Vehicle Lease Tracking & Financial Comparison Web Application*
*Researched: 2026-01-28*
*Research Mode: Ecosystem (Standard Stack)*
