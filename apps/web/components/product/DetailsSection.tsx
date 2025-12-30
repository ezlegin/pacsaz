import Diamond from "@/public/icons/Diamond";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
} from "@workspace/ui/components/dialog";
import { cn } from "@workspace/ui/lib/utils";
import { Info } from "lucide-react";
import { JSX } from "react";

export function Section({
  title,
  children,
  infoContent,
  isPremium,
  className,
}: {
  title: string;
  infoContent: JSX.Element;
  children: React.ReactNode;
  isPremium?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between">
        <p className="flex items-center gap-1 text-sm font-semibold">
          {title}
          <Dialog>
            <DialogTrigger dir="rtl">
              <Info
                size={14}
                className="text-muted-foreground cursor-pointer hover:text-primary"
              />
            </DialogTrigger>
            <DialogContent dir="rtl" showCloseButton={false}>
              <DialogHeader dir="rtl">{infoContent}</DialogHeader>
            </DialogContent>
          </Dialog>
        </p>

        {isPremium && (
          <div>
            <Diamond />
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
