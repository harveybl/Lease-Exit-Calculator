"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getLease, getLatestMarketValue } from "@/app/lease/actions";
import { getComparisonData, type ComparisonData } from "@/lib/calculations/evaluate-all";
import { ComparisonView } from "@/components/comparison/ComparisonView";
import { Decimal } from "@/lib/decimal";
import { ChevronLeft, TrendingUp } from "lucide-react";
import type { MarketValue } from "@/lib/db/schema";

interface ComparePageViewProps {
  id: string;
}

export function ComparePageView({ id }: ComparePageViewProps) {
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [marketValue, setMarketValue] = useState<MarketValue | null>(null);
  const [heading, setHeading] = useState("Lease Comparison");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const lease = await getLease(id);

    if (!lease) {
      window.location.hash = "";
      return;
    }

    const latestMarketValue = await getLatestMarketValue(id);
    const estimatedSalePrice = latestMarketValue
      ? new Decimal(latestMarketValue.value.toString())
      : undefined;

    const data = getComparisonData(lease, estimatedSalePrice);

    const vehicleHeading =
      lease.make && lease.model
        ? `${lease.year ? `${lease.year} ` : ""}${lease.make} ${lease.model}`
        : "Lease Comparison";

    setComparisonData(data);
    setMarketValue(latestMarketValue);
    setHeading(vehicleHeading);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading || !comparisonData) {
    return (
      <main id="main-content" className="mx-auto max-w-4xl px-4 py-8">
        <div className="h-4 w-32 animate-pulse rounded bg-muted mb-6" />
        <div className="h-9 w-64 animate-pulse rounded bg-muted mb-6" />
        <div className="h-48 animate-pulse rounded-lg bg-muted mb-4" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-muted mb-3" />
        ))}
      </main>
    );
  }

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8">
      {/* Back navigation */}
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); window.location.hash = ""; }}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Leases
      </a>

      <h1 className="text-2xl md:text-3xl font-bold mb-6">{heading}</h1>

      <ComparisonView
        data={comparisonData}
        marketValue={marketValue}
        leaseId={id}
        heading={heading}
        onMarketValueChange={loadData}
      />

      {/* Timeline navigation */}
      <div className="mt-8 rounded-lg border bg-card p-4 md:p-6 text-center">
        <h2 className="text-lg font-semibold mb-2">When should you act?</h2>
        <p className="text-sm text-muted-foreground mb-4">
          See how your options change month-by-month over the remaining lease term.
        </p>
        <a
          href={`#/${id}/timeline`}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <TrendingUp className="h-4 w-4" />
          View Timeline
        </a>
      </div>
    </main>
  );
}
