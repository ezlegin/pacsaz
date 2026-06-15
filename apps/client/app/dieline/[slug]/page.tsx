import DielineGenerator from "@/components/product/DielineGenerator";
import { getSessionUser } from "@repo/auth/session";
import { CustomDielineSettings, prisma } from "@repo/db";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ settingsId: string }>;
}

const getDieline = async (slug: string) => {
  return await prisma.dieline.findFirst({
    where: { slug, active: true },
    include: {
      settings: true,
    },
  });
};

export default async function DielinePage({ params, searchParams }: Props) {
  const user = await getSessionUser();
  const { settingsId } = await searchParams;
  const { slug } = await params;
  const dieline = await getDieline(slug);

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const dieline = await getDieline(slug);
  if (!dieline) return {};

  return {
    title: `دایلاین ${dieline.title}`,
    description: `دانلود دایلاین ${dieline.title}`,
  };
}
