import "@repo/ui/globals.css";
import { pacsazLogoIcon } from "@/public";
import { Toaster } from "@repo/ui/components/sonner";
import UserProvider from "@/components/UserProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontFamily = "KalamehWebFaNum";
  const user = null; //todo: AUTH Fetch

  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body style={{ fontFamily }} className="antialiased">
        <UserProvider user={user}>{children}</UserProvider>
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
