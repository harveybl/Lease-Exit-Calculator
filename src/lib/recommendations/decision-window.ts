import type { TimelineDataPoint, ScenarioType } from '@/lib/types/timeline';
import { formatCurrency, formatOptionName } from '@/lib/utils/format-currency';

/**
 * Result of recommendation analysis showing best option now vs best overall
 */
export interface RecommendationResult {
  bestNow: { scenario: ScenarioType; cost: number };
  bestOverall: { scenario: ScenarioType; cost: number; month: number };
  shouldWait: boolean;
  savings: number;
  message: string;
}

/**
 * Tie threshold from Phase 3: differences <= $100 are not meaningful
 */
const TIE_THRESHOLD = 100;

/**
 * Helper to find the cheapest scenario at a given data point
 * Returns null if no valid scenarios exist (all null)
 * Reused from crossover-detection logic
 */
function getCheapestScenario(
  point: TimelineDataPoint
): { scenario: ScenarioType; cost: number } | null {
  const scenarios: Array<{ scenario: ScenarioType; cost: number | null }> = [
    { scenario: 'return', cost: point.return },
    { scenario: 'buyout', cost: point.buyout },
    { scenario: 'sell-privately', cost: point.sellPrivately },
    { scenario: 'early-termination', cost: point.earlyTermination },
    { scenario: 'extension', cost: point.extension },
  ];

  // Filter out null costs
  const validScenarios = scenarios.filter(
    (s): s is { scenario: ScenarioType; cost: number } => s.cost !== null
  );

  if (validScenarios.length === 0) {
    return null;
  }

  // Find the minimum cost
  let cheapest = validScenarios[0];
  for (let i = 1; i < validScenarios.length; i++) {
    if (validScenarios[i].cost < cheapest.cost) {
      cheapest = validScenarios[i];
    }
  }

  return cheapest;
}

/**
 * Generates recommendation for whether to act now or wait
 *
 * Compares best option today (month 0) with best option across entire timeline.
 * Uses $100 tie threshold from Phase 3 - savings <= $100 are not worth waiting for.
 *
 * @param data - Timeline data points sorted by month
 * @returns Recommendation with best now, best overall, and whether to wait
 */
export function generateRecommendation(data: TimelineDataPoint[]): RecommendationResult {
  if (data.length === 0) {
    throw new Error('Timeline data cannot be empty');
  }

  // Find best option today (month 0)
  const bestNowResult = getCheapestScenario(data[0]);
  if (!bestNowResult) {
    throw new Error('No valid scenarios at month 0');
  }

  const bestNow = {
    scenario: bestNowResult.scenario,
    cost: bestNowResult.cost,
  };

  // Find best option across all months (global minimum)
  let bestOverall = {
    scenario: bestNowResult.scenario,
    cost: bestNowResult.cost,
    month: data[0].month,
  };

  for (let i = 1; i < data.length; i++) {
    const cheapest = getCheapestScenario(data[i]);
    if (cheapest && cheapest.cost < bestOverall.cost) {
      bestOverall = {
        scenario: cheapest.scenario,
        cost: cheapest.cost,
        month: data[i].month,
      };
    }
  }

  // Calculate savings and determine if waiting is worthwhile
  const savings = bestNow.cost - bestOverall.cost;
  const shouldWait = savings > TIE_THRESHOLD;

  // Generate human-readable message
  let message: string;
  if (shouldWait) {
    message = `Waiting ${bestOverall.month} months could save you ${formatCurrency(savings)} — ${formatOptionName(bestOverall.scenario)} becomes your best option in month ${bestOverall.month}`;
  } else {
    message = `${formatOptionName(bestNow.scenario)} is your best option today, and waiting won't improve it`;
  }

  return {
    bestNow,
    bestOverall,
    shouldWait,
    savings,
    message,
  };
}
