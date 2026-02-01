"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLeases } from "@/app/lease/actions";
import { LeaseCard } from "@/components/lease/LeaseCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Lease } from "@/lib/db/schema";

export function LeasesView() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLeases = async () => {
    const data = await getLeases();
    setLeases(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLeases();
  }, []);

  if (loading) {
    return (
      <main id="main-content" className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="h-9 w-48 animate-pulse rounded bg-muted" />
          <div className="h-10 w-28 animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8">
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
        <div className="space-y-4">
          {leases.map((lease) => (
            <LeaseCard key={lease.id} lease={lease} onDelete={loadLeases} />
          ))}
        </div>
      )}
    </main>
  );
}
