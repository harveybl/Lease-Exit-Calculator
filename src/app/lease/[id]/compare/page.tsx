import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLease, getLatestMarketValue } from "@/app/lease/actions";
import { getComparisonData } from "@/lib/calculations/evaluate-all";
import { ComparisonView } from "@/components/comparison/ComparisonView";
import { Decimal } from "@/lib/decimal";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Compare Options | Lease Tracker",
  description: "Side-by-side comparison of your lease exit options.",
};

interface ComparePageProps {
  params: Promise<{ id: string }>;
}

export default async function ComparePage({ params }: ComparePageProps) {
  const { id } = await params;
  const lease = await getLease(id);

  if (!lease) {
    notFound();
  }

  // Fetch latest market value for this lease
  const latestMarketValue = await getLatestMarketValue(id);
  const estimatedSalePrice = latestMarketValue
    ? new Decimal(latestMarketValue.value.toString())
    : undefined;

  const comparisonData = getComparisonData(lease, estimatedSalePrice);

  // Build vehicle heading
  const heading =
    lease.make && lease.model
      ? `${lease.year ? `${lease.year} ` : ""}${lease.make} ${lease.model}`
      : "Lease Comparison";

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* Back navigation */}
      <Link
        href="/lease"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Leases
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold mb-6">{heading}</h1>

      <ComparisonView
        data={comparisonData}
        marketValue={latestMarketValue}
        leaseId={id}
      />
    </main>
  );
}
