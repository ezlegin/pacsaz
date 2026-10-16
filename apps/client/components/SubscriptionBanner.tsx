"use client";

import { BANNER_STORAGE_KEY } from "@/components/bannerStorage";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import { ArrowLeft, Sparkles, X } from "lucide-react";

/**
 * Read before hydration by the inline script in the root layout, so a banner the
 * visitor already dismissed never flashes on reload.
 */
const DismissedContext = createContext(false);

export const SubscriptionBannerProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [dismissed, setDismissed] = useState(false);

  useLayoutEffect(() => {
    if (window.__pacsazBannerDismissed) setDismissed(true);
  }, []);

  return (
    <DismissedContext.Provider value={dismissed}>
      {children}
    </DismissedContext.Provider>
  );
};

/** How far down the page the visitor must be before the prompt appears. */
const REVEAL_AFTER_PX = 520;

const useRevealedOnScroll = () => {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (revealed) return;

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (window.scrollY > REVEAL_AFTER_PX) {
          setRevealed(true);
          window.removeEventListener("scroll", onScroll);
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // a reload mid-page should show it immediately

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [revealed]);

  return revealed;
};

/**
 * Floating subscription prompt.
 *
 * Landscape card on desktop (fades and slides in from the right once the
 * visitor has scrolled past the hero), short bottom bar on mobile.
 */
const SubscriptionBanner = ({
  variant,
  minPrice,
  visible,
  onDismiss,
}: {
  variant: "floating" | "bottom";
  minPrice: string;
  visible: boolean;
  onDismiss: () => void;
}) => {
  if (variant === "bottom") {
    return (
      <div
        className={`fixed inset-x-0 bottom-0 z-40 px-3 pb-3 transition-all duration-500 ease-out lg:hidden ${
          visible
            ? "visible translate-y-0 opacity-100"
            : "invisible translate-y-4 opacity-0"
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-l from-violet-600 to-purple-600 px-4 py-3 text-white shadow-lg shadow-primary/25">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold leading-tight">
              اشتراک پک‌ساز — شروع از {minPrice} تومان
            </p>
            <p className="mt-0.5 truncate text-[10px] text-white/75">
              دسترسی به همه‌ی قالب‌ها، بدون محدودیت
            </p>
          </div>

          <a
            href="/subscription"
            className="shrink-0 rounded-xl bg-white px-3 py-1.5 text-[11px] font-bold text-violet-700"
          >
            مشاهده
          </a>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="بستن بنر"
            className="grid size-7 shrink-0 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      aria-hidden={!visible}
      className={`fixed bottom-6 right-6 z-40 hidden w-[16rem] transition-all duration-700 ease-out lg:block ${
        visible
          ? "visible translate-x-0 opacity-100"
          : "invisible pointer-events-none translate-x-10 opacity-0"
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-bl from-primary/[0.07] via-background to-background p-4 shadow-[0_18px_45px_-18px] shadow-primary/35 ring-1 ring-black/[0.03]">
        {/* soft brand wash in the corner */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-12 size-32 rounded-full bg-primary/15 blur-2xl"
        />

        <button
          type="button"
          onClick={onDismiss}
          aria-label="بستن بنر"
          className="absolute left-2.5 top-2.5 z-10 grid size-6 place-items-center rounded-full text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-3" />
        </button>

        <div className="relative space-y-3">
          <div className="flex items-center gap-2.5 pr-1">
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-primary/25">
              <Sparkles className="size-4" strokeWidth={2} />
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">
              اشتراک پک‌ساز
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-[13px] font-extrabold leading-snug">
              همه‌ی قالب‌ها را باز کن
            </p>
            <p className="text-[11px] leading-5 text-muted-foreground">
              دایلاین لایه‌باز، خروجی AI و PDF، بدون محدودیت زمانی.
            </p>
          </div>

          {/* price — the focal point */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-[10px] text-muted-foreground">شروع از</span>
            <span className="bg-gradient-to-l from-violet-600 to-purple-600 bg-clip-text text-lg font-extrabold tabular-nums text-transparent">
              {minPrice}
            </span>
            <span className="text-[11px] font-bold">تومان</span>
            <span className="text-[10px] text-muted-foreground">/ ماهانه</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/subscription"
              className="group flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-l from-violet-500 to-purple-600 px-3 py-2 text-[11px] font-bold text-white shadow-sm transition-all duration-300 hover:gap-2.5 hover:shadow-md hover:shadow-primary/25"
            >
              فعال‌سازی اشتراک
              <ArrowLeft className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Renders the banner unless dismissed, revealing it after a short scroll. */
export const SubscriptionBannerSlot = ({ minPrice }: { minPrice: string }) => {
  const dismissed = useContext(DismissedContext);
  const [hidden, setHidden] = useState(false);
  const revealed = useRevealedOnScroll();

  if (dismissed || hidden) return null;

  const onDismiss = () => {
    setHidden(true);
    try {
      localStorage.setItem(BANNER_STORAGE_KEY, "1");
    } catch {
      // storage unavailable (private mode): dismissal lasts for this view only
    }
  };

  return (
    <>
      <SubscriptionBanner
        variant="floating"
        minPrice={minPrice}
        visible={revealed}
        onDismiss={onDismiss}
      />
      <SubscriptionBanner
        variant="bottom"
        minPrice={minPrice}
        visible={revealed}
        onDismiss={onDismiss}
      />
    </>
  );
};
