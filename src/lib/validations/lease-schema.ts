import { z } from 'zod';

/**
 * Shared Zod validation schema for lease form data.
 * Used by both client (React Hook Form) and server (Server Actions).
 *
 * IMPORTANT: No "use client" or "use server" directive - must be importable from both contexts.
 */

// Essential fields (required - always visible)
const essentialFields = {
  monthlyPayment: z.coerce
    .number()
    .positive({
      message: 'Monthly payment should be a positive number. Check your lease for the amount due each month.',
    }),

  termMonths: z.coerce
    .number()
    .int({ message: 'Lease term must be a whole number of months' })
    .min(12, { message: 'Lease terms are typically 24-48 months, but can range from 12 to 84.' })
    .max(84, { message: 'Lease terms are typically 24-48 months, but can range from 12 to 84.' }),

  allowedMilesPerYear: z.coerce
    .number()
    .int({ message: 'Mileage allowance must be a whole number' })
    .min(1000, { message: 'Annual mileage allowance is usually between 10,000 and 15,000 miles.' })
    .max(100000, { message: 'Annual mileage allowance is usually between 10,000 and 15,000 miles.' }),

  residualValue: z.coerce
    .number()
    .positive({
      message: 'Residual value is what the car is expected to be worth at lease end. This should be a positive number.',
    }),

  currentMileage: z.coerce
    .number()
    .int({ message: 'Current mileage must be a whole number' })
    .nonnegative({
      message: 'Enter your current odometer reading.',
    }),
};

// Optional fields (progressive disclosure section)
const optionalFields = {
  make: z.string().max(100, { message: 'Make must be 100 characters or less' }).optional(),
  model: z.string().max(100, { message: 'Model must be 100 characters or less' }).optional(),
  year: z.coerce
    .number()
    .int({ message: 'Year must be a whole number' })
    .min(2000, { message: 'Year must be 2000 or later' })
    .max(2030, { message: 'Year must be 2030 or earlier' })
    .optional(),

  msrp: z.coerce
    .number()
    .positive({ message: 'MSRP should be a positive number' })
    .optional(),

  netCapCost: z.coerce
    .number()
    .positive({ message: 'Net cap cost should be a positive number' })
    .optional(),

  residualPercent: z.coerce
    .number()
    .min(0, { message: 'Residual percentage should be between 0 and 100' })
    .max(100, { message: 'Residual percentage should be between 0 and 100' })
    .optional(),

  moneyFactor: z.coerce
    .number()
    .min(0, { message: 'Money factor must be 0 or greater' })
    .max(0.01, { message: 'Money factor is usually between 0.0001 and 0.005. This seems unusual.' })
    .optional(),

  downPayment: z.coerce
    .number()
    .nonnegative({ message: 'Down payment cannot be negative' })
    .optional()
    .default(0),

  dispositionFee: z.coerce
    .number()
    .nonnegative({ message: 'Disposition fee cannot be negative' })
    .optional()
    .default(0),

  purchaseFee: z.coerce
    .number()
    .nonnegative({ message: 'Purchase fee cannot be negative' })
    .optional()
    .default(0),

  overageFeePerMile: z.coerce
    .number()
    .min(0, { message: 'Overage fee cannot be negative' })
    .max(1, { message: 'Overage fee per mile is usually between $0.15 and $0.30' })
    .optional()
    .default(0.25),

  monthsElapsed: z.coerce
    .number()
    .int({ message: 'Months elapsed must be a whole number' })
    .nonnegative({ message: 'Months elapsed cannot be negative' })
    .optional()
    .default(0),

  stateCode: z.string()
    .length(2, { message: 'State code must be 2 characters' })
    .toUpperCase()
    .optional(),

  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
};

// Combined schema with cross-field validation
export const leaseFormSchema = z.object({
  ...essentialFields,
  ...optionalFields,
}).superRefine((data, ctx) => {
  // Cross-field validation for date consistency
  if (data.startDate && data.endDate && data.startDate >= data.endDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endDate'],
      message: 'End date must be after start date',
    });
  }

  // Cross-field validation for months elapsed vs term
  if (data.monthsElapsed && data.monthsElapsed > data.termMonths) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['monthsElapsed'],
      message: 'Months elapsed cannot exceed total lease term',
    });
  }
});

// Inferred TypeScript type from schema
export type LeaseFormData = z.infer<typeof leaseFormSchema>;

/**
 * Warning interface for unusual-but-valid values.
 * Warnings are yellow, non-blocking - errors are red, blocking.
 */
export interface LeaseFormWarning {
  field: string;
  message: string;
}

/**
 * Check for unusual but valid values that should trigger warnings.
 * These do NOT block form submission - they're informational only.
 */
export function checkLeaseWarnings(data: Partial<LeaseFormData>): LeaseFormWarning[] {
  const warnings: LeaseFormWarning[] = [];

  // Warn if residual value seems high relative to total payments
  if (data.residualValue && data.monthlyPayment && data.termMonths) {
    const totalPayments = data.monthlyPayment * data.termMonths;
    if (data.residualValue > totalPayments * 2) {
      warnings.push({
        field: 'residualValue',
        message: 'This residual value seems high relative to your payments. Double-check this value.',
      });
    }
  }

  // Warn if monthly payment is unusually high
  if (data.monthlyPayment && data.monthlyPayment > 2000) {
    warnings.push({
      field: 'monthlyPayment',
      message: 'This is higher than most lease payments. Make sure this is the right amount.',
    });
  }

  // Warn if current mileage suggests significant overage
  if (data.currentMileage && data.allowedMilesPerYear && data.termMonths && data.monthsElapsed !== undefined) {
    const expectedMileage = (data.allowedMilesPerYear * (data.monthsElapsed / 12));
    if (data.currentMileage > expectedMileage * 1.5) {
      warnings.push({
        field: 'currentMileage',
        message: 'You may be significantly over your mileage allowance. Consider your usage going forward.',
      });
    }
  }

  // Warn if money factor seems unusual (if present)
  if (data.moneyFactor !== undefined && data.moneyFactor !== null) {
    if (data.moneyFactor < 0.0001 || data.moneyFactor > 0.005) {
      warnings.push({
        field: 'moneyFactor',
        message: 'Money factor is usually between 0.0001 and 0.005. This seems unusual - verify this value.',
      });
    }
  }

  return warnings;
}
