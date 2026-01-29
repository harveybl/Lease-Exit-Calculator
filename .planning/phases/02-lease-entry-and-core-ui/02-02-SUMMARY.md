---
phase: 02-lease-entry-and-core-ui
plan: 02
subsystem: form-components
tags: [react-hook-form, progressive-disclosure, auto-save, validation, tooltips]
requires: [02-01]
provides: [lease-entry-form, field-tooltip, auto-save-hook]
affects: [02-03]
tech-stack:
  added: []
  patterns: [progressive-disclosure, hybrid-validation, debounced-auto-save, two-layer-tooltips]
key-files:
  created:
    - src/components/forms/FieldTooltip.tsx
    - src/hooks/use-auto-save.ts
    - src/components/forms/EssentialFields.tsx
    - src/components/forms/OptionalFieldsSection.tsx
    - src/components/forms/LeaseEntryForm.tsx
  modified: []
decisions:
  - decision: "Use Popover (not Tooltip) for educational content with rich formatting and links"
    rationale: "Tooltips are for simple text hints only. Popovers support interactive content (links) and rich formatting required for 'where to find' guidance"
  - decision: "Progressive disclosure tracks completion count with useWatch instead of form.watch()"
    rationale: "form.watch() at root level causes performance issues. useWatch subscribes to specific fields only"
  - decision: "Empty string defaults for required number fields, coerced by Zod schema"
    rationale: "React Hook Form works with string inputs, z.coerce handles conversion to numbers automatically"
  - decision: "Dollar sign ($) and unit labels positioned absolutely within input containers"
    rationale: "Visual clarity without adding separate label elements - keeps fields compact"
  - decision: "Warnings checked on every form data change, displayed as amber non-blocking alerts"
    rationale: "Users see warnings immediately but can still submit - educational without being pushy"
  - decision: "Auto-save indicator shows 'Draft auto-saved to this device' below submit button"
    rationale: "Subtle reassurance without being intrusive - users know their data is safe"
metrics:
  duration: 4m 45s
  completed: 2026-01-29
---

# Phase 2 Plan 02: Form Components and Progressive Disclosure Summary

**One-liner:** Complete lease entry form with FieldTooltip popover component, debounced auto-save hook, 5 essential fields, 15 optional fields in grouped expandable section, and hybrid validation with non-blocking warnings

## What Was Built

### Task 1: FieldTooltip Component and Auto-Save Hook

**FieldTooltip.tsx:**
- Educational popover component with (?) icon trigger
- Fetches content from fieldTooltips object by fieldName prop
- Displays: title (bold), description (friendly), whereToFind (bordered section), example (code style), learnMoreUrl (external link with icon)
- Uses shadcn Popover with max-w-sm, p-4, rounded-xl styling
- Accessible: sr-only label, proper ARIA attributes from Radix
- Console warns if fieldName not found in tooltip content

**use-auto-save.ts:**
- Custom hook: `useFormAutoSave<T>(watch, storageKey, delay = 500ms)`
- Watches all form values with React Hook Form's watch function
- Debounces changes with use-debounce library
- Saves debounced data to localStorage in useEffect
- Returns: loadSaved(), clearSaved(), hasSavedDraft boolean
- SSR-safe: all localStorage access guarded by `typeof window !== "undefined"`
- Never accesses localStorage during render (only in useEffect or event handlers)

### Task 2: Form Components

**EssentialFields.tsx:**
- 5 required fields visible on initial load
- Each field structure: FormLabel + FieldTooltip + FormDescription (shortHint) + FormControl (Input with prefix/suffix) + FormMessage
- Fields:
  1. Monthly Payment ($): number input, $ prefix, placeholder "450"
  2. Lease Term: number input, "months" suffix, placeholder "36"
  3. Annual Mileage Allowance: number input, "miles/year" suffix, placeholder "12000"
  4. Residual Value ($): number input, $ prefix, placeholder "18000"
  5. Current Mileage: number input, "miles" suffix, placeholder "15000"
- Prefix/suffix labels positioned absolutely within input containers (clean visual)
- Vertical stack with space-y-6 between fields

**OptionalFieldsSection.tsx:**
- Progressive disclosure expandable section with chevron icon toggle
- Tracks completion count using useWatch on 15 specific optional fields
- Shows "Add more details (X of 15 added)" on expand button
- When collapsed: subtle hint "More details improve accuracy"
- When expanded: rounded-xl card with 4 grouped sections:
  - **Vehicle Information:** make, model, year
  - **Financial Details:** msrp, netCapCost, residualPercent, moneyFactor, downPayment
  - **Fees:** dispositionFee, purchaseFee, overageFeePerMile
  - **Lease Timeline:** monthsElapsed, stateCode, startDate, endDate
- Each group has muted heading (text-sm font-medium text-muted-foreground)
- Date fields use HTML5 date input with proper value conversion
- State code auto-uppercases on input

