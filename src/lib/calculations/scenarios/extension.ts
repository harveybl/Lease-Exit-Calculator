import { Decimal } from '@/lib/decimal';
import { ExtensionResult } from '@/lib/types';
import { DISCLAIMERS } from '@/lib/disclaimers';

/**
 * Evaluates the month-to-month extension scenario
 *
 * Calculates the total cost to extend the lease for a specified number of months
 * after the original lease term ends. Most lessors keep the same monthly payment
 * for month-to-month extensions.
 *
 * @param params.monthlyPayment - Current monthly payment
 * @param params.extensionMonths - Number of months to extend
 * @param params.monthlyTax - Monthly tax amount
 * @returns ExtensionResult with itemized costs and warnings
 */
export function evaluateExtensionScenario(params: {
  monthlyPayment: Decimal;
  extensionMonths: number;
  monthlyTax: Decimal;
}): ExtensionResult {
  const { monthlyPayment, extensionMonths, monthlyTax } = params;

  // Most lessors keep the same payment for month-to-month
  const monthlyExtensionPayment = monthlyPayment;

  // Calculate total monthly with tax
  const totalPerMonth = monthlyPayment.plus(monthlyTax);

  // Calculate total extension cost
  const totalExtensionCost = totalPerMonth.times(extensionMonths);

  // Build line items
  const lineItems = [
    {
      label: 'Monthly Payment',
      amount: monthlyPayment,
      description: 'Monthly payment amount (per month)',
      type: 'liability' as const,
    },
    {
      label: 'Monthly Tax',
      amount: monthlyTax,
      description: 'Monthly tax amount',
      type: 'tax' as const,
    },
    {
      label: 'Total per Month',
      amount: totalPerMonth,
      description: 'Total monthly cost including tax',
      type: 'liability' as const,
    },
    {
      label: 'Total Extension Cost',
      amount: totalExtensionCost,
      description: `Total cost for ${extensionMonths} month extension`,
      type: 'liability' as const,
    },
  ];

  // Build warnings
  const warnings = [
    'Month-to-month extension terms may differ from your original lease agreement.',
    'Your leasing company may change rates or terms during the extension period.',
  ];

  // Add warranty warning for extensions > 6 months
  if (extensionMonths > 6) {
    warnings.push(
      'Extended lease periods may result in the vehicle falling outside warranty coverage.'
    );
  }

  return {
    type: 'extension',
    totalCost: totalExtensionCost,
    netCost: totalExtensionCost, // Extension is always a cost
    monthlyExtensionPayment,
    extensionMonths,
    totalExtensionCost,
    lineItems,
    warnings,
    disclaimers: [DISCLAIMERS.general],
  };
}
