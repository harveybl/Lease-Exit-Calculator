# Phase 2: Lease Entry and Core UI - Research

**Researched:** 2026-01-29
**Domain:** React form management with progressive disclosure, educational tooltips, validation, and persistence
**Confidence:** HIGH

## Summary

Phase 2 requires building a guided lease entry form with progressive disclosure (5 essential fields expanding to optional details), educational tooltips, hybrid validation timing, auto-save drafts, and database persistence. The research identifies React Hook Form + Zod as the clear standard for form management in the Next.js ecosystem (2026), with shadcn/ui providing accessible, composable UI primitives built on Radix UI. For educational tooltips, Radix Popover and Tooltip primitives offer WAI-ARIA compliant components with precise positioning. Auto-save patterns use debounced localStorage with React Hook Form's watch API, while server-side persistence leverages Next.js Server Actions with Drizzle ORM.

The standard approach combines:
- React Hook Form for performant, uncontrolled form state with minimal re-renders
- Zod schemas shared between client and server for type-safe validation
- Radix UI primitives (Popover/Tooltip) for accessible educational overlays
- shadcn/ui composable components for form fields with built-in accessibility
- Debounced localStorage for auto-save drafts (500ms recommended)
- Next.js Server Actions for database mutations with Drizzle ORM
- Hybrid validation timing: silent on first pass, real-time after first submit attempt

