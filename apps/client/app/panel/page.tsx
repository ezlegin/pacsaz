import { getSessionUser } from "@repo/auth/session";
import { PlanPeriod, prisma } from "@repo/db";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Check,
  Clock,
  CreditCard,
  Download,
  FileType2,
  FolderDown,
  FolderTree,
  Infinity as InfinityIcon,
  Layers,
  Ruler,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import LastDownloads from "./components/LastDownloads";
import RemainingDownloads from "./components/RemainingDownloads";
import UserSubscriptionCard from "./components/UserSubscriptionCard";
import { StatCard } from "@/components/StatCard";
import { formatDate } from "date-fns";

const fa = (value: number) =>
  value.toLocaleString("fa-IR", { useGrouping: false });

const PLAN_TAGLINE: Record<string, string> = {
  standard: "برای شروع و پروژه‌های سبک",
  pro: "برای طراحان و فریلنسرها",
  organization: "برای تیم‌ها و چاپخانه‌ها",
};

const PLAN_BENEFITS: Record<string, string[]> = {
  standard: ["دسترسی به همه دسته‌ها", "خروجی استاندارد چاپ", "پشتیبانی ایمیلی"],
  pro: ["همه امکانات استاندارد", "ابزارهای حرفه‌ای لایه‌بندی", "اولویت در پشتیبانی"],
  organization: ["همه امکانات پلن حرفه‌ای", "مناسب چند کاربر", "پشتیبانی اختصاصی"],
};

const PROMISES = [
  {
    icon: Layers,
    title: "۱۰۰٪ لایه‌باز",
    text: "خطوط برش، تا و بلید جدا و آماده ویرایش.",
  },
  {
    icon: Ruler,
    title: "ابعاد دقیق و بلید استاندارد",
    text: "بدون آزمون و خطا، آماده ارسال به چاپخانه.",
  },
  {
    icon: FileType2,
    title: "خروجی وکتور",
    text: "AI، PDF و SVG برای طراحی گرافیک.",
  },
  {
    icon: InfinityIcon,
    title: "دسترسی آنی",
    text: "بعد از پرداخت، بدون انتظار دانلود کن.",
  },
];

