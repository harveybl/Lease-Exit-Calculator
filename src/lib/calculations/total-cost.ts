import { Decimal } from '@/lib/decimal';

/**
 * Calculates the total cost of a lease over its entire term
 * Formula: (Monthly Payment * Term) + Down Payment + Total Tax
 *
 * This represents the complete out-of-pocket cost to the lessee
 * including all payments, initial costs, and taxes.
 *
 * @param monthlyPayment - Monthly payment amount
 * @param termMonths - Lease term in months
 * @param downPayment - Initial down payment (including cap cost reduction, trade-in, etc.)
 * @param totalTax - Total tax paid over the lease term
 * @returns Total lease cost as a Decimal
 *
 * @example
 * calculateTotalCost(
 *   new Decimal('393.33'),
 *   36,
 *   new Decimal('2000'),
 *   new Decimal('1500')
 * )
 * // returns Decimal('17659.88')
 */
export function calculateTotalCost(
  monthlyPayment: Decimal,
  termMonths: number,
  downPayment: Decimal,
  totalTax: Decimal
): Decimal {
  return monthlyPayment
    .times(termMonths)
    .plus(downPayment)
    .plus(totalTax);
}
