import Diamond from "@/public/icons/Diamond";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/utils";
import { Info } from "lucide-react";
import { JSX } from "react";

/** Shared header for a settings group. Purely presentational. */
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
  const locked = isPremium !== undefined && !isPremium;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-xs font-bold">{title}</p>

          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                aria-label={`راهنمای ${title}`}
                className="grid size-5 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Info className="size-3.5" />
              </button>
            </DialogTrigger>
            <DialogContent dir="rtl" showCloseButton={false}>
              <DialogHeader dir="rtl">{infoContent}</DialogHeader>
            </DialogContent>
          </Dialog>
        </div>

        {locked && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="grid size-5 shrink-0 cursor-help place-items-center rounded-full bg-amber-500/12">
                <Diamond />
              </span>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="p-1 text-[11px]">فقط در پلن حرفه‌ای و سازمانی</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className={cn(locked && "opacity-60")}>{children}</div>
    </div>
  );
}
