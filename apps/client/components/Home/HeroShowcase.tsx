"use client";

import { cn } from "@repo/ui/lib/utils";
import { ChevronsLeftRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Spec = { label: string; value: string };

type Props = {
  /** The dieline lying flat, as stored on the dieline record. */
  flatImage: string;
  /** The same box folded, from the model render. */
  foldedImage: string;
  flatLabel: string;
  foldedLabel: string;
  /** Real measurements from the dieline's settings. */
  specs: Spec[];
  className?: string;
};

/**
 * The hero's product theatre: the dieline lying flat and the same box folded,
 * with a draggable divider revealing one over the other.
 *
 * Both images are the assets attached to the dieline record, so this shows the
 * actual product rather than an illustration. The divider is a real
 * `<input type="range">` stretched across the panel with `opacity-0`: the whole
 * image becomes draggable, and it stays operable from the keyboard.
 *
 * The panel also tilts a couple of degrees towards the pointer. That transform is
 * applied by writing CSS variables straight onto the element instead of through
 * state, so moving the mouse never re-renders React.
 */
const HeroShowcase = ({
  flatImage,
  foldedImage,
  flatLabel,
  foldedLabel,
  specs,
  className,
}: Props) => {
  const [reveal, setReveal] = useState(50);
  const [engaged, setEngaged] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const touched = useRef(false);

  /**
   * One slow sweep after mount, so the divider reads as draggable without a
   * caption having to say so. Steps are skipped once the visitor takes over, and
   * the whole thing is skipped for anyone who asked for less motion.
   */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const steps: [number, number][] = [
      [1200, 34],
      [1750, 62],
      [2300, 50],
    ];

    const timers = steps.map(([delay, value]) =>
      window.setTimeout(() => {
        if (!touched.current) setReveal(value);
      }, delay),
    );

    return () => timers.forEach(window.clearTimeout);
  }, []);

  const handleTilt = (event: React.PointerEvent<HTMLDivElement>) => {
    const element = panel.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    element.style.setProperty("--tilt-y", `${(x * 7).toFixed(2)}deg`);
    element.style.setProperty("--tilt-x", `${(-y * 5).toFixed(2)}deg`);
  };

  const resetTilt = () => {
    const element = panel.current;
    if (!element) return;

    element.style.setProperty("--tilt-y", "0deg");
    element.style.setProperty("--tilt-x", "0deg");
  };

  const handleReveal = (value: number) => {
    touched.current = true;
    setEngaged(true);
    setReveal(value);
  };

  return (
    <div
      ref={panel}
      onPointerMove={handleTilt}
      onPointerLeave={resetTilt}
      style={{ perspective: "1400px" }}
      className={cn("relative animate-rise [animation-delay:250ms]", className)}
    >
      <div className="relative overflow-hidden rounded-3xl border bg-card shadow-2xl shadow-primary/10 transition-transform duration-300 ease-out [transform:rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))]">
        {/* drafting-board grid and a violet glow behind the drawing */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[26px_26px] opacity-70"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
        />

        <div className="relative flex items-center justify-between gap-3 border-b bg-background/70 px-4 py-2.5 backdrop-blur">
          <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-live rounded-full bg-emerald-500" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            پیش‌نمایش زنده
          </span>

          <span
            className={cn(
              "text-xs text-muted-foreground transition-opacity duration-500",
              engaged && "opacity-0",
            )}
          >
            بکشید تا جمع شود
          </span>
        </div>

        {/* The comparison. `dir="ltr"` keeps the divider's arithmetic predictable:
            the flat dieline sits on the left, the folded box on the right. */}
        <div
          dir="ltr"
          className="relative aspect-[4/3] select-none bg-muted/20"
        >
          <Image
            src={flatImage}
            alt={flatLabel}
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 620px"
            className="object-contain p-6"
          />

          <div
            className="absolute inset-0"
            style={{ clipPath: `inset(0 0 0 ${reveal}%)` }}
          >
            <Image
              src={foldedImage}
              alt={foldedLabel}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 620px"
              className="object-contain p-6"
            />
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-px bg-primary/70 shadow-[0_0_18px_var(--primary)]"
            style={{ left: `${reveal}%` }}
          >
            <span className="absolute top-1/2 left-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary/40 bg-background shadow-lg">
              <ChevronsLeftRight className="size-4 text-primary" />
            </span>
          </div>

          <span
            className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium backdrop-blur transition-opacity"
            style={{ opacity: reveal > 14 ? 1 : 0.2 }}
          >
            {flatLabel}
          </span>
          <span
            className="pointer-events-none absolute right-3 bottom-3 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium backdrop-blur transition-opacity"
            style={{ opacity: reveal < 86 ? 1 : 0.2 }}
          >
            {foldedLabel}
          </span>

          {/* Stretched over the artwork, invisible, keyboard operable. */}
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={reveal}
            onChange={(event) => handleReveal(Number(event.target.value))}
            aria-label={`${flatLabel} / ${foldedLabel}`}
            className="absolute inset-0 size-full cursor-ew-resize opacity-0"
          />
        </div>

        <div className="relative grid grid-cols-2 gap-px border-t bg-border/60 sm:grid-cols-4">
          {specs.map((spec) => (
            <div
              key={spec.label}
              className="bg-background/80 px-3 py-2.5 backdrop-blur"
            >
              <p className="text-[11px] text-muted-foreground">{spec.label}</p>
              <p dir="ltr" className="truncate text-xs font-semibold">
                {spec.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -bottom-5 -left-5 hidden animate-float items-center gap-2 rounded-2xl border bg-background/95 px-3 py-2 shadow-xl backdrop-blur sm:flex">
        <Sparkles className="size-4 text-primary" />
        <span className="text-xs font-medium">
          قابل ویرایش تا آخرین میلی‌متر
        </span>
      </div>
    </div>
  );
};

export default HeroShowcase;
