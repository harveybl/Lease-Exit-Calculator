"use client";

import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { getLease, getLatestMarketValue } from "@/app/lease/actions";
import { buildTimelineData } from "@/lib/calculations/timeline";
import { detectCrossovers } from "@/lib/recommendations/crossover-detection";
import { generateRecommendation } from "@/lib/recommendations/decision-window";
import { TimelineChart } from "@/components/timeline/TimelineChart";
import { RecommendationSummary } from "@/components/timeline/RecommendationSummary";
import { Decimal } from "@/lib/decimal";
import type { TimelineDataPoint } from "@/lib/types/timeline";
import type { CrossoverPoint } from "@/lib/recommendations/crossover-detection";
import type { RecommendationResult } from "@/lib/recommendations/decision-window";

interface TimelinePageViewProps {
  id: string;
}

export function TimelinePageView({ id }: TimelinePageViewProps) {
  const [data, setData] = useState<TimelineDataPoint[] | null>(null);
  const [crossovers, setCrossovers] = useState<CrossoverPoint[]>([]);
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [heading, setHeading] = useState("Lease Timeline");
  const [hasMarketValue, setHasMarketValue] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const lease = await getLease(id);

      if (!lease) {
        window.location.hash = "";
        return;
      }

      const latestMarketValue = await getLatestMarketValue(id);
      const estimatedSalePrice = latestMarketValue
        ? new Decimal(latestMarketValue.value.toString())
        : undefined;

      const timelineSeries = buildTimelineData(lease, estimatedSalePrice);
      const crossoverPoints = detectCrossovers(timelineSeries.data);
      const rec = generateRecommendation(timelineSeries.data);

      const vehicleHeading =
        lease.make && lease.model
          ? `${lease.year ? `${lease.year} ` : ""}${lease.make} ${lease.model}`
          : "Lease Timeline";

      setData(timelineSeries.data);
      setCrossovers(crossoverPoints);
      setRecommendation(rec);
      setHeading(vehicleHeading);
      setHasMarketValue(timelineSeries.hasMarketValue);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading || !data || !recommendation) {
    return (
      <main id="main-content" className="mx-auto max-w-4xl px-4 py-4 md:py-8">
        <div className="h-4 w-40 animate-pulse rounded bg-muted mb-6" />
        <div className="h-9 w-64 animate-pulse rounded bg-muted mb-6" />
        <div className="h-32 animate-pulse rounded-lg bg-muted mb-6" />
        <div className="h-[300px] md:h-[400px] animate-pulse rounded-lg bg-muted" />
      </main>
    );
  }

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-4 md:py-8">
      {/* Back navigation to compare page */}
      <a
        href={`#/${id}/compare`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Comparison
      </a>

      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">{heading}</h1>

      {/* Recommendation summary */}
      <div className="mb-4 md:mb-6">
        <RecommendationSummary
          recommendation={recommendation}
          crossovers={crossovers}
        />
      </div>

      {/* Timeline chart */}
      <div className="mb-4 md:mb-6">
        <TimelineChart data={data} crossovers={crossovers} />
      </div>

      {/* Market value note if not set */}
      {!hasMarketValue && (
        <p className="text-sm text-muted-foreground mb-4 md:mb-6">
          Add market value on the comparison page for sell-privately projections
        </p>
      )}

      {/* General disclaimer */}
      <div className="mt-6 md:mt-8 p-3 md:p-4 rounded-lg bg-muted/50">
        <p className="text-xs text-muted-foreground">
          <strong>Disclaimer:</strong> These projections are estimates based on your
          lease terms and current data. Actual costs may vary. Consult your lease
          agreement and contact your lender for precise calculations. Early termination
          formulas vary by lender and may not match these estimates.
        </p>
      </div>
    </main>
  );
}
