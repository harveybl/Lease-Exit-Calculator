"use client";

import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { LeaseEntryForm } from "@/components/forms/LeaseEntryForm";
import { getLease } from "@/app/lease/actions";
import type { LeaseFormData } from "@/lib/validations/lease-schema";

interface EditLeaseViewProps {
  id: string;
}

export function EditLeaseView({ id }: EditLeaseViewProps) {
  const [initialData, setInitialData] = useState<LeaseFormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const lease = await getLease(id);

      if (!lease) {
        window.location.hash = "";
        return;
      }

      setInitialData({
        monthlyPayment: lease.monthlyPayment.toNumber(),
        termMonths: lease.termMonths,
        allowedMilesPerYear: lease.allowedMilesPerYear,
        residualValue: lease.residualValue.toNumber(),
        currentMileage: lease.currentMileage,
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
      });
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <main id="main-content" className="mx-auto max-w-4xl px-4 py-8">
        <div className="h-4 w-32 animate-pulse rounded bg-muted mb-6" />
        <div className="h-[600px] animate-pulse rounded-lg bg-muted" />
      </main>
    );
  }

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8">
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); window.location.hash = ""; }}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to leases
      </a>

      <LeaseEntryForm leaseId={id} initialData={initialData!} />
    </main>
  );
}
