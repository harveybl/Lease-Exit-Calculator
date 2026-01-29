---
phase: 02-lease-entry-and-core-ui
plan: 01
subsystem: ui-foundation
tags: [shadcn, zod, validation, tooltips, theme]
requires: [01-foundation]
provides: [ui-components, validation-schema, tooltip-content, warm-theme]
affects: [02-02, 02-03]
tech-stack:
  added: [react-hook-form, zod, @hookform/resolvers, @radix-ui/react-popover, @radix-ui/react-tooltip, @radix-ui/react-select, @radix-ui/react-label, @radix-ui/react-slot, use-debounce, clsx, tailwind-merge, class-variance-authority, lucide-react]
  patterns: [shadcn-components, css-variables, progressive-disclosure-validation]
key-files:
  created:
    - components.json
    - src/lib/utils.ts
    - src/components/ui/form.tsx
    - src/components/ui/input.tsx
    - src/components/ui/button.tsx
    - src/components/ui/label.tsx
    - src/components/ui/popover.tsx
    - src/components/ui/tooltip.tsx
    - src/components/ui/select.tsx
    - src/components/ui/textarea.tsx
    - src/lib/validations/lease-schema.ts
    - src/lib/content/field-tooltips.ts
  modified:
    - package.json
    - package-lock.json
    - src/app/globals.css
    - tailwind.config.ts
decisions:
  - decision: "Use shadcn/ui New York style with neutral base color for warm, refined aesthetic"
    rationale: "New York style provides more refined components matching the 'Stripe/Robinhood' design direction"
  - decision: "Warm color palette with teal primary (195 85% 45%) and warm off-white background (28 20% 98%)"
    rationale: "Trustworthy but friendly - financial without being intimidating"
  - decision: "Separate warning function (checkLeaseWarnings) from schema validation"
    rationale: "Warnings are informational (yellow) and non-blocking, while errors (red) block submission"
  - decision: "Use z.coerce for all numeric and date fields instead of explicit parsing"
    rationale: "Simplifies form handling - React Hook Form can pass string values and Zod coerces automatically"
  - decision: "Tooltip content includes 'whereToFind' guidance for lease paperwork"
    rationale: "Users need to know where to look in their lease documents - reduces frustration"
metrics:
  duration: 5m 32s
  completed: 2026-01-29
---

# Phase 2 Plan 01: UI Foundation and Validation Summary

**One-liner:** shadcn/ui with warm teal theme, shared Zod schema (5 required + 14 optional fields), and educational tooltip content for all lease terms

## What Was Built

### Task 1: Dependencies and shadcn/ui Setup
- Installed form dependencies: react-hook-form, zod, @hookform/resolvers, radix-ui primitives, use-debounce
- Created components.json with New York style, neutral base color, CSS variables enabled
- Configured warm color palette in globals.css:
  - Primary: warm teal (195 85% 45%) - trustworthy but friendly
  - Background: warm off-white (28 20% 98%) - not harsh pure white
  - Warning: amber (38 92% 50%) for unusual-but-valid warnings
  - Rounded corners: 0.75rem default (rounded-xl) for soft, approachable feel
- Updated tailwind.config.ts to consume CSS variables via hsl()
- Created 9 shadcn/ui components: form, input, button, label, popover, tooltip, select, textarea
- Added src/lib/utils.ts with cn() helper for class merging (clsx + tailwind-merge)

**Tailwind CSS 4 Compatibility Note:** The project uses Tailwind CSS 4 via @tailwindcss/postcss. The `@apply` directive doesn't work with custom CSS variables in the same way as v3, so we use direct CSS properties in the base layer (`border-color: hsl(var(--border))` instead of `@apply border-border`).

