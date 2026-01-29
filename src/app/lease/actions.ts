"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { leases } from "@/lib/db/schema";
import { leaseFormSchema, type LeaseFormData } from "@/lib/validations/lease-schema";
import { Decimal } from "@/lib/decimal";
import { eq } from "drizzle-orm";

/**
 * Server-side result type for lease operations
 */
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Create a new lease in the database
 */
export async function createLease(data: LeaseFormData): Promise<ActionResult<{ leaseId: string }>> {
  try {
    // Server-side validation with shared Zod schema
    const parsed = leaseFormSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const validData = parsed.data;

    // Map form data to database columns with Decimal conversion
    const leaseData = {
      // Vehicle info - nullable in DB
      make: validData.make ?? null,
      model: validData.model ?? null,
      year: validData.year ?? null,

      // Financial terms - convert numbers to Decimal, nullable in DB
      msrp: validData.msrp !== undefined ? new Decimal(validData.msrp) : null,
      netCapCost: validData.netCapCost !== undefined ? new Decimal(validData.netCapCost) : null,
      residualValue: new Decimal(validData.residualValue), // Required
      residualPercent: validData.residualPercent !== undefined ? new Decimal(validData.residualPercent) : null,
      moneyFactor: validData.moneyFactor !== undefined ? new Decimal(validData.moneyFactor) : null,
      monthlyPayment: new Decimal(validData.monthlyPayment), // Required
      downPayment: validData.downPayment !== undefined && validData.downPayment !== 0
        ? new Decimal(validData.downPayment)
        : null,
      dispositionFee: validData.dispositionFee !== undefined && validData.dispositionFee !== 0
        ? new Decimal(validData.dispositionFee)
        : null,
      purchaseFee: validData.purchaseFee !== undefined && validData.purchaseFee !== 0
        ? new Decimal(validData.purchaseFee)
        : null,

      // Lease terms
      termMonths: validData.termMonths, // Required
      monthsElapsed: validData.monthsElapsed ?? null,

      // Mileage tracking
      allowedMilesPerYear: validData.allowedMilesPerYear, // Required
      overageFeePerMile: new Decimal(validData.overageFeePerMile ?? 0.25),
      currentMileage: validData.currentMileage, // Required
      mileageDate: new Date(), // Date-stamp with today's date

      // Location
      stateCode: validData.stateCode ?? null,

      // Lease timeline
      startDate: validData.startDate ?? null,
      endDate: validData.endDate ?? null,
    };

    // Insert into database
    const [lease] = await db.insert(leases).values(leaseData).returning({ id: leases.id });

    // Revalidate lease list page
    revalidatePath('/lease');

    return {
      success: true,
      data: { leaseId: lease.id },
    };
  } catch (error) {
    console.error("Error creating lease:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create lease",
    };
  }
}

/**
 * Update an existing lease in the database
 * CRITICAL: Only updates mileageDate if currentMileage actually changed
 */
export async function updateLease(id: string, data: LeaseFormData): Promise<ActionResult<void>> {
  try {
    // Server-side validation with shared Zod schema
    const parsed = leaseFormSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const validData = parsed.data;

    // Fetch existing lease to compare currentMileage
    const [existingLease] = await db
      .select({ currentMileage: leases.currentMileage })
      .from(leases)
      .where(eq(leases.id, id))
      .limit(1);

    if (!existingLease) {
      return {
        success: false,
        error: "Lease not found",
      };
    }

    // Determine if mileage changed (requires date-stamp update)
    const mileageChanged = existingLease.currentMileage !== validData.currentMileage;

    // Map form data to database columns with Decimal conversion
    const leaseData = {
      // Vehicle info - nullable in DB
      make: validData.make ?? null,
      model: validData.model ?? null,
      year: validData.year ?? null,

      // Financial terms - convert numbers to Decimal, nullable in DB
      msrp: validData.msrp !== undefined ? new Decimal(validData.msrp) : null,
      netCapCost: validData.netCapCost !== undefined ? new Decimal(validData.netCapCost) : null,
      residualValue: new Decimal(validData.residualValue), // Required
      residualPercent: validData.residualPercent !== undefined ? new Decimal(validData.residualPercent) : null,
      moneyFactor: validData.moneyFactor !== undefined ? new Decimal(validData.moneyFactor) : null,
      monthlyPayment: new Decimal(validData.monthlyPayment), // Required
      downPayment: validData.downPayment !== undefined && validData.downPayment !== 0
        ? new Decimal(validData.downPayment)
        : null,
      dispositionFee: validData.dispositionFee !== undefined && validData.dispositionFee !== 0
        ? new Decimal(validData.dispositionFee)
        : null,
      purchaseFee: validData.purchaseFee !== undefined && validData.purchaseFee !== 0
        ? new Decimal(validData.purchaseFee)
        : null,

      // Lease terms
      termMonths: validData.termMonths, // Required
      monthsElapsed: validData.monthsElapsed ?? null,

      // Mileage tracking
      allowedMilesPerYear: validData.allowedMilesPerYear, // Required
      overageFeePerMile: new Decimal(validData.overageFeePerMile ?? 0.25),
      currentMileage: validData.currentMileage, // Required
      // CRITICAL: Only update mileageDate if currentMileage changed
      ...(mileageChanged && { mileageDate: new Date() }),

      // Location
      stateCode: validData.stateCode ?? null,

      // Lease timeline
      startDate: validData.startDate ?? null,
      endDate: validData.endDate ?? null,

      // Update timestamp
      updatedAt: new Date(),
    };

    // Update in database
    await db.update(leases).set(leaseData).where(eq(leases.id, id));

    // Revalidate lease list and edit page
    revalidatePath('/lease');
    revalidatePath(`/lease/${id}/edit`);

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Error updating lease:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update lease",
    };
  }
}

/**
 * Delete a lease from the database
 */
export async function deleteLease(id: string): Promise<ActionResult<void>> {
  try {
    await db.delete(leases).where(eq(leases.id, id));

    // Revalidate lease list page
    revalidatePath('/lease');

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Error deleting lease:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete lease",
    };
  }
}

/**
 * Get a single lease by ID
 */
export async function getLease(id: string) {
  try {
    const [lease] = await db
      .select()
      .from(leases)
      .where(eq(leases.id, id))
      .limit(1);

    return lease ?? null;
  } catch (error) {
    console.error("Error fetching lease:", error);
    return null;
  }
}

/**
 * Get all leases, ordered by most recently updated first
 */
export async function getLeases() {
  try {
    const allLeases = await db
      .select()
      .from(leases)
      .orderBy(leases.updatedAt);

    return allLeases;
  } catch (error) {
    console.error("Error fetching leases:", error);
    return [];
  }
}
