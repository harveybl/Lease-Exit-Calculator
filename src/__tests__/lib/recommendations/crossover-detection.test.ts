import { describe, it, expect } from 'vitest';
import { detectCrossovers, CrossoverPoint } from '@/lib/recommendations/crossover-detection';
import type { TimelineDataPoint } from '@/lib/types/timeline';

describe('detectCrossovers', () => {
  it('returns empty array when one scenario is always cheapest', () => {
    const data: TimelineDataPoint[] = [
      { month: 0, return: 1000, buyout: 2000, sellPrivately: null, earlyTermination: 3000, extension: null, leaseTransfer: null },
      { month: 1, return: 1100, buyout: 2100, sellPrivately: null, earlyTermination: 2900, extension: null, leaseTransfer: null },
      { month: 2, return: 1200, buyout: 2200, sellPrivately: null, earlyTermination: 2800, extension: null, leaseTransfer: null },
    ];

    const crossovers = detectCrossovers(data);

    expect(crossovers).toEqual([]);
  });

  it('detects single crossover when buyout becomes cheaper than return', () => {
    const data: TimelineDataPoint[] = [
      { month: 0, return: 1000, buyout: 2000, sellPrivately: null, earlyTermination: 3000, extension: null, leaseTransfer: null },
      { month: 6, return: 1500, buyout: 2200, sellPrivately: null, earlyTermination: 2800, extension: null, leaseTransfer: null },
      { month: 12, return: 2000, buyout: 1800, sellPrivately: null, earlyTermination: 2600, extension: null, leaseTransfer: null },
      { month: 18, return: 2500, buyout: 1600, sellPrivately: null, earlyTermination: 2400, extension: null, leaseTransfer: null },
    ];

    const crossovers = detectCrossovers(data);

    expect(crossovers).toHaveLength(1);
    expect(crossovers[0]).toMatchObject({
      month: 12,
      scenario: 'buyout',
      overtakes: 'return',
    });
    expect(crossovers[0].message).toContain('Buy Out Lease');
    expect(crossovers[0].message).toContain('Return Vehicle');
    expect(crossovers[0].message).toContain('month 12');
  });

  it('detects multiple crossovers when rankings change multiple times', () => {
    const data: TimelineDataPoint[] = [
      { month: 0, return: 1000, buyout: 2000, sellPrivately: null, earlyTermination: 900, extension: null, leaseTransfer: null },
      { month: 6, return: 800, buyout: 1800, sellPrivately: null, earlyTermination: 1600, extension: null, leaseTransfer: null },
      { month: 12, return: 1200, buyout: 1100, sellPrivately: null, earlyTermination: 1700, extension: null, leaseTransfer: null },
      { month: 18, return: 1500, buyout: 1400, sellPrivately: null, earlyTermination: 1800, extension: null, leaseTransfer: null },
    ];

    const crossovers = detectCrossovers(data);

    expect(crossovers.length).toBe(2);
    expect(crossovers[0].month).toBe(6); // Early termination -> return
    expect(crossovers[1].month).toBe(12); // Return -> buyout
  });

  it('ignores null scenarios (sellPrivately and extension)', () => {
    const data: TimelineDataPoint[] = [
      { month: 0, return: 1000, buyout: 2000, sellPrivately: 500, earlyTermination: 3000, extension: null, leaseTransfer: null },
      { month: 6, return: 1500, buyout: 2200, sellPrivately: null, earlyTermination: 2800, extension: null, leaseTransfer: null },
      { month: 12, return: 2000, buyout: 1800, sellPrivately: null, earlyTermination: 2600, extension: null, leaseTransfer: null },
    ];

    const crossovers = detectCrossovers(data);

    // Crossover at month 6: sellPrivately -> return (sellPrivately becomes null)
    // Crossover at month 12: return -> buyout
    expect(crossovers.length).toBeGreaterThanOrEqual(1);

    // All crossovers should reference only non-null scenarios
    crossovers.forEach(c => {
      expect(c.scenario).toBeDefined();
      expect(c.overtakes).toBeDefined();
    });
  });

  it('generates human-readable messages with month reference', () => {
    const data: TimelineDataPoint[] = [
      { month: 0, return: 1000, buyout: 2000, sellPrivately: null, earlyTermination: 3000, extension: null, leaseTransfer: null },
      { month: 12, return: 2000, buyout: 1800, sellPrivately: null, earlyTermination: 2600, extension: null, leaseTransfer: null },
    ];

    const crossovers = detectCrossovers(data);

    expect(crossovers[0].message).toMatch(/month \d+/i);
    expect(crossovers[0].message).toContain('becomes cheaper');
  });

  it('handles extension scenario at lease end', () => {
    const data: TimelineDataPoint[] = [
      { month: 0, return: 1000, buyout: 2000, sellPrivately: null, earlyTermination: 3000, extension: 800, leaseTransfer: null },
      { month: 6, return: 1500, buyout: 2200, sellPrivately: null, earlyTermination: 2800, extension: null, leaseTransfer: null },
    ];

    const crossovers = detectCrossovers(data);

    expect(crossovers).toHaveLength(1);
    expect(crossovers[0]).toMatchObject({
      month: 6,
      scenario: 'return',
      overtakes: 'extension',
    });
  });

  it('returns crossovers sorted by month ascending', () => {
    const data: TimelineDataPoint[] = [
      { month: 0, return: 1000, buyout: 2000, sellPrivately: null, earlyTermination: 1500, extension: null, leaseTransfer: null },
      { month: 6, return: 900, buyout: 1800, sellPrivately: null, earlyTermination: 1600, extension: null, leaseTransfer: null },
      { month: 12, return: 1200, buyout: 1600, sellPrivately: null, earlyTermination: 1700, extension: null, leaseTransfer: null },
      { month: 18, return: 1500, buyout: 1400, sellPrivately: null, earlyTermination: 1800, extension: null, leaseTransfer: null },
    ];

    const crossovers = detectCrossovers(data);

    for (let i = 1; i < crossovers.length; i++) {
      expect(crossovers[i].month).toBeGreaterThan(crossovers[i - 1].month);
    }
  });

  it('handles edge case with only one data point', () => {
    const data: TimelineDataPoint[] = [
      { month: 0, return: 1000, buyout: 2000, sellPrivately: null, earlyTermination: 3000, extension: null, leaseTransfer: null },
    ];

    const crossovers = detectCrossovers(data);

    expect(crossovers).toEqual([]);
  });

  it('detects crossover at first month after initial', () => {
    const data: TimelineDataPoint[] = [
      { month: 0, return: 1000, buyout: 2000, sellPrivately: null, earlyTermination: 3000, extension: null, leaseTransfer: null },
      { month: 1, return: 2500, buyout: 1500, sellPrivately: null, earlyTermination: 3000, extension: null, leaseTransfer: null },
    ];

    const crossovers = detectCrossovers(data);

    expect(crossovers).toHaveLength(1);
    expect(crossovers[0].month).toBe(1);
    expect(crossovers[0].scenario).toBe('buyout');
  });

  it('detects crossover when lease transfer becomes cheapest', () => {
    const data: TimelineDataPoint[] = [
      { month: 0, return: 1000, buyout: 2000, sellPrivately: null, earlyTermination: 3000, extension: null, leaseTransfer: 1200 },
      { month: 6, return: 1500, buyout: 1800, sellPrivately: null, earlyTermination: 2800, extension: null, leaseTransfer: 900 },
      { month: 12, return: 2000, buyout: 1600, sellPrivately: null, earlyTermination: 2600, extension: null, leaseTransfer: 800 },
    ];

    const crossovers = detectCrossovers(data);

    expect(crossovers).toHaveLength(1);
    expect(crossovers[0].month).toBe(6);
    expect(crossovers[0].scenario).toBe('lease-transfer');
    expect(crossovers[0].overtakes).toBe('return');
    expect(crossovers[0].message).toContain('Transfer Lease');
  });

  it('includes lease transfer in cheapest scenario comparison', () => {
    const data: TimelineDataPoint[] = [
      { month: 0, return: 1000, buyout: 2000, sellPrivately: null, earlyTermination: 3000, extension: null, leaseTransfer: 500 },
      { month: 6, return: 1100, buyout: 2100, sellPrivately: null, earlyTermination: 2900, extension: null, leaseTransfer: 600 },
    ];

    const crossovers = detectCrossovers(data);

    // Lease transfer is always cheapest, no crossovers
    expect(crossovers).toEqual([]);
  });
});
