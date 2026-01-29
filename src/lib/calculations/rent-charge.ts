import { Decimal } from '@/lib/decimal';

/**
 * Calculates the monthly rent charge (finance charge) for a lease
 * Formula: (Net Capitalized Cost + Residual Value) * Money Factor
 *
 * This represents the interest/finance portion of the monthly payment,
 * similar to interest on a loan but calculated differently for leases.
 *
 * @param netCapCost - Net capitalized cost (vehicle price after down payment, trade-in, etc.)
 * @param residualValue - Expected value of the vehicle at lease end
 * @param moneyFactor - The lease's money factor (interest rate equivalent)
 * @returns Monthly rent charge as a Decimal
 *
 * @example
 * calculateRentCharge(new Decimal('30000'), new Decimal('18000'), new Decimal('0.00125'))
 * // returns Decimal('60')
 */
export function calculateRentCharge(
  netCapCost: Decimal,
  residualValue: Decimal,
  moneyFactor: Decimal
): Decimal {
  return netCapCost.plus(residualValue).times(moneyFactor);
}
