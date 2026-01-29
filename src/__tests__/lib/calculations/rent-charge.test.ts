import { describe, it, expect } from 'vitest';
import { Decimal } from '@/lib/decimal';
import { calculateRentCharge } from '@/lib/calculations/rent-charge';

describe('calculateRentCharge', () => {
  it('calculates standard rent charge correctly', () => {
    const netCapCost = new Decimal('30000');
    const residualValue = new Decimal('18000');
    const moneyFactor = new Decimal('0.00125');

    const result = calculateRentCharge(netCapCost, residualValue, moneyFactor);

    expect(result).toBeInstanceOf(Decimal);
    // (30000 + 18000) * 0.00125 = 48000 * 0.00125 = 60
    expect(result.toString()).toBe('60');
  });

  it('calculates luxury vehicle rent charge correctly', () => {
    const netCapCost = new Decimal('80000');
    const residualValue = new Decimal('56000');
    const moneyFactor = new Decimal('0.0008');

    const result = calculateRentCharge(netCapCost, residualValue, moneyFactor);

    expect(result).toBeInstanceOf(Decimal);
    // (80000 + 56000) * 0.0008 = 136000 * 0.0008 = 108.8
    expect(result.toString()).toBe('108.8');
  });

  it('calculates high money factor rent charge correctly', () => {
    const netCapCost = new Decimal('30000');
    const residualValue = new Decimal('18000');
    const moneyFactor = new Decimal('0.003');

    const result = calculateRentCharge(netCapCost, residualValue, moneyFactor);

    expect(result).toBeInstanceOf(Decimal);
    // (30000 + 18000) * 0.003 = 48000 * 0.003 = 144
    expect(result.toString()).toBe('144');
  });

  it('returns zero for zero money factor', () => {
    const netCapCost = new Decimal('30000');
    const residualValue = new Decimal('18000');
    const moneyFactor = new Decimal('0');

    const result = calculateRentCharge(netCapCost, residualValue, moneyFactor);

    expect(result).toBeInstanceOf(Decimal);
    expect(result.toString()).toBe('0');
  });

  it('handles decimal cents precisely', () => {
    const netCapCost = new Decimal('25000.55');
    const residualValue = new Decimal('12500.27');
    const moneyFactor = new Decimal('0.00095');

    const result = calculateRentCharge(netCapCost, residualValue, moneyFactor);

    expect(result).toBeInstanceOf(Decimal);
    // (25000.55 + 12500.27) * 0.00095 = 37500.82 * 0.00095 = 35.625779
    expect(result.toFixed(2)).toBe('35.63');
  });

  it('handles very large values', () => {
    const netCapCost = new Decimal('999999.99');
    const residualValue = new Decimal('500000.00');
    const moneyFactor = new Decimal('0.002');

    const result = calculateRentCharge(netCapCost, residualValue, moneyFactor);

    expect(result).toBeInstanceOf(Decimal);
    // (999999.99 + 500000.00) * 0.002 = 1499999.99 * 0.002 = 2999.99998
    expect(result.toFixed(2)).toBe('3000.00');
  });

  it('handles very small money factor', () => {
    const netCapCost = new Decimal('30000');
    const residualValue = new Decimal('18000');
    const moneyFactor = new Decimal('0.00001');

    const result = calculateRentCharge(netCapCost, residualValue, moneyFactor);

    expect(result).toBeInstanceOf(Decimal);
    // (30000 + 18000) * 0.00001 = 48000 * 0.00001 = 0.48
    expect(result.toString()).toBe('0.48');
  });

  it('preserves precision without floating-point drift', () => {
    const netCapCost = new Decimal('30000.01');
    const residualValue = new Decimal('18000.02');
    const moneyFactor = new Decimal('0.00125');

    const result = calculateRentCharge(netCapCost, residualValue, moneyFactor);

    expect(result).toBeInstanceOf(Decimal);
    // (30000.01 + 18000.02) * 0.00125 = 48000.03 * 0.00125 = 60.000037500...
    // Decimal.js strips trailing zeros
    expect(result.toString()).toBe('60.0000375');
  });

  it('handles promotional zero interest lease', () => {
    const netCapCost = new Decimal('40000');
    const residualValue = new Decimal('25000');
    const moneyFactor = new Decimal('0.00000');

    const result = calculateRentCharge(netCapCost, residualValue, moneyFactor);

    expect(result).toBeInstanceOf(Decimal);
    expect(result.toString()).toBe('0');
  });

  it('handles high-interest subprime lease', () => {
    const netCapCost = new Decimal('25000');
    const residualValue = new Decimal('15000');
    const moneyFactor = new Decimal('0.005'); // ~12% APR

    const result = calculateRentCharge(netCapCost, residualValue, moneyFactor);

    expect(result).toBeInstanceOf(Decimal);
    // (25000 + 15000) * 0.005 = 40000 * 0.005 = 200
    expect(result.toString()).toBe('200');
  });
});
