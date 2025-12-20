import { Toaster } from "@workspace/ui/components/sonner";
import "@workspace/ui/globals.css";
import "./fonts.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontFamily = "KalamehWebFaNum";
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body style={{ fontFamily }} className={`antialiased `}>
        {children}
        <Toaster theme="light" position="top-center" style={{ fontFamily }} />
      </body>
    </html>
  );
}

export const metadata = {
  title: "Pacsaz",
  icons: {
    icon: "/pacsaz-logo.svg",
  },
};
