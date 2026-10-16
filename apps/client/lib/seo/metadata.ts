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
 * Query strings are stripped: `/dielines?page=2` and `/dielines` are the same
 * document, and letting both be canonical is how a catalogue ends up competing
 * with itself in the index.
 */
export const canonicalFor = (path: string): string => {
  const clean = normalisePath(path).split("?")[0]?.split("#")[0] ?? "/";
  return absoluteUrl(clean === "" ? "/" : clean);
};

export const buildMetadata = ({
  title,
  description,
  path,
  noIndex = false,
  image,
  languages,
  publishedTime,
  modifiedTime,
  keywords,
  absoluteTitle,
}: MetadataInput): Metadata => {
  const url = canonicalFor(path);
  const card = image ?? OG_IMAGE;
  const fullTitle = `${title} | ${SITE_NAME}`;

  return {
    title: absoluteTitle ?? title,
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
          width: card.width ?? OG_IMAGE.width,
          height: card.height ?? OG_IMAGE.height,
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
