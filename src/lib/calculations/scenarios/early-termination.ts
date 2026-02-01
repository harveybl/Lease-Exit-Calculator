import { Decimal } from '@/lib/decimal';
import { EarlyTerminationResult } from '@/lib/types';
import { computeLeasePayoff } from '@/lib/calculations/lease-payoff';
import { DISCLAIMERS } from '@/lib/disclaimers';

/**
 * Evaluates the early termination scenario for a lease.
 *
 * Implements the contractual "lesser of" cap found in most lease contracts
 * (e.g., GM Financial §17-18):
 *
 *   Option (a): Adjusted Lease Balance − Fair Market Wholesale Value
 *   Option (b): Remaining scheduled payments + excess wear + excess mileage
 *
 * Liability = min(option_a, option_b)  (if wholesale value provided)
 * Liability = option_b                 (if no wholesale value — conservative)
 *
 * Total cost = liability + disposition fee + early termination fee
 *
 * @param params.netCapCost - Net capitalized cost
 * @param params.residualValue - Residual value at lease end
 * @param params.moneyFactor - Money factor
 * @param params.termMonths - Total lease term in months
 * @param params.monthsElapsed - Months elapsed in lease
 * @param params.monthlyPayment - Current monthly payment
 * @param params.earlyTerminationFee - Early termination fee
 * @param params.dispositionFee - Disposition fee
 * @param params.estimatedWholesaleValue - Optional estimated wholesale/trade-in value
 * @param params.excessWearCharge - Optional excess wear charge (default 0)
 * @param params.excessMileageCharge - Optional excess mileage charge (default 0)
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
  estimatedWholesaleValue?: Decimal;
  excessWearCharge?: Decimal;
  excessMileageCharge?: Decimal;
}): EarlyTerminationResult {
  const {
    netCapCost,
    residualValue,
    moneyFactor,
    termMonths,
    monthsElapsed,
    monthlyPayment,
    earlyTerminationFee,
    dispositionFee,
    estimatedWholesaleValue,
    excessWearCharge = new Decimal('0'),
    excessMileageCharge = new Decimal('0'),
  } = params;

  // Calculate months remaining
  const monthsRemaining = termMonths - monthsElapsed;

  // Option (b): Remaining scheduled payments + excess wear + excess mileage
  const remainingPayments = monthlyPayment.times(monthsRemaining);
  const optionB = remainingPayments.plus(excessWearCharge).plus(excessMileageCharge);

  // Option (a): Adjusted Lease Balance − Fair Market Wholesale Value (floor at 0)
  let optionA: Decimal | undefined;
  let usedOption: 'a' | 'b' | 'b-only';

  if (estimatedWholesaleValue) {
    const leasePayoff = computeLeasePayoff(
      netCapCost,
      residualValue,
      monthlyPayment,
      termMonths,
      monthsElapsed,
      moneyFactor,
    );
    const rawOptionA = leasePayoff.minus(estimatedWholesaleValue);
    optionA = rawOptionA.greaterThan(0) ? rawOptionA : new Decimal('0');

    // Liability is the lesser of option (a) and option (b)
    usedOption = optionA.lessThanOrEqualTo(optionB) ? 'a' : 'b';
  } else {
    usedOption = 'b-only';
  }

  const liability = usedOption === 'a' ? optionA! : optionB;

  // Calculate total early termination cost
  const totalCost = liability
    .plus(dispositionFee)
    .plus(earlyTerminationFee);

  // Build line items
  const lineItems = [];

  if (optionA !== undefined && usedOption === 'a') {
    lineItems.push({
      label: 'Early Termination Liability (Option A)',
      amount: optionA,
      description: `Adjusted Lease Balance minus estimated wholesale value (lesser of two options)`,
      type: 'liability' as const,
    });
  } else {
    lineItems.push({
      label: `Remaining Payments (${monthsRemaining} months)`,
      amount: remainingPayments,
      description: `${monthsRemaining} remaining monthly payments of ${monthlyPayment.toFixed(2)}`,
      type: 'liability' as const,
    });

    if (excessWearCharge.greaterThan(0)) {
      lineItems.push({
        label: 'Excess Wear Charge',
        amount: excessWearCharge,
        description: 'Charges for excess wear and tear on the vehicle',
        type: 'fee' as const,
      });
    }

    if (excessMileageCharge.greaterThan(0)) {
      lineItems.push({
        label: 'Excess Mileage Charge',
        amount: excessMileageCharge,
        description: 'Charges for exceeding allowed mileage',
        type: 'fee' as const,
      });
    }
  }

  lineItems.push({
    label: 'Early Termination Fee',
    amount: earlyTerminationFee,
    description: 'Fee charged by lender for early lease termination',
    type: 'fee' as const,
  });

  lineItems.push({
    label: 'Disposition Fee',
    amount: dispositionFee,
    description: 'Fee for processing lease termination',
    type: 'fee' as const,
  });

  // Build warnings
  const warnings: string[] = [];

  if (usedOption === 'b-only') {
    warnings.push(
      'This estimate uses remaining payments as the liability cap. ' +
        'Add your vehicle\'s wholesale/trade-in value for a potentially lower estimate using the contractual "lesser of" formula.'
    );
  }

  warnings.push(
    'Contact your leasing company directly for an exact early termination payoff quote.'
  );

  if (monthsElapsed < 12) {
    warnings.push('Early termination in the first year typically incurs the highest penalties.');
  }

  return {
    type: 'early-termination',
    totalCost,
    netCost: totalCost,
    earlyTerminationFee,
    dispositionFee,
    remainingPayments,
    optionA,
    optionB,
    usedOption,
    lineItems,
    warnings,
    disclaimers: [DISCLAIMERS.earlyTermination],
  };
}
