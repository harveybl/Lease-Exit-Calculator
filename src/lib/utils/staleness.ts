export const STALE_THRESHOLD_DAYS = 30;

function formatRelativeTime(days: number): string {
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days >= 2 && days <= 6) return `${days} days ago`;
  if (days >= 7 && days <= 13) return '1 week ago';
  if (days >= 14 && days <= 29) {
    const weeks = Math.floor(days / 7);
    return `${weeks} weeks ago`;
  }
  if (days >= 30 && days <= 59) return '1 month ago';

  const months = Math.floor(days / 30);
  return `${months} months ago`;
}

export function checkValueStaleness(updatedAt: Date): {
  isStale: boolean;
  message: string;
  relativeTime: string;
  daysSinceUpdate: number;
} {
  const now = new Date();
  const diffMs = now.getTime() - updatedAt.getTime();
  const daysSinceUpdate = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const isStale = daysSinceUpdate > STALE_THRESHOLD_DAYS;

  return {
    isStale,
    daysSinceUpdate,
    message: isStale
      ? 'Your market value may be outdated — consider updating'
      : '',
    relativeTime: formatRelativeTime(daysSinceUpdate),
  };
}
