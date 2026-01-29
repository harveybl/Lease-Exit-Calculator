import { describe, it, expect } from 'vitest';
import { Decimal } from '@/lib/decimal';
import { moneyFactorToAPR, aprToMoneyFactor } from '@/lib/calculations/utils';

describe('moneyFactorToAPR', () => {
  it('converts standard money factor 0.00125 to APR 3.0', () => {
    const result = moneyFactorToAPR(new Decimal('0.00125'));
    expect(result).toBeInstanceOf(Decimal);
    expect(result.toString()).toBe('3');
  });

  it('converts money factor 0.0008 to APR 1.92', () => {
    const result = moneyFactorToAPR(new Decimal('0.0008'));
    expect(result).toBeInstanceOf(Decimal);
    expect(result.toString()).toBe('1.92');
  });

  it('converts high money factor 0.003 to APR 7.2', () => {
    const result = moneyFactorToAPR(new Decimal('0.003'));
    expect(result).toBeInstanceOf(Decimal);
    expect(result.toString()).toBe('7.2');
  });

  it('converts very small money factor 0.00001 to APR 0.024', () => {
    const result = moneyFactorToAPR(new Decimal('0.00001'));
    expect(result).toBeInstanceOf(Decimal);
    expect(result.toString()).toBe('0.024');
  });

  it('converts zero money factor to zero APR', () => {
    const result = moneyFactorToAPR(new Decimal('0'));
    expect(result).toBeInstanceOf(Decimal);
    expect(result.toString()).toBe('0');
  });

  it('preserves precision for very precise money factors', () => {
    const result = moneyFactorToAPR(new Decimal('0.00123456'));
    expect(result).toBeInstanceOf(Decimal);
    expect(result.toString()).toBe('2.962944');
  });
});

describe('aprToMoneyFactor', () => {
  it('converts APR 3.0 to money factor 0.00125', () => {
    const result = aprToMoneyFactor(new Decimal('3.0'));
    expect(result).toBeInstanceOf(Decimal);
    expect(result.toString()).toBe('0.00125');
  });

  it('converts APR 1.92 to money factor 0.0008', () => {
    const result = aprToMoneyFactor(new Decimal('1.92'));
    expect(result).toBeInstanceOf(Decimal);
    expect(result.toString()).toBe('0.0008');
  });

  it('converts APR 7.2 to money factor 0.003', () => {
    const result = aprToMoneyFactor(new Decimal('7.2'));
    expect(result).toBeInstanceOf(Decimal);
    expect(result.toString()).toBe('0.003');
  });

  it('converts very low APR 0.024 to money factor 0.00001', () => {
    const result = aprToMoneyFactor(new Decimal('0.024'));
    expect(result).toBeInstanceOf(Decimal);
    expect(result.toString()).toBe('0.00001');
  });

  it('converts zero APR to zero money factor', () => {
    const result = aprToMoneyFactor(new Decimal('0'));
    expect(result).toBeInstanceOf(Decimal);
    expect(result.toString()).toBe('0');
  });

  it('preserves precision for precise APR values', () => {
    const result = aprToMoneyFactor(new Decimal('2.962944'));
    expect(result).toBeInstanceOf(Decimal);
    expect(result.toString()).toBe('0.00123456');
  });
});

describe('round-trip conversion', () => {
  it('money factor -> APR -> money factor returns original', () => {
    const original = new Decimal('0.00125');
    const apr = moneyFactorToAPR(original);
    const roundTrip = aprToMoneyFactor(apr);
    expect(roundTrip.toString()).toBe(original.toString());
  });

  it('APR -> money factor -> APR returns original', () => {
    const original = new Decimal('3.0');
    const mf = aprToMoneyFactor(original);
    const roundTrip = moneyFactorToAPR(mf);
    expect(roundTrip.toString()).toBe(original.toString());
  });
});
