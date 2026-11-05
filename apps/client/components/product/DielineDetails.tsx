import { materialLabel } from "@/lib/seo";
import { Dieline } from "@repo/db";
import { cn } from "@repo/ui/lib/utils";
import { ArrowLeft, Boxes, Check, Ruler, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const fa = (value: number) =>
  value.toLocaleString("fa-IR", { maximumFractionDigits: 1 });

/**
 * The subset of a dieline row this section renders.
 *
 * Deliberately narrower than `DielineType`: the page's own query does not load
 * `settings` or the image relations, and demanding them here would force the
 * detail query to fetch rows nothing on the page displays.
 */
type DielineDetailsData = Pick<
  Dieline,
  | "title"
  | "slug"
  | "description"
  | "materials"
  | "dimensionTypes"
  | "minWidth"
  | "minLength"
  | "minHeight"
  | "maxWidth"
  | "maxLength"
  | "maxHeight"
> & {
  categoryByModel?: { id: number; title: string; slug: string }[];
  categoryByUsage?: { id: number; title: string; slug: string }[];
  dielineImage?: { url: string } | null;
  modelImage?: { url: string } | null;
};

/**
 * The crawlable description of a dieline.
 *
 * The editor above it is a client component, so the HTML a crawler receives for
 * this route was previously an empty shell: the title, the sizes, the materials
 * and the categories only ever existed inside JavaScript. This renders the same
 * facts as server HTML — a single `h1`, a spec table, the materials, the
 * categories as links back into the catalogue, and a trail to the catalogue — so
 * the page has something to rank for and something to describe in an answer.
 *
 * Everything here comes from the database row; nothing is invented. Paragraphs of
 * the written description are separated by line breaks in the admin form.
 */
const DielineDetails = ({
  dieline,
  className,
}: {
  dieline: DielineDetailsData;
  className?: string;
}) => {
  const materials = dieline.materials
    .split(",")
    .map((material) => material.trim())
    .filter(Boolean);

  const paragraphs = dieline.description
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const images = [
    dieline.dielineImage && {
      url: dieline.dielineImage.url,
      alt: `نقشه‌ی باز دایلاین ${dieline.title}`,
    },
    dieline.modelImage && {
      url: dieline.modelImage.url,
      alt: `مدل جعبه ${dieline.title}`,
    },
  ].filter((image) => !!image);

  const categories = [
    ...(dieline.categoryByModel ?? []),
    ...(dieline.categoryByUsage ?? []),
  ];

  const dimensionTypes = dieline.dimensionTypes
    .split(",")
    .map((type) => type.trim())
    .filter(Boolean);

  const sizeSummary =
    dieline.minWidth === dieline.maxWidth &&
    dieline.minLength === dieline.maxLength &&
    dieline.minHeight === dieline.maxHeight
      ? `${dieline.minWidth} × ${dieline.minLength} × ${dieline.minHeight} میلی‌متر`
      : `${dieline.minWidth}×${dieline.minLength}×${dieline.minHeight} تا ${dieline.maxWidth}×${dieline.maxLength}×${dieline.maxHeight} میلی‌متر`;

  return (
    <section
      className={cn("mx-auto w-full max-w-3xl space-y-8 text-right", className)}
      aria-labelledby="dieline-title"
    >
      {/* --------------------------------- trail -------------------------------- */}
      <nav aria-label="مسیر صفحه">
        <ol className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          <li>
            <Link href="/" className="transition-colors hover:text-primary">
              صفحه اصلی
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link
              href="/dielines"
              className="transition-colors hover:text-primary"
            >
              قالب‌ها
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-foreground">
            {dieline.title}
          </li>
        </ol>
      </nav>

      {/* -------------------------------- heading ------------------------------- */}
      <header className="space-y-4">
        <h1 id="dieline-title" className="text-2xl font-extrabold tracking-tight">
          دایلاین {dieline.title}
        </h1>

        <p className="text-sm leading-7 text-muted-foreground">
          قالب دایلاین {dieline.title} در {fa(dieline.minWidth)}×
          {fa(dieline.minLength)}×{fa(dieline.minHeight)} تا{" "}
          {fa(dieline.maxWidth)}×{fa(dieline.maxLength)}×
          {fa(dieline.maxHeight)} میلی‌متر قابل تنظیم است. ابعاد و متریال را
          تغییر بده و خطوط برش، تا و بلید را با محاسبات دقیق تحویل بگیر؛ خروجی
          DXF، PDF و SVG آماده‌ی چاپ.
        </p>
      </header>

      {/* ------------------------------ description ----------------------------- */}
      {paragraphs.length > 0 && (
        <div className="space-y-3 text-sm leading-8">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      )}

      {/* -------------------------------- images -------------------------------- */}
      {images.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {images.map((image) => (
            <figure key={image.url} className="space-y-2">
              <Image
                src={image.url}
                alt={image.alt}
                width={640}
                height={480}
                sizes="(min-width: 640px) 384px, 100vw"
                className="aspect-[4/3] w-full rounded-2xl border bg-white object-contain"
              />
              <figcaption className="text-center text-[11px] text-muted-foreground">
                {image.alt}
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {/* -------------------------------- specs --------------------------------- */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-background p-5">
          <h2 className="mb-4 flex items-center gap-2 text-xs font-bold">
            <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
              <Ruler className="size-3.5" strokeWidth={1.9} />
            </span>
            ابعاد قابل تنظیم
          </h2>

          <dl className="space-y-2.5">
            {[
              {
                label: "عرض",
                value: `${fa(dieline.minWidth)} تا ${fa(dieline.maxWidth)} mm`,
              },
              {
                label: "طول",
                value: `${fa(dieline.minLength)} تا ${fa(dieline.maxLength)} mm`,
              },
              {
                label: "ارتفاع",
                value: `${fa(dieline.minHeight)} تا ${fa(dieline.maxHeight)} mm`,
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3 rounded-xl bg-muted/30 px-3.5 py-2.5"
              >
                <dt className="text-[11px] text-muted-foreground">{label}</dt>
                <dd
                  dir="ltr"
                  className="text-[11px] font-bold tabular-nums"
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-4">
          {materials.length > 0 && (
            <div className="rounded-2xl border bg-background p-5">
              <h2 className="mb-3 flex items-center gap-2 text-xs font-bold">
                <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Boxes className="size-3.5" strokeWidth={1.9} />
                </span>
                متریال پشتیبانی‌شده
              </h2>

              <ul className="flex flex-wrap gap-1.5">
                {materials.map((material) => (
                  <li
                    key={material}
                    className="rounded-lg bg-muted px-2.5 py-1 text-[11px] text-muted-foreground"
                  >
                    {materialLabel(material)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-2xl border bg-background p-5">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-bold">
              <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <Check className="size-3.5" strokeWidth={2.4} />
              </span>
              خروجی‌ها
            </h2>

            <ul className="space-y-2">
              {[
                "DXF برای ایلاستریتور و اتوکد",
                "PDF با اندازه واقعی",
                "SVG آماده ویرایش",
                "بدون واترمارک",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[11px] leading-6 text-muted-foreground"
                >
                  <Check
                    className="mt-1 size-3 shrink-0 text-primary"
                    strokeWidth={3}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ------------------------------ categories ------------------------------ */}
      {categories.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-xs font-bold">
            <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
              <Tag className="size-3.5" strokeWidth={1.9} />
            </span>
            دسته‌بندی‌ها
          </h2>

          <ul className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <li key={`${category.slug}-${category.id}`}>
                <Link
                  href={`/dielines/category/${category.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-[11px] transition-colors hover:border-primary/30 hover:text-primary"
                >
                  {category.title}
                  <ArrowLeft className="size-3" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ------------------------------- summary -------------------------------- */}
      <p className="rounded-2xl border bg-muted/30 p-5 text-[11px] leading-6 text-muted-foreground">
        ابعاد این دایلاین از {sizeSummary} قابل تنظیم است
        {dimensionTypes.length > 0
          ? ` و ابعاد ${
              dimensionTypes.length === 3
                ? "تولید، داخلی و خارجی"
                : dimensionTypes.join("، ")
            } را نمایش می‌دهد`
          : ""}
        . پیش از تولید، ابعاد و مشخصات فنی را با چاپخانه بررسی کنید.
      </p>
    </section>
  );
};

export default DielineDetails;
