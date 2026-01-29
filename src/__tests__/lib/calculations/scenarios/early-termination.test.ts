import { Decimal } from '@/lib/decimal';
import { evaluateEarlyTerminationScenario } from '@/lib/calculations/scenarios/early-termination';
import { DISCLAIMERS } from '@/lib/disclaimers';

describe('evaluateEarlyTerminationScenario', () => {
  it('calculates mid-lease termination (month 18 of 36)', () => {
    const result = evaluateEarlyTerminationScenario({
      netCapCost: new Decimal('30000'),
      residualValue: new Decimal('18000'),
      moneyFactor: new Decimal('0.00125'),
      termMonths: 36,
      monthsElapsed: 18,
      monthlyPayment: new Decimal('393.33'),
      earlyTerminationFee: new Decimal('500'),
      dispositionFee: new Decimal('395'),
    });

    expect(result.type).toBe('early-termination');
    expect(result.totalCost.toNumber()).toBeCloseTo(25974.94, 0);
    expect(result.netCost.toNumber()).toBeCloseTo(25974.94, 0);
    expect(result.earlyTerminationFee.toNumber()).toBe(500);
    expect(result.remainingDepreciation.toNumber()).toBeCloseTo(5999.94, 0);
    expect(result.unpaidRentCharges.toNumber()).toBeCloseTo(1080, 0);

    // Verify line items
    expect(result.lineItems).toHaveLength(5);
    expect(result.lineItems.some((item) => item.label === 'Residual Value')).toBe(true);
    expect(result.lineItems.some((item) => item.label === 'Remaining Depreciation')).toBe(true);
    expect(result.lineItems.some((item) => item.label === 'Unpaid Rent Charges')).toBe(true);
    expect(result.lineItems.some((item) => item.label === 'Early Termination Fee')).toBe(true);
    expect(result.lineItems.some((item) => item.label === 'Disposition Fee')).toBe(true);

    // Verify warnings
    expect(result.warnings).toContain(
      'This estimate uses a generic actuarial method. Your actual early termination payoff may differ significantly.'
    );
    expect(result.warnings).toContain(
      'Contact your leasing company directly for an exact payoff quote.'
    );
    expect(result.warnings).not.toContain(
      'Early termination in the first year typically incurs the highest penalties.'
    );

    // Verify disclaimer
    expect(result.disclaimers).toContain(DISCLAIMERS.earlyTermination);
  });

  it('calculates early termination (month 6 of 36) with first-year warning', () => {
    const result = evaluateEarlyTerminationScenario({
      netCapCost: new Decimal('30000'),
      residualValue: new Decimal('18000'),
      moneyFactor: new Decimal('0.00125'),
      termMonths: 36,
      monthsElapsed: 6,
      monthlyPayment: new Decimal('393.33'),
      earlyTerminationFee: new Decimal('500'),
      dispositionFee: new Decimal('395'),
    });

    expect(result.type).toBe('early-termination');
    expect(result.totalCost.toNumber()).toBeCloseTo(30694.90, 0);
    expect(result.netCost.toNumber()).toBeCloseTo(30694.90, 0);
    expect(result.remainingDepreciation.toNumber()).toBeCloseTo(9999.90, 0);
    expect(result.unpaidRentCharges.toNumber()).toBeCloseTo(1800, 0);

    // Verify first-year warning is included
    expect(result.warnings).toContain(
      'Early termination in the first year typically incurs the highest penalties.'
    );
  });

  it('calculates near-end termination (month 33 of 36)', () => {
    const result = evaluateEarlyTerminationScenario({
      netCapCost: new Decimal('30000'),
      residualValue: new Decimal('18000'),
      moneyFactor: new Decimal('0.00125'),
      termMonths: 36,
      monthsElapsed: 33,
      monthlyPayment: new Decimal('393.33'),
      earlyTerminationFee: new Decimal('500'),
      dispositionFee: new Decimal('395'),
    });

    expect(result.type).toBe('early-termination');
    expect(result.totalCost.toNumber()).toBeCloseTo(20074.99, 0);
    expect(result.netCost.toNumber()).toBeCloseTo(20074.99, 0);
    expect(result.remainingDepreciation.toNumber()).toBeCloseTo(999.99, 0);
    expect(result.unpaidRentCharges.toNumber()).toBeCloseTo(180, 0);
  });

  it('handles zero early termination fee', () => {
    const result = evaluateEarlyTerminationScenario({
      netCapCost: new Decimal('30000'),
      residualValue: new Decimal('18000'),
      moneyFactor: new Decimal('0.00125'),
      termMonths: 36,
      monthsElapsed: 18,
      monthlyPayment: new Decimal('393.33'),
      earlyTerminationFee: new Decimal('0'),
      dispositionFee: new Decimal('395'),
    });

    expect(result.earlyTerminationFee.toNumber()).toBe(0);
    expect(result.totalCost.toNumber()).toBeCloseTo(25474.94, 0);
    expect(result.lineItems.some((item) => item.label === 'Early Termination Fee')).toBe(true);
  });

  it('handles zero disposition fee', () => {
    const result = evaluateEarlyTerminationScenario({
      netCapCost: new Decimal('30000'),
      residualValue: new Decimal('18000'),
      moneyFactor: new Decimal('0.00125'),
      termMonths: 36,
      monthsElapsed: 18,
      monthlyPayment: new Decimal('393.33'),
      earlyTerminationFee: new Decimal('500'),
      dispositionFee: new Decimal('0'),
    });

    expect(result.totalCost.toNumber()).toBeCloseTo(25579.94, 0);
  });
});
