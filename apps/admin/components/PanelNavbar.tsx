import { Button } from "@repo/ui/components/button";
import { LogOut } from "lucide-react";

const PanelNavbar = () => {
  return (
    <div className="w-full">
      <div className="ml-auto w-fit">
        <Button variant={"ghost"}>
          <span>Log Out</span>
          <LogOut size={20} className="text-destructive/50" />
        </Button>
      </div>
    </div>
  );
};

export default PanelNavbar;
