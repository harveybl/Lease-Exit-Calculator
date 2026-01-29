import type { ScenarioResult } from "@/lib/types/scenario";
import { OptionCard } from "@/components/comparison/OptionCard";

// ── Component ───────────────────────────────────────────────────────

interface OptionsListProps {
  scenarios: ScenarioResult[];
}

export function OptionsList({ scenarios }: OptionsListProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      {scenarios.map((scenario, index) => (
        <OptionCard
          key={scenario.type}
          scenario={scenario}
          rank={index + 1}
          isFirst={index === 0}
        />
      ))}
    </div>
  );
}
