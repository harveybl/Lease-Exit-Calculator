import { Decimal } from '@/lib/decimal';
import { evaluateAllScenarios, getComparisonData } from '@/lib/calculations/evaluate-all';
import type { Lease } from '@/lib/db/schema';

/** Helper: Create a mock lease with sensible defaults */
function createMockLease(overrides: Partial<Lease> = {}): Lease {
  return {
    id: 'test-lease-1',
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    msrp: new Decimal('35000'),
    residualValue: new Decimal('18000'),
    residualPercent: new Decimal('51.43'),
    monthlyPayment: new Decimal('400'),
    termMonths: 36,
    monthsElapsed: 36,
    allowedMilesPerYear: 12000,
    currentMileage: 36000,
    mileageDate: new Date(),
    overageFeePerMile: new Decimal('0.25'),
    dispositionFee: new Decimal('395'),
    purchaseFee: new Decimal('300'),
    downPayment: null,
    stateCode: 'CA',
    netCapCost: new Decimal('30000'),
    moneyFactor: new Decimal('0.00125'),
    startDate: null,
    endDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('evaluateAllScenarios', () => {
  describe('with market value provided', () => {
    it('should use estimatedSalePrice for sell-privately scenario instead of residualValue', () => {
      const lease = createMockLease({
        residualValue: new Decimal('18000'),
      });

      const estimatedSalePrice = new Decimal('22000'); // Higher than residual
      const scenarios = evaluateAllScenarios(lease, estimatedSalePrice);

      const sellPrivately = scenarios.find(s => s.type === 'sell-privately')!;
      expect(sellPrivately).toBeDefined();
      expect(sellPrivately.type).toBe('sell-privately');

      // Verify it used the estimatedSalePrice (not residualValue)
      expect(sellPrivately.incomplete).toBeUndefined();
      expect(sellPrivately.warnings.some(w => w.includes('market value'))).toBe(false);

      // Type assertion to access SellPrivatelyResult specific fields
      const sellResult = sellPrivately as import('@/lib/types/scenario').SellPrivatelyResult;
      expect(sellResult.estimatedSalePrice.toNumber()).toBe(22000);
      expect(sellResult.netProceeds.greaterThan(0)).toBe(true);
    });

    it('should not mark sell-privately as incomplete when market value is provided', () => {
      const lease = createMockLease();
      const estimatedSalePrice = new Decimal('20000');
      const scenarios = evaluateAllScenarios(lease, estimatedSalePrice);

      const sellPrivately = scenarios.find(s => s.type === 'sell-privately')!;
      expect(sellPrivately.incomplete).toBeUndefined();
    });
  });

  describe('without market value (undefined)', () => {
    it('should mark sell-privately as incomplete when estimatedSalePrice is undefined', () => {
      const lease = createMockLease();
      const scenarios = evaluateAllScenarios(lease); // No estimatedSalePrice

      const sellPrivately = scenarios.find(s => s.type === 'sell-privately')!;
      expect(sellPrivately.incomplete).toBe(true);
      expect(sellPrivately.warnings.some(w =>
        w.includes('Add your vehicle\'s market value for accurate sell-privately results')
      )).toBe(true);
    });

    it('should mark early termination as incomplete when no market value', () => {
      const lease = createMockLease();
      const scenarios = evaluateAllScenarios(lease); // No estimatedSalePrice

      const earlyTerm = scenarios.find(s => s.type === 'early-termination')!;
      expect(earlyTerm.incomplete).toBe(true);
    });

    it('should sort incomplete scenarios last regardless of netCost', () => {
      const lease = createMockLease({
        residualValue: new Decimal('10000'), // Low residual to make sell-privately cheap
        monthsElapsed: 36, // End of lease
      });

      const scenarios = evaluateAllScenarios(lease); // No estimatedSalePrice

      // Find incomplete scenario
      const incompleteIndex = scenarios.findIndex(s => s.incomplete === true);
      expect(incompleteIndex).toBeGreaterThanOrEqual(0);

      // Verify all scenarios after incomplete are also incomplete (or it's last)
      const completeAfterIncomplete = scenarios.slice(incompleteIndex + 1).some(s => !s.incomplete);
      expect(completeAfterIncomplete).toBe(false);

      // Verify there's at least one complete scenario before it
      const hasCompleteBefore = scenarios.slice(0, incompleteIndex).every(s => !s.incomplete);
      expect(hasCompleteBefore).toBe(true);
    });

    it('should exclude incomplete scenarios from bestOption selection', () => {
      const lease = createMockLease();
      const comparisonData = getComparisonData(lease); // No estimatedSalePrice

      // Best option should not be incomplete
      expect(comparisonData.bestOption.incomplete).toBeUndefined();

      // Verify sell-privately is incomplete but not selected as best
      const sellPrivately = comparisonData.scenarios.find(s => s.type === 'sell-privately')!;
      expect(sellPrivately.incomplete).toBe(true);
      expect(comparisonData.bestOption.type).not.toBe('sell-privately');
    });
  });

  describe('extension incomplete for mid-lease', () => {
    it('should mark extension as incomplete when months remaining > 3', () => {
      const lease = createMockLease({
        monthsElapsed: 10, // 26 months remaining > 3
        termMonths: 36,
      });

      const scenarios = evaluateAllScenarios(lease);
      const extension = scenarios.find(s => s.type === 'extension')!;

      expect(extension.incomplete).toBe(true);
      expect(extension.warnings.some(w => w.includes('Extension only applies after your lease ends'))).toBe(true);
    });

    it('should not mark extension as incomplete at end of lease', () => {
      const lease = createMockLease({
        monthsElapsed: 36, // 0 months remaining
        termMonths: 36,
      });

      const scenarios = evaluateAllScenarios(lease);
      const extension = scenarios.find(s => s.type === 'extension')!;

      expect(extension.incomplete).toBeUndefined();
    });
  });

  describe('getComparisonData with market value', () => {
    it('should calculate positive equity correctly when market value > buyout cost', () => {
      const lease = createMockLease({
        residualValue: new Decimal('18000'),
        monthsElapsed: 36, // End of lease
      });

      // Market value higher than buyout cost
      const estimatedSalePrice = new Decimal('22000');
      const comparisonData = getComparisonData(lease, estimatedSalePrice);

      expect(comparisonData.hasMarketValue).toBe(true);
      expect(comparisonData.equity).toBeDefined();
      expect(comparisonData.equity!.isPositive).toBe(true);

      // Equity = marketValue - buyoutCost
      // buyoutCost = 18000 (residual) + 300 (purchase fee) = 18300 (no tax now)
      // Equity = 22000 - 18300 = 3700
      expect(comparisonData.equity!.amount.toNumber()).toBeCloseTo(3700, 0);
    });

    it('should calculate negative equity correctly when market value < buyout cost', () => {
      const lease = createMockLease({
        residualValue: new Decimal('18000'),
        monthsElapsed: 36, // End of lease
      });

      // Market value lower than buyout cost
      const estimatedSalePrice = new Decimal('17000');
      const comparisonData = getComparisonData(lease, estimatedSalePrice);

      expect(comparisonData.hasMarketValue).toBe(true);
      expect(comparisonData.equity).toBeDefined();
      expect(comparisonData.equity!.isPositive).toBe(false);

      // Equity = marketValue - buyoutCost
      // buyoutCost = 18000 + 300 = 18300 (no tax now)
      // Equity = 17000 - 18300 = -1300
      expect(comparisonData.equity!.amount.toNumber()).toBeCloseTo(-1300, 0);
      expect(comparisonData.equity!.amount.lessThan(0)).toBe(true);
    });

    it('should set hasMarketValue to true when estimatedSalePrice is provided', () => {
      const lease = createMockLease();
      const estimatedSalePrice = new Decimal('20000');
      const comparisonData = getComparisonData(lease, estimatedSalePrice);

      expect(comparisonData.hasMarketValue).toBe(true);
      expect(comparisonData.equity).toBeDefined();
    });

    it('should set hasMarketValue to false when estimatedSalePrice is not provided', () => {
      const lease = createMockLease();
      const comparisonData = getComparisonData(lease); // No estimatedSalePrice

      expect(comparisonData.hasMarketValue).toBe(false);
      expect(comparisonData.equity).toBeUndefined();
    });
  });

  describe('scenario sorting with mixed complete/incomplete', () => {
    it('should sort complete scenarios by netCost, then incomplete scenarios last', () => {
      const lease = createMockLease({
        residualValue: new Decimal('15000'),
        monthlyPayment: new Decimal('450'),
        monthsElapsed: 36,
      });

      const scenarios = evaluateAllScenarios(lease); // No estimatedSalePrice

      // Find the boundary between complete and incomplete
      const firstIncompleteIndex = scenarios.findIndex(s => s.incomplete === true);

      if (firstIncompleteIndex > 0) {
        // All scenarios before first incomplete should be complete and sorted by netCost
        const completeScenarios = scenarios.slice(0, firstIncompleteIndex);
        for (let i = 0; i < completeScenarios.length - 1; i++) {
          expect(completeScenarios[i].netCost.lessThanOrEqualTo(completeScenarios[i + 1].netCost)).toBe(true);
        }
      }

      // All scenarios from first incomplete onwards should be incomplete
      if (firstIncompleteIndex >= 0) {
        const incompleteScenarios = scenarios.slice(firstIncompleteIndex);
        incompleteScenarios.forEach(s => {
          expect(s.incomplete).toBe(true);
        });
      }
    });
  });
});
