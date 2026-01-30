# Phase 4: Market Value and Valuation - Research

**Researched:** 2026-01-30
**Domain:** Form state management, database history tracking, provider pattern architecture, React Hook Form, Drizzle ORM
**Confidence:** HIGH

## Summary

Phase 4 adds manual market value entry with dual entry points (lease form and comparison page), full value history tracking, and a provider interface for future API integration. The implementation leverages existing project patterns: React Hook Form for validation, Drizzle ORM for persistence, Next.js Server Actions for mutations, and shadcn/ui components for the UI.

Key technical challenges include managing form state across multiple entry points, maintaining value history with timestamps, implementing instant recalculation on value changes, and designing a provider interface that supports future API integrations without breaking downstream code.

The standard approach uses React Hook Form's `setValue` with validation triggers for external updates, Drizzle one-to-many relations for history tracking with `$onUpdate()` for auto-timestamps, Next.js Server Actions with `revalidatePath` for instant feedback, and TypeScript adapter pattern for the provider interface.

**Primary recommendation:** Implement a separate `market_values` table with foreign key to `leases`, use React Hook Form's controlled component pattern for dual entry points, create a `ValuationProvider` interface with manual implementation first, and leverage existing comparison view architecture for instant recalculation.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React Hook Form | 7.71.1 | Form state management across multiple entry points | Already in use; supports `setValue` with validation triggers for external updates |
| Drizzle ORM | 0.45.1 | Database schema and queries | Already in use; supports one-to-many relations and `$onUpdate()` for auto-timestamps |
| Zod | 4.3.6 | Schema validation (client and server) | Already in use; shared validation between form and server actions |
| Next.js Server Actions | 16.1.6 | Mutations and revalidation | Already in use; native RSC pattern with `revalidatePath` for instant updates |
| Decimal.js | 10.6.0 | Precision arithmetic | Already in use; required for all monetary values per [01-01] decision |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | N/A (add if needed) | Relative time formatting ("30 days ago") | For staleness warnings; lighter than Luxon/Day.js |
| shadcn/ui Input | Latest | Manual value entry component | Existing pattern; consistent with Phase 2 form fields |
| shadcn/ui Popover | Latest | Educational content for value sources | Existing pattern per [02-02] and [03-02] decisions |
| lucide-react | 0.563.0 | Icons (Edit, AlertCircle for staleness) | Already in use; consistent with existing UI |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| date-fns | Luxon or Day.js | Luxon is heavier but offers more features; Day.js mimics Moment.js API but no advantage here |
| Separate table | JSON column in leases | JSON loses relational queries and type safety; separate table enables trends/auditing |
| TypeScript interface | Abstract class | Interface is lighter and more idiomatic for simple adapter pattern |

**Installation:**
```bash
# Only if date-fns is needed for relative time
npm install date-fns
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── services/
│   │   ├── valuation/
│   │   │   ├── provider.ts          # ValuationProvider interface
│   │   │   ├── manual-provider.ts   # ManualValuationProvider implementation
│   │   │   └── index.ts             # Export public API
│   ├── db/
│   │   └── schema.ts                # Add market_values table
│   ├── validations/
│   │   └── market-value-schema.ts   # Zod schema for market value entry
├── components/
│   ├── forms/
│   │   └── MarketValueField.tsx     # Reusable market value input (for lease form)
│   ├── comparison/
│   │   └── MarketValueBanner.tsx    # CTA banner when no value set
│   │   └── MarketValueDisplay.tsx   # Display with edit capability
│   │   └── EquityDisplay.tsx        # Prominent equity callout
├── app/
│   ├── lease/
│   │   └── actions.ts               # Add createMarketValue, updateMarketValue
```

### Pattern 1: Drizzle One-to-Many with Auto-Timestamps

**What:** Separate `market_values` table related to `leases` with automatic timestamp updates.

**When to use:** For tracking full history of values with dates; supports trends, reversion, multi-source comparison.

