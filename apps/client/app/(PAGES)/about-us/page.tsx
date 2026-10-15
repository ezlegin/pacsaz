import PacsazLogo from "@/components/PacsazLogo";
import { prisma } from "@repo/db";
import { cn } from "@repo/ui/lib/utils";
import {
  ArrowUpRight,
  Boxes,
  Compass,
  Cpu,
  FolderTree,
  Layers,
  Milestone,
  Ruler,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const fa = (value: number) =>
  value.toLocaleString("fa-IR", { useGrouping: false });

const STARTED_AT = "مهرماه ۱۴۰۴";

const PRINCIPLES = [
  "کاهش خطاهای انسانی در محاسبات فنی دایلاین‌ها",
  "افزایش سرعت و دقت در فرآیند طراحی بسته‌بندی",
  "ارائه خروجی‌های استاندارد و قابل اتکا برای چاپخانه و قالب‌سازی",
  "ایجاد شفافیت در ارتباط میان طراحی، مهندسی و تولید",
];

const ROADMAP = [
  {
    period: STARTED_AT,
    title: "آغاز توسعه‌ی متمرکز",
    text: "تمرکز اصلی بر طراحی هسته‌ای محاسباتی بود که ضمن دقت بالا، شفاف، قابل توسعه و منطبق با نیازهای واقعی صنعت بسته‌بندی باقی بماند.",
  },
  {
    period: "امروز",
    title: "مقیاس‌پذیری و دقت محاسبات",
    text: "ساختار محصول به‌گونه‌ای شکل گرفته که امکان افزودن مدل‌های جدید بسته‌بندی، منطق‌های محاسباتی متفاوت و بهینه‌سازی‌های آینده را فراهم کند.",
  },
  {
    period: "ادامه‌ی مسیر",
    title: "تکامل مستمر",
    text: "پک‌ساز همچنان در مسیر تکامل قرار دارد و توسعه‌ی آن با تمرکز بر بهبود دقت، کارایی و پاسخ‌گویی به نیازهای تخصصی‌تر صنعت بسته‌بندی ادامه خواهد داشت.",
  },
];

const AboutPage = async () => {
  const [dielineCount, usageCategories, featureCount, materialRows] =
    await Promise.all([
      prisma.dieline.count({ where: { active: true } }),
      prisma.dielineCategoryByUsage.count(),
      prisma.tarrifFeature.count(),
      prisma.dieline.findMany({ select: { materials: true } }),
    ]);

  /** `materials` is a comma-separated list per dieline; count the union. */
  const materialCount = new Set(
    materialRows.flatMap((row) =>
      row.materials
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean),
    ),
  ).size;

  const stats = [
    { icon: Layers, value: fa(dielineCount), label: "قالب فعال" },
    { icon: FolderTree, value: fa(usageCategories), label: "دسته‌بندی تخصصی" },
    { icon: Sparkles, value: fa(featureCount), label: "ویژگی حرفه‌ای" },
    { icon: ShieldCheck, value: fa(materialCount), label: "نوع متریال پشتیبانی‌شده" },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-12">
      {/* -------------------------------- hero ------------------------------- */}
      <header className="relative overflow-hidden rounded-3xl border bg-gradient-to-bl from-primary/[0.09] via-background to-background p-8 text-center md:p-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-28 size-80 rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-24 size-80 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6">
          <PacsazLogo scale={1.4} />

          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
            <Sparkles className="size-3.5" />
            از {STARTED_AT} تا امروز
          </span>

          <h1 className="text-2xl font-extrabold leading-tight tracking-tight md:text-4xl">
            درباره‌ی{" "}
            <span className="bg-gradient-to-l from-violet-500 to-purple-600 bg-clip-text text-transparent">
              پک‌ساز
            </span>
          </h1>

          <p className="text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
            پک‌ساز تلاشی است هدفمند برای بازتعریف فرآیند طراحی دایلاین‌های
            بسته‌بندی؛ فرآیندی که در آن دقت فنی، محاسبات میلی‌متری و تصمیم‌های
            مهندسی، نقش تعیین‌کننده‌ای در کیفیت نهایی محصول ایفا می‌کنند.
          </p>
        </div>
      </header>

      {/* -------------------------------- stats ------------------------------ */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ icon: Icon, value, label }) => (
          <div
            key={label}
            className="flex items-center gap-3.5 rounded-2xl border bg-background p-5"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-4.5" strokeWidth={1.8} />
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
      </section>

      {/* ------------------------------- story ------------------------------- */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <article className="space-y-5 rounded-3xl border bg-background p-6 md:p-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Compass className="size-5" strokeWidth={1.9} />
            </span>
            <h2 className="text-lg font-extrabold tracking-tight">
              مسیر شکل‌گیری
            </h2>
          </div>

          <div className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>
              پک‌ساز از یک چالش عملی در دنیای بسته‌بندی آغاز شد؛ جایی که طراحی
              دایلاین‌ها اغلب وابسته به محاسبات دستی، آزمون‌وخطا و تجربه‌های
              پراکنده است. این رویکرد، علاوه بر افزایش احتمال خطا، زمان و انرژی
              قابل توجهی را از فرآیند طراحی و تولید می‌گیرد.
            </p>

            <p>
              هدف از شکل‌گیری پک‌ساز، ایجاد یک زیرساخت نرم‌افزاری دقیق و قابل
              اعتماد بود که بتواند منطق مهندسی بسته‌بندی را به‌صورت سیستماتیک
              پیاده‌سازی کند؛ به‌گونه‌ای که طراحان، قالب‌سازان و واحدهای تولید
              بتوانند با اطمینان بیشتری به خروجی‌ها تکیه کنند.
            </p>

            <p>
              پک‌ساز با اتکا بر تجربه‌های عملی صنعت طراحی و بسته‌بندی و در تعامل
              با مجموعه{" "}
              <a
                href="https://igraphical.ir"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-primary underline-offset-4 hover:underline"
              >
                <strong>آی گرافیکال</strong>
                <ArrowUpRight className="size-3.5" />
              </a>{" "}
              شکل گرفته است؛ مجموعه‌ای فعال در حوزه آموزش و اجرای پروژه‌های
              بسته‌بندی که نقش مهمی در اعتبارسنجی رویکردها و نیازسنجی محصول داشته
              است.
            </p>
          </div>
        </article>

        {/* timeline */}
        <article className="space-y-5 rounded-3xl border bg-background p-6 md:p-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Milestone className="size-5" strokeWidth={1.9} />
            </span>
            <h2 className="text-lg font-extrabold tracking-tight">
              گاه‌شمار
            </h2>
          </div>

          <ol className="relative space-y-7 pr-6">
            <span
              aria-hidden
              className="absolute right-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent"
            />

            {ROADMAP.map((step, index) => (
              <li key={step.title} className="relative space-y-1.5">
                <span
                  className={cn(
                    "absolute -right-6 top-1.5 size-3.5 rounded-full border-2 border-background",
                    index === 0
                      ? "bg-primary"
                      : index === 1
                        ? "bg-primary/60"
                        : "bg-muted-foreground/30",
                  )}
                />

                <p className="text-[10px] font-bold text-primary">
                  {step.period}
                </p>
                <h3 className="text-sm font-bold">{step.title}</h3>
                <p className="text-xs leading-6 text-muted-foreground">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </article>
      </section>

      {/* ----------------------------- philosophy ---------------------------- */}
      <section className="space-y-6 rounded-3xl border bg-background p-6 md:p-8">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Ruler className="size-5" strokeWidth={1.9} />
          </span>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight">
              نگاه و فلسفه محصول
            </h2>
            <p className="text-[11px] text-muted-foreground">
              چرا دایلاین فقط یک فایل فنی نیست
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>
              در پک‌ساز، دایلاین صرفاً یک فایل فنی یا نقشه اجرایی در نظر گرفته
              نمی‌شود. دایلاین نقطه تلاقی خلاقیت بصری، منطق مهندسی و محدودیت‌های
              تولید است؛ جایی که کوچک‌ترین خطا می‌تواند به هزینه‌های جدی در فرآیند
              چاپ و تولید منجر شود.
            </p>
            <p>
              فلسفه پک‌ساز بر این اصل استوار است که ابزارهای فنی باید در خدمت
              تفکر خلاق قرار بگیرند، نه مانعی در برابر آن. به همین دلیل، تمرکز
              اصلی این محصول بر حذف پیچیدگی‌های غیرضروری و انتقال محاسبات حساس
              به یک سیستم قابل اعتماد است.
            </p>
            <p className="text-sm font-medium text-foreground">
              پک‌ساز با این اهداف طراحی شده است:
            </p>
          </div>

          <ul className="space-y-3">
            {PRINCIPLES.map((principle) => (
              <li
                key={principle}
                className="flex items-start gap-3 rounded-2xl border bg-muted/30 p-4"
              >
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="size-3" strokeWidth={2.4} />
                </span>
                <span className="text-xs leading-6 text-muted-foreground">
                  {principle}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="border-t pt-5 text-sm leading-7 text-muted-foreground">
          پک‌ساز تلاش می‌کند در پس‌زمینه فرآیند طراحی حضور داشته باشد؛ ابزاری که
          شاید مستقیماً دیده نشود، اما نقش آن در استحکام، دقت و موفقیت نهایی
          پروژه کاملاً محسوس است.
        </p>
      </section>

      {/* ---------------------------- architecture --------------------------- */}
      <section className="space-y-6 rounded-3xl border bg-background p-6 md:p-8">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Cpu className="size-5" strokeWidth={1.9} />
          </span>
          <h2 className="text-lg font-extrabold tracking-tight">
            توسعه و معماری محصول
          </h2>
        </div>

        <div className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            معماری پک‌ساز با تمرکز بر مقیاس‌پذیری، دقت محاسبات و قابلیت توسعه
            طراحی شده است. ساختار این محصول به‌گونه‌ای شکل گرفته که امکان افزودن
            مدل‌های جدید بسته‌بندی، منطق‌های محاسباتی متفاوت و بهینه‌سازی‌های
            آینده را فراهم کند.
          </p>
          <p>
            در فرآیند توسعه، توجه ویژه‌ای به تجربه کاربری، خوانایی خروجی‌ها و
            انطباق با نیازهای واقعی صنعت بسته‌بندی شده است. هدف نهایی، ایجاد
            ابزاری است که هم از نظر فنی قابل اتکا باشد و هم در عمل، استفاده از آن
            ساده و قابل پیش‌بینی باقی بماند.
          </p>
        </div>
      </section>

      {/* -------------------------------- cta -------------------------------- */}
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-bl from-primary/[0.08] via-background to-background p-6 md:p-8">
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-primary/20">
              <Boxes className="size-5" strokeWidth={1.9} />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-bold">
                کتابخانه‌ی قالب‌ها را ببین
              </p>
              <p className="text-[11px] leading-6 text-muted-foreground">
                دایلاین‌های استاندارد و لایه‌باز، آماده‌ی شخصی‌سازی و چاپ.
              </p>
            </div>
          </div>

          <Link
            href="/dielines"
            className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-violet-500 to-purple-600 px-5 py-2.5 text-xs font-medium text-white shadow-sm transition-all duration-300 hover:gap-3 hover:shadow-lg hover:shadow-primary/30"
          >
            مشاهده قالب‌ها
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

export const metadata = {
  title: "درباره ما",
  description:
    "صفحه درباره ما در وبسایت پکساز. اطلاعات مربوط به مسیر شکل‌گیری، فلسفه و معماری محصول پک‌ساز در این صفحه ارائه شده است.",
};
