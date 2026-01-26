import "./styles.css";
import { Toaster } from "@repo/ui/components/sonner";
import { pacsazLogoIcon } from "@/public";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontFamily = "KalamehWeb";

  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ fontFamily }} className="antialiased">
        {children}
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
