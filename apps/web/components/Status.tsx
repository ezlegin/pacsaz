import { Status as StatusType } from "@/data/user";
import { Badge } from "@repo/ui/components/badge";
import React from "react";

const Status = ({ label, status }: { status: StatusType; label: string }) => {
  return (
    <Badge
      variant={
        status === "success"
          ? "lightGreen"
          : status === "failed"
            ? "lightRed"
            : "outline"
      }
      className="w-20"
    >
      {label}
    </Badge>
  );
};

export default Status;
