import { Decimal } from '@/lib/decimal';
import { evaluateReturnScenario } from '@/lib/calculations/scenarios/return';

describe('evaluateReturnScenario', () => {
  describe('clean return (no penalties)', () => {
    it('should calculate total with only remaining payments and disposition fee', () => {
      const result = evaluateReturnScenario({
        dispositionFee: new Decimal('395'),
        currentMileage: 18000,
        monthsElapsed: 24,
        termMonths: 36,
        allowedMilesPerYear: 12000,
        overageFeePerMile: new Decimal('0.25'),
        wearAndTearEstimate: new Decimal('0'),
        remainingPayments: new Decimal('4719.96'), // 12 * 393.33
      });

      expect(result.type).toBe('return');
      expect(result.dispositionFee.toNumber()).toBe(395);
      expect(result.excessMileageCost.toNumber()).toBe(0);
      expect(result.wearAndTearEstimate.toNumber()).toBe(0);
      expect(result.totalCost.toNumber()).toBeCloseTo(5114.96, 2); // 4719.96 + 395
      expect(result.netCost.toNumber()).toBeCloseTo(5114.96, 2);
      expect(result.lineItems).toHaveLength(4);
      expect(result.warnings).toHaveLength(0);
      expect(result.disclaimers).toHaveLength(2); // general + mileage
    });
  });

  describe('over mileage scenario', () => {
    it('should project excess mileage cost and add to total', () => {
      const result = evaluateReturnScenario({
        dispositionFee: new Decimal('395'),
        currentMileage: 15000,
        monthsElapsed: 12,
        termMonths: 36,
        allowedMilesPerYear: 12000,
        overageFeePerMile: new Decimal('0.25'),
        wearAndTearEstimate: new Decimal('0'),
        remainingPayments: new Decimal('9439.92'), // 24 * 393.33
      });

      // At 15000 miles after 12 months = 1250 miles/month
      // Projected end: 1250 * 36 = 45000 miles
      // Allowed: 12000 * 3 = 36000 miles
      // Overage: 9000 miles * $0.25 = $2250

      expect(result.type).toBe('return');
      expect(result.excessMileageCost.toNumber()).toBe(2250);
      expect(result.totalCost.toNumber()).toBeCloseTo(12084.92, 2); // 9439.92 + 395 + 2250
      expect(result.netCost.toNumber()).toBeCloseTo(12084.92, 2);
      expect(result.lineItems).toHaveLength(4);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('excess mileage'))).toBe(true);
      expect(result.disclaimers).toHaveLength(2);
    });
  });

  describe('with wear and tear estimate', () => {
    it('should include wear estimate in total cost with warning', () => {
      const result = evaluateReturnScenario({
        dispositionFee: new Decimal('395'),
        currentMileage: 18000,
        monthsElapsed: 24,
        termMonths: 36,
        allowedMilesPerYear: 12000,
        overageFeePerMile: new Decimal('0.25'),
        wearAndTearEstimate: new Decimal('500'),
        remainingPayments: new Decimal('4719.96'),
      });

      expect(result.type).toBe('return');
      expect(result.wearAndTearEstimate.toNumber()).toBe(500);
      expect(result.totalCost.toNumber()).toBeCloseTo(5614.96, 2); // 4719.96 + 395 + 500
      expect(result.netCost.toNumber()).toBeCloseTo(5614.96, 2);
      expect(result.lineItems).toHaveLength(4);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('user-estimated'))).toBe(true);
      expect(result.disclaimers).toHaveLength(2);
    });
  });

  describe('at lease end (zero remaining payments)', () => {
    it('should calculate total with only fees', () => {
      const result = evaluateReturnScenario({
        dispositionFee: new Decimal('395'),
        currentMileage: 27000,
        monthsElapsed: 36,
        termMonths: 36,
        allowedMilesPerYear: 12000,
        overageFeePerMile: new Decimal('0.25'),
        wearAndTearEstimate: new Decimal('0'),
        remainingPayments: new Decimal('0'),
      });

      // At end of lease, no remaining payments
      // Mileage is on track (27000 / 36 = 750/mo, projected 27000 = allowed 36000, no overage)
      expect(result.type).toBe('return');
      expect(result.totalCost.toNumber()).toBe(395);
      expect(result.netCost.toNumber()).toBe(395);
      expect(result.lineItems).toHaveLength(4);
      expect(result.disclaimers).toHaveLength(2);
    });
  });

  describe('combined penalties scenario', () => {
    it('should include both excess mileage and wear estimate', () => {
      const result = evaluateReturnScenario({
        dispositionFee: new Decimal('350'),
        currentMileage: 20000,
        monthsElapsed: 18,
        termMonths: 36,
        allowedMilesPerYear: 10000,
        overageFeePerMile: new Decimal('0.30'),
        wearAndTearEstimate: new Decimal('800'),
        remainingPayments: new Decimal('7079.94'), // 18 * 393.33
      });

      // At 20000 miles after 18 months = 1111.11 miles/month
      // Projected end: 1111.11 * 36 = 40000 miles
      // Allowed: 10000 * 3 = 30000 miles
      // Overage: 10000 miles * $0.30 = $3000

      expect(result.type).toBe('return');
      expect(result.excessMileageCost.toNumber()).toBe(3000);
      expect(result.wearAndTearEstimate.toNumber()).toBe(800);
      expect(result.totalCost.toNumber()).toBeCloseTo(11229.94, 2); // 7079.94 + 350 + 3000 + 800
      expect(result.netCost.toNumber()).toBeCloseTo(11229.94, 2);
      expect(result.warnings.length).toBeGreaterThan(1); // both warnings
      expect(result.disclaimers).toHaveLength(2);
    });
  });

  describe('line items structure', () => {
    it('should have proper line items with labels and descriptions', () => {
      const result = evaluateReturnScenario({
        dispositionFee: new Decimal('395'),
        currentMileage: 15000,
        monthsElapsed: 12,
        termMonths: 36,
        allowedMilesPerYear: 12000,
        overageFeePerMile: new Decimal('0.25'),
        wearAndTearEstimate: new Decimal('500'),
        remainingPayments: new Decimal('9439.92'),
      });

      expect(result.lineItems).toHaveLength(4);

      const remainingPaymentsItem = result.lineItems.find(item => item.label === 'Remaining Payments');
      expect(remainingPaymentsItem).toBeDefined();
      expect(remainingPaymentsItem?.amount.toNumber()).toBeCloseTo(9439.92, 2);
      expect(remainingPaymentsItem?.type).toBe('liability');

      const dispositionItem = result.lineItems.find(item => item.label === 'Disposition Fee');
      expect(dispositionItem).toBeDefined();
      expect(dispositionItem?.amount.toNumber()).toBe(395);
      expect(dispositionItem?.type).toBe('fee');

      const mileageItem = result.lineItems.find(item => item.label === 'Excess Mileage (Projected)');
      expect(mileageItem).toBeDefined();
      expect(mileageItem?.amount.toNumber()).toBe(2250);
      expect(mileageItem?.type).toBe('fee');

      const wearItem = result.lineItems.find(item => item.label === 'Wear and Tear Estimate');
      expect(wearItem).toBeDefined();
      expect(wearItem?.amount.toNumber()).toBe(500);
      expect(wearItem?.type).toBe('fee');
    });
  });
});
