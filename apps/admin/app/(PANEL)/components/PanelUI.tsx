import { cn } from "@repo/ui/lib/utils";
import { type LucideIcon } from "lucide-react";
import { ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/*                                   LAYOUT                                   */
/* -------------------------------------------------------------------------- */

/** Page shell so admin pages keep a consistent vertical rhythm. */
export const Page = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => <div className={cn("space-y-6", className)}>{children}</div>;

export const PageHeader = ({
  icon: Icon,
  title,
  description,
  actions,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actions?: ReactNode;
}) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="flex items-start gap-3.5">
      {Icon && (
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-primary/20">
          <Icon className="size-5" strokeWidth={1.9} />
        </span>
      )}

      <div className="space-y-1">
        <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-xl text-xs leading-6 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>

    {actions && (
      <div className="flex flex-wrap items-center gap-2">{actions}</div>
    )}
  </div>
);

/* -------------------------------------------------------------------------- */
/*                                    STATS                                   */
/* -------------------------------------------------------------------------- */

export const StatTile = ({
  icon: Icon,
  label,
  value,
  hint,
  tone = "plain",
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "plain" | "primary" | "warning";
  className?: string;
}) => {
  const tones = {
    plain: "border bg-background",
    primary:
      "border-transparent bg-gradient-to-bl from-primary to-primary/85 text-primary-foreground shadow-lg shadow-primary/20",
    warning: "border-amber-500/30 bg-amber-500/[0.06]",
  } as const;

  const isPrimary = tone === "primary";

  return (
    <div
      className={cn(
        "flex items-start gap-3.5 rounded-2xl p-5",
        tones[tone],
        className,
      )}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl",
          isPrimary ? "bg-white/15" : "bg-primary/10 text-primary",
          tone === "warning" && "bg-amber-500/15 text-amber-600",
        )}
      >
        <Icon className="size-4.5" strokeWidth={1.8} />
      </span>

      <div className="min-w-0 space-y-1">
        <p
          className={cn(
            "text-[11px] font-medium",
            isPrimary ? "text-primary-foreground/80" : "text-muted-foreground",
          )}
        >
          {label}
        </p>
        <p className="truncate text-lg font-extrabold tracking-tight">{value}</p>
        {hint && (
          <p
            className={cn(
              "text-[10px]",
              isPrimary ? "text-primary-foreground/70" : "text-muted-foreground",
            )}
          >
            {hint}
          </p>
        )}
      </div>
    </div>
  );
};
