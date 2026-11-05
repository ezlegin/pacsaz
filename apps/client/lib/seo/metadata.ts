import type { Metadata } from "next";
import {
  absoluteUrl,
  OG_IMAGE,
  SITE_LOCALE,
  SITE_NAME,
  SITE_URL,
} from "./site";

/**
 * Metadata builders.
 *
 * Next.js `metadata` objects are merged shallowly down the route tree, which
 * means a page that sets `openGraph` silently drops the parent's. Building every
 * page's metadata through these helpers keeps the defaults — `metadataBase`,
 * the canonical, the social card, the Twitter card — intact on every route
 * instead of only on the pages that remembered to repeat them.
 */

type MetadataInput = {
  title: string;
  description: string;
  /** Site-root-relative path used for the canonical, `og:url` and the OG image. */
  path: string;
  /** Page of a paginated listing; each page past the first is its own document. */
  page?: number;
  /** Indexing directive. Defaults to indexable. */
  noIndex?: boolean;
  /** Overrides the site-wide social card, e.g. a dieline preview. */
  image?: { url: string; width?: number; height?: number; alt?: string };
  /** Absolute paths to other language versions, keyed by hreflang. */
  languages?: Record<string, string>;
  /** Extra `article:*` style timestamps. */
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
  /** Overrides the `<title>` element while keeping the OG title. */
  absoluteTitle?: string;
};

const normalisePath = (path: string): string => {
  if (!path.startsWith("/")) return `/${path}`;
  return path;
};

/**
 * The canonical form of a URL.
 *
 * Query strings are stripped, so size links such as `?w=100` do not compete with
 * the page. Pagination is the exception, added by `buildMetadata`: page 2 lists
 * different dielines, and pointing it at page 1 would ask Google to drop them.
 */
export const canonicalFor = (path: string): string => {
  const clean = normalisePath(path).split("?")[0]?.split("#")[0] ?? "/";
  return absoluteUrl(clean === "" ? "/" : clean);
};

export const buildMetadata = ({
  title,
  description,
  path,
  page = 1,
  noIndex = false,
  image,
  languages,
  publishedTime,
  modifiedTime,
  keywords,
  absoluteTitle,
}: MetadataInput): Metadata => {
  const pageSuffix = page > 1 ? ` - صفحه ${page.toLocaleString("fa-IR")}` : "";
  const url = canonicalFor(path) + (page > 1 ? `?page=${page}` : "");
  const card = image ?? OG_IMAGE;
  const pageTitle = `${title}${pageSuffix}`;
  const fullTitle = absoluteTitle ?? `${pageTitle} | ${SITE_NAME}`;

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : pageTitle,
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: {
      canonical: url,
      ...(languages ? { languages } : {}),
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      url,
      title: fullTitle,
      description,
      images: [
        {
          url: card.url,
          // Declared only when known: a dieline preview can be any shape.
          ...(card.width ? { width: card.width } : {}),
          ...(card.height ? { height: card.height } : {}),
          alt: card.alt ?? title,
        },
      ],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [card.url],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: { index: false, follow: false },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            // Rich results need full-size, uncropped images and long snippets.
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
};

/**
 * Absolute origin, shaped for `metadataBase`.
 *
 * `metadataBase` is the important one: without it Next.js cannot resolve the
 * relative `og:image` path declared on individual pages, and every social card
 * silently falls back to nothing.
 */
export const metadataBase = new URL(
  (SITE_URL ?? "https://pacsaz.ir").replace(/\/+$/, "") + "/",
);
