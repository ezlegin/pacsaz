import { admin } from "@/data/admin";
import { mainURL } from "@/data/envs";
import {
  EmptyState,
  KpiCard,
  MetricRow,
  Panel,
  PanelHeader,
  RankList,
  StatusPill,
  TrendChart,
} from "@/components/dashboard/DashboardUI";
import { PlanPeriod, PlanKey, prisma } from "@repo/db";
import { formatPrice } from "@repo/lib/utils/formatPrice";
import { cn } from "@repo/ui/lib/utils";
import {
  ArrowUpRight,
  BarChart3,
  Boxes,
  CalendarClock,
  CreditCard,
  Database,
  EyeOff,
  FolderTree,
  Gauge,
  ImageOff,
  Layers,
  Package,
  RefreshCcw,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";

/** Always render from live data — never bake dashboard numbers into a build. */
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

const fa = (value: number) =>
  Math.round(value).toLocaleString("fa-IR", { useGrouping: true });

/** `formatPrice` always emits Latin digits; the admin UI is Persian. */
const MONEY = (value: number) =>
  formatPrice(Math.round(value), false, "fa")
    .replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]!)
    .trim() || "۰";

const monthLabel = (date: Date) =>
  date.toLocaleDateString("fa-IR", { month: "short" });

const dayLabel = (date: Date) =>
  date.toLocaleDateString("fa-IR", { month: "2-digit", day: "2-digit" });

const percent = (part: number, whole: number) =>
  whole > 0 ? Math.round((part / whole) * 100) : 0;

const PLAN_LABEL: Record<PlanKey, string> = {
  standard: "استاندارد",
  pro: "حرفه‌ای",
  organization: "سازمانی",
};

const PERIOD_LABEL: Record<PlanPeriod, string> = {
  monthly: "ماهیانه",
  threeMonth: "۳ ماهه",
  annual: "سالانه",
};

/** Local-time month window; avoids UTC drift on the boundaries. */
const monthWindow = (offset: number) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1);
  return { start, end };
};

const percentDelta = (current: number, previous: number) =>
  previous === 0 ? null : ((current - previous) / previous) * 100;

/** Billed amounts are per period; normalise everything to a monthly figure. */
const MONTHS_IN_PERIOD: Record<PlanPeriod, number> = {
  monthly: 1,
  threeMonth: 3,
  annual: 12,
};

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

