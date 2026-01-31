'use client';

import { ReferenceDot, Label } from 'recharts';
import type { CrossoverPoint } from '@/lib/recommendations/crossover-detection';
import type { TimelineDataPoint, ScenarioType } from '@/lib/types/timeline';

interface InflectionMarkersProps {
  crossovers: CrossoverPoint[];
  data: TimelineDataPoint[];
}

/**
 * Visual markers for crossover points on the timeline chart
 * Shows where one scenario becomes cheaper than another
 */
export function InflectionMarkers({ crossovers, data }: InflectionMarkersProps) {
  return (
    <>
      {crossovers.map((crossover, index) => {
        // Find the data point for this month to get the Y value
        const dataPoint = data.find((d) => d.month === crossover.month);
        if (!dataPoint) {
          return null;
        }

        // Get the Y value for the scenario that became cheapest
        const scenarioKey = crossover.scenario;
        const yValue = dataPoint[scenarioKey as keyof TimelineDataPoint];

        // Skip if no value (shouldn't happen, but safety check)
        if (yValue === null || yValue === undefined) {
          return null;
        }

        return (
          <ReferenceDot
            key={`crossover-${index}`}
            x={crossover.month}
            y={yValue}
            r={5}
            fill="hsl(var(--foreground))"
            stroke="hsl(var(--background))"
            strokeWidth={2}
          >
            <Label
              value="⚡"
              position="top"
              offset={10}
              className="text-sm"
            />
          </ReferenceDot>
        );
      })}
    </>
  );
}
