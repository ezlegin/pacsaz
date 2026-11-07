"use client";

import { cn } from "@repo/ui/lib/utils";
import { ArrowLeft, Box, Check, FileDown, PackageOpen, Palette, Ratio, ShieldCheck } from "lucide-react";
import { animate, motionValue, useInView, useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BoxDock from "./BoxDock";
import { fa } from "./format";
import { useHomeBox } from "./HomeBoxProvider";
import { paintPack } from "./paintPack";
import { printSheet, withPrint } from "./printSheet";

const FoldStage = dynamic(() => import("@repo/dieline-3d/stage"), { ssr: false });

type View = "3d" | "2d";

const PROMISES = [
  { icon: ShieldCheck, text: "کنترل فنی پیش از دانلود" },
  { icon: FileDown, text: "خروجی DXF، PDF و SVG" },
  { icon: Check, text: "محاسبه‌ی ضخامت مقوا" },
];

/**
 * The hero: the pitch on one side and a working box on the other. The visitor
 * sizes it, opens and closes it, and flips between the 3D box and its flat
 * dieline, all without the page taking over their scroll wheel.
 *
 * The words and the flat drawing are server HTML; the 3D stage loads after.
 */
const Showcase = () => {
  const { settledFoldSvg, material, foldConfig, size, href, drawing, preview, title } = useHomeBox();
  const stageBox = useRef<HTMLDivElement>(null);
  const slider = useRef<HTMLInputElement>(null);
  const reduced = !!useReducedMotion();
  const onScreen = useInView(stageBox, { margin: "10% 0px" });
  const [view, setView] = useState<View>("3d");
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [designed, setDesigned] = useState(true);
  const [sheet, setSheet] = useState<string | null>(null);

  // One motion value per page: the stage reads it every frame, React never does.
  const progress = useMemo(() => motionValue(1), []);
  // How much of the sheet the press has inked: the design sweeps on and off.
  const ink = useMemo(() => motionValue(1), []);

  useEffect(() => setMounted(true), []);

  // The slider follows the value while it animates, without a re-render per frame.
  useEffect(
    () =>
      progress.on("change", (value) => {
        const input = slider.current;
        if (!input) return;
        input.value = String(Math.round((1 - value) * 100));
        input.style.setProperty("--fill", `${(1 - value) * 100}%`);
      }),
    [progress],
  );

  const toggle = useCallback(() => {
    const next = !open;
    setOpen(next);
    animate(progress, next ? 0 : 1, reduced ? { duration: 0 } : { duration: 1.8, ease: [0.45, 0, 0.2, 1] });
  }, [open, progress, reduced]);

  const kraft = !["glossyCardboard", "artPaper"].includes(material.value);
  const paint = useMemo(() => paintPack(size, kraft), [size, kraft]);
  const print = useMemo(() => ({ paint, progress: ink }), [paint, ink]);

  const showDesign = useCallback(() => {
    const next = !designed;
    setDesigned(next);
    animate(ink, next ? 1 : 0, reduced ? { duration: 0 } : { duration: 1.2, ease: [0.45, 0, 0.2, 1] });
  }, [designed, ink, reduced]);

  // The flat print is painted only when the 2D view asks for it, once the type has loaded.
  useEffect(() => {
    if (view !== "2d" || !designed) return;
    let stale = false;
    void document.fonts.ready.then(() => {
      if (stale) return;
      try {
        setSheet(printSheet(paint, settledFoldSvg, drawing));
      } catch {
        setSheet(null);
      }
    });
    return () => {
      stale = true;
    };
  }, [view, designed, paint, settledFoldSvg, drawing]);

  const flat = useMemo(() => (designed && sheet ? withPrint(preview, sheet, drawing) : preview), [designed, sheet, preview, drawing]);

  const designButton = (
    <button type="button" onClick={showDesign} aria-pressed={designed} className={cn("btn-chip", !designed && "btn-chip-off")}>
      <Palette className="size-4" />
      {designed ? "پنهان کردن طرح" : "نمایش طرح"}
    </button>
  );

  return (
    <section aria-labelledby="hero-title" className="hero relative isolate overflow-hidden">
      <div aria-hidden className="hero-light" />
      <div aria-hidden className="hero-grid" />

      <div className="mx-auto grid w-full max-w-[86rem] items-center gap-10 px-5 pt-10 pb-16 md:px-12 md:pt-16 lg:grid-cols-12 lg:gap-12 lg:pb-24">
        {/* The pitch */}
        <div className="lg:col-span-5">
          <p className="hero-badge">
            <span className="size-1.5 rounded-full bg-primary" />
            طراحی پارامتریک دایلاین
          </p>
          <h1 id="hero-title" className="mt-5 text-[2.2rem] leading-[1.25] font-black sm:text-5xl xl:text-[3.6rem]">
            دایلاین جعبه‌ات را
            <span className="text-light block pb-1">در چند ثانیه بساز</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-8 text-[var(--soft)] md:text-lg md:leading-9">
            قالب را انتخاب کن، ابعاد و جنس مقوا را بده؛ پک‌ساز نقشه‌ی برش و تای دقیق را می‌کشد، کنترل فنی می‌کند و فایل آماده‌ی قالب‌سازی تحویل می‌دهد.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dielines" className="btn-primary">
              انتخاب قالب
              <ArrowLeft className="size-4" />
            </Link>
            <Link href={href} className="btn-glass">
              ساخت همین جعبه
            </Link>
          </div>

          <ul className="mt-9 grid gap-3 text-xs whitespace-nowrap text-[var(--soft)] sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {PROMISES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2">
                <span className="grid size-6 shrink-0 place-items-center rounded-md bg-violet-100 text-primary">
                  <Icon className="size-3.5" strokeWidth={2.4} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* The studio */}
        <div className="lg:col-span-7">
          <div className="studio">
            <div className="flex items-center justify-between gap-3 px-4 pt-4 md:px-5">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{title}</p>
                <p dir="ltr" className="text-right text-xs text-[var(--soft)] tabular-nums">
                  {fa(size.width)} × {fa(size.length)} × {fa(size.height)} mm
                </p>
              </div>
              <div role="tablist" aria-label="نمای جعبه" className="segmented">
                {(
                  [
                    { value: "3d", label: "سه‌بعدی", icon: Box },
                    { value: "2d", label: "دایلاین", icon: Ratio },
                  ] as const
                ).map(({ value, label, icon: Icon }) => (
                  <button key={value} type="button" role="tab" aria-selected={view === value} onClick={() => setView(value)} className={cn(view === value && "on")}>
                    <Icon className="size-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div ref={stageBox} className="relative mx-4 mt-3 aspect-[4/3] overflow-hidden rounded-2xl bg-[#f6f6f8] md:mx-5 md:aspect-[16/11]">
              {/* Flat drawing, in the product page's colours: always in the HTML, also the 3D placeholder. */}
              <div
                role="img"
                aria-label={`دایلاین ${title}`}
                className={cn("hero-preview absolute inset-0 p-6 transition-opacity duration-500", view === "3d" && ready ? "opacity-0" : "opacity-100")}
                data-print-hide
                dangerouslySetInnerHTML={{ __html: view === "2d" ? flat : preview }}
              />

              {mounted && (
                <div className={cn("absolute inset-0 transition-opacity duration-700", view === "3d" && ready ? "opacity-100" : "pointer-events-none opacity-0")}>
                  <FoldStage
                    className="!absolute inset-0"
                    svg={settledFoldSvg}
                    material={material.value}
                    thickness={material.thickness}
                    foldConfig={foldConfig}
                    progress={progress}
                    print={print}
                    sway={!reduced}
                    paused={!onScreen || view !== "3d"}
                    onReady={() => setReady(true)}
                  />
                </div>
              )}

            </div>

            <div className="px-4 pt-3 md:px-5">
              {view === "3d" ? (
                <div className="flex items-center gap-3">
                  <label className="flex min-w-0 flex-1 items-center gap-3 text-xs text-[var(--soft)]">
                    <span className="shrink-0">باز</span>
                    <input
                      ref={slider}
                      dir="ltr"
                      type="range"
                      min={0}
                      max={100}
                      defaultValue={0}
                      aria-label="باز شدن جعبه"
                      onChange={(event) => progress.set(1 - Number(event.target.value) / 100)}
                      onPointerUp={(event) => setOpen(Number(event.currentTarget.value) > 50)}
                      className="size-range"
                      style={{ "--fill": "0%" } as React.CSSProperties}
                    />
                    <span className="shrink-0">بسته</span>
                  </label>
                  {designButton}
                  <button type="button" onClick={toggle} className="btn-chip">
                    <PackageOpen className="size-4" />
                    {open ? "ببند" : "باز کن"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div dir="ltr" className="flex flex-wrap gap-3 text-[11px] text-[var(--soft)]">
                  <span className="flex items-center gap-1.5"><i className="legend legend-cut" />برش</span>
                  <span className="flex items-center gap-1.5"><i className="legend legend-fold" />تا</span>
                  <span className="tabular-nums">{fa(Math.round(drawing.blank.width))} × {fa(Math.round(drawing.blank.height))} mm</span>
                  </div>
                  {designButton}
                </div>
              )}
            </div>

            <div className="p-4 md:p-5">
              <BoxDock />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Showcase;
