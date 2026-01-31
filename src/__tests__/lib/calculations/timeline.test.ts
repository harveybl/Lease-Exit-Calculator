import { describe, it, expect } from 'vitest';
import { buildTimelineData, projectScenarioCosts } from '@/lib/calculations/timeline';
import { Decimal } from '@/lib/decimal';
import { Lease } from '@/lib/db/schema';

describe('projectScenarioCosts', () => {
  const baseLease: Lease = {
    id: 'test-lease-id',
    residualValue: new Decimal('20000'),
    netCapCost: new Decimal('35000'),
    moneyFactor: new Decimal('0.00125'),
    monthlyPayment: new Decimal('450'),
    termMonths: 36,
    monthsElapsed: 12,
    purchaseFee: new Decimal('350'),
    stateCode: 'CA',
    dispositionFee: new Decimal('395'),
    allowedMilesPerYear: 12000,
    overageFeePerMile: new Decimal('0.25'),
    currentMileage: 15000,
    mileageDate: new Date('2025-01-15'),
    make: 'Toyota',
    model: 'Camry',
    year: 2024,
    msrp: new Decimal('35000'),
    residualPercent: new Decimal('57.14'),
    downPayment: new Decimal('0'),
    startDate: new Date('2024-01-15'),
    endDate: new Date('2027-01-15'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('projects costs for all scenarios at month offset 0', () => {
    const marketValue = new Decimal('25000');
    const projection = projectScenarioCosts(baseLease, 0, marketValue);

    expect(projection.month).toBe(0);
    expect(projection.costs.return).toBeInstanceOf(Decimal);
    expect(projection.costs.buyout).toBeInstanceOf(Decimal);
    expect(projection.costs['sell-privately']).toBeInstanceOf(Decimal);
    expect(projection.costs['early-termination']).toBeInstanceOf(Decimal);
    expect(projection.costs.extension).toBeNull(); // Extension only at lease end
  });

  it('projects costs with market value for sell-privately scenario', () => {
    const marketValue = new Decimal('25000');
    const projection = projectScenarioCosts(baseLease, 0, marketValue);

    expect(projection.costs['sell-privately']).toBeInstanceOf(Decimal);
  });

  it('returns null for sell-privately when no market value provided', () => {
    const projection = projectScenarioCosts(baseLease, 0);

    expect(projection.costs['sell-privately']).toBeNull();
  });

  it('returns extension cost only at final month (monthOffset = monthsRemaining)', () => {
    const monthsRemaining = baseLease.termMonths - (baseLease.monthsElapsed ?? 0);

    // Mid-lease should have null extension
    const midLeaseProjection = projectScenarioCosts(baseLease, Math.floor(monthsRemaining / 2));
    expect(midLeaseProjection.costs.extension).toBeNull();

    // Final month should have extension cost
    const finalMonthProjection = projectScenarioCosts(baseLease, monthsRemaining);
    expect(finalMonthProjection.costs.extension).toBeInstanceOf(Decimal);
  });

  it('adjusts remaining payments as months advance', () => {
    const projection0 = projectScenarioCosts(baseLease, 0);
    const projection12 = projectScenarioCosts(baseLease, 12);

    // Return cost should decrease as remaining payments decrease
    expect(projection12.costs.return!.lessThan(projection0.costs.return!)).toBe(true);
  });
});

describe('buildTimelineData', () => {
  const baseLease: Lease = {
    id: 'test-lease-id',
    residualValue: new Decimal('20000'),
    netCapCost: new Decimal('35000'),
    moneyFactor: new Decimal('0.00125'),
    monthlyPayment: new Decimal('450'),
    termMonths: 36,
    monthsElapsed: 12,
    purchaseFee: new Decimal('350'),
    stateCode: 'CA',
    dispositionFee: new Decimal('395'),
    allowedMilesPerYear: 12000,
    overageFeePerMile: new Decimal('0.25'),
    currentMileage: 15000,
    mileageDate: new Date('2025-01-15'),
    make: 'Toyota',
    model: 'Camry',
    year: 2024,
    msrp: new Decimal('35000'),
    residualPercent: new Decimal('57.14'),
    downPayment: new Decimal('0'),
    startDate: new Date('2024-01-15'),
    endDate: new Date('2027-01-15'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('returns correct number of data points (monthsRemaining + 1)', () => {
    const timeline = buildTimelineData(baseLease);
    const monthsRemaining = baseLease.termMonths - (baseLease.monthsElapsed ?? 0);

    expect(timeline.data.length).toBe(monthsRemaining + 1);
    expect(timeline.monthsRemaining).toBe(monthsRemaining);
  });

  it('includes month 0 through monthsRemaining inclusive', () => {
    const timeline = buildTimelineData(baseLease);
    const monthsRemaining = baseLease.termMonths - (baseLease.monthsElapsed ?? 0);

    expect(timeline.data[0].month).toBe(0);
    expect(timeline.data[timeline.data.length - 1].month).toBe(monthsRemaining);
  });

  it('converts Decimal costs to numbers rounded to 2 decimal places', () => {
    const timeline = buildTimelineData(baseLease);
    const firstDataPoint = timeline.data[0];

    expect(typeof firstDataPoint.return).toBe('number');
    expect(typeof firstDataPoint.buyout).toBe('number');
    expect(typeof firstDataPoint.earlyTermination).toBe('number');

    // Check decimal precision (no more than 2 decimal places)
    expect(firstDataPoint.return).toBe(parseFloat(firstDataPoint.return.toFixed(2)));
    expect(firstDataPoint.buyout).toBe(parseFloat(firstDataPoint.buyout.toFixed(2)));
  });

  it('sets sellPrivately to null when no market value provided', () => {
    const timeline = buildTimelineData(baseLease);

    timeline.data.forEach((dataPoint) => {
      expect(dataPoint.sellPrivately).toBeNull();
    });

    expect(timeline.hasMarketValue).toBe(false);
  });

  it('includes sellPrivately values when market value provided', () => {
    const marketValue = new Decimal('25000');
    const timeline = buildTimelineData(baseLease, marketValue);

    timeline.data.forEach((dataPoint) => {
      expect(dataPoint.sellPrivately).not.toBeNull();
      expect(typeof dataPoint.sellPrivately).toBe('number');
    });

    expect(timeline.hasMarketValue).toBe(true);
  });

  it('sets extension to null for all months except final month', () => {
    const timeline = buildTimelineData(baseLease);
    const monthsRemaining = baseLease.termMonths - (baseLease.monthsElapsed ?? 0);

    // All months except last should have null extension
    for (let i = 0; i < timeline.data.length - 1; i++) {
      expect(timeline.data[i].extension).toBeNull();
    }

    // Last month should have extension value
    expect(timeline.data[timeline.data.length - 1].extension).not.toBeNull();
    expect(typeof timeline.data[timeline.data.length - 1].extension).toBe('number');
  });

  it('shows decreasing costs over time for return scenario', () => {
    const timeline = buildTimelineData(baseLease);

    // Return cost should generally decrease (fewer remaining payments)
    const firstReturn = timeline.data[0].return;
    const lastReturn = timeline.data[timeline.data.length - 1].return;

    expect(lastReturn).toBeLessThan(firstReturn);
  });

  it('shows decreasing costs over time for buyout scenario', () => {
    const timeline = buildTimelineData(baseLease);

    // Buyout cost should decrease as payoff amount decreases
    const firstBuyout = timeline.data[0].buyout;
    const lastBuyout = timeline.data[timeline.data.length - 1].buyout;

    expect(lastBuyout).toBeLessThan(firstBuyout);
  });

  it('includes all active scenarios in scenarios array', () => {
    const timelineWithoutMarketValue = buildTimelineData(baseLease);
    const timelineWithMarketValue = buildTimelineData(baseLease, new Decimal('25000'));

    // Without market value: 4 scenarios (no sell-privately)
    expect(timelineWithoutMarketValue.scenarios).toHaveLength(4);
    expect(timelineWithoutMarketValue.scenarios).toContain('return');
    expect(timelineWithoutMarketValue.scenarios).toContain('buyout');
    expect(timelineWithoutMarketValue.scenarios).toContain('early-termination');
    expect(timelineWithoutMarketValue.scenarios).toContain('extension');
    expect(timelineWithoutMarketValue.scenarios).not.toContain('sell-privately');

    // With market value: all 5 scenarios
    expect(timelineWithMarketValue.scenarios).toHaveLength(5);
    expect(timelineWithMarketValue.scenarios).toContain('return');
    expect(timelineWithMarketValue.scenarios).toContain('buyout');
    expect(timelineWithMarketValue.scenarios).toContain('sell-privately');
    expect(timelineWithMarketValue.scenarios).toContain('early-termination');
    expect(timelineWithMarketValue.scenarios).toContain('extension');
  });
});
