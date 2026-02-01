"use client";

import { useEffect, useState, useCallback } from "react";
import { LeasesView } from "./LeasesView";
import { NewLeaseView } from "./NewLeaseView";
import { EditLeaseView } from "./EditLeaseView";
import { ComparePageView } from "./ComparePageView";
import { TimelinePageView } from "./TimelinePageView";

function LeasePageSkeleton() {
  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8">
      <div className="h-4 w-32 animate-pulse rounded bg-muted mb-6" />
      <div className="h-9 w-64 animate-pulse rounded bg-muted mb-6" />
      <div className="h-48 animate-pulse rounded-lg bg-muted mb-4" />
      <div className="h-32 animate-pulse rounded-lg bg-muted" />
    </main>
  );
}

function parseHash(): string[] {
  if (typeof window === "undefined") return [];
  const hash = window.location.hash.replace(/^#\/?/, "");
  return hash ? hash.split("/").filter(Boolean) : [];
}

interface LeaseRouterProps {
  initialSlug?: string[];
}

export function LeaseRouter({ initialSlug }: LeaseRouterProps) {
  const [slug, setSlug] = useState<string[]>(initialSlug || []);
  const [mounted, setMounted] = useState(false);

  const syncHash = useCallback(() => {
    setSlug(parseHash());
  }, []);

  useEffect(() => {
    // On mount, read hash from URL (handles refresh and 404 fallback)
    syncHash();
    setMounted(true);

    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [syncHash]);

  // During SSR, use initialSlug; show skeleton only if hash will differ
  if (!mounted) {
    // For pre-rendered paths, render actual content; for 404 fallback, skeleton is fine
    if (!initialSlug || initialSlug.length === 0) {
      return <LeasesView />;
    }
    if (initialSlug[0] === "new") {
      return <NewLeaseView />;
    }
    return <LeasePageSkeleton />;
  }

  // Client-side routing based on hash
  if (slug.length === 0) return <LeasesView />;
  if (slug[0] === "new") return <NewLeaseView />;

  const id = slug[0];
  const view = slug[1];

  if (!view || view === "compare") return <ComparePageView id={id} />;
  if (view === "edit") return <EditLeaseView id={id} />;
  if (view === "timeline") return <TimelinePageView id={id} />;

  return <LeasesView />;
}
