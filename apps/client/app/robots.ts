import { siteUrl } from "@/lib/consts";
import { privateRoutes } from "@/proxy";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...privateRoutes.map((route) => route + "/*")],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
