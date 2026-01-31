import { Card, CardHeader, CardContent } from '@/components/ui/card';

/**
 * Loading skeleton for timeline page
 * Shows placeholders while data is being fetched
 */
export default function TimelineLoading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* Back link skeleton */}
      <div className="h-5 w-32 bg-muted rounded animate-pulse mb-6" />

      {/* Heading skeleton */}
      <div className="h-9 w-64 bg-muted rounded animate-pulse mb-6" />

      {/* Recommendation card skeleton */}
      <Card className="mb-6">
        <CardHeader>
          <div className="h-6 w-48 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-4 w-full bg-muted rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>

      {/* Chart skeleton */}
      <div className="h-[400px] w-full bg-muted rounded-lg animate-pulse mb-6" />

      {/* Disclaimer skeleton */}
      <div className="mt-8 p-4 rounded-lg bg-muted/50">
        <div className="h-3 w-full bg-muted rounded animate-pulse mb-2" />
        <div className="h-3 w-5/6 bg-muted rounded animate-pulse" />
      </div>
    </main>
  );
}
