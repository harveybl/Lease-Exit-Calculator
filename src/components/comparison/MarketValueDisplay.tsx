"use client";

import { useState, useTransition } from "react";
import { Pencil, Check, X, AlertCircle, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createMarketValue } from "@/app/lease/actions";
import { marketValueSchema } from "@/lib/validations/market-value-schema";
import { formatCurrency } from "@/lib/utils/format-currency";
import { checkValueStaleness } from "@/lib/utils/staleness";
import type { Decimal } from "@/lib/decimal";

interface MarketValueDisplayProps {
  leaseId: string;
  marketValue: {
    value: Decimal | string | number;
    sourceLabel: string | null;
    createdAt: Date;
    source: string;
  };
  onSave?: () => void;
}

export function MarketValueDisplay({ leaseId, marketValue, onSave }: MarketValueDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Convert marketValue.value to number for display (handles RSC serialization)
  const currentValue = Number(marketValue.value);
  const { isStale, message: stalenessMessage, relativeTime } = checkValueStaleness(marketValue.createdAt);

  const handleEditClick = () => {
    setEditValue(currentValue.toString());
    setIsEditing(true);
    setError("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue("");
    setError("");
  };

  const handleSave = () => {
    setError("");

    // Validate with marketValueSchema
    const parsed = marketValueSchema.safeParse({ value: editValue });

    if (!parsed.success) {
      const fieldError = parsed.error.flatten().fieldErrors.value?.[0];
      setError(fieldError ?? "Invalid value");
      return;
    }

    // Call server action to create new market value (history preserved)
    startTransition(async () => {
      const result = await createMarketValue(leaseId, { value: parsed.data.value });

      if (!result.success) {
        setError(result.error);
      } else {
        setIsEditing(false);
        setEditValue("");
        onSave?.();
      }
    });
  };

  return (
    <Card className="mb-6 md:mb-8 p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm text-muted-foreground">Market Value</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Where to look up your vehicle's value:</h4>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a
                          href="https://www.kbb.com/whats-my-car-worth/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Kelley Blue Book (KBB)
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.edmunds.com/appraisal/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Edmunds
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.carvana.com/sell-my-car"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Carvana Instant Offer
                        </a>
                      </li>
                    </ul>
                    <p className="text-xs text-muted-foreground border-t pt-2">
                      <strong>Tip:</strong> Use the trade-in value for the most conservative estimate.
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        className="pl-7"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        disabled={isPending}
                        autoFocus
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-destructive mt-1">{error}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleSave}
                      disabled={isPending || !editValue}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleCancel}
                      disabled={isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-3">
                  <p className="text-2xl md:text-3xl font-bold tabular-nums">
                    {formatCurrency(currentValue)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleEditClick}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {marketValue.sourceLabel ?? 'Your estimate'} • Updated {relativeTime}
                </p>
              </div>
            )}
          </div>
        </div>

        {isStale && !isEditing && (
          <div className="flex items-start gap-2 text-amber-600 dark:text-amber-500 text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>{stalenessMessage}</p>
          </div>
        )}

        {!isEditing && (
          <p className="text-xs text-muted-foreground">
            Market values are estimates and may vary by condition, location, and market conditions.
          </p>
        )}
      </div>
    </Card>
  );
}
