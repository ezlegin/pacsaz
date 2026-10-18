import DielinesFilters from "@/components/DielinesFilters";
import DielinesGrid from "@/components/DielinesGrid";
import DielinesSidebar from "@/components/DielinesSidebar";
import JsonLd from "@/components/JsonLd";
import Pagination from "@/components/Pagination";
import { getCatalogue, PAGE_SIZE } from "@/lib/catalogue";
import {
  absoluteUrl,
  breadcrumbSchema,
  collectionPageSchema,
  itemListSchema,
  SITE_NAME,
} from "@/lib/seo";
import { cn } from "@repo/ui/lib/utils";
import { Layers, LayoutGrid, SearchX, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const fa = (value: number) =>
  value.toLocaleString("fa-IR", { useGrouping: false });

/**
 * The dieline catalogue, shared by `/dielines` and `/dielines/category/<slug>`.
 *
 * A server component, so the whole listing — every title, every category link,
 * the result count — is in the HTML the crawler receives. Emitting it once and
 * wrapping it in two thin routes is what keeps the heading, the breadcrumb trail
 * and the `ItemList` in sync between the "all" view and a filtered one.
 */
const DielinesCatalogue = async ({
  categorySlug,
  page,
}: {
  categorySlug?: string;
  page?: string;
}) => {
  const {
    dielines,
    totalDielines,
    modelCategories,
    usageCategories,
    favedIds,
    activeCategory,
    missingCategory,
    user,
  } = await getCatalogue({ categorySlug, page });

  // An unknown category is a 404, not an empty listing.
  if (missingCategory) notFound();

  const path = activeCategory
    ? `/dielines/category/${activeCategory.slug}`
    : "/dielines";

  const heading = activeCategory
    ? `قالب‌های دایلاین ${activeCategory.title}`
    : "کتابخانه قالب‌های دایلاین بسته‌بندی";

  const description = activeCategory
    ? `${fa(totalDielines)} قالب دایلاین آماده‌ی دسته «${activeCategory.title}» در ${SITE_NAME}. ابعاد، متریال و ضخامت را تغییر بده و خروجی DXF، PDF یا SVG آماده‌ی چاپ بگیر.`
    : `${fa(totalDielines)} قالب دایلاین استاندارد و لایه‌باز برای بسته‌بندی؛ جعبه‌های تاشو، نمایشی، پستی، پاکت و اسلیو. ابعاد و متریال را دلخواه تغییر بده و خروجی آماده‌ی چاپ بگیر.`;

  const breadcrumbs = [
    { name: "صفحه اصلی", path: "/" },
    { name: "قالب‌ها", path: "/dielines" },
    ...(activeCategory ? [{ name: activeCategory.title, path }] : []),
  ];

  return (
    <div className="mx-auto w-full space-y-8">
      <JsonLd
        data={[
          collectionPageSchema({
            name: heading,
            description,
            path,
            breadcrumbPath: path,
          }),
          breadcrumbSchema(breadcrumbs, path),
          itemListSchema({
            name: heading,
            description,
            path,
            items: dielines.map((dieline) => ({
              name: dieline.title,
              path: `/dieline/${dieline.slug}`,
              image: dieline.dielineImage?.url
                ? absoluteUrl(dieline.dielineImage.url)
                : null,
            })),
          }),
        ]}
      />

      {/* ------------------------------- header ------------------------------ */}
      <header className="relative overflow-hidden rounded-3xl border bg-gradient-to-bl from-primary/[0.08] via-background to-background p-6 md:p-9">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-primary/15 blur-3xl"
        />

        {/* The trail is visible as well as structured: it is the only path from a
            category page back up to the full catalogue. */}
        <nav aria-label="مسیر صفحه" className="relative mb-4">
          <ol className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.path} className="flex items-center gap-1.5">
                {index > 0 && <span aria-hidden>/</span>}
                {index === breadcrumbs.length - 1 ? (
                  <span aria-current="page" className="text-foreground">
                    {crumb.name}
                  </span>
                ) : (
                  <Link
                    href={crumb.path}
                    className="transition-colors hover:text-primary"
                  >
                    {crumb.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
              <Sparkles className="size-3.5" />
              {activeCategory
                ? "دسته‌بندی قالب‌ها"
                : "کتابخانه قالب‌های پک‌ساز"}
            </span>

            <div className="space-y-2">
              {/*
                One `h1` per page, and it names the category when there is one —
                that is the phrase a category page competes for.
              */}
              <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
                {activeCategory ? (
                  <>
                    قالب‌های{" "}
                    <span className="bg-gradient-to-l from-violet-500 to-purple-600 bg-clip-text text-transparent">
                      {activeCategory.title}
                    </span>
                  </>
                ) : (
                  <>
                    قالب‌های{" "}
                    <span className="bg-gradient-to-l from-violet-500 to-purple-600 bg-clip-text text-transparent">
                      دایلاین
                    </span>
                  </>
                )}
              </h1>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                {activeCategory
                  ? `دایلاین‌های آماده‌ی دسته «${activeCategory.title}»؛ ابعاد و متریال را به دلخواه تغییر بده و خروجی آماده‌ی چاپ بگیر.`
                  : "دایلاین‌های استاندارد و لایه‌باز را انتخاب کن، ابعاد و متریال را به دلخواه تغییر بده و خروجی آماده‌ی چاپ بگیر."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {[
                { icon: Layers, text: `${fa(totalDielines)} قالب موجود` },
                {
                  icon: LayoutGrid,
                  text: `${fa(modelCategories.length + usageCategories.length)} دسته‌بندی`,
                },
              ].map(({ icon: Icon, text }) => (
                <span
                  key={text}
                  className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
                >
                  <Icon className="size-3.5 text-primary" />
                  {text}
                </span>
              ))}
            </div>
          </div>

          <DielinesFilters
            categoriesByUsage={usageCategories}
            categoriesByModel={modelCategories}
            activeCategory={categorySlug}
            resultCount={totalDielines}
          />
        </div>
      </header>

      {/* -------------------------------- body ------------------------------- */}
      <div className="flex gap-8">
        {/* desktop filter rail */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-6 rounded-2xl border bg-background p-5">
            <div className="mb-5 flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
                <Layers className="size-4" strokeWidth={1.9} />
              </span>
              <div>
                <h2 className="text-xs font-bold">فیلتر دسته‌بندی</h2>
                <p className="text-[10px] text-muted-foreground">
                  {fa(modelCategories.length + usageCategories.length)} دسته
                  فعال
                </p>
              </div>
            </div>

            <DielinesSidebar
              categoriesByUsage={usageCategories}
              categoriesByModel={modelCategories}
              activeCategory={categorySlug}
            />
          </div>
        </aside>

        {/* results */}
        <div className="min-w-0 flex-1 space-y-6">
          {/* active filter chip */}
          {activeCategory && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-muted-foreground">
                فیلتر فعال:
              </span>
              <Link
                href="/dielines"
                className={cn(
                  "group inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary",
                  "transition-colors hover:bg-primary/15",
                )}
              >
                {activeCategory.title}
                <X className="size-3 transition-transform group-hover:rotate-90" />
              </Link>
            </div>
          )}

          <DielinesGrid
            dielines={dielines}
            favedIds={favedIds}
            user={user}
            emptyState={
              <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed px-6 py-24 text-center">
                <span className="grid size-16 place-items-center rounded-3xl bg-primary/10 text-primary">
                  <SearchX className="size-7" strokeWidth={1.6} />
                </span>
                <div className="space-y-1.5">
                  <p className="text-sm font-bold">
                    {activeCategory
                      ? `در دسته «${activeCategory.title}» قالبی نیست`
                      : "هنوز قالبی منتشر نشده است"}
                  </p>
                  <p className="max-w-sm text-xs leading-6 text-muted-foreground">
                    {activeCategory
                      ? "می‌توانی فیلتر را حذف کنی و همه‌ی قالب‌ها را ببینی."
                      : "به‌زودی قالب‌های جدید به کتابخانه اضافه می‌شوند."}
                  </p>
                </div>

                {activeCategory && (
                  <Link
                    href="/dielines"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-violet-500 to-purple-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:gap-3 hover:shadow-lg hover:shadow-primary/30"
                  >
                    نمایش همه قالب‌ها
                  </Link>
                )}
              </div>
            }
          />

          <Pagination
            pageSize={PAGE_SIZE}
            totalItems={totalDielines}
            lang="fa"
          />
        </div>
      </div>
    </div>
  );
};

export default DielinesCatalogue;
