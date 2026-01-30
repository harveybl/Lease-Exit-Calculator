import type { ComparisonData } from "@/lib/calculations/evaluate-all";
import type { MarketValue } from "@/lib/db/schema";
import { HeroSummary } from "@/components/comparison/HeroSummary";
import { OptionsList } from "@/components/comparison/OptionsList";

// ── Component ───────────────────────────────────────────────────────

interface ComparisonViewProps {
  data: ComparisonData;
  marketValue?: MarketValue | null;
  leaseId: string;
}

export function ComparisonView({ data, marketValue, leaseId }: ComparisonViewProps) {
  // Collect unique disclaimers from all scenarios
  const allDisclaimers = data.scenarios.flatMap((s) => s.disclaimers);
  const uniqueDisclaimers = [...new Set(allDisclaimers)];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Market value display will be added in Plan 04 */}
      <HeroSummary data={data} />
      <OptionsList scenarios={data.scenarios} />

      {uniqueDisclaimers.length > 0 && (
        <section className="border-t mt-8 pt-6">
          <div className="text-xs text-muted-foreground space-y-2">
            {uniqueDisclaimers.map((disclaimer, idx) => (
              <p key={idx}>{disclaimer}</p>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
