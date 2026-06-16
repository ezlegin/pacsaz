import DemoContainer from "@/components/DemoContainer";
import ProgressBarProvider from "@/components/ProgressBarProvider";
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
        <div className="hidden md:block">
          <ProgressBarProvider>{children}</ProgressBarProvider>
        </div>
        <DemoContainer />
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