**Example:**
```typescript
// Source: Drizzle ORM official docs - Relations and $onUpdate
// https://orm.drizzle.team/docs/relations-v2
// https://www.codu.co/articles/drizzle-s-new-onupdate-function-prfsgmcr

import { pgTable, uuid, varchar, timestamp, decimal, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { decimalNumber } from './custom-types';

export const marketValues = pgTable('market_values', {
  id: uuid('id').primaryKey().defaultRandom(),
  leaseId: uuid('lease_id').notNull().references(() => leases.id, { onDelete: 'cascade' }),

  // Value and source
  value: decimalNumber('value', { precision: 10, scale: 2 }).notNull(),
  source: varchar('source', { length: 50 }).notNull(), // 'manual', 'kbb', 'edmunds', 'carvana'
  sourceLabel: varchar('source_label', { length: 100 }), // User-friendly label: "Your estimate", "KBB Trade-In"

  // Optional metadata for API sources (future)
  sourceMetadata: text('source_metadata'), // JSON string for API-specific data

  // Timestamps
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Define relation
export const leasesRelations = relations(leases, ({ many }) => ({
  marketValues: many(marketValues),
}));

export const marketValuesRelations = relations(marketValues, ({ one }) => ({
  lease: one(leases, {
    fields: [marketValues.leaseId],
    references: [leases.id],
  }),
}));

export type MarketValue = typeof marketValues.$inferSelect;
export type NewMarketValue = typeof marketValues.$inferInsert;
```

### Pattern 2: React Hook Form - External Updates with Validation

**What:** Programmatically update form fields from external actions (like quick-edit on comparison page) while triggering validation.

**When to use:** When a value can be edited from multiple UI locations and needs to sync with the form.

**Example:**
```typescript
// Source: React Hook Form official docs - setValue
// https://www.react-hook-form.com/api/useform/setvalue/

import { useForm } from 'react-hook-form';

function ComparisonPage() {
  const form = useForm<LeaseFormData>();

  // When user edits market value from comparison page
  const handleMarketValueUpdate = async (newValue: number) => {
    // Update form field with validation
    form.setValue('marketValue', newValue, {
      shouldValidate: true,  // Trigger validation
      shouldDirty: true,     // Mark as dirty
      shouldTouch: true,     // Mark as touched
    });

    // Save to server
    await updateMarketValue(leaseId, newValue);

    // Trigger recalculation
    router.refresh(); // Or use revalidatePath in server action
  };

  return (
    <div>
      <MarketValueDisplay
        value={currentValue}
        onEdit={handleMarketValueUpdate}
      />
    </div>
  );
}
```

### Pattern 3: Next.js Server Actions with Instant Revalidation

**What:** Server mutations that immediately update the UI via revalidation.

**When to use:** For all market value create/update operations to provide instant feedback.

**Example:**
```typescript
// Source: Next.js official docs - Server Actions and Mutations
// https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations

'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/client';
import { marketValues } from '@/lib/db/schema';
import { Decimal } from '@/lib/decimal';

export async function createMarketValue(
  leaseId: string,
  value: number,
  source: string = 'manual',
  sourceLabel: string = 'Your estimate'
) {
  // Validate input (use Zod schema)
  const validated = marketValueSchema.parse({ value, source, sourceLabel });

  // Insert new value
  await db.insert(marketValues).values({
    leaseId,
    value: new Decimal(validated.value.toString()),
    source: validated.source,
    sourceLabel: validated.sourceLabel,
  });

  // Revalidate comparison page for instant update
  revalidatePath(`/lease/${leaseId}/compare`);

  return { success: true };
}
```

### Pattern 4: Provider Interface for Future Extensibility

**What:** TypeScript adapter pattern with provider interface that abstracts value sources.

**When to use:** When future integration with external APIs is planned but not yet implemented.

