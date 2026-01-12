import DielineGenerator from "@/components/product/DielineGenerator";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function DielinePage({ params }: Props) {
  const { slug } = await params;

  return <DielineGenerator slug={slug} />;
}
