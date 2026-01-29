import { LegalDisclaimer } from '@/components/disclaimers/LegalDisclaimer';

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Lease Tracker</h1>
      <LegalDisclaimer types={['general']} />
      <section className="mt-8">
        <p className="text-gray-600">
          Calculation results will appear here.
        </p>
      </section>
    </main>
  );
}
