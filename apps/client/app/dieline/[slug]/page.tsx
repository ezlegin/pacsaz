import DielineGenerator from "@/components/product/DielineGenerator";
import { prisma } from "@repo/db";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function DielinePage({ params }: Props) {
  const { slug } = await params;
  const dieline = await prisma.dieline.findFirst({ where: { slug } });

  if (!dieline) notFound();

  return <DielineGenerator dieline={dieline} />;
}
