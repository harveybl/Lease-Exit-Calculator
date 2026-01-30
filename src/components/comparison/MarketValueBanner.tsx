"use client";

import { useState, useTransition } from "react";
import { Info } from "lucide-react";
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

interface MarketValueBannerProps {
  leaseId: string;
}

export function MarketValueBanner({ leaseId }: MarketValueBannerProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate with marketValueSchema
    const parsed = marketValueSchema.safeParse({ value });

    if (!parsed.success) {
      const fieldError = parsed.error.flatten().fieldErrors.value?.[0];
      setError(fieldError ?? "Invalid value");
      return;
    }

    // Call server action
    startTransition(async () => {
      const result = await createMarketValue(leaseId, { value: parsed.data.value });

      if (!result.success) {
        setError(result.error);
      }
      // On success, revalidatePath handles the update automatically
      // The component will unmount when the page re-renders with marketValue data
    });
  };

  return (
    <Card className="border-2 border-primary mb-6 md:mb-8 p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg md:text-xl font-bold">
              Add Your Vehicle's Market Value
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Get accurate results for buyout and sell-privately options
            </p>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Info className="h-4 w-4 text-muted-foreground" />
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

        <form onSubmit={handleSubmit} className="flex gap-3 items-start">
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                placeholder="25000"
                className="pl-7"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={isPending}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive mt-1">{error}</p>
            )}
          </div>
          <Button type="submit" disabled={isPending || !value}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </form>
      </div>
    </Card>
  );
}
