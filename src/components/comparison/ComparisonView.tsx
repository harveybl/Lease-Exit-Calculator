import type { ComparisonData } from "@/lib/calculations/evaluate-all";
import type { MarketValue } from "@/lib/db/schema";
import { HeroSummary } from "@/components/comparison/HeroSummary";
import { OptionsList } from "@/components/comparison/OptionsList";
import { MarketValueBanner } from "@/components/comparison/MarketValueBanner";
import { MarketValueDisplay } from "@/components/comparison/MarketValueDisplay";
import { ExportButton } from "@/components/comparison/ExportButton";
import { formatCurrency, formatOptionName } from "@/lib/utils/format-currency";
import type { PDFComparisonData, PDFScenarioData, PDFLineItem } from "@/lib/pdf/comparison-pdf";

// ── Helper Functions ────────────────────────────────────────────────

/**
 * Converts ComparisonData (with Decimal) to PDFComparisonData (with strings).
 * Serializes all monetary values for PDF export.
 */
function serializeForPDF(data: ComparisonData, heading: string): PDFComparisonData {
  const scenarios: PDFScenarioData[] = data.scenarios.map((scenario) => {
    const lineItems: PDFLineItem[] = scenario.lineItems.map((item) => ({
      label: item.label,
      amount: formatCurrency(item.amount),
      description: item.description,
      type: item.type || 'other',
    }));

    return {
      type: scenario.type,
      name: formatOptionName(scenario.type),
      netCost: formatCurrency(scenario.netCost),
      totalCost: formatCurrency(scenario.totalCost),
      lineItems,
      warnings: scenario.warnings,
      incomplete: scenario.incomplete,
    };
  });

  // Build savings description
  const savingsDescription = data.tie.isTie
    ? `Both options cost about the same (within $100). Choose based on your preference.`
    : data.savingsVsReturn.isNegative()
    ? `Saves ${formatCurrency(data.savingsVsReturn.abs())} compared to returning the vehicle.`
    : `Costs ${formatCurrency(data.savingsVsReturn)} more than returning the vehicle.`;

  // Collect unique disclaimers
  const allDisclaimers = data.scenarios.flatMap((s) => s.disclaimers);
  const uniqueDisclaimers = [...new Set(allDisclaimers)];

  return {
    heading,
    bestOptionName: formatOptionName(data.bestOption.type),
    savingsDescription,
    scenarios,
    disclaimers: uniqueDisclaimers,
    generatedDate: new Date().toLocaleDateString(),
  };
}

// ── Component ───────────────────────────────────────────────────────

interface ComparisonViewProps {
  data: ComparisonData;
  marketValue?: MarketValue | null;
  leaseId: string;
  heading?: string;
}

export function ComparisonView({ data, marketValue, leaseId, heading = "Lease Comparison" }: ComparisonViewProps) {
  // Collect unique disclaimers from all scenarios
  const allDisclaimers = data.scenarios.flatMap((s) => s.disclaimers);
  const uniqueDisclaimers = [...new Set(allDisclaimers)];

  // Serialize data for PDF export
  const pdfData = serializeForPDF(data, heading);

  return (
    <div id="main-content" className="max-w-4xl mx-auto px-4 py-4 md:py-8">
      {/* Export button */}
      <div className="flex justify-end mb-4">
        <ExportButton data={pdfData} />
      </div>

      {/* Market value entry/display - above hero summary */}
      <div className="mb-4 md:mb-6">
        {marketValue ? (
          <MarketValueDisplay leaseId={leaseId} marketValue={marketValue} />
        ) : (
          <MarketValueBanner leaseId={leaseId} />
        )}
      </div>
      <section aria-label="Recommendation summary">
        <HeroSummary data={data} />
      </section>
      <section aria-label="Exit options comparison">
        <OptionsList scenarios={data.scenarios} />
      </section>

      {uniqueDisclaimers.length > 0 && (
        <section aria-label="Disclaimers" className="border-t mt-8 pt-6">
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
