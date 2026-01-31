import { TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency, formatOptionName } from '@/lib/utils/format-currency';
import type { RecommendationResult } from '@/lib/recommendations/decision-window';
import type { CrossoverPoint } from '@/lib/recommendations/crossover-detection';

interface RecommendationSummaryProps {
  recommendation: RecommendationResult;
  crossovers: CrossoverPoint[];
}

/**
 * Recommendation card showing best option today vs whether waiting helps
 * Server component - no interactivity needed
 */
export function RecommendationSummary({
  recommendation,
  crossovers,
}: RecommendationSummaryProps) {
  const { bestNow, bestOverall, shouldWait, savings, message } = recommendation;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Recommendation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Primary message */}
        <p className="font-bold text-sm">{message}</p>

        {/* Best now vs best overall details */}
        {shouldWait ? (
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Best today:</span>{' '}
              {formatOptionName(bestNow.scenario)} at {formatCurrency(bestNow.cost)}
            </p>
            <p>
              <span className="text-muted-foreground">Better option:</span>{' '}
              {formatOptionName(bestOverall.scenario)} at{' '}
              {formatCurrency(bestOverall.cost)} in month {bestOverall.month}
            </p>
            <p className="text-green-600">
              Potential savings: {formatCurrency(savings)}
            </p>
          </div>
        ) : (
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Best option:</span>{' '}
              {formatOptionName(bestNow.scenario)} at {formatCurrency(bestNow.cost)}
            </p>
            <p className="text-muted-foreground">Waiting won&apos;t improve your outcome</p>
          </div>
        )}

        {/* Crossover points */}
        {crossovers.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-1">Key inflection points:</p>
            <ul className="list-disc list-inside text-sm space-y-0.5 text-muted-foreground">
              {crossovers.map((crossover, index) => (
                <li key={index}>{crossover.message}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
