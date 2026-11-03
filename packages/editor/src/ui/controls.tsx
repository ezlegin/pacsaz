"use client";

import { LINE_STYLES, LINE_TYPES, type LineType, type NodeKind } from "@repo/dieline-engine";
import { cn } from "@repo/ui/lib/utils";
import {
  Box,
  ChevronDown,
  ChevronRight,
  Circle,
  Folder,
  Hexagon,
  Pill as PillIcon,
  Slash,
  Spline,
  Square,
  Star,
  Undo,
  type LucideIcon,
} from "lucide-react";
import { useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";

export const NODE_ICONS: Record<NodeKind, LucideIcon> = {
  rect: Square,
  line: Slash,
  path: Spline,
  ellipse: Circle,
  arc: Undo,
  polygon: Hexagon,
  star: Star,
  belt: PillIcon,
  group: Folder,
  instance: Box,
};

/** A collapsible inspector section. */
export function Section({
  title,
  actions,
  children,
  defaultOpen = true,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b px-3 py-2.5">
      <div className="flex h-6 items-center gap-1">
        <button
          type="button"
          className="flex flex-1 items-center gap-1 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
          onClick={() => setOpen(!open)}
        >
          {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
          {title}
        </button>
        {actions}
      </div>
      {open && <div className="mt-2 space-y-1.5">{children}</div>}
    </section>
  );
}

/** A labelled line of controls. */
export function Row({ label, children, className }: { label?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {label !== undefined && <span className="w-14 shrink-0 truncate text-[11px] text-muted-foreground">{label}</span>}
      <div className="flex min-w-0 flex-1 items-center gap-1.5">{children}</div>
    </div>
  );
}

export function IconButton({
  className,
  active,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-3.5",
        active && "bg-blue-500/10 text-blue-600 hover:bg-blue-500/15 hover:text-blue-700",
        className,
      )}
      {...props}
    />
  );
}

/** A compact native select; dense panels read better without a popover per field. */
export function SelectField<T extends string>({
  value,
  options,
  onChange,
  className,
  title,
}: {
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  className?: string;
  title?: string;
}) {
  return (
    <select
      title={title}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={cn(
        "h-7 min-w-0 flex-1 cursor-pointer rounded-md border bg-background px-1.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
        className,
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function LineTypeSelect({
  value,
  onChange,
  allowInherit,
  className,
}: {
  value: LineType | "";
  onChange: (value: LineType | "") => void;
  allowInherit?: boolean;
  className?: string;
}) {
  const options = [
    ...(allowInherit ? [{ value: "" as const, label: "— same as shape" }] : []),
    ...LINE_TYPES.map((t) => ({ value: t, label: LINE_STYLES[t].label })),
  ];
  return (
    <div className={cn("flex min-w-0 flex-1 items-center gap-1.5", className)}>
      {value && <span className="size-2.5 shrink-0 rounded-full" style={{ background: LINE_STYLES[value].color }} />}
      <SelectField value={value} options={options} onChange={onChange} />
    </div>
  );
}

/** A small on/off pill for booleans such as "closed" or "mirror X". */
export function Pill({
  on,
  onChange,
  children,
  title,
}: {
  on: boolean;
  onChange: (on: boolean) => void;
  children: ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={() => onChange(!on)}
      className={cn(
        "h-7 rounded-md border px-2 text-[11px] transition-colors",
        on ? "border-blue-500 bg-blue-500/10 text-blue-700" : "bg-background text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function TextInput({
  value,
  onCommit,
  className,
  placeholder,
  invalid,
  title,
}: {
  value: string;
  onCommit: (value: string) => void;
  className?: string;
  placeholder?: string;
  invalid?: boolean;
  title?: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  // Escape blurs too; this keeps that blur from committing the draft.
  const cancelled = useRef(false);
  return (
    <input
      value={draft ?? value}
      placeholder={placeholder}
      title={title}
      spellCheck={false}
      onChange={(e) => setDraft(e.target.value)}
      onFocus={() => {
        cancelled.current = false;
        setDraft(value);
      }}
      onBlur={() => {
        if (!cancelled.current && draft !== null && draft !== value) onCommit(draft);
        setDraft(null);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          cancelled.current = true;
          e.currentTarget.blur();
        }
      }}
      className={cn(
        "h-7 min-w-0 flex-1 rounded-md border bg-background px-2 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
        invalid && "border-red-400",
        className,
      )}
    />
  );
}
