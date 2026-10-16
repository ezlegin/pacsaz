import DielinesCatalogue from "@/components/DielinesCatalogue";
import { getCatalogue } from "@/lib/catalogue";
import { buildMetadata, SITE_NAME } from "@/lib/seo";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

/**
 * A single category.
 *
 * Categories are real routes rather than `?category=` on the catalogue, because a
 * query parameter is a weak indexing target: it has no unique title, no unique
 * heading, and search engines routinely consolidate it away in favour of the
 * bare path. A real path gets its own title, description, `h1`, breadcrumb and
 * `ItemList`, and it is a URL the sitemap can advertise and other pages can link
 * to with anchor text that carries the category name.
 *
 * Rendered per request. The listing reads `searchParams` for pagination and the
 * session for favourites, and Next.js cannot prerender a page that does either —
 * attempting it fails the request with `DYNAMIC_SERVER_USAGE`. Declaring it
 * explicitly is what makes that a supported route rather than a 500, and it is
 * the correct behaviour anyway for a catalogue that changes without a deploy.
 */
export const dynamic = "force-dynamic";

const page = async ({ params, searchParams }: Props) => {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;

  return <DielinesCatalogue categorySlug={slug} page={pageParam} />;
};

export default page;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Reuses the page's own lookup, so the metadata can never describe a category
  // the page did not find — an unknown slug 404s in both places.
  const { activeCategory, totalDielines } = await getCatalogue({
    categorySlug: slug,
  });

  if (!activeCategory) return {};

  const count = totalDielines.toLocaleString("fa-IR", { useGrouping: false });

  return buildMetadata({
    title: `دایلاین ${activeCategory.title}`,
    description: `${count} قالب دایلاین آماده در دسته «${activeCategory.title}»؛ ساخته‌شده با ${SITE_NAME}. ابعاد و متریال را دلخواه تغییر بده و خروجی DXF، PDF یا SVG آماده‌ی چاپ دانلود کن.`,
    path: `/dielines/category/${activeCategory.slug}`,
    keywords: [
      activeCategory.title,
      `دایلاین ${activeCategory.title}`,
      `قالب ${activeCategory.title}`,
      "دایلاین بسته بندی",
      "قالب جعبه",
    ],
  });
}
