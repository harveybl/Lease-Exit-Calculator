# Lease Exit Calculator — repository index

Plain-markdown orientation for humans and coding agents. **This repository is PUBLIC**; this file only restates what is already in the repo. Based on `master` at `f0fb8a3` (2026-02-05). `README.md` and `FEATURES.md` are authoritative.

## Purpose
Web app that compares every exit option for a vehicle lease (return, buy out, sell privately, early termination, extend, transfer) with itemized costs, a month-by-month timeline, and a "act now or wait" recommendation (README). Client-side storage (IndexedDB); installable PWA; PDF export.

## Structure
| Path | What |
|---|---|
| `src/app/` | Next.js App Router pages (`page.tsx`, `lease/`, `layout.tsx`) |
| `src/components/` | UI: `comparison`, `forms`, `lease`, `timeline`, `disclaimers`, `ui` (shadcn/Radix) |
| `src/lib/` | Core logic: `calculations/`, `recommendations/`, `services/`, `validations/`, `db/` (IndexedDB), `pdf/`, `content/`, `types/`, `decimal.ts` (Decimal.js money math), `disclaimers.ts` |
| `src/hooks/` | `use-auto-save.ts` |
| `src/__tests__/lib/` | Vitest tests for the calculation library |
| `public/` | Static/PWA assets |
| `FEATURES.md`, `PHASE2-ANALYSIS.md` | Feature status and planning notes |
| `.github/workflows/deploy.yml` | GitHub Pages deploy |
| `.env.example` | Environment template (a `DATABASE_URL` entry exists; how it is used is *unknown*) |

Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, Decimal.js, Recharts, Zod/React Hook Form, Vitest (README states 208 tests), Serwist PWA.

## Build and test (from `package.json`)
```bash
npm install
npm run dev
npm run build
npm run lint
npm run test          # vitest run
npm run test:coverage
```

## CI/CD (from `.github/workflows/deploy.yml`)
"Deploy to GitHub Pages": on push to `master` or manual dispatch → Node 20, `npm ci`, `npm run build`, upload `out/`, deploy with `actions/deploy-pages`. There is no test or lint job in the workflow.

## Recent notable changes (git log, Feb 2026)
Planning/analysis documents (Phase 2 analysis, FEATURES.md, v2.0 phases 9–12), GitHub Pages status correction, merge of two Copilot-authored PRs (#1 lease calculation review, #2 missing-features review).
