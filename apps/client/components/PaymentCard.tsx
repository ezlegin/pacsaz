"use client";

import { createPayment } from "@/actions/payment";
import { PlanPeriod, Price, Tarrif } from "@repo/db";
import { formatPrice } from "@repo/lib/utils/formatPrice";
import { useLoading } from "@repo/lib/utils/useLoading";
import { Button } from "@repo/ui/components/button";
import { Spinner } from "@repo/ui/components/spinner";
import { cn } from "@repo/ui/lib/utils";
import {
  ArrowLeft,
  BadgePercent,
  CalendarClock,
  CreditCard,
  Lock,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import DiscountForm from "./forms/DiscountForm";

interface TarrifType extends Tarrif {
  price: Price | null;
}

const PERIOD_LABEL: Record<PlanPeriod, string> = {
  monthly: "ماهیانه",
  threeMonth: "۳ ماهه",
  annual: "سالیانه",
};

const PLAN_THEME = {
  standard: {
    label: "استاندارد",
    level: "۱",
    tagline: "شروع حرفه‌ای",
    from: "#8b5cf6",
    to: "#a78bfa",
  },
  pro: {
    label: "حرفه‌ای",
    level: "۲",
    tagline: "انتخاب طراحان",
    from: "#7c3aed",
    to: "#c026d3",
  },
  organization: {
    label: "سازمانی",
    level: "۳",
    tagline: "برای تیم‌ها",
    from: "#4f46e5",
    to: "#7c3aed",
  },
} as const;

/** Renders a per-plan SVG polygon stamp — replaces the old period PNGs. */
const PlanPolygon = ({
  level,
  from,
  to,
  className,
}: {
  level: string;
  from: string;
  to: string;
  className?: string;
}) => {
  const gradientId = `plan-poly-${level}-${from.slice(1)}`;

  return (
    <div
      className={cn(
        "relative aspect-square w-32 shrink-0 drop-shadow-[0_10px_25px_rgba(124,58,237,0.35)] sm:w-36",
        className,
      )}
    >
      <svg viewBox="0 0 120 120" className="size-full">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>

        {/* outer shell */}
        <polygon
          points="60,4 108,30 108,90 60,116 12,90 12,30"
          fill={`url(#${gradientId})`}
        />
        {/* inner keyline */}
        <polygon
          points="60,18 96,37 96,83 60,102 24,83 24,37"
          fill="none"
          stroke="white"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-white">
        <span className="text-3xl font-black leading-none">{level}</span>
        <span className="text-[9px] font-medium tracking-widest opacity-75">
          سطح پلن
        </span>
      </div>
    </div>
  );
};

const PaymentCard = ({
  tarrif,
  period,
}: {
  tarrif: TarrifType;
  period: PlanPeriod;
}) => {
  const router = useRouter();
  const { isLoading, startLoading, stopLoading } = useLoading();
  const [appliedDiscountCode, setAppliedDiscountCode] = useState<string | null>(
    null,
  );
  const [discountCodeAmount, setDiscountCodeAmount] = useState(0);

  const basePrice = tarrif.price?.[period] ?? 0;
  const [totalPrice, setTotalPrice] = useState(basePrice);

  const theme = PLAN_THEME[tarrif.key];
  const hasDiscount = discountCodeAmount > 0;

  const onStartPayment = async () => {
    startLoading();
    const res = await createPayment({
      total: totalPrice,
      amount: tarrif.price![period],
      plan: tarrif.key,
      period,
      discountCode: appliedDiscountCode,
      discountCodeAmount,
    });

    if (res.error) {
      toast.error(res.error);
      stopLoading();
    } else if (res.success) {
      router.push(res.data.paymentUrl);
    }
  };

  return (
    <div className="relative flex justify-center overflow-hidden px-4 py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(60%_100%_at_50%_0%,var(--color-primary),transparent_70%)] opacity-[0.09]"
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border bg-background shadow-xl shadow-primary/5">
        <PolygonPattern />

        {/* ------------------------------ banner ------------------------------ */}
        <div className="relative flex items-center gap-5 border-b bg-linear-to-bl from-primary/8 to-transparent p-6">
          <PlanPolygon level={theme.level} from={theme.from} to={theme.to} />

          <div className="min-w-0 space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">
              <Sparkles className="size-3" />
              {theme.tagline}
            </span>

            <h1 className="truncate text-2xl font-extrabold tracking-tight">
              پلن {theme.label}
            </h1>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {tarrif.isRecommended && (
                <Zap
                  className="size-3.5 text-primary"
                  fill="currentColor"
                  strokeWidth={0}
                />
              )}
              {tarrif.shortDescription}
            </div>
          </div>
        </div>

        <div className="relative space-y-6 p-6">
          {/* ------------------------------ summary ---------------------------- */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold">
                <ReceiptText className="size-4 text-primary" />
                صورت‌حساب اشتراک
              </h2>

              <span className="inline-flex items-center gap-1.5 rounded-xl border bg-muted/50 px-3 py-1 text-xs font-medium">
                <CalendarClock className="size-3.5 text-primary" />
                {PERIOD_LABEL[period]}
              </span>
            </div>

            <dl className="space-y-3 rounded-2xl border bg-muted/30 p-4 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">هزینه اشتراک</dt>
                <dd className="font-medium">
                  {formatPrice(basePrice, true, "fa")}
                </dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <BadgePercent className="size-3.5" />
                  تخفیف
                </dt>
                <dd
                  className={cn(
                    "font-medium",
                    hasDiscount ? "text-green-600" : "text-muted-foreground",
                  )}
                >
                  {hasDiscount
                    ? `${formatPrice(discountCodeAmount, true, "fa")} −`
                    : "—"}
                </dd>
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <dt className="font-bold">قابل پرداخت</dt>
                <dd className="text-lg font-extrabold text-primary">
                  {formatPrice(totalPrice, true, "fa")}
                </dd>
              </div>
            </dl>
          </div>

          {/* ------------------------------ coupon ----------------------------- */}
          <DiscountForm
            setDiscountCodeAmount={setDiscountCodeAmount}
            tarrif={tarrif}
            basePrice={basePrice}
            setTotalPrice={setTotalPrice}
            appliedDiscountCode={appliedDiscountCode}
            setAppliedDiscountCode={setAppliedDiscountCode}
          />

          {/* -------------------------------- cta ----------------------------- */}
          <div className="space-y-3">
            <Button
              onClick={onStartPayment}
              size="xl"
              variant="gradient"
              className="group w-full"
              disabled={isLoading}
            >
              {isLoading ? <Spinner /> : <CreditCard className="size-4" />}
              پرداخت {formatPrice(totalPrice, true, "fa")}
              {!isLoading && (
                <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
              )}
            </Button>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Lock className="size-3.5 text-primary" />
                پرداخت از طریق درگاه امن بانکی
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="size-3.5 text-primary" />
                فعال‌سازی آنی اشتراک
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCard;

/* -------------------------------------------------------------------------- */

/** Faint polygon lattice so the card catches the eye without any imagery. */
const PolygonPattern = () => (
  <svg
    aria-hidden
    className="pointer-events-none absolute inset-0 size-full text-primary"
  >
    <defs>
      <pattern
        id="payment-polygon-pattern"
        width="72"
        height="72"
        patternUnits="userSpaceOnUse"
        patternTransform="scale(1.1)"
      >
        <polygon
          points="36,6 62,21 62,51 36,66 10,51 10,21"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.09"
          strokeWidth="1"
        />
        <polygon
          points="36,20 50,28 50,44 36,52 22,44 22,28"
          fill="currentColor"
          fillOpacity="0.02"
        />
      </pattern>
      <radialGradient id="payment-polygon-fade" cx="50%" cy="35%" r="75%">
        <stop offset="0%" stopColor="white" stopOpacity="1" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </radialGradient>
      <mask id="payment-polygon-mask">
        <rect width="100%" height="100%" fill="url(#payment-polygon-fade)" />
      </mask>
    </defs>
    <rect
      width="100%"
      height="100%"
      fill="url(#payment-polygon-pattern)"
      mask="url(#payment-polygon-mask)"
    />
  </svg>
);
