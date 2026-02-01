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

/**
 * Parse the current route slug from the URL.
 * Uses hash for dynamic routes (#/id/compare, #/id/edit, #/id/timeline).
 * Falls back to pathname for pre-rendered routes (/lease, /lease/new).
 */
function parseRoute(): string[] {
  if (typeof window === "undefined") return [];

  // Hash takes priority (dynamic lease routes)
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (hash) {
    return hash.split("/").filter(Boolean);
  }

  // Fall back to pathname (pre-rendered routes like /lease/new)
  let pathname = window.location.pathname;
  // Strip basePath if present
  if (pathname.startsWith("/Lease-Exit-Calculator")) {
    pathname = pathname.slice("/Lease-Exit-Calculator".length);
  }
  // Strip /lease prefix
  pathname = pathname.replace(/^\/lease\/?/, "");
  return pathname ? pathname.split("/").filter(Boolean) : [];
}

interface LeaseRouterProps {
  initialSlug?: string[];
}

export function LeaseRouter({ initialSlug }: LeaseRouterProps) {
  const [slug, setSlug] = useState<string[]>(initialSlug || []);
  const [mounted, setMounted] = useState(false);

  const syncRoute = useCallback(() => {
    setSlug(parseRoute());
  }, []);

  useEffect(() => {
    // On mount, read actual route from URL
    syncRoute();
    setMounted(true);

    // Listen for hash changes (dynamic route navigation)
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, [syncRoute]);

  // During SSR, use initialSlug
  if (!mounted) {
    if (!initialSlug || initialSlug.length === 0) {
      return <LeasesView />;
    }
    if (initialSlug[0] === "new") {
      return <NewLeaseView />;
    }
    return <LeasePageSkeleton />;
  }

  // Client-side routing based on parsed route
  if (slug.length === 0) return <LeasesView />;
  if (slug[0] === "new") return <NewLeaseView />;

  const id = slug[0];
  const view = slug[1];

  if (!view || view === "compare") return <ComparePageView id={id} />;
  if (view === "edit") return <EditLeaseView id={id} />;
  if (view === "timeline") return <TimelinePageView id={id} />;

  return <LeasesView />;
}
