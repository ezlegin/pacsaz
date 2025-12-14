import { dielines } from "@/lib/dielines";
import { notFound } from "next/navigation";
import DielineGenerator from "../../../components/product/DielineGenerator";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function DielinePage({ params }: Props) {
  const { slug } = await params;

  const dieline = dielines[slug as keyof typeof dielines];

  if (!dieline) notFound();

  return <DielineGenerator slug={slug} />;
}
