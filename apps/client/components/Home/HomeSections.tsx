import type { FaqItem } from "@/data/faq";
import type { Drawing } from "@/lib/dieline/homeBox";
import { viewBoxOf } from "@/lib/dieline/homeBox";
import { HOW_TO_STEPS, RELATED_COURSE_URL } from "@/lib/seo";
import { packagingCoursePic } from "@/public";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { fa } from "./format";
import { Reveal, Spotlight } from "./HomeMotion";

export type BoxFamilyItem = { id: string; title: string; latin: string; text: string; drawing: Drawing };

const MEASURE = "mx-auto w-full max-w-[86rem] px-5 md:px-12";
const CHECKS = ["خط برش باز و گسسته", "دو تیغ روی هم", "خط‌های متقاطع", "خط تای رها در مقوا", "پاره‌خط‌های بیش از حد کوچک"];
const DIE_LAYERS = ["GLUE", "PERFORATION", "CREASE", "CUT"];
const COURSE_FACTS = ["۱۰.۵ ساعت ویدیو", "۱۰ فصل آموزشی", "مدرک پایان دوره"];

/** The six structures in a plain grid. Drawings are the engine's own presets. */
export const BoxGallery = ({ items }: { items: BoxFamilyItem[] }) => (
  <section aria-labelledby="family-title" className={`${MEASURE} py-24 md:py-32`}>
    <Reveal className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow">ساختارهای جعبه</p>
        <h2 id="family-title" className="mt-2 text-3xl font-black md:text-5xl">
          هر محصول، جعبه‌ی خودش را می‌خواهد
        </h2>
      </div>
      <Link href="/dielines" className="btn-glass">
        کتابخانه‌ی قالب‌ها
        <ArrowLeft className="size-4" />
      </Link>
    </Reveal>

    <Spotlight className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <article key={item.id} id={item.id} className="spot scroll-mt-24 p-6 md:p-7">
          <div className="aspect-[4/3]">
            <svg viewBox={viewBoxOf(item.drawing.bounds, 6)} aria-hidden className="size-full" data-print-hide>
              <path d={item.drawing.sheet} className="neon-sheet" fillRule="evenodd" />
              <path d={item.drawing.folds} className="neon-fold" />
              <path d={item.drawing.cuts} className="neon-cut" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
          <p dir="ltr" className="mt-0.5 text-right text-xs text-primary">
            {item.latin}
          </p>
          <p className="mt-2 text-sm leading-7 text-[var(--soft)]">{item.text}</p>
        </article>
      ))}
    </Spotlight>
  </section>
);

const Contours = ({ drawings, className, label }: { drawings: Drawing[]; className?: string; label?: string }) => {
  const largest = drawings[drawings.length - 1];
  if (!largest) return null;
  const centre = (d: Drawing) => [(d.bounds.minX + d.bounds.maxX) / 2, (d.bounds.minY + d.bounds.maxY) / 2] as const;
  const [cx, cy] = centre(largest);

  return (
    <svg viewBox={viewBoxOf(largest.bounds, 2)} className={`contours ${className ?? ""}`} data-print-hide {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}>
      {drawings.map((drawing, index) => {
        const [x, y] = centre(drawing);
        return <path key={index} d={drawing.cuts} transform={`translate(${cx - x} ${cy - y})`} style={{ "--i": index } as React.CSSProperties} />;
      })}
    </svg>
  );
};

/** Every claim is the engine's: `checkDieline`, `DXF_LAYERS`, the thickness rules. */
export const Production = ({ sizes }: { sizes: Drawing[] }) => (
  <section aria-labelledby="production-title" className={`${MEASURE} py-24 md:py-36`}>
    <Reveal className="mx-auto max-w-3xl text-center">
      <p className="eyebrow">آماده‌ی تولید</p>
      <h2 id="production-title" className="mt-3 text-3xl leading-[1.25] font-black md:text-6xl">
        فایلی که چاپخانه درباره‌اش <span className="text-light">سؤال نمی‌پرسد</span>
      </h2>
    </Reveal>

    <Spotlight className="mt-14 grid gap-4 lg:grid-cols-6">
      <article className="spot p-7 md:p-9 lg:col-span-3 lg:row-span-2">
        <h3 className="text-2xl font-bold md:text-3xl">یک قالب، هر اندازه‌ای</h3>
        <p className="mt-3 max-w-md text-sm leading-7 text-[var(--soft)]">
          قالب‌های پک‌ساز پارامتریک هستند؛ با هر اندازه‌ی جدید، زبانه‌ها، درب‌ها و فاصله‌ها دوباره محاسبه می‌شوند و کشیده یا فشرده نمی‌شوند.
        </p>
        <Contours drawings={sizes} label="یک قالب جعبه در شش اندازه" className="mt-6 h-72 w-full md:h-96" />
      </article>

      <article className="spot p-7 lg:col-span-3">
        <h3 className="text-xl font-bold">پیش از دانلود کنترل می‌شود</h3>
        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {CHECKS.map((check) => (
            <li key={check} className="flex items-center gap-2 text-sm text-[var(--soft)]">
              <Check className="size-4 shrink-0 text-primary" strokeWidth={2.5} />
              {check}
            </li>
          ))}
        </ul>
      </article>

      <article className="spot p-7 lg:col-span-3">
        <div className="grid items-center gap-2 sm:grid-cols-2">
          <div>
            <h3 className="text-xl font-bold">لایه‌هایی که قالب‌ساز انتظار دارد</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--soft)]">DXF برای ایلاستریتور و اتوکد، PDF با اندازه‌ی واقعی و SVG؛ با محاسبه‌ی ضخامت مقوا در هر تا.</p>
          </div>
          <div dir="ltr" className="plates" aria-hidden>
            {DIE_LAYERS.map((layer, index) => (
              <span key={layer} className="plate" style={{ "--i": index } as React.CSSProperties}>
                {layer}
              </span>
            ))}
          </div>
        </div>
      </article>
    </Spotlight>
  </section>
);