**Example:**
```typescript
// Source: TypeScript Design Patterns - Adapter Pattern
// https://refactoring.guru/design-patterns/adapter/typescript/example
// https://medium.com/@robinviktorsson/a-guide-to-the-adapter-design-pattern-in-typescript-and-node-js-with-practical-examples-f11590ace581

import { Decimal } from '@/lib/decimal';

// Core types
export interface ValuationResult {
  value: Decimal;
  source: string;
  sourceLabel: string;
  confidence?: 'high' | 'medium' | 'low'; // For API sources
  metadata?: Record<string, unknown>; // Provider-specific data
}

// Provider interface - all implementations must conform
export interface ValuationProvider {
  readonly name: string;

  /**
   * Fetch market value for a vehicle.
   * Returns null if value cannot be determined.
   */
  getMarketValue(params: {
    make?: string;
    model?: string;
    year?: number;
    mileage: number;
    zipCode?: string;
  }): Promise<ValuationResult | null>;
}

// Manual provider implementation (Phase 4)
export class ManualValuationProvider implements ValuationProvider {
  readonly name = 'manual';

  async getMarketValue(): Promise<ValuationResult | null> {
    // Manual entry doesn't auto-fetch; returns null
    // Value comes from user input
    return null;
  }

  /**
   * Create a manual value entry (not auto-fetched).
   */
  createManualEntry(value: number): ValuationResult {
    return {
      value: new Decimal(value.toString()),
      source: 'manual',
      sourceLabel: 'Your estimate',
    };
  }
}

// Future API provider (stubbed for Phase 4+)
export class KBBValuationProvider implements ValuationProvider {
  readonly name = 'kbb';

  async getMarketValue(params: {
    make?: string;
    model?: string;
    year?: number;
    mileage: number;
    zipCode?: string;
  }): Promise<ValuationResult | null> {
    // Future implementation: call KBB API
    throw new Error('KBB integration not yet implemented');
  }
}

// Factory for provider selection
export function getValuationProvider(source: string): ValuationProvider {
  switch (source) {
    case 'manual':
      return new ManualValuationProvider();
    case 'kbb':
      return new KBBValuationProvider();
    default:
      return new ManualValuationProvider();
  }
}
```

### Pattern 5: Staleness Detection with Relative Time Display

**What:** Detect values older than threshold (30 days) and display age with relative time.

**When to use:** For market value freshness warnings and "last updated" timestamps.

**Example:**
```typescript
// If using date-fns (lightweight option)
import { differenceInDays, formatDistanceToNow } from 'date-fns';

export function checkValueStaleness(updatedAt: Date): {
  isStale: boolean;
  message: string;
  relativeTime: string;
} {
  const daysSinceUpdate = differenceInDays(new Date(), updatedAt);
  const isStale = daysSinceUpdate > 30;

  return {
    isStale,
    message: isStale
      ? 'Your market value may be outdated — consider updating'
      : '',
    relativeTime: formatDistanceToNow(updatedAt, { addSuffix: true }),
  };
}

// Usage in component
function MarketValueDisplay({ updatedAt }: { updatedAt: Date }) {
  const { isStale, message, relativeTime } = checkValueStaleness(updatedAt);

  return (
    <div>
      <span className="text-xs text-muted-foreground">
        Updated {relativeTime}
      </span>
      {isStale && (
        <div className="mt-2 text-sm text-warning-foreground">
          <AlertCircle className="inline h-4 w-4 mr-1" />
          {message}
        </div>
      )}
    </div>
  );
}
```

### Anti-Patterns to Avoid

- **Don't use residual as fallback when no market value exists:** Phase context explicitly states "do not use residual as fallback" — show incomplete/missing data instead. Residual is predetermined contract value, not market value.

- **Don't store only latest value:** Context requires full history tracking for trends and multi-source comparison. Use one-to-many relation, not single field.

- **Don't couple components to specific value sources:** Always consume through ValuationProvider interface, never hard-code manual/API logic in components.

- **Don't trigger full page refresh on value update:** Use `revalidatePath` in server action for surgical updates. Full refresh loses scroll position and feels slow.

