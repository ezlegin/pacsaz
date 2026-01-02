import { cn } from "@workspace/ui/lib/utils";
import React, { ReactNode } from "react";

const Card = ({
  children,
  className,
  primaryTheme,
}: {
  children: ReactNode;
  className?: string;
  primaryTheme?: boolean;
}) => {
  return (
    <div
      className={cn(
        "border p-5 rounded-2xl bg-accent/30",
        primaryTheme && "bg-primary-foreground border-primary",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
