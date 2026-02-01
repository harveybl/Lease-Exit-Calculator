import { db, type LeaseRecord, type MarketValueRecord } from "@/lib/db/indexed-db";
import type { Lease, MarketValue } from "@/lib/db/schema";
import { leaseFormSchema, type LeaseFormData } from "@/lib/validations/lease-schema";
import { marketValueSchema } from "@/lib/validations/market-value-schema";
import { Decimal } from "@/lib/decimal";

/**
 * Result type for lease operations
 */
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Generate a UUID for new records
 */
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Convert a LeaseRecord (IndexedDB strings) to a Lease (Decimal objects)
 */
function recordToLease(record: LeaseRecord): Lease {
  return {
    id: record.id,
    make: record.make,
    model: record.model,
    year: record.year,
    msrp: record.msrp ? new Decimal(record.msrp) : null,
    netCapCost: record.netCapCost ? new Decimal(record.netCapCost) : null,
    residualValue: new Decimal(record.residualValue),
    residualPercent: record.residualPercent ? new Decimal(record.residualPercent) : null,
    moneyFactor: record.moneyFactor ? new Decimal(record.moneyFactor) : null,
    monthlyPayment: new Decimal(record.monthlyPayment),
    downPayment: record.downPayment ? new Decimal(record.downPayment) : null,
    dispositionFee: record.dispositionFee ? new Decimal(record.dispositionFee) : null,
    purchaseFee: record.purchaseFee ? new Decimal(record.purchaseFee) : null,
    termMonths: record.termMonths,
    monthsElapsed: record.monthsElapsed,
    allowedMilesPerYear: record.allowedMilesPerYear,
    overageFeePerMile: new Decimal(record.overageFeePerMile),
    currentMileage: record.currentMileage,
    mileageDate: new Date(record.mileageDate),
    stateCode: record.stateCode,
    startDate: record.startDate ? new Date(record.startDate) : null,
    endDate: record.endDate ? new Date(record.endDate) : null,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
  };
}

/**
 * Convert a MarketValueRecord (IndexedDB strings) to a MarketValue (Decimal objects)
 */
function recordToMarketValue(record: MarketValueRecord): MarketValue {
  return {
    id: record.id,
    leaseId: record.leaseId,
    value: new Decimal(record.value),
    source: record.source,
    sourceLabel: record.sourceLabel,
    sourceMetadata: record.sourceMetadata,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
  };
}

/**
 * Create a new lease in IndexedDB
 */
