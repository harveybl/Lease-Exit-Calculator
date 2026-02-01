import Link from "next/link";
import { LeaseEntryForm } from "@/components/forms/LeaseEntryForm";
import { ArrowLeft } from "lucide-react";

export function NewLeaseView() {
  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8">
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