/** The same steps the page's `HowTo` data states, from one list. */
export const Steps = () => (
  <section aria-labelledby="steps-title" className={`${MEASURE} pb-28 md:pb-40`}>
    <Reveal>
      <h2 id="steps-title" className="text-3xl font-black md:text-6xl">
        چهار قدم تا فایل نهایی
      </h2>
    </Reveal>
    <ol className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
      {HOW_TO_STEPS.map((step, index) => (
        <li key={step.name}>
          <Reveal delay={index * 0.1}>
            <span className="step-number tabular-nums">{fa(index + 1)}</span>
            <h3 className="mt-3 text-lg font-bold">{step.name}</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--soft)]">{step.text}</p>
          </Reveal>
        </li>
      ))}
    </ol>
  </section>
);

const FaqGroup = ({ title, items, open }: { title: string; items: FaqItem[]; open?: boolean }) => (
  <div>
    <h3 className="pb-4 text-sm font-medium text-muted-foreground">{title}</h3>
    <div className="grid gap-2.5">
      {items.map((item, index) => (
        <details key={item.id} className="qa" open={open && index === 0}>
          <summary>{item.question}</summary>
          <p className="pb-5 text-sm leading-7 text-muted-foreground">{item.answer}</p>
        </details>
      ))}
    </div>
  </div>
);

/** Native `<details>`: a closed Radix item leaves its answer out of the HTML. */
export const Faq = ({ product, subscription }: { product: FaqItem[]; subscription: FaqItem[] }) => (
  <section aria-labelledby="faq-title" className={`${MEASURE} py-20 md:py-28`}>
    <h2 id="faq-title" className="text-center text-3xl font-black md:text-5xl">
      پرسش‌های پرتکرار
    </h2>
    <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-8">
      <FaqGroup title="درباره‌ی پک‌ساز" items={product} open />
      <FaqGroup title="اشتراک و پرداخت" items={subscription} />
    </div>
    <div className="mt-8 text-center">
      <Link href="/faq" className="inline-flex items-center gap-2 text-sm font-bold text-primary">
        همه‌ی پرسش‌ها
        <ArrowLeft className="size-4" />
      </Link>
    </div>
  </section>
);

export const Course = () => (
  <section aria-labelledby="course-title" className={`${MEASURE} pb-20 md:pb-28`}>
    <div className="relative isolate grid items-center gap-8 overflow-hidden rounded-[2rem] bg-violet-50 p-6 md:grid-cols-2 md:p-12 lg:gap-14">
      <div>
        <p className="eyebrow">از صفر یاد بگیر</p>
        <h2 id="course-title" className="mt-3 text-2xl leading-[1.35] font-black md:text-4xl">
          دوره‌ی جامع طراحی بسته‌بندی و لیبل
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground">از ساخت دایلاین تا فایل نهایی چاپ، گام‌به‌گام و بر پایه‌ی پروژه‌های واقعی، با تدریس علیرضا ازگینی.</p>
        <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {COURSE_FACTS.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
        <a href={RELATED_COURSE_URL} target="_blank" rel="noreferrer" className="btn-glass mt-6">
          مشاهده‌ی دوره
          <ArrowUpRight className="size-4" />
        </a>
      </div>
      <Image src={packagingCoursePic} alt="دوره‌ی جامع طراحی بسته‌بندی و لیبل" width={720} height={540} loading="lazy" sizes="(max-width: 768px) 100vw, 45vw" className="aspect-[4/3] w-full rounded-2xl object-cover" />
    </div>
  </section>
);

export const FinalCta = ({ sizes, slug }: { sizes: Drawing[]; slug: string }) => (
  <section aria-labelledby="final-title" className="relative isolate overflow-hidden py-32 text-center md:py-48">
    <Contours drawings={sizes} className="absolute top-1/2 left-1/2 -z-10 h-[150%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 opacity-50" />
    <Reveal>
      <h2 id="final-title" className="mx-auto max-w-4xl px-5 text-4xl leading-[1.2] font-black md:text-7xl">
        جعبه‌ی بعدی‌ات <span className="text-light">همین‌جا</span> شروع می‌شود
      </h2>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href={`/dieline/${slug}`} className="btn-primary">
          شروع طراحی
          <ArrowLeft className="size-4" />
        </Link>
        <Link href="/dielines" className="btn-glass">
          کتابخانه‌ی قالب‌ها
        </Link>
      </div>
    </Reveal>
  </section>
);
