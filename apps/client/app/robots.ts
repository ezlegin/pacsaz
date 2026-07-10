import { privateRoutes } from "@/proxy";
import type { MetadataRoute } from "next";

const url = process.env.NEXT_PUBLIC_MAIN_URL || "https://pacsaz.ir";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...privateRoutes.map((route) => route + "/*")],
      },
    ],
    sitemap: `${url}/sitemap.xml`,
  };
}
