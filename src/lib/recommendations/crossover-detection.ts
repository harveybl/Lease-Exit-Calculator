import type { TimelineDataPoint, ScenarioType } from '@/lib/types/timeline';
import { formatOptionName } from '@/lib/utils/format-currency';

/**
 * Represents a point in time where one scenario becomes cheaper than another
 */
export interface CrossoverPoint {
  month: number;
  scenario: ScenarioType;
  overtakes: ScenarioType;
  message: string;
}

/**
 * Helper to find the cheapest scenario at a given data point
 * Returns null if no valid scenarios exist (all null)
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
    { scenario: 'lease-transfer', cost: point.leaseTransfer },
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
 * Detects crossover points where the cheapest scenario changes
 *
 * Uses a simplified approach: track which scenario is cheapest at each month.
 * When the cheapest scenario changes, that's a crossover point.
 *
 * @param data - Timeline data points sorted by month
 * @returns Array of crossover points sorted by month ascending
 */
export function detectCrossovers(data: TimelineDataPoint[]): CrossoverPoint[] {
  if (data.length <= 1) {
    return [];
  }

  const crossovers: CrossoverPoint[] = [];
  let previousCheapest = getCheapestScenario(data[0]);

  for (let i = 1; i < data.length; i++) {
    const currentCheapest = getCheapestScenario(data[i]);

    // Skip if we can't determine cheapest for either point
    if (!previousCheapest || !currentCheapest) {
      previousCheapest = currentCheapest;
      continue;
    }

    // Check if the cheapest scenario changed
    if (currentCheapest.scenario !== previousCheapest.scenario) {
      const message = `${formatOptionName(currentCheapest.scenario)} becomes cheaper than ${formatOptionName(previousCheapest.scenario)} after month ${data[i].month}`;

      crossovers.push({
        month: data[i].month,
        scenario: currentCheapest.scenario,
        overtakes: previousCheapest.scenario,
        message,
      });
    }

    previousCheapest = currentCheapest;
  }

  return crossovers;
}
