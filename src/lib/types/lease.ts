import { Decimal } from '@/lib/decimal';

export interface Lease {
  id: string; // UUID
  make: string;
  model: string;
  year: number;
  msrp: Decimal;
  netCapCost: Decimal; // negotiated price + fees - down payment
  residualValue: Decimal; // guaranteed end value
  residualPercent: Decimal; // residual as % of MSRP
  moneyFactor: Decimal; // e.g., 0.00125
  termMonths: number; // lease duration
  monthsElapsed: number; // how far into the lease
  monthlyPayment: Decimal; // actual monthly amount before tax
  downPayment: Decimal; // cap cost reduction
  dispositionFee: Decimal; // fee charged on return
  purchaseFee: Decimal; // fee to buy at lease end
  allowedMilesPerYear: number;
  overageFeePerMile: Decimal;
  currentMileage: number;
  mileageDate: Date; // when mileage was recorded
  stateCode: string; // two-letter state code for tax purposes
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
