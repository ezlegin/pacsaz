import Diamond from "@/public/icons/Diamond";
import { Button } from "@workspace/ui/components/button";
import React from "react";

const NavbarButtons = () => {
  return (
    <div className="flex gap-3 items-center">
      <Button variant={"ghost"} className="gap-1">
        <Diamond />
        اشتراک
      </Button>
      <div>
        <div className="w-[1px] ml-3 h-6 bg-slate-300" />
      </div>
      <Button>حساب کاربری</Button>
    </div>
  );
};

export default NavbarButtons;
