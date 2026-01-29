import { describe, it, expect } from 'vitest';
import { Decimal } from '@/lib/decimal';
import { projectMileage } from '@/lib/calculations/mileage';

describe('projectMileage', () => {
  it('calculates on-track mileage projection with no overage', () => {
    const result = projectMileage({
      currentMileage: 10000,
      monthsElapsed: 12,
      termMonths: 36,
      allowedMilesPerYear: 12000,
      overageFeePerMile: new Decimal('0.25'),
    });

    expect(result.currentMileage).toBe(10000);
    expect(result.monthsElapsed).toBe(12);
    expect(result.termMonths).toBe(36);
    expect(result.averageMilesPerMonth).toBeCloseTo(833.33, 2);
    expect(result.projectedEndMileage).toBe(30000);
    expect(result.allowedMiles).toBe(36000);
    expect(result.projectedOverage).toBe(0);
    expect(result.projectedOverageCost.toString()).toBe('0');
  });

  it('calculates over-pace projection with overage cost', () => {
    const result = projectMileage({
      currentMileage: 15000,
      monthsElapsed: 12,
      termMonths: 36,
      allowedMilesPerYear: 12000,
      overageFeePerMile: new Decimal('0.25'),
    });

    expect(result.currentMileage).toBe(15000);
    expect(result.monthsElapsed).toBe(12);
    expect(result.termMonths).toBe(36);
    expect(result.averageMilesPerMonth).toBe(1250);
    expect(result.projectedEndMileage).toBe(45000);
    expect(result.allowedMiles).toBe(36000);
    expect(result.projectedOverage).toBe(9000);
    expect(result.projectedOverageCost.toString()).toBe('2250');
  });

  it('calculates under-pace projection with no overage', () => {
    const result = projectMileage({
      currentMileage: 8000,
      monthsElapsed: 12,
      termMonths: 36,
      allowedMilesPerYear: 12000,
      overageFeePerMile: new Decimal('0.25'),
    });

    expect(result.currentMileage).toBe(8000);
    expect(result.monthsElapsed).toBe(12);
    expect(result.termMonths).toBe(36);
    expect(result.averageMilesPerMonth).toBeCloseTo(666.67, 2);
    expect(result.projectedEndMileage).toBe(24000);
    expect(result.allowedMiles).toBe(36000);
    expect(result.projectedOverage).toBe(0);
    expect(result.projectedOverageCost.toString()).toBe('0');
  });

  it('calculates early-in-lease projection with overage', () => {
    const result = projectMileage({
      currentMileage: 3000,
      monthsElapsed: 3,
      termMonths: 36,
      allowedMilesPerYear: 10000,
      overageFeePerMile: new Decimal('0.25'),
    });

    expect(result.currentMileage).toBe(3000);
    expect(result.monthsElapsed).toBe(3);
    expect(result.termMonths).toBe(36);
    expect(result.averageMilesPerMonth).toBe(1000);
    expect(result.projectedEndMileage).toBe(36000);
    expect(result.allowedMiles).toBe(30000);
    expect(result.projectedOverage).toBe(6000);
    expect(result.projectedOverageCost.toString()).toBe('1500');
  });

  it('handles zero monthsElapsed by throwing error', () => {
    expect(() => {
      projectMileage({
        currentMileage: 0,
        monthsElapsed: 0,
        termMonths: 36,
        allowedMilesPerYear: 12000,
        overageFeePerMile: new Decimal('0.25'),
      });
    }).toThrow('monthsElapsed must be greater than 0');
  });

  it('handles fractional mileage calculations correctly', () => {
    const result = projectMileage({
      currentMileage: 10500,
      monthsElapsed: 11,
      termMonths: 36,
      allowedMilesPerYear: 12000,
      overageFeePerMile: new Decimal('0.30'),
    });

    // 10500 / 11 = 954.545454... miles/month
    // 954.545454... * 36 = 34363.636... rounds to 34364
    expect(result.averageMilesPerMonth).toBeCloseTo(954.55, 2);
    expect(result.projectedEndMileage).toBe(34364);
    expect(result.allowedMiles).toBe(36000);
    expect(result.projectedOverage).toBe(0);
    expect(result.projectedOverageCost.toString()).toBe('0');
  });

  it('calculates overage cost with different fee rates', () => {
    const result = projectMileage({
      currentMileage: 20000,
      monthsElapsed: 12,
      termMonths: 36,
      allowedMilesPerYear: 12000,
      overageFeePerMile: new Decimal('0.20'),
    });

    expect(result.projectedEndMileage).toBe(60000);
    expect(result.allowedMiles).toBe(36000);
    expect(result.projectedOverage).toBe(24000);
    expect(result.projectedOverageCost.toString()).toBe('4800');
  });
});
