"use client";

import { signOut } from "@repo/auth/react";
import { Button } from "@repo/ui/components/button";
import { LogOut } from "lucide-react";

const LogoutButton = () => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-destructive"
      onClick={() => signOut({ redirectTo: "/login" })}
    >
      <LogOut />
      Log out
    </Button>
  );
};

export default LogoutButton;
