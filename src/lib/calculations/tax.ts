import { Decimal } from '@/lib/decimal';
import { TaxResult } from '@/lib/types/calculation';
import { getStateTaxRule } from './tax-rules';

/**
 * Calculates lease tax based on state-specific rules.
 *
 * Different states apply sales tax in different ways:
 * - Upfront: Tax on total lease payments, paid at signing (TX, NY, GA, NC)
 * - Monthly: Tax added to each monthly payment (CA, FL, PA, IL, OH, MI, NJ, VA, WA, AZ)
 * - None: No sales tax (OR)
 *
 * Some states also tax the cap cost reduction (down payment) - currently only CA.
 *
 * @param stateCode - Two-letter state code (e.g., 'CA', 'TX')
 * @param monthlyPayment - Monthly lease payment (before tax)
 * @param termMonths - Lease term in months
 * @param capCostReduction - Optional down payment / cap cost reduction
 * @returns TaxResult with upfront, monthly, and total tax amounts
 * @throws Error if state code is not supported
 */
export function calculateLeaseTax(
  stateCode: string,
  monthlyPayment: Decimal,
  termMonths: number,
  capCostReduction?: Decimal
): TaxResult {
  const rule = getStateTaxRule(stateCode);

  let upfrontTax = new Decimal(0);
  let monthlyTax = new Decimal(0);

  if (rule.timing === 'upfront') {
    // Tax on total lease payments, paid upfront
    const totalPayments = monthlyPayment.mul(termMonths);
    upfrontTax = totalPayments.mul(rule.rate);
  } else if (rule.timing === 'monthly') {
    // Tax added to each monthly payment
    monthlyTax = monthlyPayment.mul(rule.rate);

    // Some states also tax the cap cost reduction (down payment)
    if (rule.appliesToDownPayment && capCostReduction) {
      upfrontTax = capCostReduction.mul(rule.rate);
    }
  }
  // else timing === 'none', all taxes remain 0

  // Calculate total tax
  const totalTax = upfrontTax.add(monthlyTax.mul(termMonths));

  return {
    upfrontTax,
    monthlyTax,
    totalTax,
    timing: rule.timing,
    stateCode: rule.stateCode,
  };
}
