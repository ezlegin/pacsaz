import PanelNavbar from "@/components/Navbars/PanelNavbar";
import PanelSidebar from "@/components/PanelSidebar";
import { SidebarProvider } from "@repo/ui/components/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <PanelSidebar />
      <div className="w-full max-w-7xl mx-auto p-5 space-y-5">
        <PanelNavbar />
        {children}
      </div>
    </SidebarProvider>
  );
}
