import { describe, it, expect } from 'vitest';
import { Decimal } from '@/lib/decimal';
import { calculateDepreciation } from '@/lib/calculations/depreciation';

describe('calculateDepreciation', () => {
  it('calculates standard 36-month depreciation correctly', () => {
    const netCapCost = new Decimal('30000');
    const residualValue = new Decimal('18000');
    const termMonths = 36;

    const result = calculateDepreciation(netCapCost, residualValue, termMonths);

    expect(result).toBeInstanceOf(Decimal);
    expect(result.toFixed(2)).toBe('333.33');
  });

  it('calculates luxury vehicle 36-month depreciation correctly', () => {
    const netCapCost = new Decimal('80000');
    const residualValue = new Decimal('56000');
    const termMonths = 36;

    const result = calculateDepreciation(netCapCost, residualValue, termMonths);

    expect(result).toBeInstanceOf(Decimal);
    expect(result.toFixed(2)).toBe('666.67');
  });

  it('returns zero for zero depreciation (residual equals net cap cost)', () => {
    const netCapCost = new Decimal('25000');
    const residualValue = new Decimal('25000');
    const termMonths = 36;

    const result = calculateDepreciation(netCapCost, residualValue, termMonths);

    expect(result).toBeInstanceOf(Decimal);
    expect(result.toString()).toBe('0');
  });

  it('calculates short-term 24-month depreciation correctly', () => {
    const netCapCost = new Decimal('30000');
    const residualValue = new Decimal('21000');
    const termMonths = 24;

    const result = calculateDepreciation(netCapCost, residualValue, termMonths);

    expect(result).toBeInstanceOf(Decimal);
    expect(result.toString()).toBe('375');
  });

  it('handles decimal cents precisely', () => {
    const netCapCost = new Decimal('25000.55');
    const residualValue = new Decimal('12500.27');
    const termMonths = 36;

    const result = calculateDepreciation(netCapCost, residualValue, termMonths);

    expect(result).toBeInstanceOf(Decimal);
    // (25000.55 - 12500.27) / 36 = 12500.28 / 36 = 347.23(repeating)
    expect(result.toFixed(2)).toBe('347.23');
  });

  it('handles very large values', () => {
    const netCapCost = new Decimal('999999.99');
    const residualValue = new Decimal('500000.00');
    const termMonths = 48;

    const result = calculateDepreciation(netCapCost, residualValue, termMonths);

    expect(result).toBeInstanceOf(Decimal);
    expect(result.toFixed(2)).toBe('10416.67');
  });

  it('handles high-depreciation scenario (low residual)', () => {
    const netCapCost = new Decimal('50000');
    const residualValue = new Decimal('10000');
    const termMonths = 36;

    const result = calculateDepreciation(netCapCost, residualValue, termMonths);

    expect(result).toBeInstanceOf(Decimal);
    expect(result.toFixed(2)).toBe('1111.11');
  });

  it('preserves precision without floating-point drift', () => {
    const netCapCost = new Decimal('30000.01');
    const residualValue = new Decimal('18000.00');
    const termMonths = 36;

    const result = calculateDepreciation(netCapCost, residualValue, termMonths);

    expect(result).toBeInstanceOf(Decimal);
    // (30000.01 - 18000.00) / 36 = 12000.01 / 36 = 333.3336111...
    // Decimal.js precision=20 means 20 significant digits
    expect(result.toString()).toBe('333.33361111111111111');
  });

  it('handles 48-month term', () => {
    const netCapCost = new Decimal('35000');
    const residualValue = new Decimal('15000');
    const termMonths = 48;

    const result = calculateDepreciation(netCapCost, residualValue, termMonths);

    expect(result).toBeInstanceOf(Decimal);
    expect(result.toFixed(2)).toBe('416.67');
  });

  it('handles 12-month term', () => {
    const netCapCost = new Decimal('20000');
    const residualValue = new Decimal('17000');
    const termMonths = 12;

    const result = calculateDepreciation(netCapCost, residualValue, termMonths);

    expect(result).toBeInstanceOf(Decimal);
    expect(result.toString()).toBe('250');
  });
});
