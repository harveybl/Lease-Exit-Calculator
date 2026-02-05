import { Decimal } from '@/lib/decimal';
import { SellPrivatelyResult, LineItem } from '@/lib/types';
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
  } = params;

  // Input validation
  if (monthsElapsed < 0) {
    throw new Error('monthsElapsed cannot be negative');
  }

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

  // Total payoff amount to buy out the lease (no sales tax)
  const payoffAmount = leasePayoff.add(purchaseFee);

  // Calculate net proceeds (positive = profit, negative = loss)
  const netProceeds = estimatedSalePrice.sub(payoffAmount);

  // For sell-privately scenario:
  // - totalCost is the payoff amount (what you pay to own it)
  // - netCost is payoffAmount - salePrice
  //
  // ⚠️ SEMANTIC NOTE: Unlike other scenarios where netCost is always a cost (positive),
  //    sell-privately can produce a NEGATIVE netCost when sale price exceeds payoff.
  //    This negative value represents profit/equity, not a cost.
  //    
  //    Example: If payoff = $20,000 and sale = $25,000:
  //      - netCost = -$5,000 (you gain $5,000)
  //      - netProceeds = +$5,000 (same gain, different sign convention)
  //
  //    The comparison logic in evaluate-all.ts correctly handles this by using
  //    Decimal.comparedTo() which properly sorts negative values as better than positive.
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
      subItem: true,
    },
    {
      label: '    ↳ Residual Value',
      amount: residualValue,
      description: 'Predetermined vehicle value at lease end',
      type: 'liability',
      subItem: true,
    },
    {
      label: '    ↳ Remaining Depreciation',
      amount: remainingDepreciation,
      description: `Remaining book value above residual (${monthsRemaining} months left)`,
      type: 'liability',
      subItem: true,
    },
    {
      label: '  ↳ Purchase Fee',
      amount: purchaseFee,
      description: 'Administrative buyout fee',
      type: 'fee',
      subItem: true,
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

  warnings.push(
    'Sales tax may apply at buyout depending on your state. Check with your local DMV or tax advisor for exact obligations.'
  );

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