- **Don't manually manage updatedAt timestamps:** Use Drizzle's `$onUpdate()` to auto-update on record changes. Manual updates are error-prone.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Relative time display ("30 days ago") | Custom date formatter with if/else chains | date-fns `formatDistanceToNow` or browser Intl.RelativeTimeFormat | Handles edge cases (seconds, minutes, hours, days, months, years), pluralization, and i18n correctly |
| Form validation across client/server | Separate validation logic | Shared Zod schema (already in use per [02-03]) | Single source of truth; never trust client input |
| Auto-updating timestamps | Manual timestamp updates in every mutation | Drizzle `$onUpdate()` | Eliminates human error; database-level guarantee |
| Provider/adapter abstraction | Ad-hoc interface per API | TypeScript interface with factory pattern | Standardizes integration; adding new provider = implement interface |
| Change highlighting in UI | Custom CSS classes and state logic | Existing animation utilities (tailwindcss-animate already in use) | Consistent timing, easing; handles reduced-motion preference |

**Key insight:** The provider pattern may feel like over-engineering for manual-only entry, but it's architectural preparation. Adding KBB later should be implement-interface-done, not refactor-all-consumers. The cost is low (one interface, one class), the benefit is high (future-proofing without prediction).

## Common Pitfalls

### Pitfall 1: Not Handling Missing Market Value Gracefully

**What goes wrong:** Code assumes market value always exists; crashes or shows misleading data when null.

**Why it happens:** buyout/sell-privately scenarios require market value, but it's optional user input.

**How to avoid:**
- Check for null market value in `getComparisonData` before calling scenario evaluators
- Show "Incomplete" state for equity-dependent scenarios when no value exists
- Never fall back to residual (per context requirement)

**Warning signs:**
- Type errors around `marketValue!` (non-null assertion)
- Comparison view crashes on initial load before value entry
- Sell privately shows $0 or residual-based calculation

### Pitfall 2: Timestamp Timezone Mismatches

**What goes wrong:** Created/updated timestamps display wrong time or trigger false staleness warnings.

**Why it happens:** Mixing server UTC timestamps with client local time without proper conversion.

**How to avoid:**
- Store timestamps in UTC (Drizzle default with `mode: 'date'`)
- Convert to local time only for display
- Use `Date` objects for calculations (differenceInDays handles timezones)

**Warning signs:**
- Staleness warning shows immediately on fresh values
- "Updated X hours ago" shows negative hours or wrong day
- Values created in evening show tomorrow's date

### Pitfall 3: Race Conditions in Optimistic UI Updates

**What goes wrong:** User edits market value twice quickly; second update overwrites first before save completes.

**Why it happens:** Optimistic UI updates state immediately, but server mutations are async.

**How to avoid:**
- Disable edit UI during save (loading state)
- Use `useTransition` for pending state indication
- Show success confirmation after server mutation completes

**Warning signs:**
- Intermittent "lost updates" where changes don't stick
- UI shows one value, server has different value
- Rapid clicks create duplicate entries in history

### Pitfall 4: Breaking Calculation Flow with Null Checks

**What goes wrong:** Adding null checks for market value throughout calculation code; bloats and complicates math logic.

**Why it happens:** Market value is optional at data layer but required for certain calculations.

**How to avoid:**
- Handle missing value at orchestration layer (`getComparisonData`), not in scenario evaluators
- Pass explicit "incomplete" flag to scenarios or filter them out entirely
- Keep calculation functions pure — no null handling inside math logic

**Warning signs:**
- `if (marketValue == null) return ...` scattered across scenario files
- Calculation tests become complex with null branches
- Error messages like "Cannot read property 'sub' of null"

### Pitfall 5: Over-Fetching Market Value History

**What goes wrong:** Loading all historical values for every comparison page load; slows queries unnecessarily.

**Why it happens:** One-to-many relation defaults to fetching all related records.

**How to avoid:**
- Query only most recent value for calculations: `ORDER BY created_at DESC LIMIT 1`
- Fetch full history only when explicitly viewing trends (future feature)
- Index `lease_id` and `created_at` for fast latest-value queries

