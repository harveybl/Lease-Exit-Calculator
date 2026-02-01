import { Card } from "@/components/ui/card";

export default function CompareLoading() {
  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8">
      {/* Back link placeholder */}
      <div className="h-5 bg-muted rounded w-32 mb-6 animate-pulse" />

      {/* Heading placeholder */}
      <div className="h-9 bg-muted rounded w-72 mb-6 animate-pulse" />

      {/* Hero card skeleton */}
      <Card className="p-6 mb-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-64 mb-2" />
        <div className="h-5 bg-muted rounded w-96 max-w-full mb-4" />
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded w-24" />
          ))}
        </div>
      </Card>

      {/* Option card skeletons */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-muted rounded-full" />
              <div className="h-6 bg-muted rounded w-40" />
              <div className="ml-auto h-6 bg-muted rounded w-24" />
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
