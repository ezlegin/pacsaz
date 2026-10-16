import DielineGenerator from "@/components/product/DielineGenerator";
import JsonLd from "@/components/JsonLd";
import {
  breadcrumbSchema,
  buildMetadata,
  dielineDescription,
  dielineProductSchema,
  SITE_NAME,
} from "@/lib/seo";
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
      dielineImage: true,
      modelImage: true,
      // Needed by the structured data: they name the categories it belongs to.
      categoryByModel: true,
      categoryByUsage: true,
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

  const path = `/dieline/${dieline.slug}`;

  return (
    <>
      <JsonLd
        data={[
          dielineProductSchema(dieline, {
            path,
            // The file is downloadable once subscribed; the offer reflects that
            // rather than pretending the dieline itself is free.
            freeOffer: false,
          }),
          breadcrumbSchema(
            [
              { name: "صفحه اصلی", path: "/" },
              { name: "قالب‌ها", path: "/dielines" },
              { name: dieline.title, path },
            ],
            path,
          ),
        ]}
      />

      <DielineGenerator
        dieline={dieline}
        customSettings={customSettings}
        user={user}
      />
    </>
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

  const description = dielineDescription(dieline);

  const categoryNames = [
    ...dieline.categoryByModel.map((c) => c.title),
    ...dieline.categoryByUsage.map((c) => c.title),
  ];

  const image = dieline.dielineImage?.url;

  return buildMetadata({
    title: `دایلاین ${dieline.title}`,
    description,
    path: `/dieline/${dieline.slug}`,
    keywords: [
      `دایلاین ${dieline.title}`,
      `قالب ${dieline.title}`,
      ...categoryNames,
      "دایلاین بسته بندی",
      "طراحی جعبه",
      SITE_NAME,
    ],
    // A dieline preview is the strongest social card the site has; fall back to
    // the branded cover when the row has no image yet.
    image: image
      ? { url: image, width: 1200, height: 630, alt: `دایلاین ${dieline.title}` }
      : undefined,
    publishedTime: dieline.createdAt.toISOString(),
    modifiedTime: dieline.updatedAt.toISOString(),
  });
}
