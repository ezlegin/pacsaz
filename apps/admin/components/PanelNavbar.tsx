import { mainURL } from "@/data/envs";
import { Button } from "@repo/ui/components/button";
import { SidebarTrigger } from "@repo/ui/components/sidebar";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

const PanelNavbar = () => {
  return (
    <div className="flex items-center justify-between gap-3 border-b pb-4">
      <SidebarTrigger className="text-muted-foreground" />

      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link target="_blank" href={mainURL}>
            <ExternalLink />
            Open site
          </Link>
        </Button>
        <LogoutButton />
      </div>
    </div>
  );
};

export default PanelNavbar;
