'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { TimelineTooltip } from './TimelineTooltip';
import { InflectionMarkers } from './InflectionMarkers';
import type { TimelineDataPoint } from '@/lib/types/timeline';
import type { CrossoverPoint } from '@/lib/recommendations/crossover-detection';

interface TimelineChartProps {
  data: TimelineDataPoint[];
  crossovers?: CrossoverPoint[];
  className?: string;
}

// Chart configuration mapping each scenario to a label and color
const chartConfig = {
  return: {
    label: 'Return Vehicle',
    color: 'hsl(var(--chart-1))',
  },
  buyout: {
    label: 'Buy Out Lease',
    color: 'hsl(var(--chart-2))',
  },
  sellPrivately: {
    label: 'Sell Privately',
    color: 'hsl(var(--chart-3))',
  },
  earlyTermination: {
    label: 'Early Termination',
    color: 'hsl(var(--chart-4))',
  },
  extension: {
    label: 'Keep Paying',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;

/**
 * Formats Y-axis values to abbreviated currency
 * e.g., 12000 -> "$12K"
 */
function formatYAxis(value: number): string {
  if (value >= 1000) {
    return '$' + (value / 1000).toFixed(0) + 'K';
  }
  return '$' + value.toFixed(0);
}

/**
 * Main timeline chart component
 * Renders a multi-line chart showing total costs for each scenario over time
 */
export function TimelineChart({ data, crossovers, className }: TimelineChartProps) {
  return (
    <ChartContainer
      config={chartConfig}
      className={className || 'min-h-[400px] w-full'}
    >
      <LineChart
        accessibilityLayer
        data={data}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <CartesianGrid vertical={false} />

        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          label={{ value: 'Months from now', position: 'insideBottom', offset: -10 }}
        />

        <YAxis
          tickFormatter={formatYAxis}
          tickLine={false}
          axisLine={false}
        />

        <ChartTooltip content={<TimelineTooltip />} />

        {/* Return scenario line */}
        <Line
          type="monotone"
          dataKey="return"
          stroke="var(--color-return)"
          strokeWidth={2}
          dot={false}
          connectNulls={false}
        />

        {/* Buyout scenario line */}
        <Line
          type="monotone"
          dataKey="buyout"
          stroke="var(--color-buyout)"
          strokeWidth={2}
          dot={false}
          connectNulls={false}
        />

        {/* Sell privately scenario line (may have null values) */}
        <Line
          type="monotone"
          dataKey="sellPrivately"
          stroke="var(--color-sellPrivately)"
          strokeWidth={2}
          dot={false}
          connectNulls={false}
        />

        {/* Early termination scenario line */}
        <Line
          type="monotone"
          dataKey="earlyTermination"
          stroke="var(--color-earlyTermination)"
          strokeWidth={2}
          dot={false}
          connectNulls={false}
        />

        {/* Extension scenario line (only at lease end) */}
        <Line
          type="monotone"
          dataKey="extension"
          stroke="var(--color-extension)"
          strokeWidth={2}
          dot={false}
          connectNulls={false}
        />

        {/* Crossover point markers */}
        {crossovers && crossovers.length > 0 && (
          <InflectionMarkers crossovers={crossovers} data={data} />
        )}
      </LineChart>
    </ChartContainer>
  );
}
