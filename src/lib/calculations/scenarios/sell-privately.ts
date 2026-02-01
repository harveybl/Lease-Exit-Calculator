import { Decimal } from '@/lib/decimal';
import { SellPrivatelyResult, LineItem } from '@/lib/types';
import { getStateTaxRule } from '@/lib/calculations/tax-rules';
import { computeLeasePayoff } from '@/lib/calculations/lease-payoff';
import { DISCLAIMERS } from '@/lib/disclaimers';

export interface EvaluateSellPrivatelyScenarioParams {
  estimatedSalePrice: Decimal;
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
 * Evaluates the sell-privately scenario.
 *
 * Calculates the net proceeds from selling the vehicle privately after buying
 * out the lease. Uses the Constant Yield Method (same as buyout scenario) to
 * determine the amount owed to the lender.
 *
 * @param params - Sell-privately scenario parameters
 * @returns SellPrivatelyResult with itemized breakdown and net proceeds
 */
export function evaluateSellPrivatelyScenario(
  params: EvaluateSellPrivatelyScenarioParams
): SellPrivatelyResult {
  const {
    estimatedSalePrice,
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

  // Compute payoff using Constant Yield Method (same as buyout)
  const leasePayoff = computeLeasePayoff(
    netCapCost,
    residualValue,
    monthlyPayment,
    termMonths,
    monthsElapsed,
    moneyFactor,
  );

  // Remaining depreciation: payoff minus residual
  const remainingDepreciation = leasePayoff.minus(residualValue);

  // Calculate sales tax on residual value (buyout purchase price)
  const taxRule = getStateTaxRule(stateCode);
  const buyoutTax = residualValue.mul(taxRule.rate);

  // Total payoff amount to buy out the lease
  const payoffAmount = leasePayoff
    .add(purchaseFee)
    .add(buyoutTax);

  // Calculate net proceeds (positive = profit, negative = loss)
  const netProceeds = estimatedSalePrice.sub(payoffAmount);

  // For sell-privately scenario:
  // - totalCost is the payoff amount (what you pay to own it)
  // - netCost is payoffAmount - salePrice (positive = cost, negative = profit)
  const totalCost = payoffAmount;
  const netCost = payoffAmount.sub(estimatedSalePrice);

  // Build line items with buyout breakdown
  const lineItems: LineItem[] = [
    {
      label: 'Estimated Sale Price',
      amount: estimatedSalePrice,
      description: 'Expected private party sale price',
      type: 'asset',
    },
    {
      label: 'Lease Buyout Cost',
      amount: payoffAmount,
      description: 'Total cost to purchase vehicle from lessor',
      type: 'liability',
    },
    // Buyout breakdown sub-items
    {
      label: '  ↳ Lease Payoff',
      amount: leasePayoff,
      description: 'Amount owed to lender (residual + remaining book value)',
      type: 'liability',
    },
    {
      label: '    ↳ Residual Value',
      amount: residualValue,
      description: 'Predetermined vehicle value at lease end',
      type: 'liability',
    },
    {
      label: '    ↳ Remaining Depreciation',
      amount: remainingDepreciation,
      description: `Remaining book value above residual (${monthsRemaining} months left)`,
      type: 'liability',
    },
    {
      label: '  ↳ Purchase Fee',
      amount: purchaseFee,
      description: 'Administrative buyout fee',
      type: 'fee',
    },
    {
      label: '  ↳ Buyout Tax',
      amount: buyoutTax,
      description: `${taxRule.stateName} sales tax on residual (${taxRule.rate.mul(100).toFixed(2)}%)`,
      type: 'tax',
    },
    {
      label: 'Net Proceeds',
      amount: netProceeds,
      description: netProceeds.greaterThanOrEqualTo(0)
        ? 'Cash received after sale (profit)'
        : 'Cash needed to cover payoff (loss)',
      type: netProceeds.greaterThanOrEqualTo(0) ? 'asset' : 'liability',
    },
  ];

  // Build warnings
  const warnings: string[] = [];

  if (netProceeds.lessThan(0)) {
    warnings.push(
      `Sale price is less than payoff amount. You will need to cover the difference of $${netProceeds.abs().toFixed(2)} to complete the sale.`
    );
  }

  if (monthsRemaining > 0) {
    warnings.push(
      `You have ${monthsRemaining} remaining months on your lease. Important timing consideration: you must buy out the lease before selling privately. ` +
        `Coordinate buyout and sale carefully to minimize time between transactions.`
    );
  }

  // Build disclaimers
  const disclaimers: string[] = [
    DISCLAIMERS.general,
    DISCLAIMERS.tax,
    DISCLAIMERS.marketValue,
  ];

  return {
    type: 'sell-privately',
    totalCost,
    netCost,
    lineItems,
    warnings,
    disclaimers,
    estimatedSalePrice,
    payoffAmount,
    netProceeds,
  };
}
