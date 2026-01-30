import type { ComparisonData } from "@/lib/calculations/evaluate-all";
import { formatCurrency, formatOptionName } from "@/lib/utils/format-currency";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { EquityDisplay } from "@/components/comparison/EquityDisplay";

// ── Component ───────────────────────────────────────────────────────

interface HeroSummaryProps {
  data: ComparisonData;
}

export function HeroSummary({ data }: HeroSummaryProps) {
  const { bestOption, savingsVsReturn, tie, scenarios } = data;

  // Build the savings description
  let savingsDescription: string;
  if (bestOption.type === "return") {
    savingsDescription = "Returning is your best option right now";
  } else if (savingsVsReturn.gt(0)) {
    savingsDescription = `${formatOptionName(bestOption.type)} saves ${formatCurrency(savingsVsReturn)} vs. returning`;
  } else {
    savingsDescription = `${formatOptionName(bestOption.type)} costs ${formatCurrency(savingsVsReturn.abs())} more than returning`;
  }

  // Build optional caveat for specific scenario types
  let caveat: string | null = null;
  if (bestOption.type === "sell-privately") {
    caveat = "Requires finding a buyer";
  } else if (bestOption.type === "early-termination") {
    caveat = "Contact your leasing company for exact payoff";
  }

  return (
    <Card className="border-2 border-primary mb-6 md:mb-8">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl font-bold">
          Best Move: {formatOptionName(bestOption.type)}
        </CardTitle>
        <CardDescription>{savingsDescription}</CardDescription>

        {tie.isTie && tie.tiedOptions.length >= 2 && (
          <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground mt-2">
            {formatOptionName(tie.tiedOptions[0])} and{" "}
            {formatOptionName(tie.tiedOptions[1])} are within $100 — either
            is a strong choice
          </div>
        )}

        {caveat && (
          <p className="text-sm text-muted-foreground mt-1">{caveat}</p>
        )}
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:flex md:justify-between">
          {scenarios.map((opt) => (
            <div key={opt.type} className="text-center">
              <p className="text-xs text-muted-foreground mb-1">
                {formatOptionName(opt.type)}
              </p>
              <p
                className={cn(
                  "font-semibold text-sm md:text-base tabular-nums",
                  opt.type === bestOption.type && "text-primary font-bold",
                )}
              >
                {formatCurrency(opt.netCost)}
              </p>
            </div>
          ))}
        </div>

        {data.equity && (
          <div className="mt-4">
            <EquityDisplay equity={data.equity} />
          </div>
        )}

        {!data.hasMarketValue && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Some options are estimates — add your market value for complete results
          </p>
        )}
      </CardContent>
    </Card>
  );
}
