import { Decimal } from '@/lib/decimal';
import { LeaseTransferResult, LineItem } from '@/lib/types';
import { DISCLAIMERS } from '@/lib/disclaimers';

export interface EvaluateLeaseTransferScenarioParams {
  transferFee: Decimal;
  marketplaceFee: Decimal;
  registrationFee: Decimal;
  remainingPayments: Decimal;
  monthsRemaining: number;
  monthlyPayment: Decimal;
  dispositionFee: Decimal;
  incentivePayments: Decimal;
}

/**
 * Evaluates the lease transfer scenario.
 *
 * Calculates the total cost of transferring a lease to a new lessee,
 * including transfer fees, marketplace listing fees, registration fees,
 * and any incentive payments offered to attract a buyer.
 *
 * @param params - Lease transfer scenario parameters
 * @returns LeaseTransferResult with itemized breakdown and warnings
 */
export function evaluateLeaseTransferScenario(
  params: EvaluateLeaseTransferScenarioParams
): LeaseTransferResult {
  const {
    transferFee,
    marketplaceFee,
    registrationFee,
    remainingPayments,
    monthsRemaining,
    monthlyPayment,
    dispositionFee,
    incentivePayments,
  } = params;

  // Build line items array
  const lineItems: LineItem[] = [
    {
      label: 'Transfer Fee',
      amount: transferFee,
      description: 'Fee charged by leasing company to transfer lease to new lessee',
      type: 'fee',
    },
    {
      label: 'Marketplace Listing Fee',
      amount: marketplaceFee,
      description: 'Fee for listing on a lease transfer marketplace (e.g., SwapALease ~$100, LeaseTrader ~$50-200, or free on Leasehackr forums)',
      type: 'fee',
    },
    {
      label: 'Registration Fee',
      amount: registrationFee,
      description: 'Fee for new lessee registration and title transfer',
      type: 'fee',
    },
  ];

  // Only add incentive line item if greater than zero
  if (incentivePayments.greaterThan(0)) {
    lineItems.push({
      label: 'Incentive Payments',
      amount: incentivePayments,
      description: 'Payments offered to new lessee to sweeten the deal',
      type: 'fee',
    });
  }

  // Calculate total cost
  const totalCost = transferFee
    .add(marketplaceFee)
    .add(registrationFee)
    .add(incentivePayments);

  // Net cost equals total cost (you pay this to exit the lease)
  const netCost = totalCost;

  // Payments avoided by transferring instead of paying out the lease
  const paymentsAvoided = remainingPayments;

  // Build warnings
  const warnings: string[] = [];

  if (transferFee.greaterThan(500)) {
    warnings.push(
      'Transfer fee exceeds $500, which is higher than typical. ' +
        'Verify this fee with your leasing company and compare against alternative exit options.'
    );
  }

  if (monthsRemaining < 6) {
    warnings.push(
      'Lease has fewer than 6 months remaining. ' +
        'Finding a qualified transferee may be difficult for short-term leases. ' +
        'Consider alternative options like returning the vehicle or negotiating an early termination.'
    );
  }

  // Build disclaimers
  const transferDisclaimer =
    'Lease transfers require leasing company approval of the new lessee. ' +
    'Credit approval, transfer timeline, and final terms are subject to leasing company policies. ' +
    'Some leasing companies may not allow transfers or may have restrictions based on remaining lease term.';

  const disclaimers: string[] = [DISCLAIMERS.general, transferDisclaimer];

  return {
    type: 'lease-transfer',
    totalCost,
    netCost,
    lineItems,
    warnings,
    disclaimers,
    transferFee,
    marketplaceFee,
    registrationFee,
    incentivePayments,
    paymentsAvoided,
  };
}
