import { PanelSidebar } from "@/components/PanelSidebar";
import { SidebarProvider } from "@workspace/ui/components/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <PanelSidebar />
      <div className="p-5">{children}</div>
    </SidebarProvider>
  );
}
