import { cn } from "@workspace/ui/lib/utils";
import React, { ReactNode } from "react";

const Card = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("border p-5 rounded-2xl bg-accent/30", className)}>
      {children}
    </div>
  );
};

export default Card;
