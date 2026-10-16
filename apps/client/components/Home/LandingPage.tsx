import { DIMENSIONS_TYPE } from "@/data/consts";
import { DielineType } from "@/data/types";
import { tuckEnd } from "@/public";
import { materials } from "@repo/dieline-core/data/materials";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { Check, ChevronDown, ChevronLeft, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import HeroShowcase from "./HeroShowcase";
import HomeDieline from "./HomeDieline";

const CAPABILITIES = [
  "خروجی DXF و SVG آماده‌ی تولید",
  "ابعاد تولید، داخلی و خارجی",
  "کاملاً در مرورگر، بدون نصب",
];

/**
 * The landing hero.
 *
 * Laid out as a drafting board: a faint blueprint grid behind everything, the
 * pitch on one side, and the product itself on the other — the dieline the
 * visitor can drag from flat to folded, showing the real measurements stored on
 * that record. Below it sits the live editor, so the page goes from the result to
 * the tool without a navigation.
 */
const LandingPage = async ({ dieline }: { dieline: DielineType | null }) => {
  const settings = dieline?.settings ?? null;

  const material = settings
    ? materials.find((item) => item.value === settings.material)
    : undefined;

  const dimensionType = DIMENSIONS_TYPE.find(
    (type) => type.key === settings?.dimensionType,
  )?.label;

  const specs = settings
    ? [
        {
          label: "ابعاد",
          value: `${settings.length} × ${settings.width} × ${settings.height} mm`,
        },
        { label: "نوع ابعاد", value: dimensionType ?? "—" },
        { label: "ماده", value: material?.label ?? settings.material },
        { label: "بلید", value: `${settings.bleed} mm` },
      ]
    : [];

  const flatImage = dieline?.dielineImage?.url;
  const foldedImage = dieline?.modelImage?.url;
  const hasShowcase = Boolean(flatImage && foldedImage && specs.length > 0);

  return (
    <div className="relative">
      {/* ------------------------------------------------------------------ */}
      {/*  Ambient drafting board                                            */}
      {/* ------------------------------------------------------------------ */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-[34rem] bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[34px_34px] opacity-50 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
        <div className="absolute -top-40 right-1/4 size-[30rem] rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute top-32 -left-20 size-[22rem] rounded-full bg-chart-2/10 blur-3xl" />
      </div>

      <div className="grid items-center gap-12 xl:grid-cols-[1.02fr_1fr] xl:gap-16">
        {/* ---------------------------------------------------------------- */}
        {/*  Pitch                                                           */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex flex-col items-center gap-7 text-center xl:items-start xl:text-right">
          <Link
            href="/dielines"
            className="animate-rise group w-fit [animation-delay:0ms]"
          >
            <Badge
              variant="outline"
              className="gap-2 bg-background/80 py-1 pr-1 pl-3 backdrop-blur transition-shadow hover:shadow-md"
            >
              <Badge variant="lightPrimary" className="gap-1">
                <Zap className="size-3.5" />
                پک‌ساز
              </Badge>
              <span className="text-xs font-medium">
                ویرایشگر زنده + کتابخانه‌ی قالب‌های آماده
              </span>
              <ChevronLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            </Badge>
          </Link>

          <h1 className="animate-rise text-4xl leading-[1.25] font-bold [animation-delay:60ms] sm:text-5xl xl:text-[3.4rem]">
            طراحی دایلاین،
            <br />
            <span className="relative inline-block">
              <span className="bg-linear-to-l from-primary to-primary/60 bg-clip-text text-transparent">
                بدون آزمون و خطا!
              </span>

              {/* Drawn by hand, then by CSS: the stroke paints itself on. */}
              <svg
                aria-hidden
                viewBox="0 0 320 14"
                fill="none"
                preserveAspectRatio="none"
                className="absolute -bottom-2 left-0 h-3 w-full animate-draw"
                style={{ "--draw-length": 330 } as React.CSSProperties}
              >
                <path
                  d="M3 9C62 4 124 2 186 5c42 2 90 4 131 0"
                  stroke="var(--primary)"
                  strokeOpacity="0.5"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={330}
                />
              </svg>
            </span>
          </h1>

          <p className="animate-rise max-w-xl text-base text-muted-foreground [animation-delay:120ms] sm:text-lg">
            قالب بسته‌بندی را در مرورگر بسازید؛ ابعاد دقیق، ماده‌ی چاپی و خروجی
            آماده‌ی تولید — بدون یک ورق کاغذ هدر.
          </p>

          <div className="animate-rise flex flex-wrap items-center justify-center gap-3 [animation-delay:180ms]">
            <Link
              href="/dieline/tuck-end"
              className="relative overflow-hidden rounded-md"
            >
              <Button className="w-40" variant="gradient">
                ساخت اولین قالب
              </Button>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 w-12 animate-sheen bg-white/25 blur-md"
              />
            </Link>

            <Link href="/dielines">
              <Button className="w-40" variant="secondary">
                مشاهده‌ی قالب‌ها
              </Button>
            </Link>

            <a
              href="#subscription"
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              مقایسه‌ی پلن‌ها
              <ChevronDown className="size-3.5" />
            </a>
          </div>

          <ul className="animate-rise flex flex-wrap items-center justify-center gap-x-5 gap-y-2 [animation-delay:240ms] xl:justify-start">
            {CAPABILITIES.map((capability) => (
              <li
                key={capability}
                className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm"
              >
                <Check className="size-3.5 text-primary" strokeWidth={3} />
                {capability}
              </li>
            ))}
          </ul>

          <div className="animate-rise flex flex-wrap items-center justify-center gap-2 [animation-delay:300ms] xl:justify-start">
            <span className="text-xs text-muted-foreground">
              مواد پشتیبانی‌شده:
            </span>
            {materials.slice(0, 5).map((item) => (
              <span
                key={item.value}
                className="rounded-full border bg-background/70 px-2.5 py-1 text-[11px] backdrop-blur"
              >
                {item.label}
              </span>
            ))}
            <span className="text-[11px] text-muted-foreground">
              و {materials.length - 5} ماده‌ی دیگر
            </span>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/*  Product theatre                                                 */}
        {/* ---------------------------------------------------------------- */}
        {hasShowcase ? (
          <HeroShowcase
            flatImage={flatImage!}
            foldedImage={foldedImage!}
            flatLabel="دایلاین تخت"
            foldedLabel="جعبه‌ی ساخته‌شده"
            specs={specs}
          />
        ) : (
          // Without both renders there is nothing to reveal, so fall back to the
          // live editor rather than showing half a comparison.
          <div className={cn("relative")}>
            {dieline ? (
              <HomeDieline dieline={dieline} />
            ) : (
              <Image
                src={tuckEnd}
                alt="دایلاین"
                width={800}
                height={800}
                className="mx-auto h-auto w-full max-w-xl"
                priority
              />
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*  The tool itself                                                   */}
      {/* ------------------------------------------------------------------ */}
      <section className="mt-20 md:mt-28">
        <div className="overflow-hidden rounded-3xl border bg-card shadow-xl shadow-primary/5">
          <div className="flex flex-col gap-3 border-b bg-background/70 px-6 py-5 backdrop-blur md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold sm:text-xl">
                همین حالا روی قالب کار کنید
              </h2>
              <p className="text-sm text-muted-foreground">
                ابعاد را عوض کنید و نتیجه را زنده ببینید — همان قالب، در همین
                صفحه.
              </p>
            </div>

            <Link href="/dielines" className="w-fit">
              <Button variant="secondary">
                قالب‌های دیگر
                <ChevronLeft className="size-4" />
              </Button>
            </Link>
          </div>

          <div className="bg-muted/20">
            <HomeDieline dieline={dieline} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