const Page = async () => {
  const user = await getSessionUser();
  const tarrif = await prisma.tarrif.findMany({
    include: { price: true, fairDownload: true, features: true },
    orderBy: { level: "asc" },
  });

  /* ---------------------------------------------------------------------- */
  /*                          No active subscription                        */
  /* ---------------------------------------------------------------------- */

  if (!user?.plan) {
    const [dielineCount, categoryCount, featureCount] = await Promise.all([
      prisma.dieline.count({ where: { active: true } }),
      prisma.dielineCategoryByUsage.count(),
      prisma.tarrifFeature.count(),
    ]);

    const monthlyPeriod: PlanPeriod = "monthly";
    const cheapest = tarrif[0];

    const stats = [
      {
        icon: FolderTree,
        value: fa(categoryCount),
        label: "دسته‌بندی تخصصی",
      },
      { icon: Layers, value: fa(dielineCount), label: "قالب فعال" },
      { icon: Zap, value: fa(featureCount), label: "ویژگی حرفه‌ای" },
    ];

    return (
      <div className="relative space-y-6">
        {/* ------------------------------- hero ------------------------------ */}
        <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-bl from-primary/[0.10] via-background to-background p-8 md:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-primary/20 blur-3xl"
          />
          {/* faint grid so the panel has texture without imagery */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 size-full text-primary"
          >
            <defs>
              <pattern
                id="panel-empty-grid"
                width="26"
                height="26"
                patternUnits="userSpaceOnUse"
              >
                <path d="M26 0H0V26" fill="none" strokeWidth="1" />
              </pattern>
              <radialGradient id="panel-empty-fade" cx="80%" cy="0%" r="90%">
                <stop offset="0%" stopColor="white" stopOpacity="0.7" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
              <mask id="panel-empty-mask">
                <rect
                  width="100%"
                  height="100%"
                  fill="url(#panel-empty-fade)"
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="url(#panel-empty-grid)"
              className="text-primary/25"
              mask="url(#panel-empty-mask)"
            />
          </svg>

          <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
                <Sparkles className="size-3.5" />
                هنوز اشتراکی فعال نکرده‌ای
              </span>

              <div className="space-y-3">
                <h1 className="text-2xl font-extrabold leading-tight tracking-tight md:text-4xl">
                  با یک اشتراک،{" "}
                  <span className="bg-gradient-to-l from-violet-500 to-purple-600 bg-clip-text text-transparent">
                    بینهایت دایلاین
                  </span>{" "}
                  بساز
                </h1>
                <p className="max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
                  دایلاین‌های آماده و استاندارد پک‌ساز را با ابعاد دلخواه خودت
                  شخصی‌سازی کن، خروجی وکتور بگیر و مستقیم به چاپخانه بفرست. بدون
                  آزمون و خطا، بدون ترسیم از صفر.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link href="/subscription">
                  <Button variant="gradient" size="xl" className="group">
                    مشاهده پلن‌ها و فعال‌سازی
                    <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
                  </Button>
                </Link>

                <Link href="/dielines">
                  <Button variant="outline" size="xl">
                    کتابخانه قالب‌ها را ببین
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {[
                  { icon: ShieldCheck, text: "پرداخت امن بانکی" },
                  { icon: Clock, text: "فعال‌سازی آنی" },
                  { icon: BadgeCheck, text: "مجوز استفاده تجاری" },
                ].map(({ icon: Icon, text }) => (
                  <span
                    key={text}
                    className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
                  >
                    <Icon className="size-3.5 text-primary" strokeWidth={1.9} />
                    {text}
                  </span>
                ))}
              </div>
            </div>

            {/* stat column */}
            <div className="grid gap-3 sm:grid-cols-3 lg:w-56 lg:grid-cols-1">
              {stats.map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl border bg-background/70 p-4 backdrop-blur"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-4" strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-lg font-extrabold leading-tight text-primary">
                      {value}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------- plans ----------------------------- */}
        {tarrif.length > 0 && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-lg font-extrabold tracking-tight">
                  پلنی که به کارت می‌آید را انتخاب کن
                </h2>
                <p className="text-xs text-muted-foreground">
                  هر سه پلن به همه‌ی دسته‌ها دسترسی دارند؛ تفاوت در سهمیه دانلود
                  و امکانات حرفه‌ای است.
                </p>
              </div>

              <Link
                href="/subscription"
                className="text-xs font-medium text-primary hover:underline"
              >
                مقایسه کامل پلن‌ها
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {tarrif.map((plan) => {
                const isRecommended = plan.isRecommended;
                const price = plan.price?.[monthlyPeriod];
                const quota = plan.fairDownload?.[monthlyPeriod];

                return (
                  <Link
                    key={plan.id}
                    href={`/payment?plan=${plan.key}&period=${monthlyPeriod}`}
                    className={cn(
                      "group relative flex flex-col overflow-hidden rounded-3xl p-[1.5px] transition-all duration-300",
                      isRecommended
                        ? "bg-gradient-to-b from-violet-500 to-purple-600 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30"
                        : "bg-border hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10",
                    )}
                  >
                    <div className="flex flex-1 flex-col rounded-[calc(1.5rem-1.5px)] bg-background p-5">
                      {isRecommended && (
                        <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                          <Sparkles className="size-3" />
                          پیشنهاد پک‌ساز
                        </span>
                      )}

                      <div className="space-y-1">
                        <h3 className="text-base font-extrabold">
                          {plan.title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          {PLAN_TAGLINE[plan.key] ?? plan.shortDescription}
                        </p>
                      </div>

                      <div className="mt-4 flex items-end gap-1.5">
                        <span
                          className={cn(
                            "text-3xl font-extrabold tracking-tight",
                            isRecommended &&
                              "bg-gradient-to-l from-violet-600 to-purple-600 bg-clip-text text-transparent",
                          )}
                        >
                          {price
                            ? Math.round(price / 1000).toLocaleString("fa-IR")
                            : "—"}
                        </span>
                        <span className="pb-1 text-xs font-medium">تومان</span>
                        <span className="pb-1 text-[11px] text-muted-foreground">
                          / ماه
                        </span>
                      </div>

                      {quota !== undefined && (
                        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <TrendingUp className="size-3.5 text-primary" />
                          سهمیه دانلود: {fa(quota)} قالب در ماه
                        </p>
                      )}

                      <ul className="mt-5 flex-1 space-y-2.5 border-t pt-5">
                        {(
                          PLAN_BENEFITS[plan.key] ?? [plan.shortDescription]
                        ).map((benefit) => (
                          <li
                            key={benefit}
                            className="flex items-center gap-2 text-xs"
                          >
                            <span className="grid size-4 shrink-0 place-items-center rounded-full bg-green-500/10 text-green-600">
                              <Check className="size-2.5" strokeWidth={3.5} />
                            </span>
                            {benefit}
                          </li>
                        ))}
                      </ul>

                      <span
                        className={cn(
                          "mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all duration-300",
                          isRecommended
                            ? "bg-gradient-to-l from-violet-500 to-purple-600 text-white group-hover:gap-3"
                            : "border bg-background group-hover:border-primary/30 group-hover:text-primary",
                        )}
                      >
                        فعال‌سازی پلن {plan.title}
                        <ArrowLeft className="size-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ----------------------------- promises ---------------------------- */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PROMISES.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="space-y-3 rounded-2xl border bg-background p-5"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" strokeWidth={1.8} />
              </span>
              <div className="space-y-1">
                <h3 className="text-sm font-bold">{title}</h3>
                <p className="text-[11px] leading-5 text-muted-foreground">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* ------------------------------ footer ----------------------------- */}
        <section className="flex flex-col gap-4 rounded-3xl border bg-muted/40 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <CreditCard className="size-5" strokeWidth={1.9} />
            </span>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold">
                {cheapest?.price
                  ? `شروع از ${Math.round(
                      cheapest.price[monthlyPeriod] / 1000,
                    ).toLocaleString("fa-IR")} تومان در ماه`
                  : "بدون هزینه پنهان"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                بدون قرارداد بلندمدت؛ هر زمان که خواستی ارتقا بده یا تمدید کن.
              </p>
            </div>
          </div>

          <Link href="/subscription">
            <Button variant="gradient" className="group w-full sm:w-auto">
              فعال‌سازی اشتراک
              <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
            </Button>
          </Link>
        </section>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                           Active subscription                          */
  /* ---------------------------------------------------------------------- */

  const fairDownload = user.plan.fairDownload;
  const downloaded = user.plan.downloaded;

  const allDownloads = await prisma.downloadHistory.count({
    where: { userId: user.id },
  });
  const downloadRecords = await prisma.downloadHistory.findMany({
    where: { userId: user.id }, // todo
    take: 10,
    include: { dieline: true, settings: true },
    orderBy: { downloadedAt: "desc" },
  });

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-6">
      <div className="xl:col-span-3">
        <UserSubscriptionCard plan={user.plan} tarrif={tarrif} />
      </div>

      <div className="xl:col-span-3">
        <RemainingDownloads
          downloaded={downloaded}
          fairDownload={fairDownload}
        />
      </div>

      <StatCard
        title="دانلود این پلن"
        value={`${downloaded} دانلود`}
        icon={Download}
        className="md:col-span-1 xl:col-span-2"
      />

      <StatCard
        title="تعداد کل دانلودها"
        value={`${allDownloads} دانلود`}
        icon={FolderDown}
        className="md:col-span-1 xl:col-span-2"
      />

      <StatCard
        title="پایان اشتراک"
        value={formatDate(user.plan.endsAt, "PP")}
        icon={Calendar}
        className="md:col-span-2 xl:col-span-2"
      />

      <div className="md:col-span-2 xl:col-span-6">
        <LastDownloads data={downloadRecords} />
      </div>
    </div>
  );
};

export default Page;
