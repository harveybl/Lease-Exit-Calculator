"use client";

import { useState } from "react";
import type { ScenarioResult } from "@/lib/types/scenario";
import { formatCurrency, formatOptionName } from "@/lib/utils/format-currency";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { LineItemsBreakdown } from "@/components/comparison/LineItemsBreakdown";

// ── Component ───────────────────────────────────────────────────────

interface OptionCardProps {
  scenario: ScenarioResult;
  rank: number;
  isFirst: boolean;
}

export function OptionCard({ scenario, rank, isFirst }: OptionCardProps) {
  const [open, setOpen] = useState(false);
  const isIncomplete = scenario.incomplete ?? false;

  return (
    <Card
      className={cn(
        isFirst && "border-primary border-2",
        isIncomplete && "opacity-60"
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isIncomplete ? (
              <Badge variant="outline" className="bg-muted text-muted-foreground">
                ?
              </Badge>
            ) : (
              <Badge variant={rank === 1 ? "default" : "outline"}>
                #{rank}
              </Badge>
            )}
            <div>
              <CardTitle>{formatOptionName(scenario.type)}</CardTitle>
              {isIncomplete && (
                <p className="text-xs text-muted-foreground mt-1">
                  Needs market value
                </p>
              )}
            </div>
          </div>
          <span className="text-xl font-bold tabular-nums">
            {formatCurrency(scenario.netCost)}
          </span>
        </div>
      </CardHeader>

      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between px-6"
          >
            <span>View cost breakdown</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-4">
            <LineItemsBreakdown
              lineItems={scenario.lineItems}
              netCost={scenario.netCost}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {scenario.warnings.length > 0 && (
        <div className="mx-6 mb-6 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md p-3">
          {scenario.warnings.map((warning, idx) => (
            <p
              key={idx}
              className="text-sm text-amber-800 dark:text-amber-200"
            >
              {warning}
            </p>
          ))}
        </div>
      )}
    </Card>
  );
}
