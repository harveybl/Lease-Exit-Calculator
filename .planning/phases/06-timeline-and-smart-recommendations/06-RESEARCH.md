# Phase 6: Timeline and Smart Recommendations - Research

**Researched:** 2026-01-31
**Domain:** Interactive data visualization with Recharts, time-series analysis, and recommendation algorithms
**Confidence:** HIGH

## Summary

Phase 6 requires building an interactive timeline visualization showing how lease exit option costs change month-by-month over the remaining lease term, with smart identification of decision inflection points (when one option becomes better than another). The established solution is shadcn/ui's chart component, which uses Recharts 3.x under the hood.

Recharts is the React ecosystem's standard for composable, declarative charting. shadcn/ui wraps Recharts components with theme-aware styling, tooltip customization, and accessibility features while maintaining direct access to the underlying Recharts API. This prevents lock-in and allows following official Recharts upgrade paths.

The key technical challenge is converting Decimal.js financial data to JavaScript numbers for charting without losing meaningful precision, identifying crossover points where scenario rankings change, and presenting recommendations that distinguish between "best today" vs "better if you wait."

**Primary recommendation:** Use shadcn/ui chart components with Recharts LineChart/AreaChart for timeline visualization, convert Decimal to number at the presentation boundary using toNumber(), and implement a simple crossover detection algorithm that compares scenario costs month-by-month to identify inflection points.

## Standard Stack

The established libraries/tools for React data visualization with shadcn/ui:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | 3.6.0+ | React charting library | Declarative, composable API. Built on D3 + SVG. De facto standard in React ecosystem with 3,313+ dependent projects |
| shadcn/ui chart | latest | Themed chart components | Official shadcn/ui charting solution. Wraps Recharts with consistent theming, accessibility layer, custom tooltips |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 0.563.0+ | Chart icons (TrendingUp, Info, etc.) | Already in project. Use for chart decorations and UI affordances |
| Decimal.js | 10.6.0 | High-precision calculations | Already in project for all financial math. Convert to number only at chart data boundary |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recharts | Victory | Victory has more native TypeScript support but smaller ecosystem, less shadcn/ui integration |
| Recharts | visx (Airbnb) | visx offers more control and better performance for complex custom charts, but steeper learning curve and no shadcn/ui integration |
| Recharts | ApexCharts | ApexCharts has richer features for financial charts (candlestick, etc.) but not idiomatic React, harder to customize |

**Installation:**
```bash
npx shadcn@latest add chart
npm install recharts
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── calculations/
│   │   └── timeline.ts           # Month-by-month scenario projections
│   └── recommendations/
│       ├── crossover-detection.ts # Identify when rankings flip
│       └── decision-window.ts     # "Best today" vs "wait" logic
├── components/
│   └── timeline/
│       ├── TimelineChart.tsx      # Main chart container (client component)
│       ├── ScenarioCurves.tsx     # Line/Area components per scenario
│       ├── InflectionMarkers.tsx  # Visual markers for crossover points
│       └── TimelineTooltip.tsx    # Custom tooltip with cost breakdown
└── app/
    └── lease/[id]/timeline/
        └── page.tsx               # RSC that fetches lease, builds timeline data
```

### Pattern 1: Decimal → Number Conversion at Presentation Boundary
**What:** Convert Decimal.js values to JavaScript numbers only when passing data to Recharts components. Keep all calculations in Decimal to preserve precision.

**When to use:** Always when preparing chart data from financial calculations.

