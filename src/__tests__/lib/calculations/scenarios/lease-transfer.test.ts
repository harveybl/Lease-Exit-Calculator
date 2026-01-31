import { Decimal } from '@/lib/decimal';
import { evaluateLeaseTransferScenario } from '@/lib/calculations/scenarios/lease-transfer';

describe('evaluateLeaseTransferScenario', () => {
  describe('standard transfer scenario', () => {
    it('should calculate total cost with transfer, marketplace, and registration fees', () => {
      const result = evaluateLeaseTransferScenario({
        transferFee: new Decimal('400'),
        marketplaceFee: new Decimal('100'),
        registrationFee: new Decimal('150'),
        remainingPayments: new Decimal('8100'), // 18 * 450
        monthsRemaining: 18,
        monthlyPayment: new Decimal('450'),
        dispositionFee: new Decimal('395'),
        incentivePayments: new Decimal('0'),
      });

      expect(result.type).toBe('lease-transfer');
      expect(result.transferFee.toNumber()).toBe(400);
      expect(result.marketplaceFee.toNumber()).toBe(100);
      expect(result.registrationFee.toNumber()).toBe(150);
      expect(result.incentivePayments.toNumber()).toBe(0);
      expect(result.totalCost.toNumber()).toBe(650); // 400 + 100 + 150
      expect(result.netCost.toNumber()).toBe(650);
      expect(result.paymentsAvoided.toNumber()).toBe(8100);
      expect(result.lineItems).toHaveLength(3); // no incentive line item when 0
      expect(result.warnings).toHaveLength(0);
      expect(result.disclaimers.length).toBeGreaterThan(0);
    });
  });

  describe('transfer with incentive payments', () => {
    it('should include incentive in total cost and add line item', () => {
      const result = evaluateLeaseTransferScenario({
        transferFee: new Decimal('400'),
        marketplaceFee: new Decimal('100'),
        registrationFee: new Decimal('150'),
        remainingPayments: new Decimal('8100'),
        monthsRemaining: 18,
        monthlyPayment: new Decimal('450'),
        dispositionFee: new Decimal('395'),
        incentivePayments: new Decimal('200'),
      });

      expect(result.type).toBe('lease-transfer');
      expect(result.incentivePayments.toNumber()).toBe(200);
      expect(result.totalCost.toNumber()).toBe(850); // 400 + 100 + 150 + 200
      expect(result.netCost.toNumber()).toBe(850);
      expect(result.paymentsAvoided.toNumber()).toBe(8100);
      expect(result.lineItems).toHaveLength(4); // includes incentive line item
      expect(result.disclaimers.length).toBeGreaterThan(0);
    });
  });

  describe('zero fees scenario', () => {
    it('should handle zero fees correctly', () => {
      const result = evaluateLeaseTransferScenario({
        transferFee: new Decimal('0'),
        marketplaceFee: new Decimal('0'),
        registrationFee: new Decimal('0'),
        remainingPayments: new Decimal('5400'), // 12 * 450
        monthsRemaining: 12,
        monthlyPayment: new Decimal('450'),
        dispositionFee: new Decimal('0'),
        incentivePayments: new Decimal('0'),
      });

      expect(result.type).toBe('lease-transfer');
      expect(result.totalCost.toNumber()).toBe(0);
      expect(result.netCost.toNumber()).toBe(0);
      expect(result.paymentsAvoided.toNumber()).toBe(5400);
      expect(result.lineItems).toHaveLength(3);
      expect(result.disclaimers.length).toBeGreaterThan(0);
    });
  });

  describe('high transfer fee warning', () => {
    it('should warn when transfer fee exceeds $500', () => {
      const result = evaluateLeaseTransferScenario({
        transferFee: new Decimal('600'),
        marketplaceFee: new Decimal('100'),
        registrationFee: new Decimal('150'),
        remainingPayments: new Decimal('8100'),
        monthsRemaining: 18,
        monthlyPayment: new Decimal('450'),
        dispositionFee: new Decimal('395'),
        incentivePayments: new Decimal('0'),
      });

      expect(result.type).toBe('lease-transfer');
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('Transfer fee exceeds $500'))).toBe(true);
    });
  });

  describe('short lease term warning', () => {
    it('should warn when lease has fewer than 6 months remaining', () => {
      const result = evaluateLeaseTransferScenario({
        transferFee: new Decimal('400'),
        marketplaceFee: new Decimal('100'),
        registrationFee: new Decimal('150'),
        remainingPayments: new Decimal('1800'), // 4 * 450
        monthsRemaining: 4,
        monthlyPayment: new Decimal('450'),
        dispositionFee: new Decimal('395'),
        incentivePayments: new Decimal('0'),
      });

      expect(result.type).toBe('lease-transfer');
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('fewer than 6 months'))).toBe(true);
    });
  });

  describe('combined warnings', () => {
    it('should show both warnings when both conditions met', () => {
      const result = evaluateLeaseTransferScenario({
        transferFee: new Decimal('700'),
        marketplaceFee: new Decimal('100'),
        registrationFee: new Decimal('150'),
        remainingPayments: new Decimal('1350'), // 3 * 450
        monthsRemaining: 3,
        monthlyPayment: new Decimal('450'),
        dispositionFee: new Decimal('395'),
        incentivePayments: new Decimal('0'),
      });

      expect(result.type).toBe('lease-transfer');
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings.some(w => w.includes('Transfer fee exceeds $500'))).toBe(true);
      expect(result.warnings.some(w => w.includes('fewer than 6 months'))).toBe(true);
    });
  });

  describe('line items structure', () => {
    it('should have proper line items with labels and descriptions', () => {
      const result = evaluateLeaseTransferScenario({
        transferFee: new Decimal('400'),
        marketplaceFee: new Decimal('100'),
        registrationFee: new Decimal('150'),
        remainingPayments: new Decimal('8100'),
        monthsRemaining: 18,
        monthlyPayment: new Decimal('450'),
        dispositionFee: new Decimal('395'),
        incentivePayments: new Decimal('200'),
      });

      expect(result.lineItems).toHaveLength(4);

      const transferItem = result.lineItems.find(item => item.label === 'Transfer Fee');
      expect(transferItem).toBeDefined();
      expect(transferItem?.amount.toNumber()).toBe(400);
      expect(transferItem?.type).toBe('fee');

      const marketplaceItem = result.lineItems.find(item => item.label === 'Marketplace Listing Fee');
      expect(marketplaceItem).toBeDefined();
      expect(marketplaceItem?.amount.toNumber()).toBe(100);
      expect(marketplaceItem?.type).toBe('fee');

      const registrationItem = result.lineItems.find(item => item.label === 'Registration Fee');
      expect(registrationItem).toBeDefined();
      expect(registrationItem?.amount.toNumber()).toBe(150);
      expect(registrationItem?.type).toBe('fee');

      const incentiveItem = result.lineItems.find(item => item.label === 'Incentive Payments');
      expect(incentiveItem).toBeDefined();
      expect(incentiveItem?.amount.toNumber()).toBe(200);
      expect(incentiveItem?.type).toBe('fee');
    });
  });

  describe('line items without incentive', () => {
    it('should have 3 line items when incentive is zero', () => {
      const result = evaluateLeaseTransferScenario({
        transferFee: new Decimal('400'),
        marketplaceFee: new Decimal('100'),
        registrationFee: new Decimal('150'),
        remainingPayments: new Decimal('8100'),
        monthsRemaining: 18,
        monthlyPayment: new Decimal('450'),
        dispositionFee: new Decimal('395'),
        incentivePayments: new Decimal('0'),
      });

      expect(result.lineItems).toHaveLength(3);
      expect(result.lineItems.find(item => item.label === 'Incentive Payments')).toBeUndefined();
    });
  });
});
