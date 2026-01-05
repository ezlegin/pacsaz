import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import React, { ReactNode } from "react";

const Card = ({
  children,
  className,
  primaryTheme,
  title,
}: {
  children: ReactNode;
  className?: string;
  primaryTheme?: boolean;
  title?: string;
}) => {
  return (
    <div
      className={cn(
        title ? "py-5 pt-3" : "p-5",
        primaryTheme
          ? "bg-primary-foreground border border-primary"
          : "border bg-accent/30",
        "rounded-2xl",
        className
      )}
    >
      {title && (
        <>
          <div className="px-5 pb-3 text-sm">{title}</div>
          <Separator />
        </>
      )}

      {title ? <div className={"p-5 pb-0"}>{children}</div> : children}
    </div>
  );
};

export default Card;
