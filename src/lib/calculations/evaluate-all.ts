import { Decimal } from '@/lib/decimal';
import type { ScenarioResult, ScenarioType } from '@/lib/types/scenario';
import type { Lease } from '@/lib/db/schema';
import {
  evaluateReturnScenario,
  evaluateBuyoutScenario,
  evaluateSellPrivatelyScenario,
  evaluateEarlyTerminationScenario,
  evaluateExtensionScenario,
} from '@/lib/calculations/scenarios';

/**
 * Bundled comparison data for the UI.
 *
 * Contains all five scenario results sorted best-to-worst,
 * the best option, the return baseline, savings vs return, and tie detection.
 */
export interface ComparisonData {
  scenarios: ScenarioResult[];
  bestOption: ScenarioResult;
  returnOption: ScenarioResult;
  savingsVsReturn: Decimal;
  tie: { isTie: boolean; tiedOptions: ScenarioType[] };
}

/**
 * Evaluates all five lease-end scenarios for a given lease record.
 *
 * Accepts a Drizzle `Lease` select type (the shape returned by db.select().from(leases)).
 * Maps nullable DB fields to sensible defaults, then calls each scenario evaluator.
 *
 * @param lease - A lease record from the database
 * @returns All five ScenarioResult objects sorted by netCost ascending (cheapest first)
 */
export function evaluateAllScenarios(lease: Lease): ScenarioResult[] {
  // Map nullable DB fields to safe defaults
  const dispositionFee = lease.dispositionFee ?? new Decimal('0');
  const purchaseFee = lease.purchaseFee ?? new Decimal('0');
  const monthsElapsed = lease.monthsElapsed ?? 0;
  const monthsRemaining = lease.termMonths - monthsElapsed;
  const remainingPayments = lease.monthlyPayment.mul(monthsRemaining);
  const stateCode = lease.stateCode ?? 'CA';
  const netCapCost = lease.netCapCost ?? lease.residualValue;
  const moneyFactor = lease.moneyFactor ?? new Decimal('0.001');

  // Phase 4 will add market value entry; using residual as placeholder
  const estimatedSalePrice = lease.residualValue;

  const extensionMonths = 6; // Common extension period default
  const monthlyTax = new Decimal('0'); // Simplified; full tax calc is already in each scenario
  const earlyTerminationFee = new Decimal('0'); // Not captured in DB yet
  const wearAndTearEstimate = new Decimal('0'); // Not captured in DB yet

  // Evaluate all five scenarios
  const returnResult = evaluateReturnScenario({
    dispositionFee,
    currentMileage: lease.currentMileage,
    monthsElapsed,
    termMonths: lease.termMonths,
    allowedMilesPerYear: lease.allowedMilesPerYear,
    overageFeePerMile: lease.overageFeePerMile,
    wearAndTearEstimate,
    remainingPayments,
  });

  const buyoutResult = evaluateBuyoutScenario({
    residualValue: lease.residualValue,
    monthlyPayment: lease.monthlyPayment,
    monthsRemaining,
    purchaseFee,
    stateCode,
  });

  const sellPrivatelyResult = evaluateSellPrivatelyScenario({
    estimatedSalePrice,
    residualValue: lease.residualValue,
    monthlyPayment: lease.monthlyPayment,
    monthsRemaining,
    purchaseFee,
    stateCode,
  });

  const earlyTerminationResult = evaluateEarlyTerminationScenario({
    netCapCost,
    residualValue: lease.residualValue,
    moneyFactor,
    termMonths: lease.termMonths,
    monthsElapsed,
    monthlyPayment: lease.monthlyPayment,
    earlyTerminationFee,
    dispositionFee,
  });

  const extensionResult = evaluateExtensionScenario({
    monthlyPayment: lease.monthlyPayment,
    extensionMonths,
    monthlyTax,
  });

  // Sort all results by netCost ascending (cheapest first)
  const scenarios: ScenarioResult[] = [
    returnResult,
    buyoutResult,
    sellPrivatelyResult,
    earlyTerminationResult,
    extensionResult,
  ].sort((a, b) => a.netCost.comparedTo(b.netCost));

  return scenarios;
}

/**
 * Checks whether the top two scenario options are effectively tied.
 *
 * A tie is declared when the difference in netCost between the first and second
 * ranked options is $100 or less. This signals intellectual honesty -- the tool
 * acknowledges when precision has limits.
 *
 * @param scenarios - ScenarioResult array, already sorted by netCost ascending
 * @returns Whether a tie exists and which options are tied
 */
export function checkForTie(
  scenarios: ScenarioResult[]
): { isTie: boolean; tiedOptions: ScenarioType[] } {
  if (scenarios.length < 2) {
    return { isTie: false, tiedOptions: [] };
  }

  const first = scenarios[0];
  const second = scenarios[1];
  const difference = second.netCost.minus(first.netCost).abs();

  if (difference.lte(new Decimal('100'))) {
    return { isTie: true, tiedOptions: [first.type, second.type] };
  }

  return { isTie: false, tiedOptions: [] };
}

/**
 * Returns the full comparison data bundle for the UI.
 *
 * Calls evaluateAllScenarios, finds the return baseline option,
 * calculates savings vs return, checks for tie, and packages everything
 * into a single ComparisonData object.
 *
 * @param lease - A lease record from the database
 * @returns ComparisonData with sorted scenarios, best option, return baseline, savings, and tie info
 */
export function getComparisonData(lease: Lease): ComparisonData {
  const scenarios = evaluateAllScenarios(lease);
  const bestOption = scenarios[0];

  // Return is always present -- find it for baseline comparison
  const returnOption = scenarios.find((s) => s.type === 'return')!;

  // Savings vs return: how much cheaper the best option is compared to returning
  // Positive = best option saves money vs return; zero or negative = return is already best
  const savingsVsReturn = returnOption.netCost.minus(bestOption.netCost);

  const tie = checkForTie(scenarios);

  return {
    scenarios,
    bestOption,
    returnOption,
    savingsVsReturn,
    tie,
  };
}
