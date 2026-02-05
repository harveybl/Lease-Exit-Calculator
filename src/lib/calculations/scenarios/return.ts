import { Decimal } from '@/lib/decimal';
import { ReturnScenarioResult, LineItem } from '@/lib/types';
import { projectMileage } from '@/lib/calculations/mileage';
import { DISCLAIMERS } from '@/lib/disclaimers';

export interface EvaluateReturnScenarioParams {
  dispositionFee: Decimal;
  currentMileage: number;
  monthsElapsed: number;
  termMonths: number;
  allowedMilesPerYear: number;
  overageFeePerMile: Decimal;
  wearAndTearEstimate: Decimal;
  remainingPayments: Decimal;
}

/**
 * Evaluates the return-at-lease-end scenario.
 *
 * Calculates the total cost of returning the vehicle at lease end,
 * including remaining payments, disposition fee, projected excess mileage charges,
 * and user-estimated wear and tear costs.
 *
 * @param params - Return scenario parameters
 * @returns ReturnScenarioResult with itemized breakdown and warnings
 */
export function evaluateReturnScenario(
  params: EvaluateReturnScenarioParams
): ReturnScenarioResult {
  const {
    dispositionFee,
    currentMileage,
    monthsElapsed,
    termMonths,
    allowedMilesPerYear,
    overageFeePerMile,
    wearAndTearEstimate,
    remainingPayments,
  } = params;

  // Input validation
  if (monthsElapsed < 0) {
    throw new Error('monthsElapsed cannot be negative');
  }
  if (monthsElapsed > termMonths) {
    throw new Error('monthsElapsed cannot exceed termMonths');
  }

  // Project excess mileage cost using the mileage calculation module
  const mileageProjection = projectMileage({
    currentMileage,
    monthsElapsed,
    termMonths,
    allowedMilesPerYear,
    overageFeePerMile,
  });

  const excessMileageCost = mileageProjection.projectedOverageCost;

  // Calculate total cost
  const totalCost = remainingPayments
    .add(dispositionFee)
    .add(excessMileageCost)
    .add(wearAndTearEstimate);

  // For return scenario, netCost equals totalCost (no sale price to offset)
  const netCost = totalCost;

  // Build line items
  const lineItems: LineItem[] = [
    {
      label: 'Remaining Payments',
      amount: remainingPayments,
      description: 'Sum of all remaining monthly lease payments',
      type: 'liability',
    },
    {
      label: 'Disposition Fee',
      amount: dispositionFee,
      description: 'Fee charged by lessor for processing vehicle return',
      type: 'fee',
    },
    {
      label: 'Excess Mileage (Projected)',
      amount: excessMileageCost,
      description: `Projected overage: ${mileageProjection.projectedOverage.toLocaleString()} miles at ${overageFeePerMile.toFixed(2)}/mile`,
      type: 'fee',
    },
    {
      label: 'Wear and Tear Estimate',
      amount: wearAndTearEstimate,
      description: 'User-estimated cost for excessive wear and tear',
      type: 'fee',
    },
  ];

  // Build warnings
  const warnings: string[] = [];

  if (excessMileageCost.greaterThan(0)) {
    warnings.push(
      `Projected excess mileage: ${mileageProjection.projectedOverage.toLocaleString()} miles over allowance, ` +
        `resulting in an estimated charge of $${excessMileageCost.toFixed(2)}.`
    );
  }

  if (wearAndTearEstimate.greaterThan(0)) {
    warnings.push(
      'Wear and tear estimate is user-estimated and may not reflect actual inspection charges. ' +
        'Actual charges depend on lease agreement terms and vehicle condition at return.'
    );
  }

  // Build disclaimers
  const disclaimers: string[] = [DISCLAIMERS.general, DISCLAIMERS.mileage];

  return {
    type: 'return',
    totalCost,
    netCost,
    lineItems,
    warnings,
    disclaimers,
    dispositionFee,
    excessMileageCost,
    wearAndTearEstimate,
  };
}
