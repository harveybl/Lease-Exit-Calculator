import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LeaseEntryForm } from "@/components/forms/LeaseEntryForm";
import { getLease } from "@/app/lease/actions";
import type { LeaseFormData } from "@/lib/validations/lease-schema";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Edit Lease | Lease Tracker",
  description: "Update your lease details.",
};

interface EditLeasePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLeasePage({ params }: EditLeasePageProps) {
  const { id } = await params;
  const lease = await getLease(id);

  if (!lease) {
    notFound();
  }

  // Map Decimal objects to numbers for form
  // Map null to undefined for optional fields
  const initialData: LeaseFormData = {
    // Essential fields (required)
    monthlyPayment: lease.monthlyPayment.toNumber(),
    termMonths: lease.termMonths,
    allowedMilesPerYear: lease.allowedMilesPerYear,
    residualValue: lease.residualValue.toNumber(),
    currentMileage: lease.currentMileage,

    // Optional fields - map null to undefined
    make: lease.make ?? undefined,
    model: lease.model ?? undefined,
    year: lease.year ?? undefined,
    msrp: lease.msrp?.toNumber(),
    netCapCost: lease.netCapCost?.toNumber(),
    residualPercent: lease.residualPercent?.toNumber(),
    moneyFactor: lease.moneyFactor?.toNumber(),
    downPayment: lease.downPayment?.toNumber() ?? 0,
    dispositionFee: lease.dispositionFee?.toNumber() ?? 0,
    purchaseFee: lease.purchaseFee?.toNumber() ?? 0,
    overageFeePerMile: lease.overageFeePerMile.toNumber(),
    monthsElapsed: lease.monthsElapsed ?? 0,
    stateCode: lease.stateCode ?? undefined,
    startDate: lease.startDate ?? undefined,
    endDate: lease.endDate ?? undefined,
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* Back link */}
      <Link
        href="/lease"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to leases
      </Link>

      <LeaseEntryForm leaseId={id} initialData={initialData} />
    </main>
  );
}