**Example:**
```typescript
// Source: Decimal.js documentation + project patterns
import { Decimal } from '@/lib/decimal';

interface TimelineDataPoint {
  month: number;
  return: number;      // Converted from Decimal for charting
  buyout: number;
  sellPrivately: number;
  // ... other scenarios
}

function buildTimelineData(
  lease: Lease,
  estimatedSalePrice?: Decimal
): TimelineDataPoint[] {
  const points: TimelineDataPoint[] = [];

  for (let month = 0; month <= monthsRemaining; month++) {
    // Calculate costs using Decimal throughout
    const returnCost = calculateReturnAtMonth(lease, month);
    const buyoutCost = calculateBuyoutAtMonth(lease, month);

    // Convert to number ONLY at presentation boundary
    points.push({
      month,
      return: returnCost.toNumber(),
      buyout: buyoutCost.toNumber(),
      // ...
    });
  }

  return points;
}
```

### Pattern 2: Crossover Point Detection
**What:** Identify the month when one scenario becomes cheaper than another by comparing costs sequentially and detecting sign changes.

**When to use:** For highlighting decision inflection points on the chart.

**Example:**
```typescript
// Source: Web research on time-series inflection point detection
interface CrossoverPoint {
  month: number;
  fromScenario: ScenarioType;
  toScenario: ScenarioType;
  message: string; // e.g., "Buyout becomes cheaper than return"
}

function detectCrossovers(
  timelineData: TimelineDataPoint[]
): CrossoverPoint[] {
  const crossovers: CrossoverPoint[] = [];

  // Compare each pair of scenarios
  for (let i = 1; i < timelineData.length; i++) {
    const prev = timelineData[i - 1];
    const curr = timelineData[i];

    // Check if buyout crosses below return
    if (prev.buyout >= prev.return && curr.buyout < curr.return) {
      crossovers.push({
        month: curr.month,
        fromScenario: 'return',
        toScenario: 'buyout',
        message: `Buyout becomes cheaper than return after month ${curr.month}`,
      });
    }

    // ... check other scenario pairs
  }

  return crossovers;
}
```

### Pattern 3: shadcn/ui Chart with Custom Tooltip
**What:** Use shadcn/ui's ChartContainer and ChartTooltip with custom content to show cost breakdown on hover.

**When to use:** For all timeline chart implementations.

**Example:**
```typescript
// Source: shadcn/ui chart documentation + Recharts examples
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';

const chartConfig = {
  return: { label: 'Return to Dealer', color: 'hsl(var(--chart-1))' },
  buyout: { label: 'Buyout', color: 'hsl(var(--chart-2))' },
  // ...
};

export function TimelineChart({ data }: { data: TimelineDataPoint[] }) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[400px]">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          label={{ value: 'Months from now', position: 'insideBottom', offset: -5 }}
        />
        <YAxis
          label={{ value: 'Total Cost ($)', angle: -90, position: 'insideLeft' }}
        />
        <ChartTooltip content={<CustomTooltipContent />} />
        <Line
          type="monotone"
          dataKey="return"
          stroke="var(--color-return)"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="buyout"
          stroke="var(--color-buyout)"
          strokeWidth={2}
        />
        {/* ... other scenarios */}
      </LineChart>
    </ChartContainer>
  );
}
```

### Pattern 4: "Best Today" vs "Better If You Wait" Recommendation Logic
**What:** Compare the current best option against future best options to determine if waiting improves the outcome.

**When to use:** For generating the smart recommendation summary.

