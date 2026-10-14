"use client";

import { verifyPayment } from "@/actions/payment";
import { ZarinPalStatus } from "@/lib/zarrinpal";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import {
  ArrowLeft,
  CircleCheck,
  Clock,
  Home,
  LayoutDashboard,
  RefreshCcw,
  ShieldAlert,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Status = "success" | "failed" | "pending";

type StatusTheme = {
  icon: LucideIcon;
  headline: string;
  fallback: string;
  note?: string;
  /** page wash */
  wash: string;
  /** icon badge */
  badge: string;
  /** accent bar under the headline */
  rule: string;
  /** soft grid colour */
  grid: string;
};

const THEME: Record<Status, StatusTheme> = {
  pending: {
    icon: Clock,
    headline: "در حال بررسی پرداخت",
    fallback: "در حال بررسی اطلاعات...",
    wash: "bg-[radial-gradient(60%_100%_at_50%_0%,var(--color-primary),transparent_70%)] opacity-[0.10]",
    badge:
      "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-primary/40",
    rule: "from-violet-500 to-purple-600",
    grid: "text-primary/20",
  },
  success: {
    icon: CircleCheck,
    headline: "پرداخت با موفقیت انجام شد",
    fallback: "اشتراک شما با موفقیت فعال شد.",
    note: "از همین حالا می‌توانی قالب‌ها را دانلود کنی و از تمام امکانات پلن خودت استفاده کنی.",
    wash: "bg-[radial-gradient(60%_100%_at_50%_0%,#22c55e,transparent_70%)] opacity-[0.16]",
    badge:
      "bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-green-500/40",
    rule: "from-green-400 to-emerald-600",
    grid: "text-green-600/25",
  },
  failed: {
    icon: XCircle,
    headline: "پرداخت ناموفق بود",
    fallback: "تراکنش انجام نشد.",
    note: "در صورت کسر وجه، مبلغ پرداخت‌شده حداکثر تا ۷۲ ساعت آینده به حساب شما برگشت داده می‌شود.",
    wash: "bg-[radial-gradient(60%_100%_at_50%_0%,#ef4444,transparent_70%)] opacity-[0.16]",
    badge:
      "bg-gradient-to-br from-rose-400 to-red-600 text-white shadow-red-500/40",
    rule: "from-rose-400 to-red-600",
    grid: "text-red-600/25",
  },
};

const PaymentResult = ({
  authority,
  status: zpStatus,
}: {
  authority: string;
  status: ZarinPalStatus;
}) => {
  const [status, setStatus] = useState<Status>("pending");
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    if (!authority) {
      setStatus("failed");
      setText("توکن پرداخت یافت نشد.");
      return;
    }

    const Verify = async () => {
      const res = await verifyPayment(authority, zpStatus);
      setStatus(res.result as Status);
      setText(res.message);
    };

    Verify();
  }, [authority, zpStatus]);

  const theme = THEME[status];
  const Icon = theme.icon;

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-16">
      {/* page wash */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-96 transition-all duration-700",
          theme.wash,
        )}
      />

      <div className="relative w-full max-w-lg">
        <div className="relative overflow-hidden rounded-3xl border bg-background p-8 shadow-xl shadow-primary/5 sm:p-10">
          {/* subtle grid */}
          <SubtleGrid className={theme.grid} />

          {/* top accent */}
          <div
            aria-hidden
            className={cn(
              "absolute inset-x-0 top-0 h-1 transition-all duration-700 bg-gradient-to-l",
              theme.rule,
            )}
          />

          <div className="relative flex flex-col items-center gap-6 text-center">
            {/* icon badge */}
            <div className="relative">
              <span
                aria-hidden
                className={cn(
                  "absolute inset-0 rounded-3xl blur-2xl transition-all duration-700 opacity-50",
                  theme.badge,
                )}
              />
              <span
                className={cn(
                  "relative grid size-20 place-items-center rounded-3xl shadow-lg transition-all duration-500",
                  theme.badge,
                  status === "pending" && "animate-pulse",
                )}
              >
                <Icon className="size-10" strokeWidth={1.8} />
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                {theme.headline}
              </h1>

              <div
                aria-hidden
                className={cn(
                  "mx-auto h-1 w-14 rounded-full bg-gradient-to-l transition-all duration-700",
                  theme.rule,
                )}
              />

              <p className="mx-auto max-w-sm text-sm leading-6 text-muted-foreground">
                {text ?? theme.fallback}
              </p>
            </div>

            {theme.note && (
              <div className="flex w-full items-start gap-3 rounded-2xl border bg-muted/40 p-4 text-right">
                <ShieldAlert className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <p className="text-xs leading-5 text-muted-foreground">
                  {theme.note}
                </p>
              </div>
            )}

            <div className="flex w-full flex-col gap-3 sm:flex-row">
              {status === "success" ? (
                <>
                  <Link href="/panel" className="w-full">
                    <Button variant="gradient" size="xl" className="group w-full">
                      <LayoutDashboard className="size-4" />
                      اشتراک‌های من
                      <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/dielines" className="w-full">
                    <Button variant="outline" size="xl" className="w-full">
                      مشاهده قالب‌ها
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/subscription" className="w-full">
                    <Button
                      size="xl"
                      variant={status === "pending" ? "outline" : "gradient"}
                      className="group w-full"
                      disabled={status === "pending"}
                    >
                      <RefreshCcw className="size-4" />
                      تلاش دوباره
                    </Button>
                  </Link>
                  <Link href="/" className="w-full">
                    <Button variant="outline" size="xl" className="w-full">
                      <Home className="size-4" />
                      صفحه اصلی
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {status === "pending" && (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-1.5 animate-ping rounded-full bg-primary" />
                لطفاً صفحه را نبندید...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;

/* -------------------------------------------------------------------------- */

const SubtleGrid = ({ className }: { className?: string }) => (
  <svg
    aria-hidden
    className={cn(
      "pointer-events-none absolute inset-0 size-full stroke-current transition-colors duration-700",
      className,
    )}
  >
    <defs>
      <pattern
        id="payment-result-grid"
        width="26"
        height="26"
        patternUnits="userSpaceOnUse"
      >
        <path d="M26 0H0V26" fill="none" strokeWidth="1" />
      </pattern>
      <radialGradient id="payment-result-fade" cx="50%" cy="0%" r="90%">
        <stop offset="0%" stopColor="white" stopOpacity="0.9" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </radialGradient>
      <mask id="payment-result-mask">
        <rect width="100%" height="100%" fill="url(#payment-result-fade)" />
      </mask>
    </defs>
    <rect
      width="100%"
      height="100%"
      fill="url(#payment-result-grid)"
      mask="url(#payment-result-mask)"
    />
  </svg>
);
