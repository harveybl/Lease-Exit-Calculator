export type { ValuationProvider, ValuationResult } from './provider';
export { ManualValuationProvider } from './manual-provider';

import type { ValuationProvider } from './provider';
import { ManualValuationProvider } from './manual-provider';

export function getValuationProvider(source: string): ValuationProvider {
  switch (source) {
    case 'manual':
      return new ManualValuationProvider();
    case 'kbb':
    case 'edmunds':
    case 'carvana':
      // Future API providers will be added here
      return new ManualValuationProvider();
    default:
      return new ManualValuationProvider();
  }
}
