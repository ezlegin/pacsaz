"use client";

import { cn } from "@repo/ui/lib/utils";
import { Hand, Magnet, MousePointer2, Redo2, Ruler, Undo2, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useEditor, useStore } from "../state/react";
import type { Tool } from "../state/store";

const TOOLS: { tool: Tool; Icon: LucideIcon; label: string; key: string }[] = [
  { tool: "select", Icon: MousePointer2, label: "Select", key: "V" },
  { tool: "measure", Icon: Ruler, label: "Measure", key: "M" },
  { tool: "hand", Icon: Hand, label: "Pan", key: "H" },
];

function ToolButton({
  active,
  title,
  onClick,
  disabled,
  children,
}: {
  active?: boolean;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
        active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
      )}
    >
      {children}
    </button>
  );
}

/** Compact floating toolbar for the canvas. Phase 3 moves these into the shell. */
export function CanvasToolbar({ className }: { className?: string }) {
  const store = useStore();
  const tool = useEditor((s) => s.tool);
  const snapping = useEditor((s) => s.snapping);
  const canUndo = useEditor((s) => s.canUndo);
  const canRedo = useEditor((s) => s.canRedo);

  return (
    <div className={cn("flex items-center gap-0.5 rounded-lg border bg-background p-1 shadow-sm", className)}>
      {TOOLS.map(({ tool: t, Icon, label, key }) => (
        <ToolButton key={t} active={tool === t} title={`${label} (${key})`} onClick={() => store.setTool(t)}>
          <Icon size={16} />
        </ToolButton>
      ))}
      <div className="mx-1 h-5 w-px bg-border" />
      <ToolButton active={snapping} title="Snapping (S) — hold Ctrl to ignore" onClick={() => store.setSnapping(!snapping)}>
        <Magnet size={16} />
      </ToolButton>
      <div className="mx-1 h-5 w-px bg-border" />
      <ToolButton title="Undo (Ctrl+Z)" disabled={!canUndo} onClick={() => store.undo()}>
        <Undo2 size={16} />
      </ToolButton>
      <ToolButton title="Redo (Ctrl+Shift+Z)" disabled={!canRedo} onClick={() => store.redo()}>
        <Redo2 size={16} />
      </ToolButton>
    </div>
  );
}
