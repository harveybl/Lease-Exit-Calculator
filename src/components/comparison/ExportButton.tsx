'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

// Type imported from local module (safe for SSR analysis)
import type { PDFComparisonData } from '@/lib/pdf/comparison-pdf';

// ── Component ───────────────────────────────────────────────────────

interface ExportButtonProps {
  data: PDFComparisonData;
}

/**
 * Client-side export button with lazy PDF loading.
 * Loads @react-pdf/renderer and ComparisonPDF only when clicked.
 * Uses dynamic runtime import to avoid SSR bundling issues.
 */
export function ExportButton({ data }: ExportButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready'>('idle');
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (status === 'loading') {
      // Dynamic import at runtime (client-side only)
      Promise.all([
        import('@react-pdf/renderer'),
        import('@/lib/pdf/comparison-pdf'),
      ])
        .then(async ([reactPdf, comparisonPdf]) => {
          const { pdf } = reactPdf;
          const { ComparisonPDF } = comparisonPdf;

          // Generate PDF blob
          const pdfDoc = pdf(<ComparisonPDF data={data} />);
          const blob = await pdfDoc.toBlob();
          setPdfBlob(blob);
          setStatus('ready');
        })
        .catch((err) => {
          console.error('Failed to load PDF library:', err);
          setStatus('idle');
        });
    }
  }, [status, data]);

  const handleExport = () => {
    if (status === 'idle') {
      setStatus('loading');
    } else if (status === 'ready' && pdfBlob) {
      // Download the PDF blob
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'lease-comparison.pdf';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={status === 'loading'}
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      {status === 'loading' ? 'Preparing PDF...' : status === 'ready' ? 'Download PDF' : 'Export PDF'}
    </Button>
  );
}
