import { DielineType } from "@/data/types";
import { materials } from "@repo/dieline-core/data/materials";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Check, ChevronDown, ChevronLeft, Zap } from "lucide-react";
import Link from "next/link";
import SquarePattern from "../SquarePattern";
import HomeDieline from "./HomeDieline";

const LandingPage = async ({ dieline }: { dieline: DielineType | null }) => {
  const CAPABILITIES = [
    "خروجی DXF و SVG آماده‌ی تولید",
    "ابعاد تولید، داخلی و خارجی",
    "کاملاً در مرورگر، بدون نصب",
  ];

  return (
    <div>
      <SquarePattern />

      <div className="flex justify-between items-center ">
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

        <div className="hidden xl:block">
          <HomeDieline dieline={dieline} />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