**Warning signs:**
- Comparison page slows down as history grows
- N+1 queries when loading multiple leases
- Database query time increases linearly with value count

## Code Examples

Verified patterns from official sources:

### Query Latest Market Value (Drizzle)
```typescript
// Source: Drizzle ORM official docs
// https://orm.drizzle.team/docs/rqb-v2

import { db } from '@/lib/db/client';
import { marketValues } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

async function getLatestMarketValue(leaseId: string) {
  const [latest] = await db
    .select()
    .from(marketValues)
    .where(eq(marketValues.leaseId, leaseId))
    .orderBy(desc(marketValues.createdAt))
    .limit(1);

  return latest ?? null;
}
```

### Zod Schema for Market Value
```typescript
// Source: Project existing pattern from lease-schema.ts
import { z } from 'zod';

export const marketValueSchema = z.object({
  value: z.coerce
    .number()
    .positive({ message: 'Market value must be a positive number' })
    .max(1000000, { message: 'Market value seems unusually high. Please verify.' }),

  source: z.enum(['manual', 'kbb', 'edmunds', 'carvana'])
    .default('manual'),

  sourceLabel: z.string()
    .max(100, { message: 'Source label must be 100 characters or less' })
    .optional(),
});

export type MarketValueFormData = z.infer<typeof marketValueSchema>;
```

### Inline Edit Component Pattern (shadcn/ui)
```typescript
// Source: shadcn/ui component composition pattern
// https://ui.shadcn.com/docs/components/input
// Combining Input + Button for inline edit

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit, Check, X } from 'lucide-react';

export function MarketValueDisplay({
  value,
  onUpdate,
}: {
  value: number;
  onUpdate: (newValue: number) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    await onUpdate(parseFloat(editValue));
    setIsLoading(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value.toString());
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-32"
          disabled={isLoading}
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isLoading}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl font-semibold">
        ${value.toLocaleString()}
      </span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
      >
        <Edit className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

### Calculate Equity
```typescript
// Source: Project existing calculation patterns
// Equity = Market Value - Lease Payoff

import { Decimal } from '@/lib/decimal';
import { computeLeasePayoff } from '@/lib/calculations/lease-payoff';

export function calculateEquity(
  marketValue: Decimal,
  residualValue: Decimal,
  netCapCost: Decimal,
  moneyFactor: Decimal,
  monthlyPayment: Decimal,
  termMonths: number,
  monthsElapsed: number,
  purchaseFee: Decimal,
  salesTax: Decimal,
): {
  equity: Decimal;
  isPositive: boolean;
} {
  // Compute lease payoff (what you owe to buy it out)
  const leasePayoff = computeLeasePayoff(
    netCapCost,
    residualValue,
    monthlyPayment,
    termMonths,
    monthsElapsed,
    moneyFactor,
  );

  // Total payoff including fees and tax
  const totalPayoff = leasePayoff.add(purchaseFee).add(salesTax);

  // Equity = what it's worth minus what you owe
  const equity = marketValue.sub(totalPayoff);

  return {
    equity,
    isPositive: equity.greaterThanOrEqualTo(0),
  };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Prisma's `@updatedAt` decorator | Drizzle's `$onUpdate()` function | Drizzle v0.30+ (2024) | More flexible; can compute derived values, not just timestamps |
| Manual revalidation with `router.refresh()` | `revalidatePath()` in Server Actions | Next.js 13+ App Router | Surgical updates; no full page reload |
| Moment.js for date formatting | date-fns or native Intl APIs | 2020+ | Much lighter bundle; Moment.js no longer maintained |
| Custom provider factories | TypeScript interface + switch/factory | Modern TypeScript (2020+) | Better type inference; exhaustiveness checking |
| Inline timestamps in main table | Separate audit/history table | PostgreSQL best practice | Keeps main table lean; enables trend queries |

**Deprecated/outdated:**
- **Moment.js:** No longer maintained since 2020; use date-fns, Luxon, or native Intl APIs instead
- **`router.refresh()` for mutations:** Use `revalidatePath()` in Server Actions for more precise cache invalidation
- **JSON columns for structured data:** Drizzle supports proper relations; use typed tables for queryable history

## Open Questions

Things that couldn't be fully resolved:

1. **Multi-source value resolution strategy**
   - What we know: Context says "most recent value wins" regardless of source
   - What's unclear: Should API sources (future) auto-override manual? Or only override if newer?
   - Recommendation: Implement timestamp-based (most recent wins) for Phase 4; defer source priority logic to Phase 5+ when APIs exist

2. **Value range support (low/mid/high)**
   - What we know: Context marks this as Claude's discretion; API sources often return ranges
   - What's unclear: Does single-point estimate suffice for Phase 4 manual entry?
   - Recommendation: Start with single-point estimate (simpler UX, matches manual entry); add range support in Phase 5+ if API providers need it

3. **History display/trends UI**
   - What we know: Context says history should be stored; doesn't specify if/how to surface it
   - What's unclear: Should Phase 4 show value history timeline, or just store for future?
   - Recommendation: Store history in Phase 4 but don't surface UI yet (marked Claude's discretion); add trends view in Phase 6+ when data exists

