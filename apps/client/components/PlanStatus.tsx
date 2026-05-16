import { PlanStatus as PlanStatusType } from "@repo/db";
import { Badge } from "@repo/ui/components/badge";
import React from "react";

const PlanStatus = ({ status }: { status: PlanStatusType }) => {
  const title = status === "active" ? "فعال" : "غیر فعال";

  return (
    <Badge variant={status === "active" ? "lightGreen" : "lightRed"}>
      {title}
    </Badge>
  );
};

export default PlanStatus;
