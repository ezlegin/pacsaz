import {
  AI_CITATION_BOTS,
  AI_TRAINING_BOTS,
  DISALLOWED_PATHS,
  SEARCH_BOTS,
} from "@/lib/seo/routes";
import { absoluteUrl } from "@/lib/seo/site";
import type { MetadataRoute } from "next";

/**
 * `/robots.txt`.
 *
 * Rendered per request rather than at build time so it always reflects
 * `NEXT_PUBLIC_MAIN_URL`; a robots file that advertises the wrong origin's
 * sitemap is worse than none, because crawlers treat it as authoritative.
 */
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const disallow = [...DISALLOWED_PATHS];

  /**
   * Googlebot and friends get a `crawlDelay` of zero: the site is small, and
   * slowing the crawler only delays indexation. The AI agents are throttled
   * because they are the ones that fetch in bursts.
   */
  const rules: MetadataRoute.Robots["rules"] = [
    {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    {
      userAgent: [...SEARCH_BOTS],
      allow: "/",
      disallow,
    },
    {
      userAgent: [...AI_CITATION_BOTS],
      allow: "/",
      disallow,
      crawlDelay: 1,
    },
    {
      userAgent: [...AI_TRAINING_BOTS],
      allow: "/",
      disallow,
      crawlDelay: 2,
    },
    /**
     * Scrapers with no discoverability upside: they neither answer with a link
     * nor feed a search index, they only consume bandwidth.
     */
    {
      userAgent: [
        "AhrefsBot",
        "SemrushBot",
        "MJ12bot",
        "DotBot",
        "DataForSeoBot",
      ],
      disallow: "/",
    },
  ];

  return {
    rules,
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
