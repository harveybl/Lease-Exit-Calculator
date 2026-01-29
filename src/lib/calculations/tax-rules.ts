import { Decimal } from '@/lib/decimal';

/**
 * State tax rule configuration.
 *
 * Source: LeaseGuide.com state-by-state lease tax guide
 * Research date: 2026-01-28
 *
 * NOTE: Tax rates and rules are approximate and simplified for Phase 1.
 * Real-world tax calculations can involve:
 * - County and municipal taxes
 * - Special district taxes
 * - Tax holidays and exemptions
 * - Recent legislative changes
 *
 * Always verify current rates with state tax authority before financial decisions.
 */

export type TaxTiming = 'upfront' | 'monthly' | 'none';

export interface StateTaxRule {
  stateCode: string;
  stateName: string;
  timing: TaxTiming;
  rate: Decimal;
  appliesToDownPayment: boolean;
  notes?: string;
}

/**
 * State tax rules for top 15 US states by population.
 *
 * Covers approximately 65% of US population.
 */
export const STATE_TAX_RULES: Record<string, StateTaxRule> = {
  CA: {
    stateCode: 'CA',
    stateName: 'California',
    timing: 'monthly',
    rate: new Decimal('0.0725'),
    appliesToDownPayment: true,
    notes: 'Sales tax applies to monthly payments and cap cost reduction',
  },
  TX: {
    stateCode: 'TX',
    stateName: 'Texas',
    timing: 'upfront',
    rate: new Decimal('0.0625'),
    appliesToDownPayment: false,
    notes: 'Motor vehicle sales tax paid upfront on total lease payments',
  },
  FL: {
    stateCode: 'FL',
    stateName: 'Florida',
    timing: 'monthly',
    rate: new Decimal('0.06'),
    appliesToDownPayment: false,
    notes: 'Sales tax on monthly payments only',
  },
  NY: {
    stateCode: 'NY',
    stateName: 'New York',
    timing: 'upfront',
    rate: new Decimal('0.04'),
    appliesToDownPayment: false,
    notes: 'State sales tax on total lease payments for leases over 1 year',
  },
  PA: {
    stateCode: 'PA',
    stateName: 'Pennsylvania',
    timing: 'monthly',
    rate: new Decimal('0.06'),
    appliesToDownPayment: false,
    notes: 'Sales tax on monthly payments',
  },
  IL: {
    stateCode: 'IL',
    stateName: 'Illinois',
    timing: 'monthly',
    rate: new Decimal('0.0625'),
    appliesToDownPayment: false,
    notes: 'Sales tax on monthly payments',
  },
  OH: {
    stateCode: 'OH',
    stateName: 'Ohio',
    timing: 'monthly',
    rate: new Decimal('0.0575'),
    appliesToDownPayment: false,
    notes: 'Sales tax on monthly payments',
  },
  GA: {
    stateCode: 'GA',
    stateName: 'Georgia',
    timing: 'upfront',
    rate: new Decimal('0.066'),
    appliesToDownPayment: false,
    notes: 'Title Ad Valorem Tax (TAVT) - simplified as 6.6% of total payments',
  },
  NC: {
    stateCode: 'NC',
    stateName: 'North Carolina',
    timing: 'upfront',
    rate: new Decimal('0.03'),
    appliesToDownPayment: false,
    notes: 'Highway Use Tax on total lease payments',
  },
  MI: {
    stateCode: 'MI',
    stateName: 'Michigan',
    timing: 'monthly',
    rate: new Decimal('0.06'),
    appliesToDownPayment: false,
    notes: 'Sales tax on monthly payments',
  },
  NJ: {
    stateCode: 'NJ',
    stateName: 'New Jersey',
    timing: 'monthly',
    rate: new Decimal('0.06625'),
    appliesToDownPayment: false,
    notes: 'Sales tax on monthly payments',
  },
  VA: {
    stateCode: 'VA',
    stateName: 'Virginia',
    timing: 'monthly',
    rate: new Decimal('0.0415'),
    appliesToDownPayment: false,
    notes: 'Motor vehicle sales tax on monthly payments',
  },
  WA: {
    stateCode: 'WA',
    stateName: 'Washington',
    timing: 'monthly',
    rate: new Decimal('0.065'),
    appliesToDownPayment: false,
    notes: 'Sales tax on monthly payments',
  },
  AZ: {
    stateCode: 'AZ',
    stateName: 'Arizona',
    timing: 'monthly',
    rate: new Decimal('0.056'),
    appliesToDownPayment: false,
    notes: 'Transaction privilege tax on monthly payments',
  },
  OR: {
    stateCode: 'OR',
    stateName: 'Oregon',
    timing: 'none',
    rate: new Decimal('0'),
    appliesToDownPayment: false,
    notes: 'Oregon has no sales tax',
  },
};

/**
 * Get tax rule for a state.
 *
 * @param stateCode - Two-letter state code (e.g., 'CA', 'TX')
 * @returns StateTaxRule configuration
 * @throws Error if state code is not supported
 */
export function getStateTaxRule(stateCode: string): StateTaxRule {
  const rule = STATE_TAX_RULES[stateCode.toUpperCase()];

  if (!rule) {
    throw new Error(
      `Tax rules not available for state code '${stateCode}'. ` +
        `Supported states: ${Object.keys(STATE_TAX_RULES).join(', ')}`
    );
  }

  return rule;
}
