import { Decimal } from '@/lib/decimal';
import { calculateDepreciation } from './depreciation';
import { calculateRentCharge } from './rent-charge';

/**
 * Calculates the total monthly payment for a lease
 * Formula: Depreciation + Rent Charge
 *
 * This is the base monthly payment before taxes or fees.
 *
 * @param netCapCost - Net capitalized cost (vehicle price after down payment, trade-in, etc.)
 * @param residualValue - Expected value of the vehicle at lease end
 * @param moneyFactor - The lease's money factor (interest rate equivalent)
 * @param termMonths - Lease term in months
 * @returns Monthly payment as a Decimal
 *
 * @example
 * calculateMonthlyPayment(
 *   new Decimal('30000'),
 *   new Decimal('18000'),
 *   new Decimal('0.00125'),
 *   36
 * )
 * // returns Decimal('393.33333...')
 */
export function calculateMonthlyPayment(
  netCapCost: Decimal,
  residualValue: Decimal,
  moneyFactor: Decimal,
  termMonths: number
): Decimal {
  const depreciation = calculateDepreciation(netCapCost, residualValue, termMonths);
  const rentCharge = calculateRentCharge(netCapCost, residualValue, moneyFactor);
  return depreciation.plus(rentCharge);
}
