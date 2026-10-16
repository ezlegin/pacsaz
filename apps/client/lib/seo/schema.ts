/**
 * schema.org builders.
 *
 * Every function returns a plain object that is serialised into a
 * `<script type="application/ld+json">` tag by `<JsonLd />`. They are typed with
 * `WithContext` so a node is only valid where a full JSON-LD document is
 * expected, which keeps `@context` from being nested by accident.
 *
 * Nodes are stitched together with stable `@id` values from `./site` rather than
 * being re-declared on each page: a crawler that sees one Organization node on
 * the home page and bare `@id` references elsewhere resolves them into one
 * entity, which is what the brand entity needs to be recognised as.
 */

import {
  absoluteUrl,
  breadcrumbId,
  CONTACT,
  OG_IMAGE,
  ORGANIZATION_ID,
  RELATED_COURSE_URL,
  SITE_ALT_NAMES,
  SITE_DESCRIPTION,
  SITE_LANG,
  SITE_NAME,
  SITE_NAME_LATIN,
  SITE_TAGLINE,
  SOCIAL_PROFILES,
  WEBSITE_ID,
} from "./site";

export type JsonLdNode = Record<string, unknown>;

/** A complete JSON-LD document, i.e. one that carries `@context`. */
export type WithContext<T extends JsonLdNode = JsonLdNode> = T & {
  "@context": "https://schema.org";
};

const SCHEMA_CONTEXT = "https://schema.org" as const;

export const withContext = <T extends JsonLdNode>(
  node: T,
): WithContext<T> => ({ "@context": SCHEMA_CONTEXT, ...node });

/**
 * Escapes the characters that would let a value break out of the surrounding
 * `<script>` element when the JSON is inlined. `JSON.stringify` leaves `<` and
 * `>` alone, so a `</script>` inside a dieline title would end the tag and turn
 * the remainder into markup. The Unicode escapes are valid JSON and decode back
 * to the original characters inside the crawler's parser.
 *
 * `&` is deliberately *not* escaped: it cannot close the element, and escaping
 * it would corrupt URLs that carry query strings for consumers that treat the
 * escaping as literal text.
 */
export const serialiseJsonLd = (data: unknown): string =>
  JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");

/* -------------------------------------------------------------------------- */
/*                             brand-level entities                           */
/* -------------------------------------------------------------------------- */

/**
 * The brand. Declared once, on the home page, because that is the URL the
 * `@id` resolves to and where a knowledge panel expects to find it.
 */
export const organizationSchema = (): WithContext => {
  const logo = absoluteUrl("/logos/pacsaz-logo-full.svg");

  return withContext({
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    alternateName: [...SITE_ALT_NAMES],
    url: absoluteUrl("/"),
    description: SITE_DESCRIPTION,
    slogan: SITE_TAGLINE,
    logo: {
      "@type": "ImageObject",
      url: logo,
      contentUrl: logo,
      caption: SITE_NAME,
    },
    image: absoluteUrl(OG_IMAGE.url),
    email: CONTACT.email,
    telephone: CONTACT.telephone,
    sameAs: SOCIAL_PROFILES,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        name: "پشتیبانی پک‌ساز",
        email: CONTACT.email,
        telephone: CONTACT.telephone,
        availableLanguage: ["fa", "Persian"],
        areaServed: CONTACT.areaServed,
        hoursAvailable: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "https://schema.org/Saturday",
            "https://schema.org/Sunday",
            "https://schema.org/Monday",
            "https://schema.org/Tuesday",
            "https://schema.org/Wednesday",
          ],
          opens: "09:00",
          closes: "14:00",
        },
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: CONTACT.country,
    },
    knowsAbout: [
      "دایلاین بسته‌بندی",
      "طراحی جعبه",
      "بسته‌بندی",
      "dieline",
      "package design",
      "FEFCO",
    ],
    makesOffer: {
      "@type": "Offer",
      itemOffered: { "@id": WEBSITE_ID },
    },
  });
};

/**
 * The site itself, plus the sitelinks search box. `SearchAction` points at the
 * catalogue because that is the only route the site can actually search.
 */
