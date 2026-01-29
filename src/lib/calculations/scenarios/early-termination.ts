import { Decimal } from '@/lib/decimal';
import { EarlyTerminationResult } from '@/lib/types';
import { calculateDepreciation } from '@/lib/calculations/depreciation';
import { calculateRentCharge } from '@/lib/calculations/rent-charge';
import { DISCLAIMERS } from '@/lib/disclaimers';

/**
 * Evaluates the early termination scenario for a lease
 *
 * Uses the generic actuarial method (Federal Reserve reference):
 * - Calculates remaining depreciation over remaining months
 * - Calculates unpaid rent charges over remaining months
 * - Adds residual value, early termination fee, and disposition fee
 *
 * WARNING: This is a SIMPLIFIED actuarial method. Real lender payoffs
 * may differ significantly based on lender-specific formulas.
 *
 * @param params.netCapCost - Net capitalized cost
 * @param params.residualValue - Residual value at lease end
 * @param params.moneyFactor - Money factor
 * @param params.termMonths - Total lease term in months
 * @param params.monthsElapsed - Months elapsed in lease
 * @param params.monthlyPayment - Current monthly payment (not used in calculation but may be needed for validation)
 * @param params.earlyTerminationFee - Early termination fee
 * @param params.dispositionFee - Disposition fee
 * @returns EarlyTerminationResult with itemized costs and disclaimers
 */
export function evaluateEarlyTerminationScenario(params: {
  netCapCost: Decimal;
  residualValue: Decimal;
  moneyFactor: Decimal;
  termMonths: number;
  monthsElapsed: number;
  monthlyPayment: Decimal;
  earlyTerminationFee: Decimal;
  dispositionFee: Decimal;
}): EarlyTerminationResult {
  const {
    netCapCost,
    residualValue,
    moneyFactor,
    termMonths,
    monthsElapsed,
    earlyTerminationFee,
    dispositionFee,
  } = params;

  // Calculate months remaining
  const monthsRemaining = termMonths - monthsElapsed;

  // Calculate monthly depreciation and rent charge
  const monthlyDepreciation = calculateDepreciation(netCapCost, residualValue, termMonths);
  const monthlyRentCharge = calculateRentCharge(netCapCost, residualValue, moneyFactor);

  // Calculate total remaining amounts
  const remainingDepreciation = monthlyDepreciation.times(monthsRemaining);
  const unpaidRentCharges = monthlyRentCharge.times(monthsRemaining);

  // Calculate total early termination payoff
  const totalCost = residualValue
    .plus(remainingDepreciation)
    .plus(unpaidRentCharges)
    .plus(earlyTerminationFee)
    .plus(dispositionFee);

  // Build line items
  const lineItems = [
    {
      label: 'Residual Value',
      amount: residualValue,
      description: 'The predetermined value of the vehicle at lease end',
      type: 'asset' as const,
    },
    {
      label: 'Remaining Depreciation',
      amount: remainingDepreciation,
      description: `Depreciation over remaining ${monthsRemaining} months`,
      type: 'liability' as const,
    },
    {
      label: 'Unpaid Rent Charges',
      amount: unpaidRentCharges,
      description: `Finance charges over remaining ${monthsRemaining} months`,
      type: 'liability' as const,
    },
    {
      label: 'Early Termination Fee',
      amount: earlyTerminationFee,
      description: 'Fee charged by lender for early lease termination',
      type: 'fee' as const,
    },
    {
      label: 'Disposition Fee',
      amount: dispositionFee,
      description: 'Fee for processing lease termination',
      type: 'fee' as const,
    },
  ];

  // Build warnings
  const warnings = [
    'This estimate uses a generic actuarial method. Your actual early termination payoff may differ significantly.',
    'Contact your leasing company directly for an exact payoff quote.',
  ];

  // Add first-year warning if terminating within first 12 months
  if (monthsElapsed < 12) {
    warnings.push('Early termination in the first year typically incurs the highest penalties.');
  }

  return {
    type: 'early-termination',
    totalCost,
    netCost: totalCost, // Early termination is always a cost, no recovery
    earlyTerminationFee,
    remainingDepreciation,
    unpaidRentCharges,
    lineItems,
    warnings,
    disclaimers: [DISCLAIMERS.earlyTermination],
  };
}
