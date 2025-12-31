import Diamond from "@/public/icons/Diamond";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import React from "react";

const NavbarButtons = () => {
  return (
    <div className="flex gap-3 items-center">
      <Link href={"/subscription"}>
        <Button variant={"ghost"} className="gap-1">
          <Diamond />
          اشتراک
        </Button>
      </Link>
      <div>
        <div className="w-[1px] ml-3 h-6 bg-slate-300" />
      </div>
      <Link href={"/login"}>
        <Button>حساب کاربری</Button>
      </Link>
    </div>
  );
};

export default NavbarButtons;
