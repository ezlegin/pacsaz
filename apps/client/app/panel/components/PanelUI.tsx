import { cn } from "@repo/ui/lib/utils";
import { type LucideIcon } from "lucide-react";
import { ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/*                                   LAYOUT                                   */
/* -------------------------------------------------------------------------- */

/** Page shell: every panel page starts here so vertical rhythm never drifts. */
export const PanelPage = ({
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
/*                                   SURFACES                                 */
/* -------------------------------------------------------------------------- */

export const PanelCard = ({
  children,
  className,
  /** adds a brand gradient hairline on the top edge */
  accent,
}: {
  children: ReactNode;
  className?: string;
  accent?: boolean;
}) => (
  <section
    className={cn(
      "relative overflow-hidden rounded-2xl border bg-background",
      accent && "pt-px",
      className,
    )}
  >
    {accent && (
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-primary/40 to-transparent"
      />
    )}
    {children}
  </section>
);

export const SectionHeader = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex items-start justify-between gap-3 border-b px-5 py-4",
      className,
    )}
  >
    <div className="flex items-center gap-2.5">
      {Icon && (
        <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-4" strokeWidth={1.9} />
        </span>
      )}
      <div className="space-y-0.5">
        <h2 className="text-sm font-bold">{title}</h2>
        {description && (
          <p className="text-[11px] text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
    {action}
  </div>
);

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
    <span className="relative grid size-14 place-items-center rounded-3xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
      <Icon className="size-6" strokeWidth={1.7} />
    </span>

    <div className="max-w-sm space-y-1.5">
      <p className="text-sm font-bold">{title}</p>
      {description && (
        <p className="text-xs leading-6 text-muted-foreground">{description}</p>
      )}
    </div>

    {action}
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
        <p className="truncate text-lg font-extrabold tracking-tight">
          {value}
        </p>
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

/**
 * Table chrome shared by every panel list. Keeps header styling, row hover and
 * dividers identical across subscriptions, payments, saved and customers.
 */
export const Th = ({
  children,
  className,
  dir,
}: {
  children: ReactNode;
  className?: string;
  dir?: "ltr" | "rtl";
}) => (
  <th
    dir={dir}
    className={cn(
      "whitespace-nowrap px-4 py-3 text-right text-[11px] font-semibold text-muted-foreground",
      className,
    )}
  >
    {children}
  </th>
);

export const Td = ({
  children,
  className,
  dir,
}: {
  children: ReactNode;
  className?: string;
  dir?: "ltr" | "rtl";
}) => (
  <td
    dir={dir}
    className={cn(
      "whitespace-nowrap px-4 py-3.5 text-xs text-foreground",
      className,
    )}
  >
    {children}
  </td>
);

/* -------------------------------------------------------------------------- */
/*                                   PILLS                                    */
/* -------------------------------------------------------------------------- */

export type PillTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "muted"
  | "outline";

const PILL_TONES: Record<PillTone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-green-500/10 text-green-600",
  warning: "bg-amber-500/10 text-amber-600",
  danger: "bg-red-500/10 text-red-600",
  muted: "bg-muted text-muted-foreground",
  outline: "border text-muted-foreground",
};

export const Pill = ({
  children,
  tone = "muted",
  className,
}: {
  children: ReactNode;
  tone?: PillTone;
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold",
      PILL_TONES[tone],
      className,
    )}
  >
    {children}
  </span>
);

/** Plan level badge — visualises standard/pro/organization consistently. */
export const PlanPill = ({
  level,
  title,
}: {
  level: number;
  title: string;
}) => (
  <Pill tone={level >= 3 ? "primary" : level === 2 ? "warning" : "muted"}>
    {title}
  </Pill>
);
