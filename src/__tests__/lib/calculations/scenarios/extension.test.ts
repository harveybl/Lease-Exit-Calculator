import { Decimal } from '@/lib/decimal';
import { evaluateExtensionScenario } from '@/lib/calculations/scenarios/extension';
import { DISCLAIMERS } from '@/lib/disclaimers';

describe('evaluateExtensionScenario', () => {
  it('calculates short extension (3 months)', () => {
    const result = evaluateExtensionScenario({
      monthlyPayment: new Decimal('393.33'),
      extensionMonths: 3,
      monthlyTax: new Decimal('28.52'),
    });

    expect(result.type).toBe('extension');
    expect(result.monthlyExtensionPayment.toNumber()).toBeCloseTo(393.33, 2);
    expect(result.extensionMonths).toBe(3);
    expect(result.totalExtensionCost.toNumber()).toBeCloseTo(1265.55, 0);
    expect(result.totalCost.toNumber()).toBeCloseTo(1265.55, 0);
    expect(result.netCost.toNumber()).toBeCloseTo(1265.55, 0);

    // Verify line items
    expect(result.lineItems).toHaveLength(4);
    expect(result.lineItems.some((item) => item.label === 'Monthly Payment')).toBe(true);
    expect(result.lineItems.some((item) => item.label === 'Monthly Tax')).toBe(true);
    expect(result.lineItems.some((item) => item.label === 'Total per Month')).toBe(true);
    expect(result.lineItems.some((item) => item.label === 'Total Extension Cost')).toBe(true);

    // Verify warnings
    expect(result.warnings).toContain(
      'Month-to-month extension terms may differ from your original lease agreement.'
    );
    expect(result.warnings).toContain(
      'Your leasing company may change rates or terms during the extension period.'
    );
    expect(result.warnings).not.toContain(
      'Extended lease periods may result in the vehicle falling outside warranty coverage.'
    );

    // Verify disclaimer
    expect(result.disclaimers).toContain(DISCLAIMERS.general);
  });

  it('calculates long extension (12 months) with warranty warning', () => {
    const result = evaluateExtensionScenario({
      monthlyPayment: new Decimal('393.33'),
      extensionMonths: 12,
      monthlyTax: new Decimal('28.52'),
    });

    expect(result.type).toBe('extension');
    expect(result.extensionMonths).toBe(12);
    expect(result.totalExtensionCost.toNumber()).toBeCloseTo(5062.20, 0);
    expect(result.totalCost.toNumber()).toBeCloseTo(5062.20, 0);
    expect(result.netCost.toNumber()).toBeCloseTo(5062.20, 0);

    // Verify warranty warning is included
    expect(result.warnings).toContain(
      'Extended lease periods may result in the vehicle falling outside warranty coverage.'
    );
  });

  it('handles extension with no tax', () => {
    const result = evaluateExtensionScenario({
      monthlyPayment: new Decimal('393.33'),
      extensionMonths: 6,
      monthlyTax: new Decimal('0'),
    });

    expect(result.type).toBe('extension');
    expect(result.totalExtensionCost.toNumber()).toBeCloseTo(2359.98, 0);
    expect(result.totalCost.toNumber()).toBeCloseTo(2359.98, 0);
  });

  it('calculates single month extension', () => {
    const result = evaluateExtensionScenario({
      monthlyPayment: new Decimal('393.33'),
      extensionMonths: 1,
      monthlyTax: new Decimal('28.52'),
    });

    expect(result.type).toBe('extension');
    expect(result.extensionMonths).toBe(1);
    expect(result.totalExtensionCost.toNumber()).toBeCloseTo(421.85, 0);
    expect(result.totalCost.toNumber()).toBeCloseTo(421.85, 0);
  });

  it('handles 6-month extension (edge case for warranty warning)', () => {
    const result = evaluateExtensionScenario({
      monthlyPayment: new Decimal('393.33'),
      extensionMonths: 6,
      monthlyTax: new Decimal('28.52'),
    });

    // Should NOT include warranty warning at exactly 6 months
    expect(result.warnings).not.toContain(
      'Extended lease periods may result in the vehicle falling outside warranty coverage.'
    );
  });

  it('handles 7-month extension (just over edge for warranty warning)', () => {
    const result = evaluateExtensionScenario({
      monthlyPayment: new Decimal('393.33'),
      extensionMonths: 7,
      monthlyTax: new Decimal('28.52'),
    });

    // SHOULD include warranty warning at 7 months
    expect(result.warnings).toContain(
      'Extended lease periods may result in the vehicle falling outside warranty coverage.'
    );
  });
});
