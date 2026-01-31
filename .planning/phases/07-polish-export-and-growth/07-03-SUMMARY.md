---
phase: 07-polish-export-and-growth
plan: 03
subsystem: pwa
tags: [pwa, serwist, service-worker, manifest, installability, offline]

# Dependency graph
requires:
  - phase: 02-lease-entry-and-core-ui
    provides: Theme colors (teal primary #0d9488, warm off-white #fafaf7)
provides:
  - PWA manifest with app metadata, icons, and theme colors
  - Serwist service worker with precaching and runtime caching
  - Offline-capable app shell
  - Home screen installability on mobile devices
affects: [07-04-mobile-responsive-ui, 07-05-pdf-export, future-deployment]

# Tech tracking
tech-stack:
  added: [@serwist/next@9.5.3, serwist@9.5.3]
  patterns: [PWA with service worker, manifest.ts for typed PWA config, turbopack compatibility workaround]

key-files:
  created:
    - src/app/manifest.ts
    - src/app/sw.ts
    - public/icons/icon-192.png
    - public/icons/icon-512.png
    - public/icons/icon-maskable.png
  modified:
    - next.config.ts
    - src/app/layout.tsx
    - .gitignore

key-decisions:
  - "Serwist disabled in non-production (process.env.NODE_ENV !== 'production') due to Turbopack incompatibility"
  - "Empty turbopack: {} config added to suppress webpack migration warning"
  - "Generated placeholder icons with teal background and 'LT' text using ImageMagick"
  - "Service worker uses defaultCache runtime caching for optimal offline behavior"

patterns-established:
  - "PWA manifest defined as typed manifest.ts file (not static JSON)"
  - "Service worker source in src/app/sw.ts, builds to public/sw.js"
  - "Auto-generated service worker files gitignored"

# Metrics
duration: 4m 49s
completed: 2026-01-31
---

# Phase 07 Plan 03: Progressive Web App Configuration Summary

**PWA installability with Serwist service worker, typed manifest, and teal-themed icons for offline-capable home screen app**

## Performance

- **Duration:** 4m 49s
- **Started:** 2026-01-31T16:00:34Z
- **Completed:** 2026-01-31T16:05:23Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- PWA manifest configured with app name, description, icons, and theme colors from Phase 2
- Serwist service worker with precaching and runtime caching for offline support
- Three PWA icons generated (192x192, 512x512, maskable) with project theme colors
- Service worker builds in production, disabled in development to avoid Turbopack conflicts

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Serwist and configure PWA manifest** - `a324445` (feat)
2. **Task 2: Configure Serwist service worker and Next.js integration** - `cc3c723` (feat)

## Files Created/Modified
- `src/app/manifest.ts` - Typed PWA manifest with app metadata, icons, and theme colors
- `src/app/sw.ts` - Serwist service worker with precaching, skipWaiting, clientsClaim, navigationPreload
- `src/app/layout.tsx` - Added themeColor metadata
- `next.config.ts` - Wrapped with withSerwist, configured swSrc/swDest, disabled in non-production
- `public/icons/icon-192.png` - 192x192 PWA icon (teal background, white "LT" text)
- `public/icons/icon-512.png` - 512x512 PWA icon
- `public/icons/icon-maskable.png` - 512x512 maskable icon with safe zone padding
- `.gitignore` - Exclude auto-generated service worker files (sw.js, workbox-*.js)
- `package.json` - Added @serwist/next and serwist dependencies

## Decisions Made

**1. Serwist disabled in non-production environments**
- Rationale: Serwist doesn't support Turbopack yet (issue #54), causing build failures. Setting `disable: process.env.NODE_ENV !== 'production'` ensures service worker only runs in production.
- Impact: Dev server works without service worker, production builds get full PWA functionality.

**2. Added empty turbopack config to suppress warning**
- Rationale: Next.js 16 defaults to Turbopack and warns about webpack plugins without explicit acknowledgment. `turbopack: {}` suppresses the migration warning.
- Impact: Clean build output without false-positive warnings.

**3. Generated placeholder icons with ImageMagick**
- Rationale: Task required PWA icons in required sizes. Used ImageMagick (available on system) to generate simple teal squares with "LT" text as placeholders.
- Impact: App is immediately installable. Icons can be refined with designer assets later.

**4. Service worker uses defaultCache runtime caching**
- Rationale: Serwist's defaultCache provides sensible caching strategies for Next.js pages, static assets, and API routes.
- Impact: Optimal offline behavior without custom cache configuration.

## Deviations from Plan

None - plan executed exactly as written. Build succeeded after following Serwist's recommended configuration for Next.js App Router with Turbopack.

## Issues Encountered

**1. Turbopack incompatibility with Serwist**
- Problem: Initial build with `disable: process.env.NODE_ENV === 'development'` failed because Serwist tried to run webpack plugin on Turbopack build.
- Resolution: Changed condition to `process.env.NODE_ENV !== 'production'` per Serwist documentation warning.
- Outcome: Production builds work correctly, dev server runs without service worker interference.

**2. ServiceWorkerGlobalScope type not found**
- Problem: TypeScript compilation failed with "Cannot find name 'ServiceWorkerGlobalScope'".
- Resolution: Changed `declare const self: ServiceWorkerGlobalScope` to `declare const self: WorkerGlobalScope` (already declared in global interface).
- Outcome: TypeScript compilation passes.

## Next Phase Readiness

**Ready for:**
- Phase 07-04: Mobile responsive UI can rely on PWA manifest theme colors
- Phase 07-05: PDF export can reference PWA as installation alternative
- Future deployment: PWA installability works immediately on GitHub Pages or any static host

**Notes:**
- Service worker auto-registers in production (default Serwist behavior)
- Manifest served at `/manifest.webmanifest` via Next.js App Router
- Icons can be refined with professional design assets without changing manifest structure
- Lighthouse PWA audit should pass with current configuration

---
*Phase: 07-polish-export-and-growth*
*Completed: 2026-01-31*
