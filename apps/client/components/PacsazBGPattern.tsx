import { cn } from "@repo/ui/lib/utils";
import { ReactNode } from "react";

const PacsazBGPattern = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className="bg-accent absolute inset-0 h-full overflow-hidden">
      <div
        className={`
        absolute inset-0 
        bg-[url('/pacsaz-pattern.png')]
        bg-size-[800px]
        bg-repeat
        opacity-20
        pointer-events-none
      `}
      />
      <div className={cn("min-h-screen z-10", className)}>{children}</div>
    </div>
  );
};

export default PacsazBGPattern;
