import { ReactNode } from "react";
import { cn } from "../../lib/utils";

const Flex = ({
  className,
  children,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex gap-3 items-center", className)}>{children}</div>
  );
};

export default Flex;
