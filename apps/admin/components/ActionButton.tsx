import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { LucideIcon } from "lucide-react";

const ActionButton = (param: {
  icon: LucideIcon;
  className?: string;
  iconClass?: string;
}) => {
  return (
    <Button
      variant={"secondary"}
      size={"icon"}
      className={cn(
        "rounded-full text-muted-foreground hover:text-foreground size-7",
        param.className
      )}
    >
      <param.icon className={cn("scale-90", param.iconClass)} />
    </Button>
  );
};

export default ActionButton;
