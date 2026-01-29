import { Decimal } from '@/lib/decimal';
import { BuyoutScenarioResult, LineItem } from '@/lib/types';
import { getStateTaxRule } from '@/lib/calculations/tax-rules';
import { DISCLAIMERS } from '@/lib/disclaimers';

export interface EvaluateBuyoutScenarioParams {
  residualValue: Decimal;
  monthlyPayment: Decimal;
  monthsRemaining: number;
  purchaseFee: Decimal;
  stateCode: string;
}

/**
 * Evaluates the lease buyout scenario.
 *
 * Calculates the total cost to purchase the leased vehicle,
 * including residual value, remaining lease payments, purchase fee,
 * and state-specific sales tax on the buyout.
 *
 * @param params - Buyout scenario parameters
 * @returns BuyoutScenarioResult with itemized breakdown and warnings
 */
export function evaluateBuyoutScenario(
  params: EvaluateBuyoutScenarioParams
): BuyoutScenarioResult {
  const { residualValue, monthlyPayment, monthsRemaining, purchaseFee, stateCode } = params;

  // Calculate remaining payments
  const remainingPayments = monthlyPayment.mul(monthsRemaining);

  // Calculate sales tax on residual value (buyout purchase price)
  // Get state tax rate for buyout
  const taxRule = getStateTaxRule(stateCode);
  const salesTax = residualValue.mul(taxRule.rate);

  // Calculate total cost
  const totalCost = residualValue.add(remainingPayments).add(purchaseFee).add(salesTax);

  // For buyout scenario, netCost equals totalCost (no sale price to offset)
  const netCost = totalCost;

  // Build line items
  const lineItems: LineItem[] = [
    {
      label: 'Residual Value',
      amount: residualValue,
      description: 'Predetermined buyout price at lease end',
      type: 'liability',
    },
    {
      label: 'Remaining Payments',
      amount: remainingPayments,
      description: `${monthsRemaining} remaining monthly payments`,
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
      `You have ${monthsRemaining} remaining payments totaling $${remainingPayments.toFixed(2)}. ` +
        `These must be paid before or at the time of buyout.`
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
    remainingPayments,
    purchaseFee,
    salesTax,
  };
}
