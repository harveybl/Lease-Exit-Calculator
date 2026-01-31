import { Decimal } from '@/lib/decimal';
import { LineItem } from './calculation';

export type ScenarioType = 'return' | 'buyout' | 'sell-privately' | 'early-termination' | 'extension' | 'lease-transfer';

export interface ScenarioResult {
  type: ScenarioType;
  totalCost: Decimal;
  netCost: Decimal;
  lineItems: LineItem[];
  warnings: string[];
  disclaimers: string[];
  incomplete?: boolean;
}

export interface ReturnScenarioResult extends ScenarioResult {
  type: 'return';
  dispositionFee: Decimal;
  excessMileageCost: Decimal;
  wearAndTearEstimate: Decimal;
}

export interface BuyoutScenarioResult extends ScenarioResult {
  type: 'buyout';
  residualValue: Decimal;
  payoffAmount: Decimal;
  remainingDepreciation: Decimal;
  purchaseFee: Decimal;
  salesTax: Decimal;
}

export interface SellPrivatelyResult extends ScenarioResult {
  type: 'sell-privately';
  estimatedSalePrice: Decimal;
  payoffAmount: Decimal;
  netProceeds: Decimal;
}

export interface EarlyTerminationResult extends ScenarioResult {
  type: 'early-termination';
  earlyTerminationFee: Decimal;
  remainingDepreciation: Decimal;
  unpaidRentCharges: Decimal;
}

export interface ExtensionResult extends ScenarioResult {
  type: 'extension';
  monthlyExtensionPayment: Decimal;
  extensionMonths: number;
  totalExtensionCost: Decimal;
}

export interface LeaseTransferResult extends ScenarioResult {
  type: 'lease-transfer';
  transferFee: Decimal;
  marketplaceFee: Decimal;
  registrationFee: Decimal;
  incentivePayments: Decimal;
  paymentsAvoided: Decimal;
}
