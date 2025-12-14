import "@workspace/ui/globals.css";
import "./fonts.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        style={{ fontFamily: "KalamehWebFaNum" }}
        className={`antialiased `}
      >
        {children}
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
