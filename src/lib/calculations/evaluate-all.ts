import { Decimal } from '@/lib/decimal';
import type { ScenarioResult, ScenarioType } from '@/lib/types/scenario';
import type { Lease } from '@/lib/db/schema';
import {
  evaluateReturnScenario,
  evaluateBuyoutScenario,
  evaluateSellPrivatelyScenario,
  evaluateEarlyTerminationScenario,
  evaluateExtensionScenario,
  evaluateLeaseTransferScenario,
} from '@/lib/calculations/scenarios';

/**
 * Bundled comparison data for the UI.
 *
 * Contains all six scenario results sorted best-to-worst,
 * the best option, the return baseline, savings vs return, and tie detection.
 */
export interface ComparisonData {
  scenarios: ScenarioResult[];
  bestOption: ScenarioResult;
  returnOption: ScenarioResult;
  savingsVsReturn: Decimal;
  tie: { isTie: boolean; tiedOptions: ScenarioType[] };
  hasMarketValue: boolean;
  equity?: { amount: Decimal; isPositive: boolean };
}

/**
 * Evaluates all six lease-end scenarios for a given lease record.
 *
 * Accepts a Drizzle `Lease` select type (the shape returned by db.select().from(leases)).
 * Maps nullable DB fields to sensible defaults, then calls each scenario evaluator.
 *
 * @param lease - A lease record from the database
 * @param estimatedSalePrice - Optional market value for sell-privately scenario
 * @returns All six ScenarioResult objects sorted by netCost ascending (cheapest first)
 */
export function evaluateAllScenarios(
  lease: Lease,
  estimatedSalePrice?: Decimal
): ScenarioResult[] {
  // Map nullable DB fields to safe defaults
  const dispositionFee = lease.dispositionFee ?? new Decimal('0');
  const purchaseFee = lease.purchaseFee ?? new Decimal('0');
  const monthsElapsed = lease.monthsElapsed ?? 0;
  const monthsRemaining = lease.termMonths - monthsElapsed;
  const remainingPayments = lease.monthlyPayment.mul(monthsRemaining);
  const stateCode = lease.stateCode ?? 'CA';
  const netCapCost = lease.netCapCost ?? lease.residualValue;
  const moneyFactor = lease.moneyFactor ?? new Decimal('0.001');

  const extensionMonths = 6; // Common extension period default
  const monthlyTax = new Decimal('0'); // Simplified; full tax calc is already in each scenario
  const earlyTerminationFee = new Decimal('0'); // Not captured in DB yet
  const wearAndTearEstimate = new Decimal('0'); // Not captured in DB yet

  // Evaluate all six scenarios
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
    netCapCost,
    moneyFactor,
    monthlyPayment: lease.monthlyPayment,
    termMonths: lease.termMonths,
    monthsElapsed,
    purchaseFee,
    stateCode,
  });

  // Use provided market value or fallback to residualValue as conservative placeholder
  const salePrice = estimatedSalePrice ?? lease.residualValue;

  const sellPrivatelyResult = evaluateSellPrivatelyScenario({
    estimatedSalePrice: salePrice,
    residualValue: lease.residualValue,
    netCapCost,
    moneyFactor,
    monthlyPayment: lease.monthlyPayment,
    termMonths: lease.termMonths,
    monthsElapsed,
    purchaseFee,
    stateCode,
  });

  // Mark sell-privately as incomplete if no market value provided
  if (!estimatedSalePrice) {
    sellPrivatelyResult.incomplete = true;
    sellPrivatelyResult.warnings.push(
      'Add your vehicle\'s market value for accurate sell-privately results'
    );
  }

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

  const leaseTransferResult = evaluateLeaseTransferScenario({
    transferFee: new Decimal('400'), // Midpoint of $75-$895 range
    marketplaceFee: new Decimal('100'), // Typical marketplace listing
    registrationFee: new Decimal('150'), // Typical registration/title
    remainingPayments,
    monthsRemaining,
    monthlyPayment: lease.monthlyPayment,
    dispositionFee,
    incentivePayments: new Decimal('0'),
  });

  // Mark lease transfer as incomplete with warning (no transfer details in DB yet)
  leaseTransferResult.incomplete = true;
  leaseTransferResult.warnings.push(
    'Add your transfer details for accurate lease transfer results'
  );

  // Sort all results: complete scenarios by netCost ascending, incomplete last
  const scenarios: ScenarioResult[] = [
    returnResult,
    buyoutResult,
    sellPrivatelyResult,
    earlyTerminationResult,
    extensionResult,
    leaseTransferResult,
  ].sort((a, b) => {
    // Incomplete scenarios always sort last
    if (a.incomplete && !b.incomplete) return 1;
    if (!a.incomplete && b.incomplete) return -1;
    // Both complete or both incomplete: sort by netCost
    return a.netCost.comparedTo(b.netCost);
  });

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
 * @param estimatedSalePrice - Optional market value for sell-privately scenario
 * @returns ComparisonData with sorted scenarios, best option, return baseline, savings, and tie info
 */
export function getComparisonData(
  lease: Lease,
  estimatedSalePrice?: Decimal
): ComparisonData {
  const scenarios = evaluateAllScenarios(lease, estimatedSalePrice);

  // Best option is first non-incomplete scenario
  const bestOption = scenarios.find((s) => !s.incomplete) ?? scenarios[0];

  // Return is always present -- find it for baseline comparison
  const returnOption = scenarios.find((s) => s.type === 'return')!;

  // Savings vs return: how much cheaper the best option is compared to returning
  // Positive = best option saves money vs return; zero or negative = return is already best
  const savingsVsReturn = returnOption.netCost.minus(bestOption.netCost);

  const tie = checkForTie(scenarios.filter((s) => !s.incomplete));

  // Equity calculation when market value is provided
  const hasMarketValue = estimatedSalePrice !== undefined;
  let equity: { amount: Decimal; isPositive: boolean } | undefined;

  if (estimatedSalePrice) {
    const buyoutResult = scenarios.find((s) => s.type === 'buyout')!;
    if (buyoutResult.type === 'buyout') {
      const equityAmount = estimatedSalePrice.minus(buyoutResult.totalCost);
      equity = {
        amount: equityAmount,
        isPositive: equityAmount.greaterThan(0),
      };
    }
  }

  return {
    scenarios,
    bestOption,
    returnOption,
    savingsVsReturn,
    tie,
    hasMarketValue,
    equity,
  };
}
