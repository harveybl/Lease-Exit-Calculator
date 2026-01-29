import { Decimal } from '@/lib/decimal';

/**
 * Calculates the monthly depreciation charge for a lease
 * Formula: (Net Capitalized Cost - Residual Value) / Term in Months
 *
 * This represents the portion of the monthly payment that covers the vehicle's
 * loss in value over the lease term.
 *
 * @param netCapCost - Net capitalized cost (vehicle price after down payment, trade-in, etc.)
 * @param residualValue - Expected value of the vehicle at lease end
 * @param termMonths - Lease term in months
 * @returns Monthly depreciation charge as a Decimal
 *
 * @example
 * calculateDepreciation(new Decimal('30000'), new Decimal('18000'), 36)
 * // returns Decimal('333.33333...')
 */
export function calculateDepreciation(
  netCapCost: Decimal,
  residualValue: Decimal,
  termMonths: number
): Decimal {
  return netCapCost.minus(residualValue).dividedBy(termMonths);
}
