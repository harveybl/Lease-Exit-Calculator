import type { Metadata } from "next";
import Link from "next/link";
import { getLeases } from "./actions";
import { LeaseCard } from "@/components/lease/LeaseCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Your Leases | Lease Tracker",
  description: "Manage your vehicle leases.",
};

export default async function LeasesPage() {
  const leases = await getLeases();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Your Leases</h1>
        <Button asChild>
          <Link href="/lease/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Lease
          </Link>
        </Button>
      </div>

      {/* Lease list */}
      {leases.length === 0 ? (
        // Empty state
        <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center">
          <h2 className="text-xl font-semibold mb-2">No leases yet</h2>
          <p className="text-muted-foreground mb-6">
            Add your first lease to start tracking your options.
          </p>
          <Button asChild size="lg">
            <Link href="/lease/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Lease
            </Link>
          </Button>
        </div>
      ) : (
        // List of leases
        <div className="space-y-4">
          {leases.map((lease) => (
            <LeaseCard key={lease.id} lease={lease} />
          ))}
        </div>
      )}
    </main>
  );
}
