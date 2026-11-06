import PanelNavbar from "@/components/PanelNavbar";
import { PanelSidebar } from "@/components/PanelSidebar";
import { getCurrentAdmin } from "@/lib/session";
import { SidebarProvider } from "@repo/ui/components/sidebar";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  // The proxy only checks that the token is genuine; this checks that the admin
  // it names still exists.
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  return (
    <SidebarProvider>
      <PanelSidebar admin={admin} />
      <div className="w-full max-w-7xl mx-auto p-5 space-y-5">
        <PanelNavbar />
        {children}
      </div>
    </SidebarProvider>
  );
}
