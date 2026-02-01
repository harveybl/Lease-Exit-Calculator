"use client";

import { Decimal } from "@/lib/decimal";
import type { LineItem } from "@/lib/types/calculation";
import { formatCurrency } from "@/lib/utils/format-currency";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

// ── Category configuration ──────────────────────────────────────────

type CategoryKey = "liability" | "fee" | "tax" | "asset" | "other";

const categoryLabels: Record<CategoryKey, string> = {
  liability: "Lease Costs",
  fee: "Fees",
  tax: "Taxes",
  asset: "Credits & Equity",
  other: "Other",
};

const displayOrder: CategoryKey[] = [
  "liability",
  "fee",
  "tax",
  "asset",
  "other",
];

// ── Component ───────────────────────────────────────────────────────

interface LineItemsBreakdownProps {
  lineItems: LineItem[];
  netCost: Decimal | string | number;
}

export function LineItemsBreakdown({
  lineItems,
  netCost,
}: LineItemsBreakdownProps) {
  // Group line items by their type field (default to "other")
  const grouped = lineItems.reduce<Record<CategoryKey, LineItem[]>>(
    (acc, item) => {
      const key: CategoryKey = item.type ?? "other";
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    { liability: [], fee: [], tax: [], asset: [], other: [] },
  );

  // Calculate totals for the summary section (exclude sub-items to avoid double-counting)
  const totalCosts = lineItems
    .filter((item) => item.type !== "asset" && !item.subItem)
    .reduce((sum, item) => sum.plus(item.amount), new Decimal("0"));

  const totalCredits = lineItems
    .filter((item) => item.type === "asset" && !item.subItem)
    .reduce((sum, item) => sum.plus(item.amount), new Decimal("0"));

  const hasCredits = totalCredits.gt(0);

  return (
    <div className="space-y-4">
      {/* Category sections */}
      {displayOrder.map((category) => {
        const items = grouped[category];
        if (!items || items.length === 0) return null;

        const isAsset = category === "asset";

        return (
          <div key={category}>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              {categoryLabels[category]}
            </h4>
            <div className="space-y-1.5">
              {items.map((item, idx) => (
                <div
                  key={`${category}-${idx}`}
                  className={cn(
                    "flex items-center justify-between text-sm",
                    item.subItem && "text-muted-foreground text-xs",
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {item.label}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={`Info about ${item.label}`}
                        >
                          <Info size={14} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="text-sm">
                        {item.description}
                      </PopoverContent>
                    </Popover>
                  </span>
                  <span
                    className={cn(
                      "tabular-nums",
                      isAsset && "text-green-600 dark:text-green-400",
                    )}
                  >
                    {isAsset && (
                      <>
                        <span className="sr-only">Credit: </span>
                        You receive:{" "}
                      </>
                    )}
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Summary section */}
      <div className="border-t pt-3 mt-3 space-y-1.5">
        <div className="flex justify-between text-sm">
          <span>Total costs</span>
          <span className="tabular-nums">{formatCurrency(totalCosts)}</span>
        </div>
        {hasCredits && (
          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span>Total credits</span>
            <span className="tabular-nums">
              {formatCurrency(totalCredits)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold">
          <span>Net</span>
          <span className="tabular-nums">{formatCurrency(netCost)}</span>
        </div>
      </div>
    </div>
  );
}