export const websiteSchema = (): WithContext =>
  withContext({
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: absoluteUrl("/"),
    name: SITE_NAME,
    alternateName: SITE_NAME_LATIN,
    description: SITE_DESCRIPTION,
    inLanguage: SITE_LANG,
    publisher: { "@id": ORGANIZATION_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/dielines")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  });

/* -------------------------------------------------------------------------- */
/*                                  the product                               */
/* -------------------------------------------------------------------------- */

/**
 * The service behind the site, described as a `WebApplication`.
 *
 * `WebApplication` rather than `SoftwareApplication` because there is nothing to
 * install — it runs in the browser — and it is where Google expects feature and
 * pricing information for a web tool.
 */
export const webApplicationSchema = ({
  prices,
}: {
  /** Cheapest published plan per billing period, in IRR. */
  prices?: { monthly?: number; threeMonth?: number; annual?: number };
} = {}): WithContext => {
  const offers = buildOfferCatalogue(prices);

  return withContext({
    "@type": "WebApplication",
    "@id": `${absoluteUrl("/")}#webapp`,
    name: SITE_NAME,
    alternateName: SITE_NAME_LATIN,
    url: absoluteUrl("/"),
    description: SITE_DESCRIPTION,
    applicationCategory: "DesignApplication",
    applicationSubCategory: "Packaging dieline generator",
    operatingSystem: "Web browser",
    browserRequirements: "Requires JavaScript",
    inLanguage: SITE_LANG,
    isAccessibleForFree: true,
    provider: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    featureList: [
      "ساخت دایلاین جعبه بر اساس ابعاد دلخواه",
      "محاسبه ابعاد تولید، داخلی و خارجی",
      "خروجی DXF برای ایلاستریتور و اتوکد",
      "خروجی PDF با اندازه واقعی",
      "خروجی SVG آماده ویرایش",
      "انتخاب متریال و ضخامت مقوا",
      "خطوط برش، تا و بلید",
      "کتابخانه قالب‌های استاندارد بسته‌بندی",
    ],
    screenshot: absoluteUrl(OG_IMAGE.url),
    ...(offers.length ? { offers } : {}),
  });
};

/** Maps the seeded plan prices onto schema.org `Offer` nodes. */
const buildOfferCatalogue = (
  prices?: { monthly?: number; threeMonth?: number; annual?: number },
): JsonLdNode[] => {
  if (!prices) return [];

  const periods: {
    key: keyof typeof prices;
    name: string;
    months: number;
  }[] = [
    { key: "monthly", name: "اشتراک یک‌ماهه", months: 1 },
    { key: "threeMonth", name: "اشتراک سه‌ماهه", months: 3 },
    { key: "annual", name: "اشتراک یک‌ساله", months: 12 },
  ];

  return periods.flatMap(({ key, name, months }) => {
    const amount = prices[key];
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      return [];
    }

    return [
      {
        "@type": "Offer",
        name,
        price: amount,
        priceCurrency: "IRR",
        availability: "https://schema.org/InStock",
        url: absoluteUrl("/subscription"),
        category: "subscription",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: amount,
          priceCurrency: "IRR",
          billingDuration: months,
          billingIncrement: 1,
          unitCode: "MON",
        },
      } satisfies JsonLdNode,
    ];
  });
};

/* -------------------------------------------------------------------------- */
/*                          navigation and collections                        */
/* -------------------------------------------------------------------------- */

export type Crumb = {
  name: string;
  /** Site-root-relative path, e.g. `/dielines`. */
  path: string;
};

/**
 * A breadcrumb trail. The last crumb is the current page, as Google requires,
 * and its `item` is still emitted because the page is itself a valid URL.
 */
export const breadcrumbSchema = (crumbs: Crumb[], currentPath: string): WithContext =>
  withContext({
    "@type": "BreadcrumbList",
    "@id": breadcrumbId(currentPath),
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  });

/**
 * An ordered collection of pages, used for the catalogue and its categories so
 * the individual dielines are discoverable from the listing itself.
 */
export const itemListSchema = ({
  name,
  description,
  path,
  items,
}: {
  name: string;
  description?: string;
  path: string;
  items: { name: string; path: string; image?: string | null }[];
}): WithContext =>
  withContext({
    "@type": "ItemList",
    "@id": `${absoluteUrl(path)}#itemlist`,
    name,
    ...(description ? { description } : {}),
    numberOfItems: items.length,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
      ...(item.image ? { image: item.image } : {}),
    })),
  });

