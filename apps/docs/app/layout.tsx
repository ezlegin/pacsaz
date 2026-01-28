import { pacsazLogoIcon } from "@/public";
import "@repo/ui/globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontFamily = "KalamehWeb";

  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ fontFamily }} className="antialiased dark bg-[#17181c]">
        <main>{children}</main>
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
