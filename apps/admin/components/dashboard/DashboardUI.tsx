import { cn } from "@repo/ui/lib/utils";
import { type LucideIcon } from "lucide-react";
import { ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/*                                  PRIMITIVES                                */
/* -------------------------------------------------------------------------- */

export const Panel = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <section
    className={cn(
      "relative overflow-hidden rounded-2xl border bg-background p-5",
      className,
    )}
  >
    {children}
  </section>
);

export const PanelHeader = ({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) => (
  <div className="mb-4 flex items-start justify-between gap-3">
    <div className="space-y-0.5">
      <h3 className="text-sm font-semibold">{title}</h3>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
    {action}
  </div>
);

export const EmptyState = ({
  icon: Icon,
  title,
  hint,
  className,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  className?: string;
}) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-8 text-center",
      className,
    )}
  >
    <span className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground">
      <Icon className="size-4" />
    </span>
    <p className="text-xs font-medium">{title}</p>
    {hint && (
      <p className="max-w-xs text-[11px] leading-5 text-muted-foreground">
        {hint}
      </p>
    )}
  </div>
);

/* -------------------------------------------------------------------------- */
/*                                 KPI CARDS                                  */
/* -------------------------------------------------------------------------- */

export type KpiTone = "primary" | "plain" | "warning";

const TONE: Record<KpiTone, { card: string; icon: string; value: string }> = {
  primary: {
    card: "border-transparent bg-gradient-to-bl from-primary to-primary/85 text-primary-foreground shadow-lg shadow-primary/20",
    icon: "bg-white/15 text-primary-foreground",
    value: "text-primary-foreground",
  },
  plain: {
    card: "bg-background",
    icon: "bg-primary/10 text-primary",
    value: "text-foreground",
  },
  warning: {
    card: "border-amber-500/30 bg-amber-500/[0.06]",
    icon: "bg-amber-500/15 text-amber-600",
    value: "text-foreground",
  },
};

export const KpiCard = ({
  label,
  value,
  unit,
  hint,
  delta,
  icon: Icon,
  tone = "plain",
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  delta?: { value: number; label: string } | null;
  icon: LucideIcon;
  tone?: KpiTone;
}) => {
  const t = TONE[tone];
  const isPrimary = tone === "primary";
  const up = (delta?.value ?? 0) >= 0;

  return (
    <div
      className={cn(
        "relative flex flex-col gap-4 overflow-hidden rounded-2xl border p-5",
        t.card,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "text-xs font-medium",
            isPrimary ? "text-primary-foreground/80" : "text-muted-foreground",
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-xl",
            t.icon,
          )}
        >
          <Icon className="size-4" strokeWidth={1.9} />
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline gap-1.5">
          <span
            className={cn("text-2xl font-extrabold tracking-tight", t.value)}
          >
            {value}
          </span>
          {unit && (
            <span
              className={cn(
                "text-xs",
                isPrimary
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground",
              )}
            >
              {unit}
            </span>
          )}
        </div>

        {delta && (
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
              isPrimary
                ? "bg-white/15 text-primary-foreground"
                : up
                  ? "bg-green-500/10 text-green-600"
                  : "bg-red-500/10 text-red-600",
            )}
          >
            {up ? "▲" : "▼"} {Math.abs(Math.round(delta.value))}٪
            <span
              className={cn(
                "font-medium",
                isPrimary
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground",
              )}
            >
              {delta.label}
            </span>
          </div>
        )}

        {hint && (
          <p
            className={cn(
              "text-[11px] leading-5",
              isPrimary
                ? "text-primary-foreground/70"
                : "text-muted-foreground",
            )}
          >
            {hint}
          </p>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                    BARS                                    */
/* -------------------------------------------------------------------------- */

export type TrendPoint = {
  label: string;
  value: number;
  secondary: number;
};

/**
 * Dependency-free SVG bar chart. Renders an honest baseline of zero, so empty
 * months are visible rather than silently skipped.
 */
export const TrendChart = ({
  data,
  emptyLabel,
  emptyIcon,
}: {
  data: TrendPoint[];
  emptyLabel: string;
  emptyIcon: LucideIcon;
}) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  const hasData = data.some((d) => d.value > 0);

  if (!hasData)
    return <EmptyState icon={emptyIcon} title={emptyLabel} className="py-10" />;

  return (
    <div className="space-y-3">
      <div className="flex h-44 items-end gap-2">
        {data.map((d) => {
          const height = Math.max((d.value / max) * 100, d.value > 0 ? 6 : 2);
          const isLast = d === data[data.length - 1];

          return (
            <div
              key={d.label}
              className="group flex flex-1 flex-col items-center gap-2"
            >
              <div className="relative flex h-36 w-full items-end justify-center">
                <div
                  style={{ height: `${height}%` }}
                  className={cn(
                    "w-full rounded-lg transition-all duration-300",
                    d.value === 0
                      ? "bg-muted"
                      : isLast
                        ? "bg-linear-to-t from-primary to-primary/60"
                        : "bg-primary/25 group-hover:bg-primary/45",
                  )}
                />
                <span className="pointer-events-none absolute -top-6 hidden rounded-md border bg-popover px-2 py-0.5 text-[10px] font-medium shadow-sm group-hover:block">
                  {d.secondary}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                  ROW LISTS                                 */
/* -------------------------------------------------------------------------- */

export const MetricRow = ({
  label,
  value,
  sub,
  percent,
  tone = "plain",
}: {
  label: string;
  value: string;
  sub?: string;
  percent?: number;
  tone?: "plain" | "primary" | "muted";
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between gap-3 text-xs">
      <span
        className={cn(
          "font-medium",
          tone === "muted" && "text-muted-foreground",
          tone === "primary" && "text-primary",
        )}
      >
        {label}
      </span>
      <span className="flex items-baseline gap-1.5">
        <span className="font-bold">{value}</span>
        {sub && <span className="text-muted-foreground">{sub}</span>}
      </span>
    </div>
    {percent !== undefined && (
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <span
          style={{ width: `${Math.max(Math.min(percent, 100), 0)}%` }}
          className={cn(
            "block h-full rounded-full",
            tone === "primary" ? "bg-primary" : "bg-primary/40",
          )}
        />
      </div>
    )}
  </div>
);

export const RankList = ({
  items,
  empty,
}: {
  items: { id: number; title: string; sub: string; value: string }[];
  empty: ReactNode;
}) =>
  items.length === 0 ? (
    <>{empty}</>
  ) : (
    <ul className="divide-y">
      {items.map((item, index) => (
        <li key={item.id} className="flex items-center gap-3 py-2.5">
          <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-muted text-[10px] font-bold text-muted-foreground">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{item.title}</p>
            <p className="truncate text-[10px] text-muted-foreground">
              {item.sub}
            </p>
          </div>
          <span className="shrink-0 text-xs font-bold">{item.value}</span>
        </li>
      ))}
    </ul>
  );

export const StatusPill = ({ status }: { status: string }) => {
  const tone =
    status === "success"
      ? "bg-green-500/10 text-green-600"
      : status === "failed"
        ? "bg-red-500/10 text-red-600"
        : status === "pending"
          ? "bg-amber-500/10 text-amber-600"
          : "bg-muted text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold",
        tone,
      )}
    >
      {status}
    </span>
  );
};
