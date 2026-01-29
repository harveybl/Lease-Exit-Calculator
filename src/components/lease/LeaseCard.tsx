"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Lease } from "@/lib/db/schema";
import { deleteLease } from "@/app/lease/actions";
import { Button } from "@/components/ui/button";
import { BarChart3, Edit, Trash2 } from "lucide-react";

interface LeaseCardProps {
  lease: Lease;
}

export function LeaseCard({ lease }: LeaseCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) {
      // First click: show confirmation
      setConfirmDelete(true);
      // Reset confirmation after 3 seconds
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }

    // Second click: actually delete
    setDeleting(true);
    const result = await deleteLease(lease.id);

    if (result.success) {
      router.refresh();
    } else {
      console.error("Failed to delete lease:", result.error);
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  // Format vehicle display
  const vehicleDisplay = lease.make && lease.model
    ? `${lease.year ? `${lease.year} ` : ""}${lease.make} ${lease.model}`
    : "Vehicle Lease";

  // Format last updated
  const lastUpdated = new Date(lease.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        {/* Lease details */}
        <div className="flex-1 space-y-3">
          {/* Vehicle info */}
          <div>
            <h3 className="text-lg font-semibold">{vehicleDisplay}</h3>
            <p className="text-sm text-muted-foreground">
              Last updated {lastUpdated}
            </p>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Monthly Payment</p>
              <p className="font-medium">${Number(lease.monthlyPayment).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Lease Term</p>
              <p className="font-medium">{lease.termMonths} months</p>
            </div>
            <div>
              <p className="text-muted-foreground">Current Mileage</p>
              <p className="font-medium">{lease.currentMileage.toLocaleString()} miles</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button asChild variant="default" size="sm">
            <Link href={`/lease/${lease.id}/compare`}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Compare Options
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/lease/${lease.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button
            variant={confirmDelete ? "destructive" : "outline"}
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleting ? "Deleting..." : confirmDelete ? "Confirm Delete?" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
