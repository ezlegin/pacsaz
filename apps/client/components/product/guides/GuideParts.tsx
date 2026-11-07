import { DialogDescription, DialogTitle } from "@repo/ui/components/dialog";
import { Lightbulb } from "lucide-react";

/**
 * Building blocks shared by the settings guides, so every guide reads the same:
 * a title, a one-line lead, a figure, the options one by one, and a practical tip.
 * Figures are inline SVG in the brand violet, so they stay sharp and match the page.
 */

export const VIOLET = "#7c3aed";
export const VIOLET_SOFT = "#ede9fe";
export const INK = "#334155";
export const MUTED = "#94a3b8";

export function GuideHeader({ title, lead }: { title: string; lead: string }) {
  return (
    <div className="space-y-1.5 text-right">
      <DialogTitle className="text-base font-extrabold">{title}</DialogTitle>
      <DialogDescription className="text-xs leading-6">{lead}</DialogDescription>
    </div>
  );
}

export function GuideFigure({ children, caption }: { children: React.ReactNode; caption?: string }) {
  return (
    <figure className="rounded-2xl border bg-gradient-to-b from-primary/[0.04] to-transparent p-4">
      {children}
      {caption && <figcaption className="mt-2 text-center text-[10px] text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}

/** One option or idea: a short name, an optional badge, and what it means in practice. */
export function GuideItem({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-background p-3 text-right">
      <p className="flex items-center gap-2 text-xs font-bold text-foreground">
        {title}
        {badge && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{badge}</span>}
      </p>
      <div className="mt-1 text-[11px] leading-6 text-muted-foreground">{children}</div>
    </div>
  );
}

export function GuideTip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-right text-[11px] leading-6 text-amber-900">
      <Lightbulb className="mt-1 size-3.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

/** Arrowhead markers for figure dimension lines; ids are per figure so several can share a page. */
export function Arrows({ id, color = VIOLET }: { id: string; color?: string }) {
  return (
    <defs>
      <marker id={`${id}-end`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0 0L10 5L0 10z" fill={color} />
      </marker>
      <marker id={`${id}-start`} viewBox="0 0 10 10" refX="1" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M10 0L0 5L10 10z" fill={color} />
      </marker>
    </defs>
  );
}

/** A dimension line with arrows at both ends. */
export function DimLine({ id, x1, y1, x2, y2, color = VIOLET }: { id: string; x1: number; y1: number; x2: number; y2: number; color?: string }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1.5} markerStart={`url(#${id}-start)`} markerEnd={`url(#${id}-end)`} />;
}

/** Figure text: Vazirmatn comes from the page, so Persian labels render like the rest of the UI. */
export function Label({ x, y, children, color = VIOLET, size = 11, weight = 700, anchor = "middle" }: { x: number; y: number; children: React.ReactNode; color?: string; size?: number; weight?: number; anchor?: "start" | "middle" | "end" }) {
  return (
    <text x={x} y={y} fill={color} fontSize={size} fontWeight={weight} textAnchor={anchor} dominantBaseline="central" style={{ fontFamily: "inherit" }}>
      {children}
    </text>
  );
}
