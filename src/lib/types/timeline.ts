import { Decimal } from '@/lib/decimal';
import { ScenarioType } from './scenario';

/**
 * A single data point in the timeline representing costs at a specific month offset
 * All numeric values are rounded to 2 decimal places for chart consumption
 */
export interface TimelineDataPoint {
  month: number;
  return: number;
  buyout: number;
  sellPrivately: number | null;
  earlyTermination: number;
  extension: number | null;
}

/**
 * Internal representation of monthly projection with full Decimal precision
 * Used during calculation before conversion to TimelineDataPoint
 */
export interface MonthlyProjection {
  month: number;
  costs: Record<ScenarioType, Decimal | null>;
}

/**
 * Complete timeline data for all scenarios across remaining lease term
 */
export interface TimelineSeries {
  data: TimelineDataPoint[];
  monthsRemaining: number;
  hasMarketValue: boolean;
  scenarios: ScenarioType[];
}

// Re-export ScenarioType for convenience
export type { ScenarioType };
