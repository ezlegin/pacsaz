import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { HTMLAttributeAnchorTarget, ReactNode } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../dialog";

const ActionButton = (param: {
  icon: LucideIcon;
  href?: string;
  target?: HTMLAttributeAnchorTarget;
  className?: string;
  dialogClassName?: string;
  iconClass?: string;
  children?: ReactNode;
}) => {
  if (param.href)
    return (
      <Link href={param.href} target={param.target}>
        <ActButton>
          <param.icon size={14} className={param.iconClass} />
        </ActButton>
      </Link>
    );

  return (
    <Dialog>
      <DialogTrigger>
        <ActButton>
          <param.icon size={14} className={param.iconClass} />
        </ActButton>
      </DialogTrigger>
      <DialogContent className={param.dialogClassName}>
        {param.children}
      </DialogContent>
    </Dialog>
  );
};

export default ActionButton;

export const ActButton = ({ children }: { children: ReactNode }) => {
  return (
    <div
      className={
        "rounded-full bg-muted flex items-center justify-center hover:bg-gray-200 cursor-pointer text-muted-foreground hover:text-foreground size-7"
      }
    >
      {children}
    </div>
  );
};
