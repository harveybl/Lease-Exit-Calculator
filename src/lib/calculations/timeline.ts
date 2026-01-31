import { Decimal } from '@/lib/decimal';
import { Lease } from '@/lib/db/schema';
import { ScenarioType } from '@/lib/types/scenario';
import { MonthlyProjection, TimelineDataPoint, TimelineSeries } from '@/lib/types/timeline';
import {
  evaluateReturnScenario,
  evaluateBuyoutScenario,
  evaluateSellPrivatelyScenario,
  evaluateEarlyTerminationScenario,
  evaluateExtensionScenario,
} from './scenarios';

/**
 * Projects scenario costs at a specific month offset from now
 *
 * @param lease - The lease to evaluate
 * @param monthOffset - Number of months forward from now (0 = today)
 * @param estimatedSalePrice - Optional market value for sell-privately scenario
 * @returns MonthlyProjection with Decimal costs for each scenario
 */
export function projectScenarioCosts(
  lease: Lease,
  monthOffset: number,
  estimatedSalePrice?: Decimal
): MonthlyProjection {
  const monthsElapsed = (lease.monthsElapsed ?? 0) + monthOffset;
  const monthsRemaining = lease.termMonths - monthsElapsed;

  // Calculate remaining payments for return scenario
  const remainingPayments = lease.monthlyPayment.times(monthsRemaining);

  // Evaluate return scenario
  const returnResult = evaluateReturnScenario({
    dispositionFee: lease.dispositionFee ?? new Decimal('0'),
    currentMileage: lease.currentMileage,
    monthsElapsed,
    termMonths: lease.termMonths,
    allowedMilesPerYear: lease.allowedMilesPerYear,
    overageFeePerMile: lease.overageFeePerMile,
    wearAndTearEstimate: new Decimal('0'), // No wear and tear projection for timeline
    remainingPayments,
  });

  // Evaluate buyout scenario
  const buyoutResult = evaluateBuyoutScenario({
    residualValue: lease.residualValue,
    netCapCost: lease.netCapCost ?? lease.residualValue,
    moneyFactor: lease.moneyFactor ?? new Decimal('0'),
    monthlyPayment: lease.monthlyPayment,
    termMonths: lease.termMonths,
    monthsElapsed,
    purchaseFee: lease.purchaseFee ?? new Decimal('0'),
    stateCode: lease.stateCode ?? 'CA',
  });

  // Evaluate sell-privately scenario (only if market value provided)
  let sellPrivatelyResult = null;
  if (estimatedSalePrice) {
    const result = evaluateSellPrivatelyScenario({
      estimatedSalePrice,
      residualValue: lease.residualValue,
      netCapCost: lease.netCapCost ?? lease.residualValue,
      moneyFactor: lease.moneyFactor ?? new Decimal('0'),
      monthlyPayment: lease.monthlyPayment,
      termMonths: lease.termMonths,
      monthsElapsed,
      purchaseFee: lease.purchaseFee ?? new Decimal('0'),
      stateCode: lease.stateCode ?? 'CA',
    });
    sellPrivatelyResult = result.netCost;
  }

  // Evaluate early termination scenario
  const earlyTerminationResult = evaluateEarlyTerminationScenario({
    netCapCost: lease.netCapCost ?? lease.residualValue,
    residualValue: lease.residualValue,
    moneyFactor: lease.moneyFactor ?? new Decimal('0'),
    termMonths: lease.termMonths,
    monthsElapsed,
    monthlyPayment: lease.monthlyPayment,
    earlyTerminationFee: new Decimal('500'), // Default early termination fee
    dispositionFee: lease.dispositionFee ?? new Decimal('0'),
  });

  // Evaluate extension scenario (only at lease end)
  let extensionResult = null;
  if (monthsRemaining === 0) {
    // Extension only available at lease end
    const result = evaluateExtensionScenario({
      monthlyPayment: lease.monthlyPayment,
      extensionMonths: 6, // Default 6-month extension
      monthlyTax: new Decimal('0'), // Simplified for timeline
    });
    extensionResult = result.totalCost;
  }

  return {
    month: monthOffset,
    costs: {
      return: returnResult.netCost,
      buyout: buyoutResult.netCost,
      'sell-privately': sellPrivatelyResult,
      'early-termination': earlyTerminationResult.netCost,
      extension: extensionResult,
      'lease-transfer': null, // TODO: Implement timeline support for lease transfer in future plan
    },
  };
}

/**
 * Builds complete timeline data with month-by-month projections for all scenarios
 *
 * @param lease - The lease to evaluate
 * @param estimatedSalePrice - Optional market value for sell-privately scenario
 * @returns TimelineSeries with data points for each month from now until lease end
 */
export function buildTimelineData(
  lease: Lease,
  estimatedSalePrice?: Decimal
): TimelineSeries {
  const monthsRemaining = lease.termMonths - (lease.monthsElapsed ?? 0);
  const hasMarketValue = !!estimatedSalePrice;

  // Build data points for each month from 0 to monthsRemaining (inclusive)
  const data: TimelineDataPoint[] = [];

  for (let monthOffset = 0; monthOffset <= monthsRemaining; monthOffset++) {
    const projection = projectScenarioCosts(lease, monthOffset, estimatedSalePrice);

    // Convert Decimal costs to numbers with 2 decimal places
    const dataPoint: TimelineDataPoint = {
      month: monthOffset,
      return: projection.costs.return!.toDP(2).toNumber(),
      buyout: projection.costs.buyout!.toDP(2).toNumber(),
      sellPrivately: projection.costs['sell-privately']?.toDP(2).toNumber() ?? null,
      earlyTermination: projection.costs['early-termination']!.toDP(2).toNumber(),
      extension: projection.costs.extension?.toDP(2).toNumber() ?? null,
      leaseTransfer: projection.costs['lease-transfer']?.toDP(2).toNumber() ?? null,
    };

    data.push(dataPoint);
  }

  // Determine active scenarios
  const scenarios: ScenarioType[] = [
    'return',
    'buyout',
    'early-termination',
    'extension',
  ];

  if (hasMarketValue) {
    scenarios.splice(2, 0, 'sell-privately'); // Insert after buyout
  }

  return {
    data,
    monthsRemaining,
    hasMarketValue,
    scenarios,
  };
}
