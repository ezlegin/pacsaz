import DielineGenerator from "@/components/product/DielineGenerator";
import { getSessionUser } from "@repo/auth/session";
import { CustomDielineSettings, prisma } from "@repo/db";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ settingsId: string }>;
}

export default async function DielinePage({ params, searchParams }: Props) {
  const user = await getSessionUser();
  const { settingsId } = await searchParams;
  const { slug } = await params;
  const dieline = await prisma.dieline.findFirst({
    where: { slug, active: true },
    include: {
      settings: true,
    },
  });

  let customSettings: CustomDielineSettings | null = null;
  if (settingsId) {
    customSettings = await prisma.customDielineSettings.findFirst({
      where: { id: +settingsId },
    });
  }

  if (!dieline) notFound();

  return (
    <DielineGenerator
      dieline={dieline}
      customSettings={customSettings}
      user={user}
    />
  );
}