/** A generic `CollectionPage`, so the listing pages describe themselves too. */
export const collectionPageSchema = ({
  name,
  description,
  path,
  breadcrumbPath,
}: {
  name: string;
  description: string;
  path: string;
  breadcrumbPath?: string;
}): WithContext =>
  withContext({
    "@type": "CollectionPage",
    "@id": `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name,
    description,
    inLanguage: SITE_LANG,
    isPartOf: { "@id": WEBSITE_ID },
    ...(breadcrumbPath
      ? { breadcrumb: { "@id": breadcrumbId(breadcrumbPath) } }
      : {}),
  });

/** A `WebPage` node for the content pages (about, contact, terms, ...). */
export const webPageSchema = ({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}): WithContext =>
  withContext({
    "@type": "WebPage",
    "@id": `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name,
    description,
    inLanguage: SITE_LANG,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
  });

/* -------------------------------------------------------------------------- */
/*                                 the dieline                                */
/* -------------------------------------------------------------------------- */

export type DielineForSchema = {
  title: string;
  slug: string;
  materials: string;
  dimensionTypes: string;
  minWidth: number;
  minLength: number;
  minHeight: number;
  maxWidth: number;
  maxLength: number;
  maxHeight: number;
  updatedAt: Date;
  createdAt: Date;
  dielineImage: { url: string } | null;
  modelImage: { url: string } | null;
  categoryByModel: { title: string }[];
  categoryByUsage: { title: string }[];
};

/**
 * A downloadable dieline, modelled as a `Product`.
 *
 * `Product` is deliberate: it is what Google can turn into a rich result with
 * price and availability, and a dieline genuinely is the thing being sold —
 * access to it is what a subscription buys. `additionalType` records that it is
 * a digital template, which answer engines pick up.
 *
 * The dieline file itself is not a URL a crawler can fetch (it is generated
 * client-side and gated behind a plan), so no `contentUrl` is claimed.
 */
export const dielineProductSchema = (
  dieline: DielineForSchema,
  { path, freeOffer }: { path: string; freeOffer: boolean },
): WithContext => {
  const image = dieline.dielineImage?.url
    ? [dieline.dielineImage.url, dieline.modelImage?.url].filter(
        (url): url is string => Boolean(url),
      )
    : [absoluteUrl(OG_IMAGE.url)];

  const category = [
    ...dieline.categoryByModel.map((c) => c.title),
    ...dieline.categoryByUsage.map((c) => c.title),
  ];

  const materials = dieline.materials
    .split(",")
    .map((material) => material.trim())
    .filter(Boolean);

  return withContext({
    "@type": ["Product", "CreativeWork"],
    "@id": `${absoluteUrl(path)}#product`,
    additionalType: "https://schema.org/DigitalDocument",
    name: `دایلاین ${dieline.title}`,
    alternateName: dieline.title,
    url: absoluteUrl(path),
    /**
     * `Dieline.specification` is a JSON geometry document, not prose — it is
     * parsed into a spec tree by the editor. Echoing it into structured data
     * would publish raw JSON as the product description, so the text is written
     * from the fields that are actually human-readable: the title, the size
     * range and the materials.
     */
    description: dielineDescription(dieline),
    inLanguage: SITE_LANG,
    image,
    datePublished: dieline.createdAt.toISOString(),
    dateModified: dieline.updatedAt.toISOString(),
    ...(category.length ? { category } : {}),
    ...(materials.length ? { material: materials.join("، ") } : {}),
    keywords: [
      "دایلاین",
      "قالب بسته‌بندی",
      dieline.title,
      ...category,
      "طراحی جعبه",
    ].join(", "),
    brand: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    isPartOf: { "@id": WEBSITE_ID },
    /**
     * Sizes are real, published numbers, so they are exposed where an answer
     * engine can quote them — this is the question users actually ask.
     */
    additionalProperty: buildDimensionProperties(dieline),
    isAccessibleForFree: freeOffer,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(path),
      availability: "https://schema.org/InStock",
      priceCurrency: "IRR",
      ...(freeOffer
        ? { price: 0 }
        : {
            // The product is sold by subscription; the offer therefore points at
            // the pricing page instead of inventing a per-item price.
            priceSpecification: {
              "@type": "PriceSpecification",
              priceCurrency: "IRR",
              valueAddedTaxIncluded: false,
              url: absoluteUrl("/subscription"),
            },
          }),
    },
  });
};

