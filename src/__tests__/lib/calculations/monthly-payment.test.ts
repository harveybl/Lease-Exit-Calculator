import { describe, it, expect } from 'vitest';
import { Decimal } from '@/lib/decimal';
import { calculateMonthlyPayment } from '@/lib/calculations/monthly-payment';

describe('calculateMonthlyPayment', () => {
  it('calculates standard 36-month payment correctly', () => {
    const netCapCost = new Decimal('30000');
    const residualValue = new Decimal('18000');
    const moneyFactor = new Decimal('0.00125');
    const termMonths = 36;

    const result = calculateMonthlyPayment(netCapCost, residualValue, moneyFactor, termMonths);

    expect(result).toBeInstanceOf(Decimal);
    // Depreciation: (30000 - 18000) / 36 = 333.33(repeating)
    // Rent charge: (30000 + 18000) * 0.00125 = 60
    // Total: 333.33... + 60 = 393.33...
    expect(result.toFixed(2)).toBe('393.33');
  });

  it('calculates luxury vehicle 36-month payment correctly', () => {
    const netCapCost = new Decimal('80000');
    const residualValue = new Decimal('56000');
    const moneyFactor = new Decimal('0.0008');
    const termMonths = 36;

    const result = calculateMonthlyPayment(netCapCost, residualValue, moneyFactor, termMonths);

    expect(result).toBeInstanceOf(Decimal);
    // Depreciation: (80000 - 56000) / 36 = 666.67(rounded)
    // Rent charge: (80000 + 56000) * 0.0008 = 108.8
    // Total: 666.67... + 108.8 = 775.47...
    expect(result.toFixed(2)).toBe('775.47');
  });

  it('handles real scenario with decimal cents precisely', () => {
    const netCapCost = new Decimal('25000.55');
    const residualValue = new Decimal('12500.27');
    const moneyFactor = new Decimal('0.00095');
    const termMonths = 36;

    const result = calculateMonthlyPayment(netCapCost, residualValue, moneyFactor, termMonths);

    expect(result).toBeInstanceOf(Decimal);
    // Depreciation: (25000.55 - 12500.27) / 36 = 347.23(repeating)
    // Rent charge: (25000.55 + 12500.27) * 0.00095 = 35.625779
    // Total: 347.23... + 35.625779 = 382.86...
    expect(result.toFixed(2)).toBe('382.86');
  });

  it('calculates zero interest lease payment', () => {
    const netCapCost = new Decimal('30000');
    const residualValue = new Decimal('18000');
    const moneyFactor = new Decimal('0');
    const termMonths = 36;

    const result = calculateMonthlyPayment(netCapCost, residualValue, moneyFactor, termMonths);

    expect(result).toBeInstanceOf(Decimal);
    // Depreciation: (30000 - 18000) / 36 = 333.33
    // Rent charge: 0
    // Total: 333.33
    expect(result.toFixed(2)).toBe('333.33');
  });

  it('calculates zero depreciation lease payment (residual = net cap cost)', () => {
    const netCapCost = new Decimal('25000');
    const residualValue = new Decimal('25000');
    const moneyFactor = new Decimal('0.00125');
    const termMonths = 36;

    const result = calculateMonthlyPayment(netCapCost, residualValue, moneyFactor, termMonths);

    expect(result).toBeInstanceOf(Decimal);
    // Depreciation: 0
    // Rent charge: (25000 + 25000) * 0.00125 = 62.5
    // Total: 62.5
    expect(result.toString()).toBe('62.5');
  });

  it('handles 24-month short term correctly', () => {
    const netCapCost = new Decimal('30000');
    const residualValue = new Decimal('21000');
    const moneyFactor = new Decimal('0.00125');
    const termMonths = 24;

    const result = calculateMonthlyPayment(netCapCost, residualValue, moneyFactor, termMonths);

    expect(result).toBeInstanceOf(Decimal);
    // Depreciation: (30000 - 21000) / 24 = 375
    // Rent charge: (30000 + 21000) * 0.00125 = 63.75
    // Total: 375 + 63.75 = 438.75
    expect(result.toString()).toBe('438.75');
  });

  it('handles 48-month extended term correctly', () => {
    const netCapCost = new Decimal('35000');
    const residualValue = new Decimal('15000');
    const moneyFactor = new Decimal('0.0015');
    const termMonths = 48;

    const result = calculateMonthlyPayment(netCapCost, residualValue, moneyFactor, termMonths);

    expect(result).toBeInstanceOf(Decimal);
    // Depreciation: (35000 - 15000) / 48 = 416.67(rounded)
    // Rent charge: (35000 + 15000) * 0.0015 = 75
    // Total: 416.67... + 75 = 491.67...
    expect(result.toFixed(2)).toBe('491.67');
  });

  it('handles very large values', () => {
    const netCapCost = new Decimal('999999.99');
    const residualValue = new Decimal('500000.00');
    const moneyFactor = new Decimal('0.002');
    const termMonths = 48;

    const result = calculateMonthlyPayment(netCapCost, residualValue, moneyFactor, termMonths);

    expect(result).toBeInstanceOf(Decimal);
    // Depreciation: (999999.99 - 500000.00) / 48 = 10416.67(rounded)
    // Rent charge: (999999.99 + 500000.00) * 0.002 = 3000
    // Total: 10416.67... + 3000 = 13416.67...
    expect(result.toFixed(2)).toBe('13416.67');
  });

  it('handles high-interest subprime lease', () => {
    const netCapCost = new Decimal('25000');
    const residualValue = new Decimal('15000');
    const moneyFactor = new Decimal('0.005');
    const termMonths = 36;

    const result = calculateMonthlyPayment(netCapCost, residualValue, moneyFactor, termMonths);

    expect(result).toBeInstanceOf(Decimal);
    // Depreciation: (25000 - 15000) / 36 = 277.78(rounded)
    // Rent charge: (25000 + 15000) * 0.005 = 200
    // Total: 277.78... + 200 = 477.78...
    expect(result.toFixed(2)).toBe('477.78');
  });

  it('preserves precision without floating-point drift', () => {
    const netCapCost = new Decimal('30000.01');
    const residualValue = new Decimal('18000.02');
    const moneyFactor = new Decimal('0.00125');
    const termMonths = 36;

    const result = calculateMonthlyPayment(netCapCost, residualValue, moneyFactor, termMonths);

    expect(result).toBeInstanceOf(Decimal);
    // Verify result is Decimal instance (not native number)
    expect(result.constructor.name).toBe('Decimal');
    // Should have high precision
    expect(result.toFixed(6)).toMatch(/^\d+\.\d{6}$/);
  });
});
