"use client";

import { formatNumber, type Pt } from "@repo/dieline-engine";
import { useEditor } from "../state/react";

/** Cursor position, zoom, selection and problem count along the canvas bottom. */
export function StatusBar({ cursor }: { cursor: Pt | null }) {
  const zoom = useEditor((s) => s.view.zoom);
  const selection = useEditor((s) => s.selection);
  const result = useEditor((s) => s.result);
  const snapping = useEditor((s) => s.snapping);

  const errors = result.diagnostics.filter((d) => d.severity === "error").length;
  const warnings = result.diagnostics.length - errors;
  const single = selection.length === 1 ? result.nodes[selection[0]!] : null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-7 items-center gap-4 border-t bg-background/90 px-3 pl-8 text-[11px] text-muted-foreground tabular-nums backdrop-blur">
      <span className="w-36">{cursor ? `X ${formatNumber(cursor[0], 1)}  Y ${formatNumber(cursor[1], 1)}` : " "}</span>
      <span>{Math.round(zoom * 100)}%</span>
      <span>Snap {snapping ? "on" : "off"}</span>
      <span className="truncate">
        {single ? `${single.name} · ${single.kind}` : selection.length > 1 ? `${selection.length} selected` : ""}
      </span>
      <span className="ml-auto flex gap-3">
        {errors > 0 && <span className="text-red-600">{errors} error{errors > 1 ? "s" : ""}</span>}
        {warnings > 0 && <span className="text-amber-600">{warnings} warning{warnings > 1 ? "s" : ""}</span>}
      </span>
    </div>
  );
}
