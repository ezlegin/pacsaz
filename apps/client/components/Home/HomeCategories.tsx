import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import {
  ArrowLeft,
  Box,
  Layers,
  Mail,
  Scissors,
  Store,
  Truck,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

type Category = {
  title: string;
  slug: string;
  count: number;
  icon: LucideIcon;
};

const dielineCategories: Category[] = [
  {
    title: "جعبه‌های تاشو",
    slug: "folding-boxes",
    count: 184,
    icon: Box,
  },
  {
    title: "جعبه‌های نمایشی",
    slug: "display-boxes",
    count: 126,
    icon: Store,
  },
  {
    title: "جعبه‌های پستی",
    slug: "postal-boxes",
    count: 72,
    icon: Truck,
  },
  {
    title: "پاکت و اسلیو",
    slug: "sleeves-envelopes",
    count: 95,
    icon: Mail,
  },
  {
    title: "جعبه‌های صنعتی (FEFCO)",
    slug: "fefco-boxes",
    count: 210,
    icon: Layers,
  },
];

const faDigits = (value: number) =>
  value.toLocaleString("fa-IR", { useGrouping: false });

const HomeCategories = () => {
  const featured = dielineCategories[0]!;
  const rest = dielineCategories.slice(1);
  const FeaturedIcon = featured.icon;
  const total = dielineCategories.reduce((sum, c) => sum + c.count, 0);
  const max = Math.max(...dielineCategories.map((c) => c.count));

  return (
    <section className="mx-auto w-full max-w-7xl">
      <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-primary/25">
            <Scissors className="size-6" strokeWidth={1.9} />
          </span>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              دسته‌بندی قالب‌ها
            </h2>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              {faDigits(total)} قالب لایه‌باز و آماده شخصی‌سازی، دسته‌بندی‌شده
              بر اساس نوع بسته‌بندی.
            </p>
          </div>
        </div>

        <Link href="/dielines" className="w-full sm:w-auto">
          <Button variant="gradient" className="w-full sm:w-auto">
            همه دسته‌ها
            <ArrowLeft />
          </Button>
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:grid-rows-2">
        <Link
          href={`/dielines?category=${featured.slug}`}
          className={cn(
            "group relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 sm:col-span-2 sm:row-span-2 md:col-span-2 md:row-span-2",
            "bg-linear-to-bl from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20",
            "transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            "hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30",
          )}
        >
          <span
            aria-hidden
            className="size-32 absolute -top-10 -left-10 rounded-full border-14 border-white/10"
          />

          <div className="relative flex items-start justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium">
              محبوب‌ترین دسته
            </span>
            <FeaturedIcon className="size-7 opacity-80" strokeWidth={1.7} />
          </div>

          <div className="relative space-y-3">
            <h3 className="text-2xl font-extrabold md:text-3xl">
              {featured.title}
            </h3>
            <p className="max-w-xs text-sm leading-6 text-primary-foreground/75">
              پرکاربردترین خانواده دایلاین؛ از جعبه‌های تک‌نفره خرده‌فروشی تا
              بسته‌بندی چندتایی، با خطوط برش و بلید استاندارد چاپ.
            </p>
          </div>

          <div className="relative flex items-end justify-between gap-4 border-t border-white/20 pt-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold">
                {faDigits(featured.count)}
              </span>
              <span className="text-xs text-primary-foreground/70">قالب</span>
            </div>

            <span className="grid size-10 place-items-center rounded-full bg-white/15 transition-all duration-300 group-hover:bg-white group-hover:text-primary">
              <ArrowLeft className="size-5" />
            </span>
          </div>
        </Link>

        {rest.map(({ title, slug, count, icon: Icon }) => (
          <Link
            key={slug}
            href={`/dielines?category=${slug}`}
            className={cn(
              "group flex flex-col justify-between gap-4 rounded-3xl border bg-background p-5 transition-all duration-300",
              "outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              "hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10",
            )}
          >
            <div className="flex items-start justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-5" strokeWidth={1.8} />
              </span>
              <ArrowLeft className="size-4 text-muted-foreground/40 transition-all duration-300 group-hover:-translate-x-1 group-hover:text-primary" />
            </div>

            <div className="space-y-2.5">
              <h3 className="text-sm font-bold leading-6 tracking-tight transition-colors group-hover:text-primary">
                {title}
              </h3>

              <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-primary/70 transition-all duration-500 group-hover:bg-primary"
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
