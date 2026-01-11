import { Button } from "@repo/ui/components/button";
import { Eye } from "lucide-react";
import React from "react";

const ViewButton = () => {
  return (
    <Button
      variant={"secondary"}
      size={"icon"}
      className="rounded-full text-muted-foreground hover:text-foreground"
    >
      <Eye />
    </Button>
  );
};

export default ViewButton;
