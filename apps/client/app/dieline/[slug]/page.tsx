import DielineGenerator from "@/components/product/DielineGenerator";
import { DielineSettings, prisma } from "@repo/db";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ settingsId: string }>;
}

export default async function DielinePage({ params, searchParams }: Props) {
  const { settingsId } = await searchParams;
  const { slug } = await params;
  const dieline = await prisma.dieline.findFirst({
    where: { slug, active: true },
    include: {
      settings: true,
    },
  });

  let settings: DielineSettings | null = null;
  if (settingsId) {
    settings = await prisma.dielineSettings.findFirst({
      where: { id: +settingsId },
    });
  }

  if (!dieline) notFound();

  return <DielineGenerator dieline={dieline} customSettings={settings} />;
}
