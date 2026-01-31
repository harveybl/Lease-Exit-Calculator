import { describe, it, expect } from 'vitest';
import { generateRecommendation, RecommendationResult } from '@/lib/recommendations/decision-window';
import type { TimelineDataPoint } from '@/lib/types/timeline';

describe('generateRecommendation', () => {
  it('identifies best option today when no waiting benefit exists', () => {
    const data: TimelineDataPoint[] = [
      { month: 0, return: 1000, buyout: 2000, sellPrivately: null, earlyTermination: 3000, extension: null, leaseTransfer: null },
      { month: 6, return: 1100, buyout: 2100, sellPrivately: null, earlyTermination: 2900, extension: null, leaseTransfer: null },
      { month: 12, return: 1200, buyout: 2200, sellPrivately: null, earlyTermination: 2800, extension: null, leaseTransfer: null },
    ];

    const result = generateRecommendation(data);

    expect(result.bestNow.scenario).toBe('return');
    expect(result.bestNow.cost).toBe(1000);
    expect(result.bestOverall.scenario).toBe('return');
    expect(result.bestOverall.cost).toBe(1000);
    expect(result.bestOverall.month).toBe(0);
    expect(result.shouldWait).toBe(false);
    expect(result.savings).toBe(0);
    expect(result.message).toContain('Return Vehicle');
    expect(result.message).toContain('best option today');
    expect(result.message).toContain('waiting won\'t improve');
  });

  it('recommends waiting when future month has significant savings', () => {
    const data: TimelineDataPoint[] = [
      { month: 0, return: 2000, buyout: 2500, sellPrivately: null, earlyTermination: 3000, extension: null, leaseTransfer: null },
      { month: 6, return: 2200, buyout: 2400, sellPrivately: null, earlyTermination: 2800, extension: null, leaseTransfer: null },
      { month: 12, return: 2500, buyout: 1500, sellPrivately: null, earlyTermination: 2600, extension: null, leaseTransfer: null },
      { month: 18, return: 2800, buyout: 1600, sellPrivately: null, earlyTermination: 2400, extension: null, leaseTransfer: null },
    ];

    const result = generateRecommendation(data);

    expect(result.bestNow.scenario).toBe('return');
    expect(result.bestNow.cost).toBe(2000);
    expect(result.bestOverall.scenario).toBe('buyout');
    expect(result.bestOverall.cost).toBe(1500);
    expect(result.bestOverall.month).toBe(12);
    expect(result.shouldWait).toBe(true);
    expect(result.savings).toBe(500);
    expect(result.message).toContain('Waiting');
    expect(result.message).toContain('12 months');
    expect(result.message).toContain('$500');
    expect(result.message).toContain('Buy Out Lease');
  });

  it('treats savings <= $100 as not worth waiting (tie threshold)', () => {
    const data: TimelineDataPoint[] = [
      { month: 0, return: 1000, buyout: 2000, sellPrivately: null, earlyTermination: 3000, extension: null, leaseTransfer: null },
      { month: 6, return: 1100, buyout: 2100, sellPrivately: null, earlyTermination: 2800, extension: null, leaseTransfer: null },
      { month: 12, return: 1150, buyout: 950, sellPrivately: null, earlyTermination: 2600, extension: null, leaseTransfer: null },
    ];

    const result = generateRecommendation(data);

    expect(result.bestNow.scenario).toBe('return');
    expect(result.bestNow.cost).toBe(1000);
    expect(result.bestOverall.scenario).toBe('buyout');
    expect(result.bestOverall.cost).toBe(950);
    expect(result.shouldWait).toBe(false); // $50 savings not worth waiting
    expect(result.savings).toBe(50);
    expect(result.message).toContain('best option today');
  });

  it('handles edge case with only one data point (month 0)', () => {
    const data: TimelineDataPoint[] = [
      { month: 0, return: 1000, buyout: 2000, sellPrivately: null, earlyTermination: 3000, extension: null, leaseTransfer: null },
    ];

    const result = generateRecommendation(data);

    expect(result.bestNow.scenario).toBe('return');
    expect(result.bestNow.cost).toBe(1000);
    expect(result.bestOverall.scenario).toBe('return');
    expect(result.bestOverall.cost).toBe(1000);
    expect(result.bestOverall.month).toBe(0);
    expect(result.shouldWait).toBe(false);
    expect(result.savings).toBe(0);
  });

  it('excludes null scenarios from comparison', () => {
    const data: TimelineDataPoint[] = [
      { month: 0, return: 2000, buyout: 2500, sellPrivately: 1500, earlyTermination: 3000, extension: null, leaseTransfer: null },
      { month: 6, return: 2200, buyout: 2400, sellPrivately: null, earlyTermination: 2800, extension: null, leaseTransfer: null },
      { month: 12, return: 2500, buyout: 2200, sellPrivately: null, earlyTermination: 2600, extension: null, leaseTransfer: null },
    ];

    const result = generateRecommendation(data);

    expect(result.bestNow.scenario).toBe('sell-privately');
    expect(result.bestNow.cost).toBe(1500);
    expect(result.bestOverall.scenario).toBe('sell-privately');
    expect(result.bestOverall.cost).toBe(1500);
    expect(result.shouldWait).toBe(false);
  });

  it('correctly identifies best future month when multiple future options exist', () => {
    const data: TimelineDataPoint[] = [
      { month: 0, return: 2000, buyout: 2500, sellPrivately: null, earlyTermination: 3000, extension: null, leaseTransfer: null },
      { month: 6, return: 2200, buyout: 1900, sellPrivately: null, earlyTermination: 2800, extension: null, leaseTransfer: null },
      { month: 12, return: 2500, buyout: 1400, sellPrivately: null, earlyTermination: 2600, extension: null, leaseTransfer: null },
      { month: 18, return: 2800, buyout: 1600, sellPrivately: null, earlyTermination: 2400, extension: null, leaseTransfer: null },
    ];

    const result = generateRecommendation(data);

    expect(result.bestOverall.month).toBe(12);
    expect(result.bestOverall.cost).toBe(1400);
    expect(result.message).toContain('12 months');
  });

  it('includes formatted currency in messages', () => {
    const data: TimelineDataPoint[] = [
      { month: 0, return: 2000, buyout: 2500, sellPrivately: null, earlyTermination: 3000, extension: null, leaseTransfer: null },
      { month: 12, return: 2500, buyout: 1250.50, sellPrivately: null, earlyTermination: 2600, extension: null, leaseTransfer: null },
    ];

    const result = generateRecommendation(data);

    expect(result.message).toMatch(/\$\d{3,}/); // Contains formatted dollar amount
    expect(result.message).toContain('$749.50'); // Exact savings
  });

  it('handles extension scenario at lease end', () => {
    const data: TimelineDataPoint[] = [
      { month: 0, return: 1000, buyout: 2000, sellPrivately: null, earlyTermination: 3000, extension: 800, leaseTransfer: null },
      { month: 6, return: 1500, buyout: 2200, sellPrivately: null, earlyTermination: 2800, extension: null, leaseTransfer: null },
    ];

    const result = generateRecommendation(data);

    expect(result.bestNow.scenario).toBe('extension');
    expect(result.bestNow.cost).toBe(800);
    expect(result.message).toContain('Keep Paying');
  });

  it('recommends waiting exactly at $101 savings (just over threshold)', () => {
    const data: TimelineDataPoint[] = [
      { month: 0, return: 1000, buyout: 2000, sellPrivately: null, earlyTermination: 3000, extension: null, leaseTransfer: null },
      { month: 12, return: 1150, buyout: 899, sellPrivately: null, earlyTermination: 2600, extension: null, leaseTransfer: null },
    ];

    const result = generateRecommendation(data);

    expect(result.shouldWait).toBe(true); // $101 savings
    expect(result.savings).toBe(101);
  });

  it('does not recommend waiting at exactly $100 savings (at threshold)', () => {
    const data: TimelineDataPoint[] = [
      { month: 0, return: 1000, buyout: 2000, sellPrivately: null, earlyTermination: 3000, extension: null, leaseTransfer: null },
      { month: 12, return: 1150, buyout: 900, sellPrivately: null, earlyTermination: 2600, extension: null, leaseTransfer: null },
    ];

    const result = generateRecommendation(data);

    expect(result.shouldWait).toBe(false); // Exactly $100 savings
    expect(result.savings).toBe(100);
  });
});
