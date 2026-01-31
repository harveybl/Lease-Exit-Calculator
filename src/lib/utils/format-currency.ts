import { Decimal } from '@/lib/decimal';
import type { ScenarioType } from '@/lib/types/scenario';

/**
 * Reusable currency formatter instance.
 * Module-level constant avoids creating a new Intl.NumberFormat per call.
 */
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Converts a monetary value to a localized USD currency string.
 *
 * Accepts Decimal (server-side), number, or string (after RSC serialization).
 * Decimal.toJSON() returns a string, so client components receive strings
 * for Decimal fields when data crosses the server/client boundary.
 *
 * @param value - A Decimal, number, or string amount
 * @returns Formatted string like "$1,234.56"
 */
export function formatCurrency(value: Decimal | number | string): string {
  const num = value instanceof Decimal ? value.toNumber() : Number(value);
  return currencyFormatter.format(num);
}

/**
 * Maps ScenarioType enum values to human-readable display names.
 */
const scenarioDisplayNames: Record<ScenarioType, string> = {
  'return': 'Return Vehicle',
  'buyout': 'Buy Out Lease',
  'sell-privately': 'Sell Privately',
  'early-termination': 'Early Termination',
  'extension': 'Keep Paying (Extend)',
  'lease-transfer': 'Transfer Lease',
};

/**
 * Returns a human-readable display name for a scenario type.
 *
 * @param type - A ScenarioType value
 * @returns Display name like "Return Vehicle" or "Buy Out Lease"
 */
export function formatOptionName(type: ScenarioType): string {
  return scenarioDisplayNames[type];
}
