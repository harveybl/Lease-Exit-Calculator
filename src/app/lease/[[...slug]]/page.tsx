import { LeaseRouter } from "@/components/lease/LeaseRouter";

export async function generateStaticParams() {
  return [
    { slug: undefined },
    { slug: ["new"] },
  ];
}

export default async function LeaseCatchAll({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  return <LeaseRouter initialSlug={slug} />;
}
