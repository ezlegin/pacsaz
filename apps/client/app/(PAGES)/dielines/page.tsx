import DielinesCatalogue from "@/components/DielinesCatalogue";
import { buildMetadata, SITE_NAME } from "@/lib/seo";
import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ page?: string; category?: string }>;
}

/**
 * The full catalogue.
 *
 * Takes `searchParams`, which also forces the page to render per request — a
 * build-time render here would freeze the listing at whatever the catalogue held
 * on deploy day.
 */
const page = async ({ searchParams }: Props) => {
  const { page: pageParam, category } = await searchParams;

  /**
   * The catalogue used to filter with `?category=`, which made every category a
   * near-duplicate of this URL with no title, heading or canonical of its own.
   * Categories now live at `/dielines/category/<slug>`, so the old form is
   * redirected rather than served: a permanent redirect transfers whatever
   * authority those URLs accumulated instead of leaving them to compete.
   */
  if (category) {
    permanentRedirect(`/dielines/category/${encodeURIComponent(category)}`);
  }

  return <DielinesCatalogue page={pageParam} />;
};

export default page;

export const metadata: Metadata = buildMetadata({
  title: "کتابخانه قالب‌های دایلاین بسته‌بندی",
  description: `قالب‌های دایلاین آماده و لایه‌باز ${SITE_NAME} برای جعبه‌های تاشو، نمایشی، پستی، پاکت و اسلیو. ابعاد و متریال را دلخواه تغییر بده و خروجی DXF، PDF یا SVG آماده‌ی چاپ بگیر.`,
  path: "/dielines",
  keywords: [
    "قالب دایلاین",
    "دایلاین آماده",
    "کتابخانه دایلاین",
    "قالب جعبه بسته بندی",
    "دانلود دایلاین",
  ],
});
