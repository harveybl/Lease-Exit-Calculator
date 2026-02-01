import Link from "next/link";
import { LegalDisclaimer } from '@/components/disclaimers/LegalDisclaimer';
import { Button } from "@/components/ui/button";
import { ArrowRight, List } from "lucide-react";

export default function Home() {
  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8">
      {/* Hero section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Lease Tracker</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Find out the smartest financial move for your vehicle lease.
        </p>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="min-w-[200px]">
            <Link href="/lease/new">
              Enter Your Lease
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="min-w-[200px]">
            <Link href="/lease">
              <List className="h-4 w-4 mr-2" />
              View Saved Leases
            </Link>
          </Button>
        </div>
      </section>

      {/* Legal disclaimer */}
      <LegalDisclaimer types={['general']} />
    </main>
  );
}
