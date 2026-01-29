import { describe, it, expect } from 'vitest';
import { Decimal } from '@/lib/decimal';
import { calculateTotalCost } from '@/lib/calculations/total-cost';

describe('calculateTotalCost', () => {
  it('calculates standard lease total cost correctly', () => {
    const monthlyPayment = new Decimal('393.33');
    const termMonths = 36;
    const downPayment = new Decimal('2000');
    const totalTax = new Decimal('0');

    const result = calculateTotalCost(monthlyPayment, termMonths, downPayment, totalTax);

    expect(result).toBeInstanceOf(Decimal);
    // (393.33 * 36) + 2000 + 0 = 14159.88 + 2000 = 16159.88
    expect(result.toFixed(2)).toBe('16159.88');
  });

  it('calculates total cost with tax included', () => {
    const monthlyPayment = new Decimal('393.33');
    const termMonths = 36;
    const downPayment = new Decimal('2000');
    const totalTax = new Decimal('1500');

    const result = calculateTotalCost(monthlyPayment, termMonths, downPayment, totalTax);

    expect(result).toBeInstanceOf(Decimal);
    // (393.33 * 36) + 2000 + 1500 = 14159.88 + 3500 = 17659.88
    expect(result.toFixed(2)).toBe('17659.88');
  });

  it('calculates total cost with zero down payment', () => {
    const monthlyPayment = new Decimal('393.33');
    const termMonths = 36;
    const downPayment = new Decimal('0');
    const totalTax = new Decimal('0');

    const result = calculateTotalCost(monthlyPayment, termMonths, downPayment, totalTax);

    expect(result).toBeInstanceOf(Decimal);
    // (393.33 * 36) + 0 + 0 = 14159.88
    expect(result.toFixed(2)).toBe('14159.88');
  });

  it('handles precise decimal monthly payments', () => {
    const monthlyPayment = new Decimal('382.86');
    const termMonths = 36;
    const downPayment = new Decimal('1500.50');
    const totalTax = new Decimal('750.25');

    const result = calculateTotalCost(monthlyPayment, termMonths, downPayment, totalTax);

    expect(result).toBeInstanceOf(Decimal);
    // (382.86 * 36) + 1500.50 + 750.25 = 13782.96 + 2250.75 = 16033.71
    expect(result.toFixed(2)).toBe('16033.71');
  });

  it('handles 24-month term correctly', () => {
    const monthlyPayment = new Decimal('438.75');
    const termMonths = 24;
    const downPayment = new Decimal('3000');
    const totalTax = new Decimal('500');

    const result = calculateTotalCost(monthlyPayment, termMonths, downPayment, totalTax);

    expect(result).toBeInstanceOf(Decimal);
    // (438.75 * 24) + 3000 + 500 = 10530 + 3500 = 14030
    expect(result.toString()).toBe('14030');
  });

  it('handles 48-month extended term correctly', () => {
    const monthlyPayment = new Decimal('491.67');
    const termMonths = 48;
    const downPayment = new Decimal('2500');
    const totalTax = new Decimal('1200');

    const result = calculateTotalCost(monthlyPayment, termMonths, downPayment, totalTax);

    expect(result).toBeInstanceOf(Decimal);
    // (491.67 * 48) + 2500 + 1200 = 23600.16 + 3700 = 27300.16
    expect(result.toFixed(2)).toBe('27300.16');
  });

  it('handles large down payment', () => {
    const monthlyPayment = new Decimal('250.00');
    const termMonths = 36;
    const downPayment = new Decimal('10000');
    const totalTax = new Decimal('800');

    const result = calculateTotalCost(monthlyPayment, termMonths, downPayment, totalTax);

    expect(result).toBeInstanceOf(Decimal);
    // (250.00 * 36) + 10000 + 800 = 9000 + 10800 = 19800
    expect(result.toString()).toBe('19800');
  });

  it('handles zero monthly payment (all-up-front lease)', () => {
    const monthlyPayment = new Decimal('0');
    const termMonths = 36;
    const downPayment = new Decimal('12000');
    const totalTax = new Decimal('1000');

    const result = calculateTotalCost(monthlyPayment, termMonths, downPayment, totalTax);

    expect(result).toBeInstanceOf(Decimal);
    // (0 * 36) + 12000 + 1000 = 13000
    expect(result.toString()).toBe('13000');
  });

  it('handles very large monthly payment', () => {
    const monthlyPayment = new Decimal('2000.00');
    const termMonths = 36;
    const downPayment = new Decimal('5000');
    const totalTax = new Decimal('3000');

    const result = calculateTotalCost(monthlyPayment, termMonths, downPayment, totalTax);

    expect(result).toBeInstanceOf(Decimal);
    // (2000.00 * 36) + 5000 + 3000 = 72000 + 8000 = 80000
    expect(result.toString()).toBe('80000');
  });

  it('preserves precision without floating-point drift', () => {
    const monthlyPayment = new Decimal('393.33333333333333333');
    const termMonths = 36;
    const downPayment = new Decimal('2000.01');
    const totalTax = new Decimal('1500.02');

    const result = calculateTotalCost(monthlyPayment, termMonths, downPayment, totalTax);

    expect(result).toBeInstanceOf(Decimal);
    // Verify high precision calculation
    expect(result.constructor.name).toBe('Decimal');
    // Should maintain precision
    const expected = monthlyPayment.times(termMonths).plus(downPayment).plus(totalTax);
    expect(result.toString()).toBe(expected.toString());
  });

  it('handles recurring decimals from monthly payment', () => {
    // Monthly payment from real calculation: 333.33(repeating)
    const monthlyPayment = new Decimal('333.33333333333333333');
    const termMonths = 36;
    const downPayment = new Decimal('2000');
    const totalTax = new Decimal('0');

    const result = calculateTotalCost(monthlyPayment, termMonths, downPayment, totalTax);

    expect(result).toBeInstanceOf(Decimal);
    // Precision is maintained throughout
    expect(result.toFixed(2)).toBe('14000.00');
  });

  it('handles tax-only scenario (zero down)', () => {
    const monthlyPayment = new Decimal('500.00');
    const termMonths = 24;
    const downPayment = new Decimal('0');
    const totalTax = new Decimal('2400');

    const result = calculateTotalCost(monthlyPayment, termMonths, downPayment, totalTax);

    expect(result).toBeInstanceOf(Decimal);
    // (500 * 24) + 0 + 2400 = 12000 + 2400 = 14400
    expect(result.toString()).toBe('14400');
  });
});
