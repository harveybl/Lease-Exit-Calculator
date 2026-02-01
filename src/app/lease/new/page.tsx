import type { Metadata } from "next";
import Link from "next/link";
import { LeaseEntryForm } from "@/components/forms/LeaseEntryForm";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "New Lease | Lease Tracker",
  description: "Enter your lease details to find the smartest financial move.",
};

export default function NewLeasePage() {
  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8">
      {/* Back link */}
      <Link
        href="/lease"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to leases
      </Link>

      <LeaseEntryForm />
    </main>
  );
}