const page = async () => {
  const now = new Date();
  const last30 = new Date(now.getTime() - 30 * 864e5);
  const thisMonth = monthWindow(0);
  const lastMonth = monthWindow(1);

  const [
    activePlans,
    newUsers30,
    newUsersPrev30,
    thisMonthRevenue,
    lastMonthRevenue,
    allTimeRevenue,
    paymentsByStatus,
    paymentsAgg,
    recentPayments,
    dielineStats,
    activeDielineCount,
    withDielineImage,
    withModelImage,
    categoriesByUsage,
    categoriesByModel,
    topDielines,
    downloadTotal,
    downloads30,
    quotaAgg,
    planHistory,
    userCount,
    userTypeSplit,
    couponUsage,
  ] = await Promise.all([
    prisma.plan.findMany({
      where: { status: "active", endsAt: { gt: now } },
      select: {
        key: true,
        period: true,
        type: true,
        downloaded: true,
        fairDownload: true,
        endsAt: true,
        payment: { select: { total: true } },
      },
    }),
    prisma.user.count({ where: { joinedAt: { gte: last30 } } }),
    prisma.user.count({
      where: {
        joinedAt: { gte: new Date(last30.getTime() - 30 * 864e5), lt: last30 },
      },
    }),
    prisma.payment.aggregate({
      where: {
        status: "success",
        updatedAt: { gte: thisMonth.start, lt: thisMonth.end },
      },
      _sum: { total: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: "success",
        updatedAt: { gte: lastMonth.start, lt: lastMonth.end },
      },
      _sum: { total: true },
    }),
    prisma.payment.aggregate({
      where: { status: "success" },
      _sum: { total: true },
      _avg: { total: true },
    }),
    prisma.payment.groupBy({ by: ["status"], _count: true }),
    prisma.payment.aggregate({
      where: { status: "success" },
      _sum: { totalDiscount: true, discountCodeAmount: true },
      _count: true,
    }),
    prisma.payment.findMany({
      orderBy: { id: "desc" },
      take: 6,
      select: {
        id: true,
        total: true,
        status: true,
        period: true,
        createdAt: true,
        tarrif: { select: { key: true } },
        user: { select: { fullName: true } },
      },
    }),
    prisma.dieline.aggregate({ _count: { _all: true } }),
    prisma.dieline.count({ where: { active: true } }),
    prisma.dielineImage.count(),
    prisma.modelImage.count(),
    prisma.dielineCategoryByUsage.findMany({
      select: { id: true, title: true, _count: { select: { dieline: true } } },
      orderBy: { title: "asc" },
    }),
    prisma.dielineCategoryByModel.findMany({
      select: { id: true, title: true, _count: { select: { dieline: true } } },
      orderBy: { title: "asc" },
    }),
    prisma.dieline.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        active: true,
        createdAt: true,
        _count: {
          select: {
            downloadHistory: true,
            favedDieline: true,
            savedDielines: true,
          },
        },
      },
    }),
    prisma.downloadHistory.count(),
    prisma.downloadHistory.count({ where: { downloadedAt: { gte: last30 } } }),
    prisma.plan.aggregate({
      where: { status: "active" },
      _sum: { downloaded: true, fairDownload: true },
    }),
    prisma.plan.groupBy({ by: ["period"], _count: true }),
    prisma.user.count(),
    prisma.user.groupBy({ by: ["userType"], _count: true }),
    prisma.coupon.findMany({
      select: { code: true, used: true, limit: true, type: true, amount: true },
      orderBy: { used: "desc" },
      take: 5,
    }),
  ]);

  /* ----------------------------- derived values ---------------------------- */

  const revenueThisMonth = thisMonthRevenue._sum.total ?? 0;
  const revenueLastMonth = lastMonthRevenue._sum.total ?? 0;
  const revenueDelta = percentDelta(revenueThisMonth, revenueLastMonth);

  const successCount =
    paymentsByStatus.find((p) => p.status === "success")?._count ?? 0;
  const failedCount =
    paymentsByStatus.find((p) => p.status === "failed")?._count ?? 0;
  const pendingCount =
    paymentsByStatus.find((p) => p.status === "pending")?._count ?? 0;
  const canceledCount =
    paymentsByStatus.find((p) => p.status === "canceled")?._count ?? 0;
  const couldNotInitiate =
    paymentsByStatus.find((p) => p.status === "could_not_initiate")?._count ??
    0;
  const paymentTotal = paymentsByStatus.reduce((sum, p) => sum + p._count, 0);
  const successRate = percent(successCount, paymentTotal);

  const dielineTotal = dielineStats._count._all;
  const missingImages = Math.max(dielineTotal - withModelImage, 0);
  const inactiveDielines = dielineTotal - activeDielineCount;

  const quotaDownloaded = quotaAgg._sum.downloaded ?? 0;
  const quotaTotal = quotaAgg._sum.fairDownload ?? 0;

  const byPlanKey = (key: PlanKey) =>
    activePlans.filter((p) => p.key === key).length;

  /** Monthly recurring revenue, normalised from each plan's billed period. */
  const activeCount = activePlans.length;
  const mrr = activePlans.reduce(
    (sum, plan) =>
      sum + (plan.payment?.total ?? 0) / MONTHS_IN_PERIOD[plan.period],
    0,
  );

  // last 8 months of revenue, newest last — one grouped query, not eight
  const revenueTrend = await (async () => {
    const { start: windowStart } = monthWindow(7);
    const rows = await prisma.payment.findMany({
      where: {
        status: "success",
        updatedAt: { gte: windowStart },
      },
      select: { total: true, updatedAt: true },
    });

    return Array.from({ length: 8 }, (_, index) => {
      const { start, end } = monthWindow(7 - index);
      const bucket = rows.filter(
        (row) => row.updatedAt >= start && row.updatedAt < end,
      );
      return {
        label: monthLabel(start),
        value: bucket.reduce((sum, row) => sum + row.total, 0),
        secondary: bucket.length,
      };
    });
  })();

  const topByDownloads = [...topDielines]
    .sort((a, b) => b._count.downloadHistory - a._count.downloadHistory)
    .slice(0, 5);
  const topByFaves = [...topDielines]
    .filter((d) => d._count.favedDieline > 0)
    .sort((a, b) => b._count.favedDieline - a._count.favedDieline)
    .slice(0, 5);

  const usageMax = Math.max(
    ...categoriesByUsage.map((c) => c._count.dieline),
    1,
  );
  const modelMax = Math.max(
    ...categoriesByModel.map((c) => c._count.dieline),
    1,
  );
  const emptyUsage = categoriesByUsage.filter((c) => c._count.dieline === 0);
  const emptyModel = categoriesByModel.filter((c) => c._count.dieline === 0);

  const needsAttention = [
    inactiveDielines > 0 && {
      icon: EyeOff,
      title: `${fa(inactiveDielines)} قالب غیرفعال`,
      hint: "در فروشگاه نمایش داده نمی‌شوند.",
      href: "/dielines",
    },
    missingImages > 0 && {
      icon: ImageOff,
      title: `${fa(missingImages)} قالب بدون تصویر مدل`,
      hint: "کارت قالب در فروشگاه بدون پیش‌نمایش می‌ماند.",
      href: "/dielines",
    },
    emptyUsage.length > 0 && {
      icon: FolderTree,
      title: `${fa(emptyUsage.length)} دسته بدون قالب`,
      hint: `از ${fa(categoriesByUsage.length)} دسته‌ی مصرفی خالی است.`,
      href: "/categories",
    },
    emptyModel.length > 0 && {
      icon: Layers,
      title: `${fa(emptyModel.length)} مدل بدون قالب`,
      hint: `از ${fa(categoriesByModel.length)} مدل تعریف‌شده خالی است.`,
      href: "/categories",
    },
  ].filter(Boolean) as {
    icon: typeof EyeOff;
    title: string;
    hint: string;
    href: string;
  }[];

  /* ---------------------------------- view --------------------------------- */

  return (
    <div dir="rtl" className="space-y-6 ">
      {/* -------------------------------- header ------------------------------ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            {now.toLocaleDateString("fa-IR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight">
            سلام {admin.fullName.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            نمای کلی فروشگاه، اشتراک‌ها و سلامت کتابخانه‌ی قالب‌ها.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dielines"
            className="inline-flex items-center gap-1.5 rounded-xl border bg-background px-3 py-2 text-xs font-medium transition-colors hover:border-primary/30 hover:text-primary"
          >
            <Boxes className="size-3.5" />
            کتابخانه قالب‌ها
          </Link>
          <Link
            href={mainURL}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border bg-background px-3 py-2 text-xs font-medium transition-colors hover:border-primary/30 hover:text-primary"
          >
            <ArrowUpRight className="size-3.5" />
            مشاهده سایت
          </Link>
        </div>
      </div>

      {/* --------------------------------- KPIs ------------------------------- */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          tone="primary"
          icon={CreditCard}
          label="درآمد این ماه"
          value={MONEY(revenueThisMonth)}
          unit="تومان"
          delta={
            revenueDelta === null
              ? null
              : { value: revenueDelta, label: "نسبت به ماه قبل" }
          }
        />
        <KpiCard
          icon={Users}
          label="اشتراک‌های فعال"
          value={fa(activePlans.length)}
          unit="اشتراک"
          hint={
            quotaTotal > 0
              ? `${fa(quotaDownloaded)} از ${fa(quotaTotal)} دانلود پلن‌ها مصرف شده`
              : "هنوز دانلودی ثبت نشده است."
          }
        />
        <KpiCard
          icon={Wallet}
          label="درآمد کل"
          value={MONEY(allTimeRevenue._sum.total ?? 0)}
          unit="تومان"
          hint={
            allTimeRevenue._avg.total
              ? `میانگین هر پرداخت ${MONEY(allTimeRevenue._avg.total)} تومان`
              : "پرداخت موفقی ثبت نشده است."
          }
        />
        <KpiCard
          icon={Gauge}
          label="نرخ پرداخت موفق"
          value={`${fa(successRate)}٪`}
          hint={`${fa(successCount)} موفق از ${fa(paymentTotal)} تراکنش`}
          tone={successRate < 60 && paymentTotal > 0 ? "warning" : "plain"}
        />
      </div>

      {/* ------------------------- revenue + subscriptions -------------------- */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <PanelHeader
            title="روند درآمد ۸ ماه اخیر"
            hint="فقط پرداخت‌های موفق، بر اساس تاریخ تایید"
            action={
              <span className="inline-flex items-center gap-1.5 rounded-xl border bg-muted/40 px-2.5 py-1 text-[11px] font-medium">
                <TrendingUp className="size-3.5 text-primary" />
                {MONEY(revenueTrend[revenueTrend.length - 1]?.value ?? 0)} تومان
              </span>
            }
          />

          <TrendChart
            data={revenueTrend}
            emptyIcon={BarChart3}
            emptyLabel="هنوز پرداخت موفقی در این بازه ثبت نشده است."
          />

          <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-4">
            {[
              { label: "این ماه", value: MONEY(revenueThisMonth) },
              { label: "ماه قبل", value: MONEY(revenueLastMonth) },
              {
                label: "میانگین ماه‌های فعال",
                value: MONEY(
                  revenueTrend.some((m) => m.value > 0)
                    ? revenueTrend.reduce((s, m) => s + m.value, 0) /
                        revenueTrend.filter((m) => m.value > 0).length
                    : 0,
                ),
              },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <p className="text-[10px] text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-sm font-bold">{item.value}</p>
                <p className="text-[10px] text-muted-foreground">تومان</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="ترکیب اشتراک‌های فعال"
            hint={`${fa(activePlans.length)} اشتراک در جریان`}
          />

          <div className="space-y-4">
            {(["standard", "pro", "organization"] as PlanKey[]).map((key) => {
              const count = byPlanKey(key);
              return (
                <MetricRow
                  key={key}
                  label={PLAN_LABEL[key]}
                  value={fa(count)}
                  sub="اشتراک"
                  percent={percent(count, activePlans.length)}
                  tone={count > 0 ? "primary" : "muted"}
                />
              );
            })}
          </div>

          <div className="mt-5 space-y-3 border-t pt-4">
            <p className="text-[11px] font-medium text-muted-foreground">
              به تفکیک دوره
            </p>
            {(["monthly", "threeMonth", "annual"] as PlanPeriod[]).map(
              (period) => {
                const count =
                  planHistory.find((p) => p.period === period)?._count ?? 0;
                return (
                  <MetricRow
                    key={period}
                    label={PERIOD_LABEL[period]}
                    value={fa(count)}
                    sub="کل تاریخچه"
                    percent={percent(
                      count,
                      planHistory.reduce((s, p) => s + p._count, 0),
                    )}
                  />
                );
              },
            )}
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
            <CalendarClock className="size-4 shrink-0 text-primary" />
            <p className="text-[11px] leading-5 text-muted-foreground">
              {activePlans.length === 0
                ? "در حال حاضر هیچ اشتراک فعالی وجود ندارد."
                : `نزدیک‌ترین انقضا: ${[...activePlans]
                    .sort((a, b) => a.endsAt.getTime() - b.endsAt.getTime())[0]
                    ?.endsAt.toLocaleDateString("fa-IR")}`}
            </p>
          </div>
        </Panel>
      </div>

      {/* --------------------------- payments + health ------------------------ */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel>
          <PanelHeader title="سلامت پرداخت‌ها" hint="توزیع وضعیت تراکنش‌ها" />

          <div className="space-y-4">
            {[
              { label: "موفق", value: successCount, tone: "primary" as const },
              { label: "ناموفق", value: failedCount },
              { label: "در انتظار", value: pendingCount },
              { label: "لغو شده", value: canceledCount },
              { label: "درگاه بی‌پاسخ", value: couldNotInitiate },
            ].map((row) => (
              <MetricRow
                key={row.label}
                label={row.label}
                value={fa(row.value)}
                sub="تراکنش"
                percent={percent(row.value, paymentTotal)}
                tone={row.tone ?? "plain"}
              />
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 border-t pt-4">
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground">
                تخفیف اعمال‌شده
              </p>
              <p className="text-xs font-bold">
                {MONEY(paymentsAgg._sum.discountCodeAmount ?? 0)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground">
                کدهای تخفیف فعال
              </p>
              <p className="text-xs font-bold">{fa(couponUsage.length)}</p>
            </div>
          </div>
        </Panel>

        <Panel className="xl:col-span-2">
          <PanelHeader
            title="دسترسی سریع به وضعیت سیستم"
            hint="مواردی که همین حالا به توجه نیاز دارند"
          />

          {needsAttention.length === 0 ? (
            <EmptyState
              icon={Database}
              title="همه‌چیز مرتب است."
              hint="قالب غیرفعال، تصویر ناقص یا دسته‌ی خالی وجود ندارد."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {needsAttention.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex items-start gap-3 rounded-xl border bg-muted/20 p-4 transition-colors hover:border-primary/30 hover:bg-primary/4"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
                    <item.icon className="size-4" strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-semibold">{item.title}</p>
                    <p className="text-[11px] leading-5 text-muted-foreground">
                      {item.hint}
                    </p>
                  </div>
                  <ArrowUpRight className="ml-auto size-3.5 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-primary" />
                </Link>
              ))}
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4 sm:grid-cols-4">
            {[
              { label: "کل قالب‌ها", value: fa(dielineTotal), icon: Package },
              { label: "فعال", value: fa(activeDielineCount), icon: Boxes },
              { label: "با تصویر", value: fa(withDielineImage), icon: Layers },
              {
                label: "دسته‌های مصرفی",
                value: fa(categoriesByUsage.length),
                icon: FolderTree,
              },
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <item.icon className="size-3.5 text-primary" />
                <p className="text-sm font-bold">{item.value}</p>
                <p className="text-[10px] text-muted-foreground">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* ---------------------------- content + ops --------------------------- */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel>
          <PanelHeader
            title="پرکاربردترین قالب‌ها"
            hint="بر اساس تعداد دانلود"
            action={
              <Link
                href="/dielines"
                className="text-[11px] font-medium text-primary hover:underline"
              >
                همه
              </Link>
            }
          />

          <RankList
            items={topByDownloads.map((d) => ({
              id: d.id,
              title: d.title,
              sub: `${d.active ? "فعال" : "غیرفعال"} · ${fa(d._count.savedDielines)} ذخیره`,
              value: `${fa(d._count.downloadHistory)} دانلود`,
            }))}
            empty={
              <EmptyState
                icon={Package}
                title="هنوز دانلودی ثبت نشده است."
                hint="با اولین دانلود کاربران، رتبه‌بندی این بخش ساخته می‌شود."
              />
            }
          />
        </Panel>

        <Panel>
          <PanelHeader
            title="محبوب‌ترین قالب‌ها"
            hint="بر اساس افزودن به علاقه‌مندی‌ها"
          />

          <RankList
            items={topByFaves.map((d) => ({
              id: d.id,
              title: d.title,
              sub: `${fa(d._count.downloadHistory)} دانلود`,
              value: `${fa(d._count.favedDieline)} ❤`,
            }))}
            empty={
              <EmptyState
                icon={EyeOff}
                title="هنوز قالبی نشان نشده است."
                hint="آمار «پربازدیدترین» در دیتابیس ثبت نمی‌شود، بنابراین نمایش داده نمی‌شود."
              />
            }
          />
        </Panel>

        <Panel>
          <PanelHeader
            title="مصرف سهمیه دانلود"
            hint="بر پایه‌ی اشتراک‌های فعال"
          />

          {quotaTotal === 0 ? (
            <EmptyState
              icon={Gauge}
              title="اشتراک فعالی برای سنجش وجود ندارد."
            />
          ) : (
            <div className="space-y-5">
              <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-primary">
                    {fa(quotaDownloaded)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    از {fa(quotaTotal)} دانلود
                  </span>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                  {fa(percent(quotaDownloaded, quotaTotal))}٪
                </span>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <span
                  style={{
                    width: `${Math.min(percent(quotaDownloaded, quotaTotal), 100)}%`,
                  }}
                  className="block h-full rounded-full bg-linear-to-l from-violet-500 to-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 border-t pt-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground">
                    دانلود ۳۰ روز اخیر
                  </p>
                  <p className="text-sm font-bold">{fa(downloads30)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground">
                    کل دانلودهای ثبت‌شده
                  </p>
                  <p className="text-sm font-bold">{fa(downloadTotal)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground">
                    کاربران ۳۰ روز اخیر
                  </p>
                  <p className="flex items-center gap-1.5 text-sm font-bold">
                    <UserPlus className="size-3.5 text-primary" />
                    {fa(newUsers30)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground">
                    کل کاربران
                  </p>
                  <p className="text-sm font-bold">{fa(userCount)}</p>
                </div>
              </div>

              {newUsersPrev30 > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  رشد کاربران:{" "}
                  {fa(percent(newUsers30 - newUsersPrev30, newUsersPrev30))}٪
                  نسبت به ۳۰ روز قبل
                </p>
              )}
            </div>
          )}
        </Panel>
      </div>

      {/* --------------------------- categories + feed ------------------------ */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel>
          <PanelHeader
            title="پوشش دسته‌های مصرفی"
            hint={`${fa(categoriesByUsage.length)} دسته`}
          />
          <div className="max-h-72 space-y-4 overflow-y-auto pl-1 custom-scrollbar">
            {categoriesByUsage.map((category) => (
              <MetricRow
                key={category.id}
                label={category.title}
                value={fa(category._count.dieline)}
                sub="قالب"
                percent={percent(category._count.dieline, usageMax)}
                tone={category._count.dieline === 0 ? "muted" : "primary"}
              />
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="پوشش مدل‌های قالب"
            hint={`${fa(categoriesByModel.length)} مدل`}
          />
          <div className="space-y-4">
            {categoriesByModel.map((category) => (
              <MetricRow
                key={category.id}
                label={category.title}
                value={fa(category._count.dieline)}
                sub="قالب"
                percent={percent(category._count.dieline, modelMax)}
                tone={category._count.dieline === 0 ? "muted" : "primary"}
              />
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="آخرین پرداخت‌ها"
            hint="۶ تراکنش اخیر"
            action={
              <Link
                href="/payments"
                className="text-[11px] font-medium text-primary hover:underline"
              >
                همه
              </Link>
            }
          />

          {recentPayments.length === 0 ? (
            <EmptyState icon={CreditCard} title="پرداختی ثبت نشده است." />
          ) : (
            <ul className="divide-y">
              {recentPayments.map((payment) => (
                <li key={payment.id} className="flex items-center gap-3 py-2.5">
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-xl text-[10px] font-bold",
                      "bg-primary/10 text-primary",
                    )}
                  >
                    {payment.tarrif.key.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">
                      {payment.user.fullName}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {PLAN_LABEL[payment.tarrif.key]} ·{" "}
                      {PERIOD_LABEL[payment.period]} ·{" "}
                      {dayLabel(payment.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-xs font-bold">
                      {MONEY(payment.total)}
                    </span>
                    <StatusPill status={payment.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* ------------------------------- footnote ---------------------------- */}
      <Panel className="bg-muted/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <RefreshCcw className="size-4" />
            </span>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold">
                {fa(activeCount)} اشتراک فعال · درآمد ماهانه معادل {MONEY(mrr)}{" "}
                تومان
              </p>
              <p className="text-[11px] text-muted-foreground">
                این داشبورد فقط از داده‌های موجود در دیتابیس ساخته می‌شود؛ آمار
                بازدید صفحه در سیستم ثبت نمی‌شود.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {userTypeSplit.map((row) => (
              <span
                key={String(row.userType)}
                className="rounded-full border bg-background px-2.5 py-1 text-[10px] font-medium"
              >
                {String(row.userType ?? "نامشخص")}: {fa(row._count)}
              </span>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
};

export default page;
