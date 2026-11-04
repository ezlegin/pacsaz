"use client";

import { cn } from "@repo/ui/lib/utils";
import { ArrowLeft } from "lucide-react";
import { motion, motionValue, useInView, useMotionTemplate, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BoxDock from "./BoxDock";
import { useHomeBox } from "./HomeBoxProvider";
import { paintBlueprint, paintPack } from "./paintPack";

const FoldStage = dynamic(() => import("@repo/dieline-3d/stage"), { ssr: false });

const LAYERS = [
  { title: "خط برش", text: "جایی که تیغ مقوا را می‌برد؛ مسیری بسته و بدون گسستگی." },
  { title: "خط تا", text: "مقوا فشرده می‌شود و نمی‌برد، تا همان‌جا بدون ترک خم شود." },
  { title: "بلید", text: "حاشیه‌ی چاپی بیرون خط برش، تا لبه‌ی سفید دیده نشود." },
  { title: "ناحیه‌ی چسب", text: "زبانه‌ای بدون ورنی که دو سر بدنه را به هم می‌چسباند." },
];

const CLOSED = motionValue(1);
const STILL = motionValue(0.16);

/**
 * The page's first act, one pinned scene: a real box, built from the real
 * template, that the visitor sizes with their own hands. Scrolling unfolds it
 * into its dieline, then strips the print off to show the bare sheet.
 *
 * All the words are ordinary HTML, so the page reads the same with no WebGL.
 */
const Showcase = () => {
  const { settledFoldSvg, material, foldConfig, size, href, drawing } = useHomeBox();
  const track = useRef<HTMLElement>(null);
  const reduced = !!useReducedMotion();
  const onScreen = useInView(track, { margin: "10% 0px" });
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [wide, setWide] = useState(true);

  useEffect(() => {
    setMounted(true);
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  const eased = useSpring(scrollYProgress, { stiffness: 100, damping: 26, mass: 0.35 });

  const unfolded = useTransform(eased, [0.1, 0.55], [1, 0]);
  const inked = useTransform(eased, [0.64, 0.84], [1, 0]);
  const sideways = useTransform(eased, [0.08, 0.5], [wide ? 0.17 : 0, wide ? -0.17 : 0]);

  const heroOpacity = useTransform(eased, [0, 0.07, 0.12], [1, 1, 0]);
  const heroY = useTransform(eased, [0, 0.12], [0, -60]);
  const heroEvents = useTransform(heroOpacity, (value) => (value > 0.4 ? "auto" : "none"));
  const mapOpacity = useTransform(eased, [0.18, 0.25, 0.54, 0.6], [0, 1, 1, 0]);
  const mapY = useTransform(eased, [0.18, 0.25, 0.54, 0.6], [50, 0, 0, -50]);
  const layerOpacity = useTransform(eased, [0.64, 0.7, 1], [0, 1, 1]);
  const layerY = useTransform(eased, [0.64, 0.72], [50, 0]);
  const wordX = useTransform(eased, [0, 0.6], ["0%", "-12%"]);
  const lightOpacity = useTransform(eased, [0, 0.5, 1], [1, 0.75, 0.45]);
  const bar = useMotionTemplate`${useTransform(eased, [0, 1], [0, 100])}%`;

  const onReady = useCallback(() => setReady(true), []);
  const kraft = !["glossyCardboard", "artPaper"].includes(material.value);
  const print = useMemo(
    () => ({ paint: paintPack(size, kraft), paintBare: paintBlueprint(drawing.cuts, drawing.folds), progress: reduced ? CLOSED : inked }),
    [size, kraft, drawing.cuts, drawing.folds, reduced, inked],
  );

  return (
    <section ref={track} aria-labelledby="hero-title" className={cn("relative", !reduced && "h-[520svh]")}>
      <div className={cn("relative h-svh min-h-[40rem] overflow-hidden", !reduced && "sticky top-0")}>
        <motion.div aria-hidden className="stage-light" style={{ opacity: lightOpacity }} />
        <div aria-hidden className="stage-floor" />
        <motion.div aria-hidden dir="ltr" className="stage-word" style={{ x: wordX }}>
          PACSAZ
        </motion.div>

        {mounted && (
          <div className={cn("stage-canvas absolute inset-0", ready && "stage-canvas-on")}>
            <FoldStage
              className="!absolute inset-0"
              svg={settledFoldSvg}
              material={material.value}
              thickness={material.thickness}
              foldConfig={foldConfig}
              progress={reduced ? CLOSED : unfolded}
              print={print}
              shift={reduced ? STILL : sideways}
              sway={!reduced}
              paused={!onScreen}
              insetTop={wide ? 72 : 260}
              onReady={onReady}
            />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 mx-auto max-w-[92rem] px-5 md:px-12">
          {/* Act one */}
          <motion.div
            className="absolute inset-x-5 top-20 md:inset-x-12 lg:top-1/2 lg:right-12 lg:left-auto lg:w-[32rem] lg:-translate-y-[46%]"
            style={reduced ? undefined : { opacity: heroOpacity, y: heroY, pointerEvents: heroEvents }}
          >
            <h1 id="hero-title" className="text-[2.1rem] leading-[1.22] font-black sm:text-5xl xl:text-[3.75rem]">
              طراحی دایلاین بسته‌بندی،
              <span className="text-light block pb-1">بدون آزمون و خطا</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-[var(--soft)] md:text-lg md:leading-9">
              اندازه‌ی جعبه را با دست خودت تغییر بده و ببین. پک‌ساز نقشه‌ی برش و تای دقیق آن را می‌کشد و فایل آماده‌ی چاپ تحویل می‌دهد.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 max-lg:hidden">
              <Link href={href} className="btn-primary pointer-events-auto">
                ساخت همین جعبه
                <ArrowLeft className="size-4" />
              </Link>
              <Link href="/dielines" className="btn-glass pointer-events-auto">
                کتابخانه‌ی قالب‌ها
              </Link>
            </div>
            <div className="pointer-events-auto mt-6 max-lg:hidden">
              <BoxDock />
            </div>
          </motion.div>

          <motion.div className="pointer-events-auto absolute inset-x-5 bottom-5 lg:hidden" style={reduced ? undefined : { opacity: heroOpacity, pointerEvents: heroEvents }}>
            <BoxDock />
            <Link href={href} className="btn-primary mt-3 w-full">
              ساخت همین جعبه
            </Link>
          </motion.div>

          {/* Act two */}
          <motion.div
            className="absolute inset-x-5 top-24 md:inset-x-12 lg:top-1/2 lg:right-auto lg:left-12 lg:w-[30rem] lg:-translate-y-1/2"
            style={reduced ? { position: "static" } : { opacity: mapOpacity, y: mapY }}
          >
            <p className="eyebrow">هر جعبه یک نقشه دارد</p>
            <h2 className="mt-3 text-3xl leading-[1.25] font-black md:text-6xl">دایلاین چیست؟</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--soft)] md:text-lg md:leading-9">
              دایلاین نقشه‌ی تخت و بازشده‌ی جعبه است؛ نشان می‌دهد تیغ کجا مقوا را ببرد و کجا آن را خط بزند تا جعبه پس از تا شدن درست بسته شود. طرح چاپی روی همین نقشه چیده
              می‌شود و قالب‌ساز از روی آن تیغ را می‌سازد.
            </p>
          </motion.div>

          {/* Act three */}
          <motion.div
            className="absolute inset-x-5 bottom-5 lg:top-1/2 lg:right-auto lg:bottom-auto lg:left-12 lg:w-[30rem] lg:-translate-y-1/2"
            style={reduced ? { position: "static" } : { opacity: layerOpacity, y: layerY }}
          >
            <h2 className="text-2xl font-black md:text-5xl">چهار لایه‌ی یک نقشه</h2>
            <ul className="mt-4 grid grid-cols-2 gap-2 md:mt-6 md:gap-3">
              {LAYERS.map((layer) => (
                <li key={layer.title} className="glass !rounded-2xl p-3 md:p-4">
                  <h3 className="text-sm font-bold md:text-base">{layer.title}</h3>
                  <p className="mt-1 text-xs leading-6 text-[var(--soft)] md:text-sm">{layer.text}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div aria-hidden className="absolute bottom-6 left-1/2 -translate-x-1/2 max-lg:hidden" style={{ opacity: heroOpacity }}>
          <div className="scroll-cue" />
        </motion.div>
        <motion.span aria-hidden className="absolute right-0 bottom-0 h-px bg-violet-400" style={{ width: bar }} />
      </div>
    </section>
  );
};

export default Showcase;