**Example:**
```typescript
// Source: Financial scenario optimization research
interface RecommendationResult {
  bestNow: ScenarioType;
  bestNowCost: Decimal;
  bestFuture?: {
    scenario: ScenarioType;
    month: number;
    cost: Decimal;
    savingsVsNow: Decimal;
  };
  message: string;
}

function generateRecommendation(
  timelineData: TimelineDataPoint[],
  scenarios: ScenarioResult[]
): RecommendationResult {
  const now = timelineData[0];
  const bestNowScenario = scenarios.find(s => !s.incomplete)!;

  // Find the cheapest option across all future months
  let bestFutureMonth = 0;
  let bestFutureCost = Infinity;
  let bestFutureScenario: ScenarioType = bestNowScenario.type;

  timelineData.forEach((point, index) => {
    const minCostThisMonth = Math.min(point.return, point.buyout, /* ... */);
    if (minCostThisMonth < bestFutureCost) {
      bestFutureCost = minCostThisMonth;
      bestFutureMonth = index;
      // Determine which scenario was cheapest
      // ...
    }
  });

  const bestNowCost = new Decimal(now[bestNowScenario.type]);
  const bestFutureCostDecimal = new Decimal(bestFutureCost);

  if (bestFutureCostDecimal.lt(bestNowCost)) {
    return {
      bestNow: bestNowScenario.type,
      bestNowCost,
      bestFuture: {
        scenario: bestFutureScenario,
        month: bestFutureMonth,
        cost: bestFutureCostDecimal,
        savingsVsNow: bestNowCost.minus(bestFutureCostDecimal),
      },
      message: `Waiting ${bestFutureMonth} months could save you ${formatCurrency(bestNowCost.minus(bestFutureCostDecimal))}`,
    };
  }

  return {
    bestNow: bestNowScenario.type,
    bestNowCost,
    message: `${bestNowScenario.type} is your best option today and won't improve by waiting`,
  };
}
```

### Anti-Patterns to Avoid
- **Calculating with numbers instead of Decimal:** All financial math must use Decimal.js. Only convert to number at the final presentation step.
- **Hand-rolling chart components:** Don't build custom SVG charts. Recharts handles responsive scaling, interactions, accessibility better than any custom solution.
- **Overly complex crossover detection:** Simple sequential comparison is sufficient. Don't implement sophisticated change-point detection algorithms (PELT, binary segmentation, etc.) - overkill for this use case.
- **Computing timeline data on every render:** Memoize or server-compute the month-by-month projections. They don't change unless lease data changes.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Interactive charts | Custom SVG with D3 directly | Recharts + shadcn/ui chart | Recharts abstracts D3 complexity, handles responsive containers, tooltips, animations, accessibility. Building from scratch takes weeks and misses edge cases. |
| Responsive chart sizing | Manual resize listeners, CSS tricks | Recharts ResponsiveContainer | ResponsiveContainer handles parent dimension tracking, debouncing, and re-rendering automatically. Hand-rolled solutions have performance issues (Issue #1767). |
| Chart tooltips | Custom positioned divs | Recharts Tooltip + shadcn/ui ChartTooltip | Tooltip positioning near chart boundaries is complex. Recharts handles automatic repositioning, hover detection, and content rendering. |
| Inflection point detection | PELT, binary segmentation, Kalman filters | Simple sequential comparison loop | Financial crossovers are deterministic (cost A < cost B at month N). Sophisticated statistical change-point algorithms are for noisy time-series data, not precise financial calculations. |
| Number formatting in charts | toFixed(), template literals | Existing formatCurrency utility | Project already has Intl.NumberFormat-based formatCurrency (Phase 3). Reuse it in custom tooltip content. |

**Key insight:** Charting is a solved problem in React. Recharts is battle-tested by 3,313+ projects. The value is in accurate financial projections, not chart rendering mechanics.

## Common Pitfalls

### Pitfall 1: Decimal Precision Loss in Chart Data
**What goes wrong:** Converting Decimal to number using toNumber() can lose precision for very large values (e.g., scientific notation for numbers > 10^15). Charts then display incorrect values.

**Why it happens:** JavaScript numbers are IEEE 754 double-precision floats with ~15-16 significant digits. Decimal.js supports arbitrary precision, but toNumber() must fit into float64.

**How to avoid:**
- Financial lease values are typically $10k-$100k range. toNumber() is safe for this domain (no precision loss).
- If edge cases arise (luxury leases > $1M), round to nearest cent using Decimal.toDP(2) before toNumber().
- Add a test: `new Decimal('99999.99').toNumber() === 99999.99` should pass.

**Warning signs:** Chart displays scientific notation (e.g., "1.23e+5") instead of currency values.

### Pitfall 2: Tooltip Content Not Accessible
**What goes wrong:** shadcn/ui tooltips can be dismissed with ESC but are not hoverable or persistent. Users with motor impairments or using screen magnification cannot read tooltip content.

**Why it happens:** Recharts Tooltip disappears immediately on mouse leave. This is a known accessibility issue (verified in independent audit).

**How to avoid:**
- Always enable `accessibilityLayer` prop on chart components for keyboard navigation.
- Consider adding a secondary "show details" interaction (click to persist tooltip or show breakdown below chart).
- Test with keyboard-only navigation and screen reader.

**Warning signs:** Tooltip content flashes too quickly to read on hover; cannot access tooltip with keyboard alone.

### Pitfall 3: ResponsiveContainer Performance During Resize
**What goes wrong:** Dragging browser window causes chart to stutter or lag. Horizontal overflow appears during resize.

**Why it happens:** ResponsiveContainer re-renders the entire chart on every resize event. Known issue (GitHub Issue #1767 from 2019 still relevant).

**How to avoid:**
- Set explicit min-h-[VALUE] on ChartContainer (required by shadcn/ui docs).
- Disable chart animations during active resize using `isAnimationActive={false}` prop.
- Consider debouncing resize events if performance is critical (ResponsiveContainer doesn't debounce internally).

**Warning signs:** Chart flickers or freezes when resizing browser; CPU spikes during window drag.

### Pitfall 4: Mixing Decimal and Number in Calculations
**What goes wrong:** Calculating timeline costs using a mix of Decimal objects and JavaScript numbers produces incorrect results due to floating-point arithmetic.

**Why it happens:** TypeScript won't prevent this - Decimal.plus(number) compiles but converts number to Decimal using potentially imprecise float representation.

**How to avoid:**
- Keep ALL financial calculations in Decimal until the final toNumber() call for charting.
- Use type guards: `if (value instanceof Decimal)` before operating.
- Add a lint rule or type utility to enforce Decimal-only in calculation functions.

**Warning signs:** Chart shows values like $1234.5699999997 instead of $1234.57; calculations differ from Phase 3 scenario results.

### Pitfall 5: Not Accounting for Incomplete Scenarios in Timeline
**What goes wrong:** Timeline shows sell-privately costs when no market value is available, displaying residualValue placeholder as if it's real data. User makes decisions based on incomplete information.

**Why it happens:** Phase 4 marks scenarios as incomplete when data is missing, but timeline generation doesn't check the incomplete flag.

**How to avoid:**
- Filter out incomplete scenarios before building timeline data, OR
- Render incomplete scenario lines as dashed/faded with clear visual indicator, AND
- Show warning banner "Market value needed for sell-privately projection".

**Warning signs:** Timeline shows all five scenarios even when market value is missing; no visual distinction for placeholder data.

## Code Examples

Verified patterns from official sources:

### shadcn/ui Chart with Line Chart
```typescript
// Source: https://ui.shadcn.com/docs/components/chart
"use client"

