import { formatCurrency } from "@/lib/utils/format-currency";
import { Card } from "@/components/ui/card";
import type { Decimal } from "@/lib/decimal";

interface EquityDisplayProps {
  equity: {
    amount: Decimal | string | number;
    isPositive: boolean;
  };
}

export function EquityDisplay({ equity }: EquityDisplayProps) {
  // Convert equity.amount to number (handles RSC serialization)
  const amount = Number(equity.amount);
  const absAmount = Math.abs(amount);

  // Determine if near-zero (within $50)
  const isNearZero = absAmount < 50;

  // Determine text and styling based on equity position
  let message: string;
  let amountText: string;
  let amountColor: string;

  if (isNearZero) {
    message = "Your vehicle has approximately no equity";
    amountText = "";
    amountColor = "";
  } else if (equity.isPositive) {
    message = "Your vehicle has";
    amountText = ` ${formatCurrency(absAmount)} in positive equity`;
    amountColor = "text-primary";
  } else {
    message = "Your vehicle has";
    amountText = ` ${formatCurrency(absAmount)} in negative equity`;
    amountColor = "text-destructive";
  }

  return (
    <Card className="mb-6 md:mb-8 p-4">
      <div className="space-y-2">
        <p className="text-sm md:text-base">
          {message}
          {amountText && (
            <span className={`font-semibold ${amountColor}`}>
              {amountText}
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          Equity = market value minus what you owe to buy out the lease
        </p>
      </div>
    </Card>
  );
}
