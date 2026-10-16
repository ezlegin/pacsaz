import PanelNavbar from "@/components/Navbars/PanelNavbar";
import PanelSidebar from "@/components/PanelSidebar";
import { getSessionUser } from "@repo/auth/session";
import { SidebarProvider, SidebarTrigger } from "@repo/ui/components/sidebar";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user?.onboardingCompleted) redirect("/onboarding");

  return (
    <SidebarProvider>
      <PanelSidebar />
      <div className="w-full max-w-7xl mx-auto p-5 space-y-5">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <PanelNavbar />
        </div>

        {children}
      </div>
    </SidebarProvider>
  );
}

/**
 * The user panel.
 *
 * `noindex` on the layout applies to every route underneath it, so a new panel
 * page is private by default instead of relying on every author to remember.
 * `/panel/` is also disallowed in robots.txt; the two are complementary, because
 * `Disallow` stops the crawl while `noindex` keeps the URL out of the index.
 */
export const metadata: Metadata = {
  title: {
    default: "حساب کاربری",
    template: "%s - پک‌ساز",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};
