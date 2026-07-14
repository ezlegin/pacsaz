import PanelNavbar from "@/components/Navbars/PanelNavbar";
import PanelSidebar from "@/components/PanelSidebar";
import { getSessionUser } from "@repo/auth/session";
import { SidebarProvider, SidebarTrigger } from "@repo/ui/components/sidebar";
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

export const metadata = {
  title: {
    default: "حساب کاربری",
    template: "%s - پک‌ساز",
  },
};
