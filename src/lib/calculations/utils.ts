import { Decimal } from '@/lib/decimal';

/**
 * Converts a money factor to APR (Annual Percentage Rate)
 * Formula: MF * 2400 = APR
 *
 * @param moneyFactor - The money factor as a Decimal
 * @returns The APR as a Decimal
 *
 * @example
 * moneyFactorToAPR(new Decimal('0.00125')) // returns Decimal('3')
 */
export function moneyFactorToAPR(moneyFactor: Decimal): Decimal {
  return moneyFactor.times(2400);
}

/**
 * Converts APR (Annual Percentage Rate) to a money factor
 * Formula: APR / 2400 = MF
 *
 * @param apr - The APR as a Decimal
 * @returns The money factor as a Decimal
 *
 * @example
 * aprToMoneyFactor(new Decimal('3.0')) // returns Decimal('0.00125')
 */
export function aprToMoneyFactor(apr: Decimal): Decimal {
  return apr.dividedBy(2400);
}