/** Human-readable dimensions, the most-quoted fact about a dieline. */
const buildDimensionProperties = (dieline: DielineForSchema): JsonLdNode[] => {
  const mm = (value: number) => `${value} mm`;

  const ranges: { name: string; min: number; max: number }[] = [
    { name: "عرض (mm)", min: dieline.minWidth, max: dieline.maxWidth },
    { name: "طول (mm)", min: dieline.minLength, max: dieline.maxLength },
    { name: "ارتفاع (mm)", min: dieline.minHeight, max: dieline.maxHeight },
  ];

  return ranges
    .filter(({ min, max }) => Number.isFinite(min) && Number.isFinite(max))
    .flatMap(({ name, min, max }) => {
      const value = min === max ? mm(min) : `${mm(min)} تا ${mm(max)}`;

      return [
        {
          "@type": "PropertyValue",
          name,
          value,
          minValue: min,
          maxValue: max,
          unitCode: "MMT",
        } satisfies JsonLdNode,
      ];
    });
};

/**
 * The product blurb, assembled from the real columns rather than invented copy,
 * so the same sentence can appear in the meta description and the body.
 *
 * Kept inside the ~175-character window Google renders for a snippet: the sizes
 * are the reason someone clicks this result, so they must not be the part that
 * gets truncated. `specification` is deliberately not used — it is a JSON
 * geometry document, not text.
 */
export const dielineDescription = (dieline: {
  title: string;
  minWidth: number;
  minLength: number;
  minHeight: number;
  maxWidth: number;
  maxLength: number;
  maxHeight: number;
}): string => {
  const size = [
    `${dieline.minWidth}×${dieline.minLength}×${dieline.minHeight}`,
    `${dieline.maxWidth}×${dieline.maxLength}×${dieline.maxHeight}`,
  ].join(" تا ");

  return `دایلاین ${dieline.title}؛ ابعاد قابل تنظیم ${size} میلی‌متر، با خطوط برش، تا و بلید استاندارد و خروجی DXF، PDF و SVG آماده‌ی چاپ.`;
};

/* -------------------------------------------------------------------------- */
/*                                    FAQ                                     */
/* -------------------------------------------------------------------------- */

export const faqSchema = (
  items: { question: string; answer: string }[],
  path: string,
): WithContext =>
  withContext({
    "@type": "FAQPage",
    "@id": `${absoluteUrl(path)}#faq`,
    inLanguage: SITE_LANG,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  });

/**
 * `HowTo` for the product's core task. Answer engines surface these steps
 * directly, and it is the same sequence the editor actually implements.
 */
export const howToSchema = (): WithContext =>
  withContext({
    "@type": "HowTo",
    "@id": `${absoluteUrl("/")}#howto`,
    name: "چگونه دایلاین بسته‌بندی بسازیم؟",
    description:
      "ساخت دایلاین جعبه در پک‌ساز: قالب را انتخاب کن، ابعاد و متریال را تنظیم کن و خروجی آماده‌ی چاپ بگیر.",
    inLanguage: SITE_LANG,
    totalTime: "PT5M",
    tool: [{ "@type": "HowToTool", name: SITE_NAME }],
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "انتخاب قالب",
        text: "از کتابخانه قالب‌ها یک دایلاین پایه انتخاب کن یا از قالب خالی شروع کن.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "وارد کردن ابعاد",
        text: "عرض، طول و ارتفاع بسته را وارد کن؛ ابعاد تولید، داخلی و خارجی هم‌زمان محاسبه می‌شوند.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "تنظیم متریال و ضخامت",
        text: "متریال مقوا و ضخامت آن را انتخاب کن تا خطوط تا و بلید درست محاسبه شوند.",
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "دانلود خروجی",
        text: "فایل DXF، PDF یا SVG دایلاین را دانلود کن و برای چاپ به چاپخانه بفرست.",
      },
    ],
    publisher: { "@id": ORGANIZATION_ID },
  });

/** The external packaging course credited in the footer. */
export const courseSchema = (): WithContext =>
  withContext({
    "@type": "Course",
    name: "دوره طراحی بسته‌بندی",
    url: RELATED_COURSE_URL,
    inLanguage: SITE_LANG,
    provider: { "@id": ORGANIZATION_ID },
    about: "طراحی بسته‌بندی و دایلاین",
  });

/** The site's country, useful context for a locally-served product. */
export const areaServed = CONTACT.areaServed;
