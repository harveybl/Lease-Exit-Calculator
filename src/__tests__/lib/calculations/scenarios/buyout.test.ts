import { Decimal } from '@/lib/decimal';
import { evaluateBuyoutScenario } from '@/lib/calculations/scenarios/buyout';

describe('evaluateBuyoutScenario', () => {
  describe('end-of-lease buyout in TX (upfront tax)', () => {
    it('should calculate buyout with TX sales tax on residual', () => {
      const result = evaluateBuyoutScenario({
        residualValue: new Decimal('18000'),
        monthlyPayment: new Decimal('393.33'),
        monthsRemaining: 0,
        purchaseFee: new Decimal('300'),
        stateCode: 'TX',
      });

      // TX: 6.25% sales tax on residual
      // Tax: 18000 * 0.0625 = 1125
      // Total: 18000 + 0 + 300 + 1125 = 19425

      expect(result.type).toBe('buyout');
      expect(result.residualValue.toNumber()).toBe(18000);
      expect(result.remainingPayments.toNumber()).toBe(0);
      expect(result.purchaseFee.toNumber()).toBe(300);
      expect(result.salesTax.toNumber()).toBe(1125);
      expect(result.totalCost.toNumber()).toBe(19425);
      expect(result.netCost.toNumber()).toBe(19425);
      expect(result.lineItems).toHaveLength(4);
      expect(result.warnings).toHaveLength(0); // No remaining payments
      expect(result.disclaimers).toHaveLength(2); // general + tax
    });
  });

  describe('mid-lease buyout in CA (monthly tax)', () => {
    it('should calculate buyout with CA sales tax and remaining payments', () => {
      const result = evaluateBuyoutScenario({
        residualValue: new Decimal('18000'),
        monthlyPayment: new Decimal('393.33'),
        monthsRemaining: 10,
        purchaseFee: new Decimal('300'),
        stateCode: 'CA',
      });

      // Remaining payments: 393.33 * 10 = 3933.30
      // CA: 7.25% sales tax on residual
      // Tax: 18000 * 0.0725 = 1305
      // Total: 18000 + 3933.30 + 300 + 1305 = 23538.30

      expect(result.type).toBe('buyout');
      expect(result.residualValue.toNumber()).toBe(18000);
      expect(result.remainingPayments.toNumber()).toBeCloseTo(3933.30, 2);
      expect(result.purchaseFee.toNumber()).toBe(300);
      expect(result.salesTax.toNumber()).toBe(1305);
      expect(result.totalCost.toNumber()).toBeCloseTo(23538.30, 2);
      expect(result.netCost.toNumber()).toBeCloseTo(23538.30, 2);
      expect(result.lineItems).toHaveLength(4);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('remaining payments'))).toBe(true);
      expect(result.disclaimers).toHaveLength(2);
    });
  });

  describe('no-tax state buyout (OR)', () => {
    it('should calculate buyout with zero sales tax', () => {
      const result = evaluateBuyoutScenario({
        residualValue: new Decimal('18000'),
        monthlyPayment: new Decimal('393.33'),
        monthsRemaining: 0,
        purchaseFee: new Decimal('300'),
        stateCode: 'OR',
      });

      // OR has no sales tax
      // Tax: 0
      // Total: 18000 + 0 + 300 + 0 = 18300

      expect(result.type).toBe('buyout');
      expect(result.residualValue.toNumber()).toBe(18000);
      expect(result.remainingPayments.toNumber()).toBe(0);
      expect(result.purchaseFee.toNumber()).toBe(300);
      expect(result.salesTax.toNumber()).toBe(0);
      expect(result.totalCost.toNumber()).toBe(18300);
      expect(result.netCost.toNumber()).toBe(18300);
      expect(result.lineItems).toHaveLength(4);
      expect(result.warnings).toHaveLength(0);
      expect(result.disclaimers).toHaveLength(2);
    });
  });

  describe('mid-lease buyout with many remaining payments', () => {
    it('should warn about timing when remaining payments exist', () => {
      const result = evaluateBuyoutScenario({
        residualValue: new Decimal('22000'),
        monthlyPayment: new Decimal('450'),
        monthsRemaining: 18,
        purchaseFee: new Decimal('350'),
        stateCode: 'FL',
      });

      // Remaining payments: 450 * 18 = 8100
      // FL: 6% sales tax on residual
      // Tax: 22000 * 0.06 = 1320
      // Total: 22000 + 8100 + 350 + 1320 = 31770

      expect(result.type).toBe('buyout');
      expect(result.residualValue.toNumber()).toBe(22000);
      expect(result.remainingPayments.toNumber()).toBe(8100);
      expect(result.purchaseFee.toNumber()).toBe(350);
      expect(result.salesTax.toNumber()).toBe(1320);
      expect(result.totalCost.toNumber()).toBe(31770);
      expect(result.netCost.toNumber()).toBe(31770);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('18 remaining'))).toBe(true);
      expect(result.disclaimers).toHaveLength(2);
    });
  });

  describe('zero purchase fee', () => {
    it('should handle zero purchase fee correctly', () => {
      const result = evaluateBuyoutScenario({
        residualValue: new Decimal('20000'),
        monthlyPayment: new Decimal('400'),
        monthsRemaining: 0,
        purchaseFee: new Decimal('0'),
        stateCode: 'NY',
      });

      // NY: 4% sales tax on residual
      // Tax: 20000 * 0.04 = 800
      // Total: 20000 + 0 + 0 + 800 = 20800

      expect(result.type).toBe('buyout');
      expect(result.residualValue.toNumber()).toBe(20000);
      expect(result.purchaseFee.toNumber()).toBe(0);
      expect(result.salesTax.toNumber()).toBe(800);
      expect(result.totalCost.toNumber()).toBe(20800);
      expect(result.netCost.toNumber()).toBe(20800);
      expect(result.lineItems).toHaveLength(4);
      expect(result.disclaimers).toHaveLength(2);
    });
  });

  describe('line items structure', () => {
    it('should have proper line items with labels and descriptions', () => {
      const result = evaluateBuyoutScenario({
        residualValue: new Decimal('18000'),
        monthlyPayment: new Decimal('393.33'),
        monthsRemaining: 5,
        purchaseFee: new Decimal('300'),
        stateCode: 'TX',
      });

      expect(result.lineItems).toHaveLength(4);

      const residualItem = result.lineItems.find(item => item.label === 'Residual Value');
      expect(residualItem).toBeDefined();
      expect(residualItem?.amount.toNumber()).toBe(18000);
      expect(residualItem?.type).toBe('liability');

      const remainingItem = result.lineItems.find(item => item.label === 'Remaining Payments');
      expect(remainingItem).toBeDefined();
      expect(remainingItem?.amount.toNumber()).toBeCloseTo(1966.65, 2);
      expect(remainingItem?.type).toBe('liability');

      const feeItem = result.lineItems.find(item => item.label === 'Purchase Fee');
      expect(feeItem).toBeDefined();
      expect(feeItem?.amount.toNumber()).toBe(300);
      expect(feeItem?.type).toBe('fee');

      const taxItem = result.lineItems.find(item => item.label === 'Sales Tax');
      expect(taxItem).toBeDefined();
      expect(taxItem?.amount.toNumber()).toBe(1125); // 18000 * 0.0625
      expect(taxItem?.type).toBe('tax');
    });
  });
});