**Primary recommendation:** Use React Hook Form + Zod + shadcn/ui Form components + Radix Popover/Tooltip with Server Actions for database persistence. This stack is the 2026 standard for Next.js forms and provides excellent TypeScript integration, accessibility, and developer experience.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | ^7.x | Form state management, validation orchestration | Industry standard for React forms - 12KB gzipped, zero dependencies, minimal re-renders via uncontrolled components. Actively maintained, excellent TypeScript support. Formik is unmaintained (last commit 1+ year ago) |
| zod | ^3.x | Schema validation (client + server) | De facto TypeScript-first validation library. Type inference, composable schemas, custom error messages via `.refine()`. Works seamlessly with React Hook Form via @hookform/resolvers |
| @hookform/resolvers | ^3.x | Zod integration with React Hook Form | Official resolver package for connecting Zod schemas to React Hook Form validation |
| @radix-ui/react-popover | ^1.x | Educational tooltip popovers | Accessible (WAI-ARIA Dialog pattern), unstyled primitive with flexible positioning via Floating UI, modal/non-modal modes, keyboard navigation |
| @radix-ui/react-tooltip | ^1.x | Quick hint tooltips | Accessible (WAI-ARIA compliant), auto-open on hover/focus, global timing control via Provider, portal rendering |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui Form components | Latest | Composable form field components | Pre-built accessible form primitives that integrate React Hook Form + Zod + Radix. Saves boilerplate for FormField/FormItem/FormLabel/FormControl/FormMessage pattern |
| react-hook-form-persist | ^3.x | localStorage persistence for React Hook Form | Auto-save form drafts to localStorage/sessionStorage with field exclusion options. Simpler than custom useEffect hooks for basic use cases |
| use-debounce | ^10.x | Debouncing hook | Generic debounce hook for auto-save triggers (500ms recommended for form saves, 250ms for search/autocomplete) |
| zod-validation-error | ^3.x | User-friendly Zod error formatting | Converts Zod errors to readable messages for end users (optional - Zod's default errors are decent) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React Hook Form | Formik | Formik is unmaintained (no commits/releases in 1+ year). 3.7x larger bundle (44KB vs 12KB). More re-renders due to controlled components |
| React Hook Form | TanStack Form | Newer, less ecosystem support. Good option if already using TanStack ecosystem, but React Hook Form has more mature documentation and community |
| Radix Popover/Tooltip | Floating UI directly | Lower-level positioning library. Use Radix for accessibility patterns + positioning, or Floating UI if you need full custom control |
| shadcn/ui | Build custom with Radix | shadcn/ui IS custom Radix components (copy-paste into codebase). Using shadcn saves boilerplate while maintaining full control |
| Native `<details>`/`<summary>` | JavaScript accordion libraries | Native HTML disclosure elements are performant and accessible, but less styling control. Good for simple cases, but progressive disclosure forms need more control |

**Installation:**
```bash
npm install react-hook-form @hookform/resolvers zod
npm install @radix-ui/react-popover @radix-ui/react-tooltip
npm install use-debounce

# shadcn/ui uses CLI to add components (copies into your codebase)
npx shadcn@latest add form input textarea label button
npx shadcn@latest add popover tooltip
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── lease/
│       ├── new/
│       │   └── page.tsx              # Client component wrapper
│       └── actions.ts                # Server actions ("use server")
├── components/
│   ├── forms/
│   │   ├── LeaseEntryForm.tsx        # Main form component ("use client")
│   │   ├── EssentialFields.tsx       # 5 core fields
│   │   ├── OptionalFieldsSection.tsx # Progressive disclosure expandable
│   │   └── FieldTooltip.tsx          # Reusable educational tooltip wrapper
│   └── ui/
│       ├── form.tsx                  # shadcn Form primitives
│       ├── input.tsx                 # shadcn Input
│       ├── popover.tsx               # shadcn Popover
│       └── tooltip.tsx               # shadcn Tooltip
├── lib/
│   └── validations/
│       └── lease-schema.ts           # Shared Zod schema (no directive - used client+server)
└── hooks/
    └── use-auto-save.ts              # Custom auto-save hook (localStorage + debounce)
```

### Pattern 1: Shared Zod Schema (Client + Server Validation)
**What:** Single source of truth for validation rules, used in both React Hook Form (client) and Server Actions (server)
**When to use:** Always - prevents validation drift between client and server
**Example:**
```typescript
// lib/validations/lease-schema.ts (no "use client" or "use server")
import { z } from "zod";

export const leaseSchema = z.object({
  monthlyPayment: z.number().positive({
    message: "Monthly payment should be a positive number. Check your lease for the amount due each month."
  }),
  term: z.number().int().min(12).max(60, {
    message: "Lease term is typically 24-48 months. Double-check this value."
  }),
  mileageAllowance: z.number().int().positive(),
  residualValue: z.number().positive(),
  currentMileage: z.number().int().nonnegative(),
  // Optional fields
  acquisitionFee: z.number().nonnegative().optional(),
  dispositionFee: z.number().nonnegative().optional(),
}).refine((data) => {
  // Custom validation example: warn if residual seems high
  const estimatedTotal = data.monthlyPayment * data.term;
  return data.residualValue < estimatedTotal * 2;
}, {
  message: "This residual value seems unusual — double-check this value.",
  path: ["residualValue"],
});

export type LeaseFormData = z.infer<typeof leaseSchema>;
```

### Pattern 2: React Hook Form with shadcn/ui Components
**What:** Composable form fields using shadcn's Form primitives with React Hook Form integration
**When to use:** All form fields - provides consistent accessibility and error handling
**Example:**
```typescript
// components/forms/LeaseEntryForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leaseSchema, type LeaseFormData } from "@/lib/validations/lease-schema";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FieldTooltip } from "./FieldTooltip";

export function LeaseEntryForm() {
  const form = useForm<LeaseFormData>({
    resolver: zodResolver(leaseSchema),
    defaultValues: {
      monthlyPayment: 0,
      term: 36,
      mileageAllowance: 12000,
      residualValue: 0,
      currentMileage: 0,
    },
    mode: "onTouched", // Hybrid validation: silent initially, validates after touch
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="monthlyPayment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Monthly Payment
                <FieldTooltip
                  title="Monthly Payment"
                  description="Think of this as what you pay the dealer each month to drive the car."
                  whereToFind="Look on page 2 of your lease agreement, under 'Monthly Payment Amount'"
                  learnMoreUrl="https://www.edmunds.com/car-leasing/calculate-your-own-lease-payment.html"
                />
              </FormLabel>
              <FormDescription>The amount you pay each month</FormDescription>
              <FormControl>
                <Input type="number" placeholder="450" {...field} />
              </FormControl>
              <FormMessage /> {/* Auto-displays Zod error messages */}
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

### Pattern 3: Educational Tooltips with Two-Layer System
**What:** Inline hint text (FormDescription) always visible + detailed popover on (?) icon click
**When to use:** Complex fields that need explanation (residual, money factor, cap cost)
**Example:**
```typescript
// components/forms/FieldTooltip.tsx
"use client";

import { HelpCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface FieldTooltipProps {
  title: string;
  description: string;
  whereToFind?: string;
  learnMoreUrl?: string;
}

export function FieldTooltip({ title, description, whereToFind, learnMoreUrl }: FieldTooltipProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="ml-1 inline-flex text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Help for {title}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
          {whereToFind && (
            <div className="text-sm">
              <strong>Where to find this:</strong>
              <p className="text-muted-foreground">{whereToFind}</p>
            </div>
          )}
          {learnMoreUrl && (
            <a
              href={learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Learn more →
            </a>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### Pattern 4: Progressive Disclosure with Conditional Rendering
**What:** 5 essential fields visible, expandable section for optional details using useWatch to avoid unnecessary re-renders
**When to use:** Forms with many optional fields that would overwhelm users if shown all at once
**Example:**
```typescript
// components/forms/OptionalFieldsSection.tsx
"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OptionalFieldsSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { formState } = useFormContext();

  // Optional: track completeness
  const optionalFieldCount = Object.keys(formState.dirtyFields).filter(
    key => ["acquisitionFee", "dispositionFee", "moneyFactor"].includes(key)
  ).length;

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between"
      >
        <span>Add more details {optionalFieldCount > 0 && `(${optionalFieldCount} added)`}</span>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {isExpanded && (
        <div className="space-y-4 rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            More details improve accuracy
          </p>
          {/* Optional field FormFields here */}
        </div>
      )}
    </div>
  );
}
```

### Pattern 5: Auto-Save with Debounced localStorage
**What:** Persist form state to localStorage with 500ms debounce, restore on mount
**When to use:** Long forms where users might navigate away or close browser
**Example:**
```typescript
// hooks/use-auto-save.ts
"use client";

import { useEffect } from "react";
import { useDebounce } from "use-debounce";
import { UseFormWatch } from "react-hook-form";

export function useAutoSave<T>(
  watch: UseFormWatch<T>,
  storageKey: string,
  delay: number = 500
) {
  const formData = watch();
  const [debouncedData] = useDebounce(formData, delay);

  // Save to localStorage when debounced data changes
  useEffect(() => {
    if (debouncedData) {
      localStorage.setItem(storageKey, JSON.stringify(debouncedData));
    }
  }, [debouncedData, storageKey]);

  // Restore from localStorage on mount
  const getInitialValues = (): Partial<T> | null => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : null;
  };

  // Clear saved draft
  const clearDraft = () => {
    localStorage.removeItem(storageKey);
  };

  return { getInitialValues, clearDraft };
}

// Usage in form component:
const { getInitialValues, clearDraft } = useAutoSave(form.watch, "lease-draft");

useEffect(() => {
  const saved = getInitialValues();
  if (saved) {
    form.reset(saved);
  }
}, []); // Only on mount

const onSubmit = async (data: LeaseFormData) => {
  await saveLease(data);
  clearDraft(); // Clear draft after successful save
};
```

### Pattern 6: Server Actions with Drizzle ORM
**What:** Server-side form mutations using Next.js Server Actions with Zod validation
**When to use:** All database mutations (insert, update, delete)
**Example:**
```typescript
// app/lease/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { leases, mileageHistory } from "@/lib/db/schema";
import { leaseSchema } from "@/lib/validations/lease-schema";

export async function createLease(formData: FormData) {
  // Server-side validation with same Zod schema
  const rawData = Object.fromEntries(formData);
  const parsed = leaseSchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  try {
    // Insert lease with Drizzle ORM
    const [lease] = await db.insert(leases).values({
      monthlyPayment: parsed.data.monthlyPayment.toString(), // Decimal.js string
      term: parsed.data.term,
      mileageAllowance: parsed.data.mileageAllowance,
      residualValue: parsed.data.residualValue.toString(),
      // ... other fields
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // Insert initial mileage history entry with timestamp
    await db.insert(mileageHistory).values({
      leaseId: lease.id,
      mileage: parsed.data.currentMileage,
      recordedAt: new Date(), // Date stamp for projection accuracy
    });

    revalidatePath("/lease");
    return { success: true, leaseId: lease.id };
  } catch (error) {
    console.error("Failed to create lease:", error);
    return { error: "Failed to save lease. Please try again." };
  }
}
```

### Pattern 7: Hybrid Validation Timing
**What:** No validation errors on first pass (mode: "onTouched"), real-time after first submit attempt
**When to use:** Forms where you want friendly UX - don't show errors while user is still filling out
**Example:**
```typescript
const form = useForm<LeaseFormData>({
  resolver: zodResolver(leaseSchema),
  mode: "onTouched", // Validates after field is touched/blurred
  reValidateMode: "onChange", // After first submit, validate on every change
});

// Alternative: trigger validation mode change after first submit
const [hasSubmitted, setHasSubmitted] = useState(false);

const form = useForm<LeaseFormData>({
  resolver: zodResolver(leaseSchema),
  mode: hasSubmitted ? "onChange" : "onTouched",
});

const onSubmit = async (data: LeaseFormData) => {
  setHasSubmitted(true);
  // ... submission logic
};
```

### Anti-Patterns to Avoid
- **Forgetting default values in useForm**: Causes bugs with form submission, reset, dirty field tracking. Always set defaultValues even if empty/zero.
- **Mismatched Zod schema and form field names**: Typos cause silent validation failures. Use TypeScript's type inference to catch at compile time.
- **Manual state management for form fields**: Don't use useState for form fields - defeats React Hook Form's performance optimizations. Use form.watch() or useWatch instead.
- **Defining Server Actions in Client Components**: Server Actions with "use server" directive MUST be in separate files or server components. Import them into client components.
- **Validating only on client**: Always validate on server with same Zod schema - client validation can be bypassed.
- **Conditional fields without unregister**: When hiding fields, use form.unregister() to remove from form state, or use useWatch + separate component to avoid re-render issues.
- **Auto-save without debounce**: Causes excessive localStorage writes and performance issues. Use 500ms debounce minimum.
- **Relying on color alone for validation states**: WCAG violation. Use text, icons, and ARIA attributes (aria-invalid, aria-describedby) in addition to color.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form state management | Custom useState + validation logic | React Hook Form | Managing touched/dirty/errors state, nested objects, field arrays, validation timing, submission handling - 1000+ edge cases. 12KB for battle-tested solution |
| Schema validation | Custom validation functions | Zod | Type inference, composable schemas, async validation, error formatting, coercion. Custom validation duplicates this and breaks type safety |
| Tooltip positioning | Absolute positioning + viewport detection | Radix Tooltip or Floating UI | Collision detection, arrow positioning, overflow ancestors, virtual elements, scroll handling - complex geometry problems already solved |
| Popover focus management | Custom click-outside + escape listeners | Radix Popover | WAI-ARIA Dialog pattern, focus trap, restore focus, nested layers, dismissal, keyboard navigation - accessibility minefield |
| Debouncing | Custom setTimeout cleanup | use-debounce or lodash.debounce | Edge cases with React strict mode, cleanup on unmount, leading/trailing options, max wait times |
| Form accessibility | Custom ARIA attributes | shadcn/ui Form components | Correct aria-invalid, aria-describedby linking, unique ID generation (React.useId), error announcement - easy to get wrong |
| localStorage sync | Custom useEffect + JSON.stringify | react-hook-form-persist or custom hook | Race conditions, JSON serialization edge cases, SSR hydration mismatches, field exclusion |
| Server-side validation | Manual FormData parsing | Zod with FormData | Type coercion from strings, file handling, multi-value fields, nested objects from FormData |

**Key insight:** Form libraries, validation, tooltips, and accessibility are mature problem domains with 10+ years of refinement. Custom solutions miss edge cases (keyboard nav, screen readers, touch devices, RTL layouts, nested forms, async validation). Use battle-tested libraries and focus your effort on domain-specific UX (educational content, friendly error messages, lease-specific validation rules).

## Common Pitfalls

### Pitfall 1: Form Performance Degradation with Large Forms
**What goes wrong:** Form becomes laggy with many fields, typing has delay, validation causes stuttering
**Why it happens:** React Hook Form is performant, but common mistakes break performance: using form.watch() at root level instead of useWatch for specific fields, controlled components that re-render entire form, validation running on every keystroke before submission
**How to avoid:**
- Use `useWatch({ name: "specificField" })` instead of `form.watch()` when you only need one field's value
- Keep validation mode as "onTouched" or "onBlur" until after first submit, then switch to "onChange"
- Extract conditional sections into separate components with their own useWatch subscriptions
- Use `shouldUnregister: true` for unmounted conditional fields
**Warning signs:** Input delay, console warnings about re-renders, React DevTools profiler shows form component re-rendering frequently

### Pitfall 2: Accessible Error Messages Not Announced to Screen Readers
**What goes wrong:** Validation errors appear visually but aren't announced to screen readers, failing WCAG 3.3.1 Error Identification
**Why it happens:** Missing aria-invalid and aria-describedby attributes linking inputs to error messages, error messages not in live region
**How to avoid:**
- Use shadcn/ui FormField/FormMessage components - they handle ARIA attributes automatically
- Ensure error messages have unique IDs linked via aria-describedby
- Use aria-invalid="true" when field has error
- For critical errors, use role="alert" or aria-live="polite" to announce
**Warning signs:** Screen reader testing shows errors not announced, WAVE or axe DevTools flags missing ARIA attributes

### Pitfall 3: Client-Server Validation Drift
**What goes wrong:** Client validation passes but server rejects, or vice versa. Users see confusing "this shouldn't happen" errors
**Why it happens:** Separate validation logic on client and server, or server validation but no client validation, schema changes updated in one place but not the other
**How to avoid:**
- Single Zod schema file with no "use client"/"use server" directive - import in both places
- Use same schema in React Hook Form resolver AND Server Action
- Test: submit form with client JS disabled to verify server validation catches same errors
- CI/CD check: if schema file changes, verify Server Action uses it
**Warning signs:** Server errors that should have been caught client-side, duplicate validation code in different files

### Pitfall 4: localStorage Hydration Mismatch in Next.js
**What goes wrong:** "Hydration failed" errors, flash of wrong data, form resets unexpectedly
**Why it happens:** localStorage accessed during SSR (server has no localStorage), initial render doesn't match server render, restored data set in wrong lifecycle
**How to avoid:**
- Only access localStorage in useEffect (client-side only)
- Use lazy initial state with conditional: `const [value] = useState(() => typeof window !== 'undefined' ? JSON.parse(localStorage.getItem()) : null)`
- Don't restore localStorage data during render - use useEffect after mount
- For Next.js: mark form component with "use client" directive
**Warning signs:** Hydration errors in console, form flashing with empty then populated values, different content on first vs. second render

### Pitfall 5: Decimal/Float Precision Loss in Financial Calculations
**What goes wrong:** Validation passes on client with Decimal.js, but server receives string/number and loses precision, database stores incorrect values
**Why it happens:** FormData converts everything to strings, Zod schema uses z.number() which parses as JavaScript number (loses precision), Decimal.js not used consistently end-to-end
**How to avoid:**
- Use Zod transform to convert form strings to Decimal objects: `z.string().transform(val => new Decimal(val))`
- Or validate as string and construct Decimal in Server Action before database insert
- Ensure Drizzle custom type (decimalNumber from Phase 1) handles Decimal.js correctly
- Never use JavaScript number type for monetary values
**Warning signs:** Amounts like 450.00 becoming 449.99999 or rounding differently, test failures comparing Decimal to number

### Pitfall 6: Forgetting to Unregister Conditional Fields
**What goes wrong:** Hidden fields still submit their values, validation runs on invisible fields, form.formState.isDirty includes hidden fields
**Why it happens:** React Hook Form keeps field registration even when component unmounts unless explicitly told to unregister
**How to avoid:**
- Use `shouldUnregister: true` in useForm options if conditional fields should not persist
- Or manually unregister when hiding: `useEffect(() => { if (!visible) form.unregister("fieldName") }, [visible])`
- Or extract conditional fields into separate component with useWatch - when unmounted, field auto-unregisters
- Decide: do you want hidden fields to keep their values (user re-expands) or reset?
**Warning signs:** Form submits data for fields that aren't visible, validation errors on hidden fields

### Pitfall 7: Tooltip/Popover Z-Index Issues
**What goes wrong:** Tooltips appear behind other elements, modal dialogs hide popovers, stacking context issues
**Why it happens:** Complex CSS stacking contexts, positioned ancestors, multiple portals with different z-index
**How to avoid:**
- Use Radix Portal components - render into document.body by default (escapes stacking contexts)
- Set consistent z-index scale in Tailwind config for overlays (e.g., tooltip: 50, popover: 60, modal: 70)
- Avoid transform/opacity/filter on positioned ancestors (creates new stacking context)
- If needed, customize portal container: `<PopoverPortal container={customContainer}>`
**Warning signs:** Tooltips not visible, visual layering bugs, tooltip appears then immediately disappears

### Pitfall 8: Overly Aggressive Auto-Save Creating Race Conditions
**What goes wrong:** Auto-save triggers while user is typing, multiple saves overlap, last save overwrites correct data with stale data
**Why it happens:** No debounce, debounce too short, not using AbortController for in-flight requests
**How to avoid:**
- Use 500ms minimum debounce for auto-save (250ms feels too aggressive for saves)
- Don't auto-save on submit - explicit save only
- If saving to API (not just localStorage), use AbortController to cancel in-flight requests
- Show save status indicator: "Saving...", "Saved", "Failed to save"
**Warning signs:** Multiple network requests fired for same form, save errors due to concurrent updates, data loss

## Code Examples

Verified patterns from official sources:

### Example 1: Form with Zod Validation (React Hook Form + shadcn/ui)
```typescript
// Source: https://ui.shadcn.com/docs/components/form
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  monthlyPayment: z.coerce.number().positive("Monthly payment must be positive"),
  term: z.coerce.number().int().min(12).max(60),
});

export function LeaseForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyPayment: 0,
      term: 36,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="monthlyPayment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Payment</FormLabel>
              <FormControl>
                <Input placeholder="450" type="number" {...field} />
              </FormControl>
              <FormDescription>
                The amount you pay each month
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### Example 2: Educational Popover with Radix
```typescript
// Source: https://www.radix-ui.com/primitives/docs/components/popover
"use client";

import * as Popover from "@radix-ui/react-popover";
import { HelpCircle } from "lucide-react";

export function ResidualValueTooltip() {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="IconButton" aria-label="Help for residual value">
          <HelpCircle className="h-4 w-4" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="PopoverContent" sideOffset={5}>
          <div className="space-y-2">
            <h4 className="font-medium">Residual Value</h4>
            <p className="text-sm text-muted-foreground">
              Think of this as what the dealer thinks your car will be worth when your lease is up.
            </p>
            <div className="text-sm">
              <strong>Where to find this:</strong>
              <p className="text-muted-foreground">
                Look on page 2 of your lease agreement, under "Residual Value" or "Lease End Value"
              </p>
            </div>
            <a
              href="https://www.edmunds.com/car-leasing/residual-value.html"
              target="_blank"
              rel="noopener"
              className="text-sm text-primary hover:underline"
            >
              Learn more →
            </a>
          </div>
          <Popover.Arrow className="PopoverArrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
```

### Example 3: Next.js Server Action with Zod + Drizzle
```typescript
// Source: https://nextjs.org/docs/app/guides/forms (pattern)
// and https://orm.drizzle.team/docs/insert
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { leases } from "@/lib/db/schema";
import { leaseSchema } from "@/lib/validations/lease-schema";

export async function createLease(formData: FormData) {
  // Server-side validation
  const rawData = {
    monthlyPayment: Number(formData.get("monthlyPayment")),
    term: Number(formData.get("term")),
    mileageAllowance: Number(formData.get("mileageAllowance")),
    residualValue: Number(formData.get("residualValue")),
    currentMileage: Number(formData.get("currentMileage")),
  };

  const parsed = leaseSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      error: "Invalid form data",
      issues: parsed.error.issues
    };
  }

  try {
    const [lease] = await db
      .insert(leases)
      .values({
        monthlyPayment: parsed.data.monthlyPayment.toString(),
        term: parsed.data.term,
        mileageAllowance: parsed.data.mileageAllowance,
        residualValue: parsed.data.residualValue.toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    revalidatePath("/lease");
    return { success: true, leaseId: lease.id };
  } catch (error) {
    return { error: "Failed to save lease" };
  }
}
```

### Example 4: Auto-Save with Debounce
```typescript
// Source: https://coreui.io/answers/how-to-debounce-input-in-react/ (pattern)
"use client";

import { useEffect } from "react";
import { useDebounce } from "use-debounce";
import { UseFormWatch } from "react-hook-form";

export function useFormAutoSave<T extends Record<string, any>>(
  watch: UseFormWatch<T>,
  storageKey: string,
  delay = 500
) {
  const formData = watch();
  const [debouncedData] = useDebounce(formData, delay);

  useEffect(() => {
    if (typeof window !== "undefined" && debouncedData) {
      localStorage.setItem(storageKey, JSON.stringify(debouncedData));
    }
  }, [debouncedData, storageKey]);

  const loadSaved = (): Partial<T> | null => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : null;
  };

  const clearSaved = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey);
    }
  };

  return { loadSaved, clearSaved };
}
```

### Example 5: Conditional Fields with useWatch
```typescript
// Source: https://echobind.com/post/conditionally-render-fields-using-react-hook-form
"use client";

import { useWatch } from "react-hook-form";
import { FormField } from "@/components/ui/form";

export function ConditionalField({ control }) {
  const hasMoneyFactor = useWatch({
    control,
    name: "hasMoneyFactor",
  });

  // Only renders when checkbox is true
  // Automatically unregisters when unmounted (if shouldUnregister: true)
  return hasMoneyFactor ? (
    <FormField
      control={control}
      name="moneyFactor"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Money Factor</FormLabel>
          <FormControl>
            <Input type="number" step="0.000001" {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  ) : null;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Formik for React forms | React Hook Form | 2023-2024 | Formik unmaintained (no releases 1+ year), React Hook Form 3.7x smaller, better performance with uncontrolled components |
| Manual ARIA for tooltips | Radix UI primitives | 2022-present | Radix provides WAI-ARIA compliant components out of the box, integrated with Floating UI for positioning |
| Popper.js for positioning | Floating UI | 2021 (Popper.js v2 → Floating UI) | Floating UI is Popper.js v3 rebranded, more modular, better TypeScript support |
| Custom shadcn/ui installation | shadcn CLI | 2024-present | CLI now standard, copies components into codebase for full control vs. package dependency |
| Pages Router forms with API routes | App Router Server Actions | 2023 (Next.js 13+) | Server Actions eliminate API route boilerplate, integrated form handling with progressive enhancement |
| Manual FormData parsing | Zod with z.coerce | 2023-present | Zod handles string→number coercion from FormData automatically, reduces boilerplate |
| Class components for forms | Hooks (React Hook Form) | 2019-present | Hooks-first approach, functional components standard for new code |
| `<details>`/`<summary>` for simple disclosure | JS libraries for progressive disclosure | 2024-present | Native HTML disclosure elements widely supported, performant, accessible - use for simple cases |

**Deprecated/outdated:**
- **Formik**: Unmaintained, last commit March 2024, no releases 1+ year. Use React Hook Form instead.
- **Redux Form**: Heavy, requires Redux, overkill for most forms. Use React Hook Form for local state.
- **Popper.js v2**: Now Floating UI. Update imports from `@popperjs/core` to `@floating-ui/react`.
- **Next.js Pages Router with API routes for forms**: App Router Server Actions are the new standard for form mutations.

## Open Questions

Things that couldn't be fully resolved:

1. **Date-stamped mileage history schema design**
   - What we know: ENTRY-07 requires current mileage with date stamping for projection accuracy. Need separate `mileageHistory` table with `recordedAt` timestamp.
   - What's unclear: Should initial mileage entry create history record, or only updates? How to handle bulk imports vs. manual entries?
   - Recommendation: Create history record on every save (initial + edits). Single source of truth pattern - query most recent mileageHistory entry for "current mileage", not separate field on lease.

2. **Post-save navigation behavior**
   - What we know: Context says "Claude's Discretion" for post-save navigation
   - What's unclear: Stay on form for editing, navigate to comparison view, show success toast and redirect?
   - Recommendation: Research dashboard/comparison view UX in Phase 3+ to inform. For now, show success toast + stay on form with "View Comparison" button (non-blocking navigation).

3. **Optimistic UI updates vs. Server Action response**
   - What we know: Server Actions can return data, React 19 useActionState hook available
   - What's unclear: Best pattern for showing save status (loading, success, error) while Server Action pending
   - Recommendation: Use React 19 useActionState with isPending state for loading UI. Don't implement optimistic updates yet (adds complexity for low value in lease entry form).

4. **Field grouping strategy for optional section**
   - What we know: Context says "Claude's Discretion" for specific grouping within expanded section
   - What's unclear: Group by concept (Financial, Vehicle Info, Fees) or flat list? User testing needed.
   - Recommendation: Start with flat list of optional fields. If >10 optional fields, introduce grouped sub-sections. For Phase 2 (7 requirements), flat list sufficient.

5. **Tailwind CSS 4 compatibility with shadcn/ui**
   - What we know: Project uses Tailwind CSS 4 (package.json), shadcn/ui docs show Tailwind CSS 3 examples
   - What's unclear: Are there breaking changes in Tailwind CSS 4 that affect shadcn components?
   - Recommendation: Test shadcn CLI installation with Tailwind 4 in dev. shadcn is just copy-paste components, so fixing compatibility is straightforward if issues arise. Mark as LOW confidence until tested.

## Sources

### Primary (HIGH confidence)
- React Hook Form official documentation - https://react-hook-form.com (WebFetch 2026-01-29)
- Radix UI Popover - https://www.radix-ui.com/primitives/docs/components/popover (WebFetch 2026-01-29)
- Radix UI Tooltip - https://www.radix-ui.com/primitives/docs/components/tooltip (WebFetch 2026-01-29)
- Drizzle ORM Insert API - https://orm.drizzle.team/docs/insert (WebFetch 2026-01-29)
- shadcn/ui Form components - https://ui.shadcn.com/docs/components/form (WebFetch 2026-01-29)
- Next.js Forms guide - https://nextjs.org/docs/app/guides/forms (referenced in WebSearch, official docs)
- Zod Error Customization - https://zod.dev/error-customization (WebSearch verified)
- W3C WAI Form Notifications - https://www.w3.org/WAI/tutorials/forms/notifications/ (WebSearch verified)

### Secondary (MEDIUM confidence)
- React Hook Form vs Formik comparison - LogRocket, Refine, Joyfill (multiple sources agree, 2024-2025)
- Form accessibility best practices - W3C WAI, Deque, DigitalA11Y (WCAG 3.3.1 Error Identification)
- Next.js 15 Server Actions patterns - Medium tutorials, Next.js blog (2025-2026)
- Drizzle ORM with Next.js - Refine.dev, Strapi.io tutorials (January 2026)
- Debounce patterns in React - CoreUI, Developer Way (2024-2025)
- Progressive disclosure UX - NN/g, LogRocket, UXPin (established UX patterns)
- Auto-save patterns - Medium, GitHub discussions (2024-2025)

### Tertiary (LOW confidence)
- Tailwind CSS 4 form validation - Search results showed Tailwind CSS general patterns, not specific v4 features (mark for testing)
- shadcn/ui with Tailwind CSS 4 compatibility - Not explicitly documented, assume compatible but test (copy-paste components, not versioned package)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - React Hook Form + Zod + Radix is 2026 standard, verified with official docs and multiple authoritative sources. Formik's unmaintained status confirmed via GitHub.
- Architecture: HIGH - Patterns verified with official documentation (React Hook Form, Radix, Next.js, Drizzle). Server Actions + Zod shared schema is canonical Next.js 15 approach.
- Pitfalls: MEDIUM-HIGH - Common pitfalls sourced from official FAQs, GitHub discussions, and blog posts. Some are general React/Next.js patterns (hydration) not React Hook Form specific, but verified applicable.

**Research date:** 2026-01-29
**Valid until:** 2026-03-01 (30 days - stable ecosystem, but Next.js and React iterate quickly)
