import { DISCLAIMERS, type DisclaimerKey } from '@/lib/disclaimers';

interface LegalDisclaimerProps {
  types?: DisclaimerKey[];
  className?: string;
}

export function LegalDisclaimer({
  types = ['general'],
  className = '',
}: LegalDisclaimerProps) {
  return (
    <div
      role="alert"
      aria-label="Legal disclaimer"
      className={`rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 ${className}`}
    >
      <p className="mb-1 font-semibold">Important Notice</p>
      {types.map((type) => (
        <p key={type} className="mt-2">
          {DISCLAIMERS[type]}
        </p>
      ))}
    </div>
  );
}
