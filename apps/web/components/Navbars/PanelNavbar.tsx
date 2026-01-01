import { Button } from "@workspace/ui/components/button";
import { LogOut } from "lucide-react";
import React from "react";

const PanelNavbar = () => {
  return (
    <div className="w-full">
      <div className="w-fit mr-auto">
        <Button variant={"ghost"}>
          <LogOut size={20} className="text-destructive/50" />
          <span>خروج از حساب</span>
        </Button>
      </div>
    </div>
  );
};

export default PanelNavbar;