export async function createLease(data: LeaseFormData): Promise<ActionResult<{ leaseId: string }>> {
  try {
    const parsed = leaseFormSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const validData = parsed.data;
    const now = new Date().toISOString();
    const id = generateId();

    const record: LeaseRecord = {
      id,
      make: validData.make ?? null,
      model: validData.model ?? null,
      year: validData.year ?? null,
      msrp: validData.msrp !== undefined ? new Decimal(validData.msrp).toFixed() : null,
      netCapCost: validData.netCapCost !== undefined ? new Decimal(validData.netCapCost).toFixed() : null,
      residualValue: new Decimal(validData.residualValue).toFixed(),
      residualPercent: validData.residualPercent !== undefined ? new Decimal(validData.residualPercent).toFixed() : null,
      moneyFactor: validData.moneyFactor !== undefined ? new Decimal(validData.moneyFactor).toFixed() : null,
      monthlyPayment: new Decimal(validData.monthlyPayment).toFixed(),
      downPayment: validData.downPayment !== undefined && validData.downPayment !== 0
        ? new Decimal(validData.downPayment).toFixed()
        : null,
      dispositionFee: validData.dispositionFee !== undefined && validData.dispositionFee !== 0
        ? new Decimal(validData.dispositionFee).toFixed()
        : null,
      purchaseFee: validData.purchaseFee !== undefined && validData.purchaseFee !== 0
        ? new Decimal(validData.purchaseFee).toFixed()
        : null,
      termMonths: validData.termMonths,
      monthsElapsed: validData.monthsElapsed ?? null,
      allowedMilesPerYear: validData.allowedMilesPerYear,
      overageFeePerMile: new Decimal(validData.overageFeePerMile ?? 0.25).toFixed(),
      currentMileage: validData.currentMileage,
      mileageDate: new Date().toISOString(),
      stateCode: validData.stateCode ?? null,
      startDate: validData.startDate ? new Date(validData.startDate).toISOString() : null,
      endDate: validData.endDate ? new Date(validData.endDate).toISOString() : null,
      createdAt: now,
      updatedAt: now,
    };

    await db.leases.add(record);

    return {
      success: true,
      data: { leaseId: id },
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
 * Update an existing lease in IndexedDB
 * CRITICAL: Only updates mileageDate if currentMileage actually changed
 */
export async function updateLease(id: string, data: LeaseFormData): Promise<ActionResult<void>> {
  try {
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
    const existingRecord = await db.leases.get(id);

    if (!existingRecord) {
      return {
        success: false,
        error: "Lease not found",
      };
    }

    const mileageChanged = existingRecord.currentMileage !== validData.currentMileage;

    const updates: Partial<LeaseRecord> = {
      make: validData.make ?? null,
      model: validData.model ?? null,
      year: validData.year ?? null,
      msrp: validData.msrp !== undefined ? new Decimal(validData.msrp).toFixed() : null,
      netCapCost: validData.netCapCost !== undefined ? new Decimal(validData.netCapCost).toFixed() : null,
      residualValue: new Decimal(validData.residualValue).toFixed(),
      residualPercent: validData.residualPercent !== undefined ? new Decimal(validData.residualPercent).toFixed() : null,
      moneyFactor: validData.moneyFactor !== undefined ? new Decimal(validData.moneyFactor).toFixed() : null,
      monthlyPayment: new Decimal(validData.monthlyPayment).toFixed(),
      downPayment: validData.downPayment !== undefined && validData.downPayment !== 0
        ? new Decimal(validData.downPayment).toFixed()
        : null,
      dispositionFee: validData.dispositionFee !== undefined && validData.dispositionFee !== 0
        ? new Decimal(validData.dispositionFee).toFixed()
        : null,
      purchaseFee: validData.purchaseFee !== undefined && validData.purchaseFee !== 0
        ? new Decimal(validData.purchaseFee).toFixed()
        : null,
      termMonths: validData.termMonths,
      monthsElapsed: validData.monthsElapsed ?? null,
      allowedMilesPerYear: validData.allowedMilesPerYear,
      overageFeePerMile: new Decimal(validData.overageFeePerMile ?? 0.25).toFixed(),
      currentMileage: validData.currentMileage,
      ...(mileageChanged && { mileageDate: new Date().toISOString() }),
      stateCode: validData.stateCode ?? null,
      startDate: validData.startDate ? new Date(validData.startDate).toISOString() : null,
      endDate: validData.endDate ? new Date(validData.endDate).toISOString() : null,
      updatedAt: new Date().toISOString(),
    };

    await db.leases.update(id, updates);

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
 * Delete a lease from IndexedDB (cascades to market values)
 */
export async function deleteLease(id: string): Promise<ActionResult<void>> {
  try {
    await db.transaction('rw', [db.leases, db.marketValues], async () => {
      await db.marketValues.where('leaseId').equals(id).delete();
      await db.leases.delete(id);
    });

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
export async function getLease(id: string): Promise<Lease | null> {
  try {
    const record = await db.leases.get(id);
    return record ? recordToLease(record) : null;
  } catch (error) {
    console.error("Error fetching lease:", error);
    return null;
  }
}

/**
 * Get all leases, ordered by most recently updated first
 */
export async function getLeases(): Promise<Lease[]> {
  try {
    const records = await db.leases.orderBy('updatedAt').reverse().toArray();
    return records.map(recordToLease);
  } catch (error) {
    console.error("Error fetching leases:", error);
    return [];
  }
}

/**
 * Create a new market value entry for a lease
 */
export async function createMarketValue(
  leaseId: string,
  data: { value: number; source?: string; sourceLabel?: string }
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = marketValueSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const validData = parsed.data;
    const now = new Date().toISOString();
    const id = generateId();

    const record: MarketValueRecord = {
      id,
      leaseId,
      value: new Decimal(validData.value.toString()).toFixed(),
      source: validData.source ?? 'manual',
      sourceLabel: validData.sourceLabel ?? 'Your estimate',
      sourceMetadata: null,
      createdAt: now,
      updatedAt: now,
    };

    await db.marketValues.add(record);

    return {
      success: true,
      data: { id },
    };
  } catch (error) {
    console.error("Error creating market value:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create market value",
    };
  }
}

/**
 * Get the latest market value for a lease
 */
export async function getLatestMarketValue(leaseId: string): Promise<MarketValue | null> {
  try {
    const records = await db.marketValues
      .where('leaseId')
      .equals(leaseId)
      .reverse()
      .sortBy('createdAt');

    if (records.length === 0) return null;
    return recordToMarketValue(records[0]);
  } catch (error) {
    console.error("Error fetching latest market value:", error);
    return null;
  }
}