**LeaseEntryForm.tsx:**
- Main orchestration component wrapping EssentialFields + OptionalFieldsSection
- React Hook Form setup:
  - zodResolver(leaseFormSchema) for validation
  - mode: "onTouched" (hybrid validation - silent initially)
  - reValidateMode: "onChange" (real-time after first submit)
  - defaultValues: sensible defaults (36 months, 12000 miles/year, empty strings for required user input)
- Auto-save integration:
  - useFormAutoSave hook with 500ms debounce
  - Restores draft on mount with visual "Draft restored" indicator (fades after 3s)
  - Shows "Draft auto-saved to this device" below submit button when draft exists
- Warning system:
  - useEffect subscribes to form.watch() and calls checkLeaseWarnings
  - Displays warnings in amber/yellow alert box above submit button
  - Non-blocking: user can submit despite warnings
- Visual container:
  - Centered card: max-w-2xl mx-auto
  - Rounded-2xl border with shadow-sm
  - Padding: p-6 sm:p-8
  - Header: "Enter Your Lease Details" with friendly subtitle
- Submit button:
  - Shows "Validating..." when isSubmitting
  - Console.log for now (server actions coming in Plan 03)
  - Clears saved draft on successful submission

## Technical Decisions

**Popover vs Tooltip for educational content:**
Popovers support rich content (headings, paragraphs, borders, links), while tooltips are text-only. Educational content needs "where to find" sections with visual separators and "learn more" external links - Popover is the right primitive.

**useWatch performance optimization:**
Using `form.watch()` at root level subscribes to ALL form changes and re-renders the component on every field update. useWatch subscribes to specific fields only, preventing unnecessary re-renders. This is critical for forms with 20+ fields.

**Empty string defaults for number fields:**
React Hook Form works with HTML input values (strings). Using empty strings for required number fields allows the input to be initially empty, and z.coerce.number() handles the conversion. This is simpler than managing undefined states.

**Absolute positioned prefix/suffix labels:**
Instead of separate label elements or input groups, prefix/suffix labels are positioned absolutely within the input container. This keeps the FormItem structure clean and avoids extra wrapper divs.

**Warning check on form.watch subscription:**
Warnings are checked on every form data change (via form.watch subscription) rather than on submit. This gives users immediate feedback about unusual values while still allowing submission.

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

All verification criteria met:
- ✓ npx tsc --noEmit passes with no errors
- ✓ src/components/forms/FieldTooltip.tsx exports FieldTooltip component
- ✓ src/hooks/use-auto-save.ts exports useFormAutoSave hook
- ✓ FieldTooltip accepts fieldName prop and renders Popover with content from field-tooltips.ts
- ✓ Auto-save hook uses useDebounce with configurable delay
- ✓ No direct localStorage access outside useEffect (verified with grep)
- ✓ src/components/forms/LeaseEntryForm.tsx exports LeaseEntryForm
- ✓ src/components/forms/EssentialFields.tsx exports EssentialFields with 5 form fields
- ✓ src/components/forms/OptionalFieldsSection.tsx exports OptionalFieldsSection with expandable section
- ✓ LeaseEntryForm uses zodResolver with leaseFormSchema
- ✓ LeaseEntryForm integrates useFormAutoSave hook
- ✓ Each essential field has FormLabel + FieldTooltip + FormDescription + FormControl + FormMessage
- ✓ Progressive disclosure section tracks and displays optional field completion count
- ✓ npm run build succeeds

## Files Changed

**Created (5 files):**
- src/components/forms/FieldTooltip.tsx - Educational popover with (?) icon trigger
- src/hooks/use-auto-save.ts - Debounced localStorage persistence hook
- src/components/forms/EssentialFields.tsx - 5 essential lease fields component
- src/components/forms/OptionalFieldsSection.tsx - Progressive disclosure expandable section
- src/components/forms/LeaseEntryForm.tsx - Main form orchestration component

**Modified (0 files):**
- None

## Next Phase Readiness

**Ready for Plan 02-03:** Server actions and database persistence can now be wired up. All form components are complete and ready to integrate with:
- Server actions for CRUD operations (createLease, updateLease, deleteLease)
- Page routes (app/lease/new, app/lease/[id]/edit)
- Database integration via Drizzle ORM

**Blockers:** None

**Concerns:**
- Date field handling: HTML5 date inputs work, but consider date-fns or similar for better UX in Plan 03
- Type safety with z.coerce: The any type assertions in LeaseEntryForm are a workaround for Zod's input/output type mismatch with z.coerce. This is acceptable for now but could be improved with better types in a future refactor

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 | c1f6928 | feat(02-02): create FieldTooltip component and auto-save hook |
| 2 | c71a17f | feat(02-02): build complete lease entry form with progressive disclosure |

**Total:** 2 commits (per-task atomic commits)
