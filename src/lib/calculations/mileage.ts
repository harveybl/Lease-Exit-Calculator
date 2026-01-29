import { Decimal } from '@/lib/decimal';
import { MileageProjection } from '@/lib/types/calculation';

export interface ProjectMileageParams {
  currentMileage: number;
  monthsElapsed: number;
  termMonths: number;
  allowedMilesPerYear: number;
  overageFeePerMile: Decimal;
}

/**
 * Projects end-of-lease mileage and calculates overage cost.
 *
 * @param params - Mileage projection parameters
 * @returns MileageProjection with current usage, projected end, and overage details
 * @throws Error if monthsElapsed is 0 (cannot calculate usage rate)
 */
export function projectMileage(params: ProjectMileageParams): MileageProjection {
  const {
    currentMileage,
    monthsElapsed,
    termMonths,
    allowedMilesPerYear,
    overageFeePerMile,
  } = params;

  if (monthsElapsed <= 0) {
    throw new Error('monthsElapsed must be greater than 0');
  }

  // Calculate average miles per month based on current usage
  const averageMilesPerMonth = currentMileage / monthsElapsed;

  // Project end-of-lease mileage based on current pace
  const projectedEndMileage = Math.round(averageMilesPerMonth * termMonths);

  // Calculate allowed miles for the full term
  const allowedMiles = allowedMilesPerYear * (termMonths / 12);

  // Calculate overage (never negative)
  const projectedOverage = Math.max(0, projectedEndMileage - allowedMiles);

  // Calculate overage cost
  const projectedOverageCost = new Decimal(projectedOverage).mul(overageFeePerMile);

  return {
    currentMileage,
    monthsElapsed,
    termMonths,
    averageMilesPerMonth,
    projectedEndMileage,
    allowedMiles,
    projectedOverage,
    projectedOverageCost,
  };
}
