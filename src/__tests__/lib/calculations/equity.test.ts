import { describe, it, expect } from 'vitest';
import { Decimal } from '@/lib/decimal';
import { calculateEquity } from '@/lib/calculations/equity';

describe('calculateEquity', () => {
  it('calculates positive equity correctly', () => {
    const result = calculateEquity(
      new Decimal('28000'), // market value
      new Decimal('18000'), // residual value
      new Decimal('3933'),  // remaining payments (10mo * 393.33)
      new Decimal('300')    // buyout fee
    );

    expect(result.marketValue.toString()).toBe('28000');
    expect(result.buyoutCost.toString()).toBe('22233');
    expect(result.equity.toString()).toBe('5767');
    expect(result.hasPositiveEquity).toBe(true);
    expect(result.lineItems).toHaveLength(4);

    // Verify line items structure
    expect(result.lineItems[0]).toMatchObject({
      label: 'Market Value',
      type: 'asset',
    });
    expect(result.lineItems[0].amount.toString()).toBe('28000');

    expect(result.lineItems[1]).toMatchObject({
      label: 'Residual Value',
      type: 'liability',
    });
    expect(result.lineItems[1].amount.toString()).toBe('18000');

    expect(result.lineItems[2]).toMatchObject({
      label: 'Remaining Payments',
      type: 'liability',
    });
    expect(result.lineItems[2].amount.toString()).toBe('3933');

    expect(result.lineItems[3]).toMatchObject({
      label: 'Buyout Fee',
      type: 'liability',
    });
    expect(result.lineItems[3].amount.toString()).toBe('300');
  });

  it('calculates negative equity correctly', () => {
    const result = calculateEquity(
      new Decimal('15000'), // market value
      new Decimal('18000'), // residual value
      new Decimal('3933'),  // remaining payments
      new Decimal('300')    // buyout fee
    );

    expect(result.marketValue.toString()).toBe('15000');
    expect(result.buyoutCost.toString()).toBe('22233');
    expect(result.equity.toString()).toBe('-7233');
    expect(result.hasPositiveEquity).toBe(false);
    expect(result.lineItems).toHaveLength(4);
  });

  it('handles break-even scenario (zero equity)', () => {
    const result = calculateEquity(
      new Decimal('22233'), // market value equals buyout cost
      new Decimal('18000'), // residual value
      new Decimal('3933'),  // remaining payments
      new Decimal('300')    // buyout fee
    );

    expect(result.equity.toString()).toBe('0');
    expect(result.hasPositiveEquity).toBe(false); // zero is not positive
  });

  it('handles zero remaining payments', () => {
    const result = calculateEquity(
      new Decimal('28000'), // market value
      new Decimal('18000'), // residual value
      new Decimal('0'),     // no remaining payments
      new Decimal('300')    // buyout fee
    );

    expect(result.buyoutCost.toString()).toBe('18300');
    expect(result.equity.toString()).toBe('9700');
    expect(result.hasPositiveEquity).toBe(true);
  });

  it('handles zero buyout fee', () => {
    const result = calculateEquity(
      new Decimal('25000'), // market value
      new Decimal('20000'), // residual value
      new Decimal('2000'),  // remaining payments
      new Decimal('0')      // no buyout fee
    );

    expect(result.buyoutCost.toString()).toBe('22000');
    expect(result.equity.toString()).toBe('3000');
    expect(result.hasPositiveEquity).toBe(true);
  });

  it('handles high-precision decimal calculations', () => {
    const result = calculateEquity(
      new Decimal('27999.99'),
      new Decimal('18333.33'),
      new Decimal('3933.37'),
      new Decimal('299.99')
    );

    // buyout = 18333.33 + 3933.37 + 299.99 = 22566.69
    // equity = 27999.99 - 22566.69 = 5433.30
    expect(result.buyoutCost.toString()).toBe('22566.69');
    expect(result.equity.toString()).toBe('5433.3');
    expect(result.hasPositiveEquity).toBe(true);
  });

  it('includes descriptions in line items', () => {
    const result = calculateEquity(
      new Decimal('25000'),
      new Decimal('20000'),
      new Decimal('2000'),
      new Decimal('300')
    );

    expect(result.lineItems[0].description).toContain('Current market');
    expect(result.lineItems[1].description).toContain('residual');
    expect(result.lineItems[2].description).toContain('remaining');
    expect(result.lineItems[3].description).toContain('buyout');
  });
});
