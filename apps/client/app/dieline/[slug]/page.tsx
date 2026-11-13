import DielineGenerator from "@/components/product/DielineGeneratorClient";
import JsonLd from "@/components/JsonLd";
import {
  breadcrumbSchema,
  buildMetadata,
  dielineDescription,
  dielineSchema,
  SITE_NAME,
} from "@/lib/seo";
import { clampSize } from "@/lib/dieline/engine";
import { getSessionUser } from "@repo/auth/session";
import { CustomDielineSettings, prisma } from "@repo/db";
import { materials } from "@repo/dieline-core/data/materials";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
  /** `w`, `l`, `h` and `m` carry the size and material chosen on the home page. */
  searchParams: Promise<{ settingsId?: string; w?: string; l?: string; h?: string; m?: string }>;
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

type Dieline = NonNullable<Awaited<ReturnType<typeof getDieline>>>;

/**
 * Starts a template at a size asked for in the URL. The range and the material
 * are the template's own limits, so a hand-edited link can only pick from what
 * is on sale; anything unusable falls back to the template's default. The
 * canonical URL has no query, so these links do not compete with the page.
 */
const withRequestedSize = (dieline: Dieline, query: { w?: string; l?: string; h?: string; m?: string }): Dieline => {
  if (!dieline.settings) return dieline;

  const requested = { width: Number(query.w), length: Number(query.l), height: Number(query.h) };
  if (!Object.values(requested).every((value) => Number.isFinite(value) && value > 0)) return dieline;

  const size = clampSize(
    requested,
    { width: dieline.minWidth, length: dieline.minLength, height: dieline.minHeight },
    { width: dieline.maxWidth, length: dieline.maxLength, height: dieline.maxHeight },
  );
  const material = dieline.materials.split(",").includes(query.m ?? "") ? query.m! : dieline.defaultMaterial;
  const thickness = materials.find((item) => item.value === material)?.thickness ?? dieline.settings.thickness;

  return { ...dieline, defaultMaterial: material, settings: { ...dieline.settings, ...size, material, thickness } };
};

export default async function DielinePage({ params, searchParams }: Props) {
  const user = await getSessionUser();
  const { settingsId, w, l, h, m } = await searchParams;
  const { slug } = await params;
  const dieline = await getDieline(slug);

  let customSettings: CustomDielineSettings | null = null;
  // Only the signed-in user's own saved copy or past download may be reopened.
  if (settingsId && user) {
    customSettings = await prisma.customDielineSettings.findFirst({
      where: {
        id: Number(settingsId) || 0,
        OR: [{ savedDieline: { userId: user.id } }, { downloadHistory: { userId: user.id } }],
      },
    });
  }

  if (!dieline) notFound();

  const path = `/dieline/${dieline.slug}`;

  return (
    <>
      <JsonLd
        data={[
          dielineSchema(dieline, { path }),
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
        dieline={withRequestedSize(dieline, { w, l, h, m })}
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
      ? { url: image, alt: `دایلاین ${dieline.title}` }
      : undefined,
    publishedTime: dieline.createdAt.toISOString(),
    modifiedTime: dieline.updatedAt.toISOString(),
  });
}
