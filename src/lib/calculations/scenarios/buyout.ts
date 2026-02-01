import { Decimal } from '@/lib/decimal';
import { BuyoutScenarioResult, LineItem } from '@/lib/types';
import { getStateTaxRule } from '@/lib/calculations/tax-rules';
import { computeLeasePayoff } from '@/lib/calculations/lease-payoff';
import { DISCLAIMERS } from '@/lib/disclaimers';

export interface EvaluateBuyoutScenarioParams {
  residualValue: Decimal;
  netCapCost: Decimal;
  moneyFactor: Decimal;
  monthlyPayment: Decimal;
  termMonths: number;
  monthsElapsed: number;
  purchaseFee: Decimal;
  stateCode: string;
}

/**
 * Evaluates the lease buyout scenario.
 *
 * Calculates the total cost to purchase the leased vehicle using the
 * Constant Yield Method (as defined in lease contracts like GM Financial §22).
 * The payoff amount is the Adjusted Lease Balance — the remaining book value
 * computed using constant yield accounting, which matches how lenders
 * calculate mid-lease buyout quotes.
 *
 * Falls back to straight-line depreciation for zero-interest leases.
 *
 * @param params - Buyout scenario parameters
 * @returns BuyoutScenarioResult with itemized breakdown and warnings
 */
export function evaluateBuyoutScenario(
  params: EvaluateBuyoutScenarioParams
): BuyoutScenarioResult {
  const {
    residualValue,
    netCapCost,
    moneyFactor,
    monthlyPayment,
    termMonths,
    monthsElapsed,
    purchaseFee,
    stateCode,
  } = params;

  const monthsRemaining = termMonths - monthsElapsed;

  // Compute payoff using Constant Yield Method
  // This matches how lenders (e.g., GM Financial) compute mid-lease buyout quotes
  const payoffAmount = computeLeasePayoff(
    netCapCost,
    residualValue,
    monthlyPayment,
    termMonths,
    monthsElapsed,
    moneyFactor,
  );

  // Remaining depreciation: difference between payoff and residual
  // At end of lease this is zero; mid-lease it reflects unrecovered book value
  const remainingDepreciation = payoffAmount.minus(residualValue);

  // Calculate sales tax on residual value (buyout purchase price)
  const taxRule = getStateTaxRule(stateCode);
  const salesTax = residualValue.mul(taxRule.rate);

  // Calculate total cost
  const totalCost = payoffAmount.add(purchaseFee).add(salesTax);

  // For buyout scenario, netCost equals totalCost (no sale price to offset)
  const netCost = totalCost;

  // Build line items
  const lineItems: LineItem[] = [
    {
      label: 'Payoff Amount',
      amount: payoffAmount,
      description: 'Amount owed to lender to purchase the vehicle',
      type: 'liability',
    },
    {
      label: '  ↳ Residual Value',
      amount: residualValue,
      description: 'Predetermined vehicle value at lease end',
      type: 'liability',
    },
    {
      label: '  ↳ Remaining Depreciation',
      amount: remainingDepreciation,
      description: `Remaining book value above residual (${monthsRemaining} months left)`,
      type: 'liability',
    },
    {
      label: 'Purchase Fee',
      amount: purchaseFee,
      description: 'Administrative fee charged for lease buyout',
      type: 'fee',
    },
    {
      label: 'Sales Tax',
      amount: salesTax,
      description: `${taxRule.stateName} sales tax on residual value (${taxRule.rate.mul(100).toFixed(2)}%)`,
      type: 'tax',
    },
  ];

  // Build warnings
  const warnings: string[] = [];

  if (monthsRemaining > 0) {
    warnings.push(
      `Estimated payoff based on constant yield method. ` +
        `Actual payoff may differ — contact your lender for an exact quote.`
    );
  }

  // Build disclaimers
  const disclaimers: string[] = [DISCLAIMERS.general, DISCLAIMERS.tax];

  return {
    type: 'buyout',
    totalCost,
    netCost,
    lineItems,
    warnings,
    disclaimers,
    residualValue,
    payoffAmount,
    remainingDepreciation,
    purchaseFee,
    salesTax,
  };
}
