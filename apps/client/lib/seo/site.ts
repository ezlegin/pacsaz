import { siteUrl } from "@/lib/consts";

/**
 * Single source of truth for everything search engines and answer engines need
 * to identify the brand.
 *
 * Keep this file free of side effects and database access: it is imported by the
 * root layout, `robots.ts`, `sitemap.ts` and every page that emits structured
 * data, so it must stay cheap and synchronous.
 */

/** The name people actually search for, in Persian. */
export const SITE_NAME = "پک‌ساز";

/**
 * The Latin transliteration. Persian users frequently type the brand in Latin
 * script ("pacsaz"), so it is declared as an alternate name rather than dropped.
 */
export const SITE_NAME_LATIN = "Pacsaz";

/**
 * Every spelling of the brand a user might type. Emitted as `<meta
 * name="alternate-name">` and as `Organization.alternateName`, because a search
 * engine that has never seen "پک ساز" (with a space) cannot guess it is the same
 * entity as "پک‌ساز" (with a zero-width non-joiner).
 */
export const SITE_ALT_NAMES = [
  SITE_NAME_LATIN,
  "Pacsaz.ir",
  "پک ساز",
  "پکساز",
  "pack saz",
] as const;


/**
 * The canonical origin.
 *
 * `siteUrl` is typed `string | undefined` because `NEXT_PUBLIC_MAIN_URL` may be
 * absent, so it is narrowed here once: every builder below needs an origin, and a
 * `undefined` leaking into a canonical URL silently produces a relative one.
 */
const CANONICAL_ORIGIN = (siteUrl ?? "https://pacsaz.ir").replace(/\/+$/, "");

export const SITE_URL = CANONICAL_ORIGIN;

export const SITE_LOCALE = "fa_IR";
export const SITE_LANG = "fa";
export const SITE_DIR = "rtl";

/**
 * The one-sentence answer to "what is this?". Written to be quotable verbatim by
 * an answer engine: it names the category, the audience and the differentiator
 * without marketing filler.
 */
export const SITE_TAGLINE =
  "ابزار آنلاین طراحی دایلاین بسته‌بندی و کتابخانه قالب‌های آماده";

/**
 * The default meta description.
 *
 * Held to roughly 155 characters on purpose: Google truncates a snippet past
 * about that length, and the tail of this sentence carries the differentiator —
 * cutting it off would waste the strongest reason to click.
 */
export const SITE_DESCRIPTION =
  "پک‌ساز ابزار آنلاین ساخت دایلاین بسته‌بندی است: ابعاد و متریال را وارد کن و خروجی DXF، PDF و SVG آماده‌ی چاپ بگیر. کتابخانه‌ای از قالب‌های استاندارد جعبه، بدون آزمون و خطا.";

/**
 * The head terms this site competes for, ordered by intent rather than volume.
 *
 * Google has ignored `meta keywords` for over a decade and this list is *not*
 * here for that. It is emitted as schema.org `keywords`/`knowsAbout` on the
 * product and organization nodes, which answer engines and internal site search
 * do read, and it keeps the vocabulary in one place so the visible copy, the
 * titles and the structured data cannot drift apart.
 */
export const SITE_KEYWORDS = [
  "دایلاین",
  "دای لاین",
  "دایلاین بسته بندی",
  "طراحی دایلاین",
  "قالب بسته بندی",
  "طراحی جعبه",
  "جعبه بسته بندی",
  "ساخت دایلاین آنلاین",
  "نرم افزار دایلاین",
  "dieline",
  "dieline generator",
] as const;


/** The default social card. Exactly 1200×630, as the platforms require. */
export const OG_IMAGE = {
  url: "/og-cover.png",
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
} as const;

export const CONTACT = {
  email: "pacsaz.ir@gmail.com",
  /** E.164, as required by schema.org `telephone`. */
  telephone: "+989962224177",
  telephoneLabel: "۰۹۹۶-۲۲۲-۴۱۷۷",
  areaServed: "IR",
  country: "IR",
  /** Staffed support hours, published in the footer. Used in `ContactPoint`. */
  hours: "Sa-We 09:00-14:00",
} as const;

/** The branded short links published on the site. */
export const SOCIAL_PROFILES: string[] = [
  "https://trustseal.enamad.ir/?id=8198265&Code=MgGrRlsux4O6hcApzFke6ZHyDZIVsRrI",
];

/** An external course the footer links out to, credited as the trainer. */
export const RELATED_COURSE_URL = "https://igraphical.ir/courses/packaging";

/**
 * Absolute URL for a path, so every canonical, `og:url` and sitemap entry is
 * absolute — which is what crawlers require and what `metadataBase` resolves
 * relative `alternates.canonical` values against.
 */
export const absoluteUrl = (path = "/"): string => {
  const base = (SITE_URL ?? "https://pacsaz.ir").replace(/\/+$/, "");
  if (!path || path === "/") return `${base}/`;
  return `${base}/${path.replace(/^\/+/, "")}`;
};

/**
 * The Organization node, reused by every other graph so the brand is described
 * once and referenced by `@id` everywhere else.
 */
export const ORGANIZATION_ID = `${absoluteUrl("/")}#organization`;
export const WEBSITE_ID = `${absoluteUrl("/")}#website`;

/** Builders for the stable `@id` values that stitch the graph together. */
export const breadcrumbId = (path: string) =>
  `${absoluteUrl(path)}#breadcrumb`;

export const webPageId = (path: string) => `${absoluteUrl(path)}#webpage`;