### Task 2: Validation Schema and Tooltip Content
- Created leaseFormSchema (src/lib/validations/lease-schema.ts):
  - 5 required essential fields: monthlyPayment, termMonths, allowedMilesPerYear, residualValue, currentMileage
  - 14 optional fields: make, model, year, msrp, netCapCost, residualPercent, moneyFactor, downPayment, dispositionFee, purchaseFee, overageFeePerMile, monthsElapsed, stateCode, startDate, endDate
  - Cross-field validation: date consistency, months elapsed vs term
  - Friendly error messages guiding users to correct values
- Created checkLeaseWarnings function:
  - Returns array of warnings for unusual-but-valid values
  - High residual relative to payments: warns if residualValue > totalPayments * 2
  - Unusually high monthly payment: warns if > $2000
  - Significant mileage overage: warns if 1.5x over expected
  - Unusual money factor: warns if outside 0.0001-0.005 range
  - **Important:** Warnings do NOT block submission (yellow) - only errors block (red)
- Created fieldTooltips (src/lib/content/field-tooltips.ts):
  - Educational content for all 19 lease fields
  - Structure: title, shortHint (always visible), description (popover), whereToFind, learnMoreUrl, example
  - Tone: casual, friendly, approachable - "like explaining over coffee"
  - "Where to find" guidance: specific page numbers and section names in lease paperwork
  - External links: Edmunds, NerdWallet articles for complex terms (money factor, cap cost, residual)

## Technical Decisions

**No "use client"/"use server" directives on shared schema:**
The lease-schema.ts file must be importable from both client (React Hook Form) and server (Server Actions) contexts. Zod schemas are pure JavaScript and work in both environments.

**z.coerce for all numeric fields:**
Using z.coerce.number() instead of z.number() allows React Hook Form to pass string values from inputs and have Zod automatically coerce them to numbers. This simplifies form handling significantly.

**CSS variables over hardcoded colors:**
All colors defined as CSS variables in globals.css and consumed via hsl() in tailwind.config.ts. This enables easy theme switching (dark mode already scaffolded) and maintains consistency across components.

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

All verification criteria met:
- ✓ All dependencies installed (verified with npm ls)
- ✓ components.json exists with correct aliases
- ✓ All 9 UI components exist and export correct primitives
- ✓ src/lib/utils.ts exists with cn() function
- ✓ npx tsc --noEmit passes with no type errors
- ✓ npm run build succeeds (Next.js 16.1.6 with Turbopack)
- ✓ leaseFormSchema exports and validates correctly
- ✓ checkLeaseWarnings returns warnings without blocking
- ✓ fieldTooltips covers all essential and optional fields

## Files Changed

**Created (12 files):**
- components.json - shadcn/ui configuration
- src/lib/utils.ts - cn() helper for class merging
- src/components/ui/form.tsx - Form primitives (Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription)
- src/components/ui/input.tsx - Input component
- src/components/ui/button.tsx - Button component with variants
- src/components/ui/label.tsx - Label component
- src/components/ui/popover.tsx - Popover component (for tooltip popovers)
- src/components/ui/tooltip.tsx - Tooltip component
- src/components/ui/select.tsx - Select dropdown component
- src/components/ui/textarea.tsx - Textarea component
- src/lib/validations/lease-schema.ts - Shared Zod schema and warning function
- src/lib/content/field-tooltips.ts - Educational tooltip content

**Modified (4 files):**
- package.json - Added 13 new dependencies
- package-lock.json - Locked dependency versions
- src/app/globals.css - Warm color palette CSS variables (light + dark mode)
- tailwind.config.ts - Theme extension for CSS variables, dark mode class strategy

## Next Phase Readiness

**Ready for Plan 02-02:** Form component construction can now begin. All prerequisites in place:
- shadcn/ui components available for import
- Zod schema ready for React Hook Form resolver
- Tooltip content ready for FieldTooltip wrapper component
- Warm theme applied globally

**Blockers:** None

**Concerns:** None - foundation is solid

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 | 97b73b8 | chore(02-01): install dependencies and initialize shadcn/ui with warm theme |
| 2 | f7b59a0 | feat(02-01): create shared Zod validation schema and tooltip content |

**Total:** 2 commits (per-task atomic commits)
