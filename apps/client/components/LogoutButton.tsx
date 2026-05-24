"use client";

import { signOut } from "@repo/auth/react";
import { Button } from "@repo/ui/components/button";
import { LogOut } from "lucide-react";

const LogoutButton = () => {
  return (
    <Button variant={"ghost"} onClick={() => signOut()}>
      <LogOut size={20} className="text-destructive/50" />
      <span>خروج از حساب</span>
    </Button>
  );
};

export default LogoutButton;
