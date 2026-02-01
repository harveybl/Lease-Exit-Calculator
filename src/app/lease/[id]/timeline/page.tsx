import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getLease, getLatestMarketValue } from '@/app/lease/actions';
import { buildTimelineData } from '@/lib/calculations/timeline';
import { detectCrossovers } from '@/lib/recommendations/crossover-detection';
import { generateRecommendation } from '@/lib/recommendations/decision-window';
import { TimelineChart } from '@/components/timeline/TimelineChart';
import { RecommendationSummary } from '@/components/timeline/RecommendationSummary';
import { Decimal } from '@/lib/decimal';

export const metadata: Metadata = {
  title: 'Timeline | Lease Tracker',
  description: 'Month-by-month cost projections for all your lease exit options.',
};

interface TimelinePageProps {
  params: Promise<{ id: string }>;
}

export default async function TimelinePage({ params }: TimelinePageProps) {
  const { id } = await params;
  const lease = await getLease(id);

  if (!lease) {
    notFound();
  }

  // Fetch latest market value for this lease
  const latestMarketValue = await getLatestMarketValue(id);
  const estimatedSalePrice = latestMarketValue
    ? new Decimal(latestMarketValue.value.toString())
    : undefined;

  // Build timeline data with month-by-month projections
  const timelineSeries = buildTimelineData(lease, estimatedSalePrice);

  // Detect crossover points where cheapest scenario changes
  const crossovers = detectCrossovers(timelineSeries.data);

  // Generate recommendation (best now vs best overall)
  const recommendation = generateRecommendation(timelineSeries.data);

  // Build vehicle heading
  const heading =
    lease.make && lease.model
      ? `${lease.year ? `${lease.year} ` : ''}${lease.make} ${lease.model}`
      : 'Lease Timeline';

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-4 md:py-8">
      {/* Back navigation to compare page */}
      <Link
        href={`/lease/${id}/compare`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Comparison
      </Link>

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
        <TimelineChart data={timelineSeries.data} crossovers={crossovers} />
      </div>

      {/* Market value note if not set */}
      {!timelineSeries.hasMarketValue && (
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
