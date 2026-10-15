import DielinesFilters from "@/components/DielinesFilters";
import DielinesGrid from "@/components/DielinesGrid";
import DielinesSidebar from "@/components/DielinesSidebar";
import Pagination from "@/components/Pagination";
import { getSessionUser } from "@repo/auth/session";
import { Prisma, prisma } from "@repo/db";
import { pagination } from "@repo/lib/utils/pagination";
import { cn } from "@repo/ui/lib/utils";
import { Layers, LayoutGrid, SearchX, Sparkles, X } from "lucide-react";
import Link from "next/link";

const PAGE_SIZE = 32;

const fa = (value: number) =>
  value.toLocaleString("fa-IR", { useGrouping: false });

interface Props {
  searchParams: Promise<{ category?: string; page?: string }>;
}

const page = async ({ searchParams }: Props) => {
  const { category, page } = await searchParams;
  const { skip, take } = pagination(page ?? "", PAGE_SIZE);

  const user = await getSessionUser();

  /**
   * Without a `category` param the OR clause matched nothing, so the plain
   * catalogue view returned an empty grid. Only constrain when filtering.
   */
  const where: Prisma.DielineWhereInput = {
    active: true,
    ...(category
      ? {
          OR: [
            { categoryByModel: { some: { slug: category } } },
            { categoryByUsage: { some: { slug: category } } },
          ],
        }
      : {}),
  };

  const [
    dielines,
    totalDielines,
    categoriesByModel,
    categoriesByUsage,
    favedIds,
  ] = await Promise.all([
    prisma.dieline.findMany({
      orderBy: { id: "desc" },
      where,
      include: {
        dielineImage: true,
        modelImage: true,
        categoryByModel: true,
        categoryByUsage: true,
      },
      skip,
      take,
    }),
    prisma.dieline.count({ where }),
    prisma.dielineCategoryByModel.findMany({
      include: {
        _count: { select: { dieline: { where: { active: true } } } },
      },
      orderBy: { title: "asc" },
    }),
    prisma.dielineCategoryByUsage.findMany({
      include: {
        _count: { select: { dieline: { where: { active: true } } } },
      },
      orderBy: { title: "asc" },
    }),
    user
      ? prisma.favedDieline.findMany({
          where: { userId: user.id },
          select: { dielineId: true },
        })
      : Promise.resolve([]),
  ]);

  // only offer categories that actually have something in them
  const modelCategories = categoriesByModel.filter((c) => c._count.dieline > 0);
  const usageCategories = categoriesByUsage.filter((c) => c._count.dieline > 0);

  const activeCategory =
    [...categoriesByModel, ...categoriesByUsage].find(
      (c) => c.slug === category,
    ) ?? null;

  const favedIdList = favedIds.map((f) => f.dielineId);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      {/* ------------------------------- header ------------------------------ */}
      <header className="relative overflow-hidden rounded-3xl border bg-gradient-to-bl from-primary/[0.08] via-background to-background p-6 md:p-9">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-primary/15 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
              <Sparkles className="size-3.5" />
              کتابخانه قالب‌های پک‌ساز
            </span>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
                قالب‌های{" "}
                <span className="bg-gradient-to-l from-violet-500 to-purple-600 bg-clip-text text-transparent">
                  دایلاین
                </span>
              </h1>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                دایلاین‌های استاندارد و لایه‌باز را انتخاب کن، ابعاد و متریال را
                به دلخواه تغییر بده و خروجی آماده‌ی چاپ بگیر.
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
            activeCategory={category}
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
              activeCategory={category}
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
            favedIds={favedIdList}
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

export default page;

export const metadata = {
  title: "قالب ها",
  description:
    "صفحه قالب‌ها در وبسایت پکساز. در این صفحه می‌توانید انواع قالب‌های دایلاین را مشاهده و انتخاب کنید.",
};
