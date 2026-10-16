import { ArrowLeft, Box, Layers, Scissors, Sparkles } from "lucide-react";
import Link from "next/link";

export type HomeCategory = {
  title: string;
  slug: string;
  count: number;
};

/**
 * The category grid on the home page.
 *
 * Categories come from the database rather than a constant, and every card is a
 * real `<Link>` to `/dielines/category/<slug>`. A hardcoded list drifts: it
 * advertised slugs that do not exist, which produced both a 404 for the visitor
 * and a dead end for the crawler — and it claimed counts the catalogue did not
 * have, which is the kind of mismatch that reads as cloaking.
 */
const HomeCategories = ({ categories }: { categories: HomeCategory[] }) => {
  if (categories.length === 0) return null;

  const faDigits = (value: number) =>
    value.toLocaleString("fa-IR", { useGrouping: false });

  const [featured, ...rest] = categories;
  if (!featured) return null;

  const max = Math.max(...categories.map((c) => c.count));

  return (
    <section className="mx-auto w-full max-w-7xl">
      <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-primary/25">
            <Scissors className="size-6" strokeWidth={1.9} />
          </span>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              دسته‌بندی قالب‌های دایلاین
            </h2>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              قالب‌های لایه‌باز و آماده شخصی‌سازی، دسته‌بندی‌شده بر اساس نوع
              بسته‌بندی.
            </p>
          </div>
        </div>

        <Link
          href="/dielines"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border bg-background px-5 py-2.5 text-xs font-medium transition-colors hover:border-primary/30 hover:text-primary sm:w-auto"
        >
          همه قالب‌ها
          <ArrowLeft className="size-3.5" />
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {/* The busiest category leads, spanning two columns on a wide screen. */}
        <Link
          href={`/dielines/category/${featured.slug}`}
          className="group relative flex flex-col justify-between gap-6 overflow-hidden rounded-3xl bg-linear-to-bl from-primary to-primary/80 p-6 text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 outline-none hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30 focus-visible:ring-2 focus-visible:ring-primary/50 sm:col-span-2 md:row-span-2"
        >
          <span
            aria-hidden
            className="absolute -top-10 -left-10 size-32 rounded-full border-14 border-white/10"
          />

          <div className="relative flex items-start justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium">
              <Sparkles className="size-3" />
              پرقالب‌ترین دسته
            </span>
            <Box className="size-7 opacity-80" strokeWidth={1.7} />
          </div>

          <div className="relative space-y-3">
            <h3 className="text-2xl font-extrabold md:text-3xl">
              {featured.title}
            </h3>
            <p className="text-sm leading-6 text-primary-foreground/75">
              {faDigits(featured.count)} قالب دایلاین آماده در این دسته؛ با خطوط
              برش، تا و بلید استاندارد چاپ.
            </p>
          </div>

          <span className="relative grid size-10 place-items-center rounded-full bg-white/15 transition-all duration-300 group-hover:bg-white group-hover:text-primary">
            <ArrowLeft className="size-5" />
          </span>
        </Link>

        {rest.map(({ title, slug, count }) => (
          <Link
            key={slug}
            href={`/dielines/category/${slug}`}
            className="group flex flex-col justify-between gap-4 rounded-3xl border bg-background p-5 transition-all duration-300 outline-none hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <div className="flex items-start justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <Layers className="size-5" strokeWidth={1.8} />
              </span>
              <ArrowLeft className="size-4 text-muted-foreground/40 transition-all duration-300 group-hover:-translate-x-1 group-hover:text-primary" />
            </div>

            <div className="space-y-2.5">
              <h3 className="text-sm leading-6 font-bold tracking-tight transition-colors group-hover:text-primary">
                {title}
              </h3>

              <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-primary/70 transition-colors duration-500 group-hover:bg-primary"
                  style={{ width: `${Math.round((count / max) * 100)}%` }}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                {faDigits(count)} قالب
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default HomeCategories;
