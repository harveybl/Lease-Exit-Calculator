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
 * Converts a Decimal value to a localized USD currency string.
 *
 * Number conversion happens here at the display boundary — all upstream
 * calculations use Decimal for precision.
 *
 * @param value - A Decimal amount
 * @returns Formatted string like "$1,234.56"
 */
export function formatCurrency(value: Decimal): string {
  return currencyFormatter.format(value.toNumber());
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
