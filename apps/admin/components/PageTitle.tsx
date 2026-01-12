import { cn } from "@repo/ui/lib/utils";
import React from "react";

const PageTitle = ({
  title,
  className,
}: {
  title: string;
  className?: string;
}) => {
  return <h2 className={cn("text-xl font-semibold", className)}>{title}</h2>;
};

export default PageTitle;
