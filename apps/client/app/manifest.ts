import { SITE_DESCRIPTION, SITE_NAME, SITE_NAME_LATIN } from "@/lib/seo";
import type { MetadataRoute } from "next";

/**
 * The web app manifest.
 *
 * Served at `/manifest.webmanifest` and linked from the root layout. It is what
 * makes the site installable — which Chrome measures as an engagement signal —
 * and it gives Android a maskable icon, so the brand mark is not letterboxed on
 * a home screen.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — طراحی دایلاین بسته‌بندی`,
    short_name: SITE_NAME_LATIN,
    description: SITE_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    lang: "fa",
    dir: "rtl",
    background_color: "#ffffff",
    theme_color: "#8158ff",
    categories: ["design", "productivity", "business"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
