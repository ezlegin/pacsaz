import ReduxProvider from "@/components/ReduxProvider";
import { favIcon } from "@/public";
import { Toaster } from "@repo/ui/components/sonner";
import "@repo/ui/globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontFamily = "KalamehWeb";

  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ fontFamily }} className="antialiased">
        <ReduxProvider>{children}</ReduxProvider>
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
    icon: favIcon,
  },
};
