'use client';

import { formatCurrency, formatOptionName } from '@/lib/utils/format-currency';
import type { ScenarioType } from '@/lib/types/timeline';

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

interface TimelineTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string | number;
}

/**
 * Custom tooltip for timeline chart showing cost breakdown per month
 * Displays all scenarios with their costs, sorted cheapest to most expensive
 */
export function TimelineTooltip({ active, payload, label }: TimelineTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  // Filter out null values (incomplete scenarios at this month)
  const validEntries = payload.filter(entry => entry.value !== null);

  // Sort by value ascending (cheapest first)
  const sortedEntries = [...validEntries].sort((a, b) => a.value - b.value);

  // Format header
  const headerText = label === 0 ? 'Today' : `Month ${label}`;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md max-w-[280px]">
      <div className="mb-2 font-medium text-foreground">{headerText}</div>
      <div className="flex flex-col gap-1.5">
        {sortedEntries.map((entry) => {
          const scenarioKey = entry.dataKey as ScenarioType;
          const displayName = formatOptionName(scenarioKey);

          return (
            <div key={entry.dataKey} className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="flex-1 text-sm text-muted-foreground truncate">
                {displayName}
              </span>
              <span className="text-sm font-medium tabular-nums text-foreground shrink-0">
                {formatCurrency(entry.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