4. **Equity display placement**
   - What we know: Context requires "prominent equity display" but exact placement is Claude's discretion
   - What's unclear: HeroSummary vs. separate card vs. inline with market value?
   - Recommendation: Add to HeroSummary near best option (already prominent); test with real data in implementation

## Sources

### Primary (HIGH confidence)
- [React Hook Form - setValue API](https://www.react-hook-form.com/api/useform/setvalue/) - Validated external update pattern with shouldValidate option
- [Drizzle ORM - Relations V2](https://orm.drizzle.team/docs/relations-v2) - One-to-many relationship patterns
- [Drizzle ORM - $onUpdate Function](https://www.codu.co/articles/drizzle-s-new-onupdate-function-prfsgmcr) - Auto-updating timestamp pattern
- [Next.js - Server Actions and Mutations](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) - revalidatePath for instant updates
- [PostgreSQL Audit Logging Best Practices](https://www.cybertec-postgresql.com/en/row-change-auditing-options-for-postgresql/) - History table patterns with triggers and shadow tables
- Project existing code: `/src/lib/db/schema.ts`, `/src/lib/validations/lease-schema.ts`, `/src/components/forms/LeaseEntryForm.tsx` - Current patterns

### Secondary (MEDIUM confidence)
- [TypeScript Adapter Pattern](https://refactoring.guru/design-patterns/adapter/typescript/example) - Provider interface design
- [Optimistic UI in Next.js 15](https://javascript.plainenglish.io/supercharge-your-ux-with-optimistic-updates-in-next-js-15-56541a19c305) - useOptimistic pattern for instant feedback
- [PatternFly Stale Data Warning](https://www.patternfly.org/component-groups/status-and-state-indicators/stale-data-warning/) - UI pattern for staleness indicators
- [shadcn/ui Components](https://ui.shadcn.com/) - Component composition patterns

### Tertiary (LOW confidence)
- date-fns library (not yet confirmed version/fit) - Verify if needed for relative time vs. native Intl.RelativeTimeFormat
- React diff visualization libraries - Only relevant if showing before/after comparison; may be overkill for simple highlight

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use except date-fns (optional); patterns verified in existing code
- Architecture: HIGH - Drizzle relations, React Hook Form, Server Actions all documented in official sources
- Pitfalls: MEDIUM - Based on common patterns and project constraints; some inferred from context rather than observed bugs
- Provider pattern: HIGH - Standard TypeScript adapter pattern; well-documented in design pattern literature
- Staleness detection: MEDIUM - Logic is straightforward; specific 30-day threshold from context, relative time display is standard practice

**Research date:** 2026-01-30
**Valid until:** 2026-03-30 (60 days - stable domain, established patterns, no fast-moving dependencies)
