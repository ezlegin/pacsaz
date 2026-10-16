import ProgressBarProvider from "@/components/ProgressBarProvider";
import ReduxProvider from "@/components/ReduxProvider";
import { BANNER_INLINE_SCRIPT } from "@/components/bannerStorage";
import NotificationBanner from "@/components/NotificationBanner";
import { SubscriptionBannerProvider } from "@/components/SubscriptionBanner";
import { favIcon } from "@/public";
import { Toaster } from "@repo/ui/components/sonner";
import "@repo/ui/globals.css";

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

export const metadata = {
  title: {
    default: "پک‌ساز",
    template: "%s - پک‌ساز",
  },
  description: "طراحی دایلاین، بدون آزمون و خطا!",
  icons: {
    icon: favIcon,
  },
};
