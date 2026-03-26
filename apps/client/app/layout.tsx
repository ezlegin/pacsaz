import ProgressBarProvider from "@/components/ProgressBarProvider";
import UserProvider from "@/components/UserProvider";
import { getSessionUser } from "@/data/user";
import { pacsazLogoIcon } from "@/public";
import { Toaster } from "@repo/ui/components/sonner";
import "@repo/ui/globals.css";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontFamily = "KalamehWebFaNum";

  const user = await getSessionUser();

  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body style={{ fontFamily }} className="antialiased">
        <ProgressBarProvider>
          <UserProvider user={user}>{children}</UserProvider>
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
  title: "Pacsaz",
  icons: {
    icon: pacsazLogoIcon,
  },
};
