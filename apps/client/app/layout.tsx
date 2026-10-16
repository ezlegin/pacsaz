import ProgressBarProvider from "@/components/ProgressBarProvider";
import ReduxProvider from "@/components/ReduxProvider";
import { BANNER_INLINE_SCRIPT } from "@/components/bannerStorage";
import JsonLd from "@/components/JsonLd";
import NotificationBanner from "@/components/NotificationBanner";
import { SubscriptionBannerProvider } from "@/components/SubscriptionBanner";
import { favIcon } from "@/public";
import { metadataBase, OG_IMAGE, SITE_ALT_NAMES, SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_TAGLINE, organizationSchema, websiteSchema } from "@/lib/seo";
import { Toaster } from "@repo/ui/components/sonner";
import "@repo/ui/globals.css";
import type { Metadata } from "next";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontFamily = "KalamehWebFaNum";

  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body style={{ fontFamily }} className="antialiased">
        {/*
          The brand entity, described once for the whole site. Google resolves the
          `@id` references used on every other page against these two nodes, so
          they must be present on the URL the ids point at — the home page.
        */}
        <JsonLd data={[organizationSchema(), websiteSchema()]} />

        {/*
          The announcement bar sits above everything, on every page. It renders
          nothing at all when no notification is configured.
        */}
        <NotificationBanner />
        {/*
          Reads the banner's dismissed flag before paint. Without this the server
          would render the banner and the client would remove it on hydration,
          which flashes a card the visitor already closed.
        */}
        <script
          dangerouslySetInnerHTML={{ __html: BANNER_INLINE_SCRIPT }}
        />
        <ProgressBarProvider>
          <SubscriptionBannerProvider>
            <ReduxProvider>{children}</ReduxProvider>
          </SubscriptionBannerProvider>
        </ProgressBarProvider>
        <Toaster
          richColors
          theme="light"
          position="top-center"
          style={{ fontFamily }}
        />
      </body>
    </html>
  );
}

/**
 * Site-wide metadata.
 *
 * `metadataBase` comes first in spirit: without it Next.js cannot resolve the
 * relative `og:image` and `alternates.canonical` values declared by pages, so
 * every social card and canonical silently degrades. Page-level metadata is
 * built with `buildMetadata` from `@/lib/seo`, which repeats the social card and
 * the robots directives because Next.js merges `metadata` shallowly — a page
 * that sets only `openGraph` would otherwise drop these.
 */
export const metadata: Metadata = {
  metadataBase,
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [...SITE_KEYWORDS],
  applicationName: SITE_NAME,
  category: "design",
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "fa_IR",
    alternateLocale: ["en_US"],
    url: "/",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE.url,
        width: OG_IMAGE.width,
        height: OG_IMAGE.height,
        alt: OG_IMAGE.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  icons: {
    icon: [
      { url: favIcon, type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Rich results need a full-size, uncropped image and an untruncated snippet.
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  other: {
    // Consumed by answer engines that read the alternate-name hints.
    "alternate-name": SITE_ALT_NAMES.join(", "),
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};
