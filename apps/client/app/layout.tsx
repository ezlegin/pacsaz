import Providers from "@/components/Providers";
import { pacsazLogoIcon } from "@/public";
import { Toaster } from "@repo/ui/components/sonner";
import "@repo/ui/globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontFamily = "KalamehWebFaNum";

  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body style={{ fontFamily }} className="antialiased">
        <Providers>{children}</Providers>
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
  title: "Pacsaz",
  icons: {
    icon: pacsazLogoIcon,
  },
};
