import { Decimal } from '@/lib/decimal';
import { EquityCalculation, LineItem } from '@/lib/types/calculation';

/**
 * Calculates equity position by comparing market value to total buyout cost.
 *
 * Positive equity means the vehicle is worth more than the buyout cost,
 * indicating a potential opportunity to sell privately or negotiate with the dealer.
 *
 * @param marketValue - Current market value of the vehicle
 * @param residualValue - Predetermined end-of-lease residual value
 * @param remainingPayments - Sum of all remaining monthly payments
 * @param buyoutFee - Administrative fee charged for lease buyout
 * @returns EquityCalculation with equity amount, status, and detailed line items
 */
export function calculateEquity(
  marketValue: Decimal,
  residualValue: Decimal,
  remainingPayments: Decimal,
  buyoutFee: Decimal
): EquityCalculation {
  // Total cost to buy out the lease
  const buyoutCost = residualValue.add(remainingPayments).add(buyoutFee);

  // Equity is the difference between what it's worth and what it costs
  const equity = marketValue.sub(buyoutCost);

  // Positive equity only if greater than zero
  const hasPositiveEquity = equity.greaterThan(0);

  // Create detailed line items for transparency
  const lineItems: LineItem[] = [
    {
      label: 'Market Value',
      amount: marketValue,
      description: 'Current market value of the vehicle',
      type: 'asset',
    },
    {
      label: 'Residual Value',
      amount: residualValue,
      description: 'Predetermined residual value at lease end',
      type: 'liability',
    },
    {
      label: 'Remaining Payments',
      amount: remainingPayments,
      description: 'Sum of all remaining monthly payments',
      type: 'liability',
    },
    {
      label: 'Buyout Fee',
      amount: buyoutFee,
      description: 'Administrative fee for lease buyout',
      type: 'liability',
    },
  ];

  return {
    marketValue,
    buyoutCost,
    equity,
    hasPositiveEquity,
    lineItems,
  };
}