import { Line, LineChart, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  return: {
    label: "Return to Dealer",
    color: "hsl(var(--chart-1))",
  },
  buyout: {
    label: "Buyout",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function TimelineChart({ data }: { data: any[] }) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[400px]">
      <LineChart
        accessibilityLayer
        data={data}
        margin={{ left: 12, right: 12 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Line
          dataKey="return"
          type="monotone"
          stroke="var(--color-return)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="buyout"
          type="monotone"
          stroke="var(--color-buyout)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  )
}
```

### Custom Tooltip with Cost Breakdown
```typescript
// Source: https://recharts.org/en-US/examples/CustomContentOfTooltip + shadcn/ui patterns
import { formatCurrency } from '@/lib/utils';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
}

export function TimelineTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const monthLabel = label === 0 ? 'Today' : `Month ${label}`;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="text-sm font-semibold mb-2">{monthLabel}</p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span
              className="text-xs flex items-center gap-1.5"
              style={{ color: entry.color }}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
            <span className="text-sm font-mono">
              {formatCurrency(new Decimal(entry.value))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Month-by-Month Cost Projection
```typescript
// Source: Lease amortization patterns + project calculation structure
import { Decimal } from '@/lib/decimal';
import type { Lease } from '@/lib/db/schema';

interface MonthlyProjection {
  month: number;
  date: Date;
  costs: {
    return: Decimal;
    buyout: Decimal;
    sellPrivately: Decimal | null;
    earlyTermination: Decimal;
    extension: Decimal | null;
  };
}

export function projectMonthlyTimeline(
  lease: Lease,
  estimatedSalePrice?: Decimal
): MonthlyProjection[] {
  const monthsRemaining = lease.termMonths - (lease.monthsElapsed ?? 0);
  const projections: MonthlyProjection[] = [];

  const today = new Date();

  for (let monthOffset = 0; monthOffset <= monthsRemaining; monthOffset++) {
    const projectedDate = new Date(today);
    projectedDate.setMonth(today.getMonth() + monthOffset);

    // Calculate each scenario cost at this future month
    // Remaining payments decrease as months advance
    const remainingPaymentsAtMonth = lease.monthlyPayment.mul(
      monthsRemaining - monthOffset
    );

    projections.push({
      month: monthOffset,
      date: projectedDate,
      costs: {
        return: calculateReturnCostAtMonth(lease, monthOffset, remainingPaymentsAtMonth),
        buyout: calculateBuyoutCostAtMonth(lease, monthOffset, remainingPaymentsAtMonth),
        sellPrivately: estimatedSalePrice
          ? calculateSellCostAtMonth(lease, monthOffset, remainingPaymentsAtMonth, estimatedSalePrice)
          : null,
        earlyTermination: calculateEarlyTermCostAtMonth(lease, monthOffset),
        extension: monthOffset === monthsRemaining
          ? calculateExtensionCost(lease)
          : null,
      },
    });
  }

  return projections;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Recharts v2.x | Recharts v3.x (3.6.0+) | 2024-2025 | Breaking changes in API. shadcn/ui is upgrading (GitHub Issue #7669). Use v3.x for new projects. |
| Manual D3.js + SVG | Recharts composable components | 2015-present | Recharts abstracts D3 complexity. Building charts is now declarative, not imperative. |
| Chart.js (Canvas) | Recharts (SVG) | React ecosystem shift | Chart.js is faster for large datasets (Canvas rendering), but Recharts is more idiomatic React and easier to style with CSS. |
| Custom tooltip positioning | Recharts + shadcn/ui ChartTooltip | 2024 (shadcn charts release) | shadcn/ui added chart components mid-2024. Before that, custom Recharts tooltips required manual styling. |

**Deprecated/outdated:**
- **victory-chart**: Less actively maintained than Recharts. Smaller ecosystem, fewer examples.
- **nivo**: Good for static charts, but Recharts has better interactive features and shadcn/ui integration.
- **react-vis (Uber)**: No longer actively maintained. Archive notice on GitHub.

## Open Questions

Things that couldn't be fully resolved:

1. **Recharts v3 compatibility with shadcn/ui**
   - What we know: shadcn/ui is working on Recharts v3 support (GitHub Issue #7669). Current shadcn chart components may use v2.x.
   - What's unclear: Whether `npx shadcn@latest add chart` installs v2 or v3, and if manual upgrade is needed.
   - Recommendation: After adding chart component, check package.json for recharts version. If v2.x, manually upgrade to v3.6.0+ and test. shadcn/ui charts should work with v3 since they don't wrap the API.

2. **Optimal number of timeline data points**
   - What we know: More points = smoother curves but slower rendering. Typical lease has 24-48 months remaining.
   - What's unclear: Performance impact of 48 monthly data points × 5 scenarios = 240 chart values. Is monthly granularity needed, or is quarterly sufficient?
   - Recommendation: Start with monthly granularity (matches lease payment cadence). If performance issues arise, consider quarterly for leases > 36 months remaining.

3. **Handling tie scenarios in timeline visualization**
   - What we know: Phase 3 defines tie as ≤$100 difference between top two options (checkForTie function).
   - What's unclear: How to visually represent ties in timeline when two lines are nearly overlapping. Distinct colors may not be perceivable.
   - Recommendation: When lines are within tie threshold, use pattern fills or add annotation markers. Test with colorblind simulation tools.

## Sources

### Primary (HIGH confidence)
- [shadcn/ui Chart Component](https://ui.shadcn.com/docs/components/chart) - Official documentation for chart installation and usage
- [Recharts Official Docs](https://recharts.github.io) - v3.7.0 current version, composable React components
- [Recharts npm](https://www.npmjs.com/package/recharts) - v3.6.0 latest stable release
- [Decimal.js API](https://mikemcl.github.io/decimal.js/) - toNumber() method and precision considerations
- Project source code: `src/lib/calculations/evaluate-all.ts` - Existing scenario evaluation patterns
- Project source code: `src/app/lease/[id]/compare/page.tsx` - RSC data fetching pattern
- Project source code: `package.json` - Current dependencies (Decimal.js 10.6.0, React 19)

### Secondary (MEDIUM confidence)
- [8 Best React Chart Libraries for Visualizing Data in 2025](https://embeddable.com/blog/react-chart-libraries) - Recharts vs visx vs Chart.js comparison
- [Best React chart libraries (2025 update)](https://blog.logrocket.com/best-react-chart-libraries-2025/) - Use cases and performance analysis
- [shadcn/ui Discussion #4133](https://github.com/shadcn-ui/ui/discussions/4133) - Community discussion on chart library choices
- [A Quick-ish Accessibility Review: shadcn/ui Charts](https://ashleemboyer.com/blog/a-quick-ish-accessibility-review-shadcn-ui-charts) - Independent accessibility audit findings
- [How to use Recharts to visualize analytics data](https://posthog.com/tutorials/recharts) - Recharts implementation examples with LineChart, AreaChart, Tooltip
- [Recharts ResponsiveContainer Guide](https://www.dhiwise.com/post/simplify-data-visualization-with-recharts-responsivecontainer) - Responsive patterns
- [Recharts Issue #1767](https://github.com/recharts/recharts/issues/1767) - ResponsiveContainer performance during resize
- [How to Calculate Lease Amortization Schedules](https://www.occupier.com/blog/how-to-calculate-your-lease-amortization-schedules-excel-template/) - Month-by-month projection patterns

### Tertiary (LOW confidence)
- [A Survey of Methods for Time Series Change Point Detection](https://pmc.ncbi.nlm.nih.gov/articles/PMC5464762/) - Academic survey (overkill for this use case, but validates simpler approaches)
- [Crossover Point Report | Actual Budget](https://actualbudget.org/docs/experimental/crossover-point-report/) - Financial crossover visualization concept
- [Front-End Dilemmas: Decimal.js](https://medium.com/@riteshsinha_62295/front-end-dilemmas-tackling-precision-problems-in-javascript-with-decimal-js-c38a9ae24ddd) - Decimal.js usage patterns (Medium article, not official docs)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - shadcn/ui + Recharts is the established solution for React charting with shadcn/ui design system. Verified through official docs and widespread ecosystem adoption.
- Architecture: HIGH - Patterns derived from official examples, existing project structure (Phases 1-4), and verified Recharts documentation.
- Pitfalls: MEDIUM - Accessibility issues verified through independent audit. Performance issues documented in GitHub issues. Decimal conversion pitfalls verified through official API docs but not extensively tested in charting context.

**Research date:** 2026-01-31
**Valid until:** 2026-03-02 (30 days - Recharts is stable, but shadcn/ui chart component is newer and may receive updates)
