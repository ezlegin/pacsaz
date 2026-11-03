"use client";

import { updateNode, type PanelsNode } from "@repo/dieline-engine";
import { cn } from "@repo/ui/lib/utils";
import { Plus } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { edgeSlots, type EdgeSlot } from "../model/body";
import { setIn } from "../model/fields";
import { useEditor, useStore } from "../state/react";
import { useEdgeComponents } from "../panels/BodyInspector";
import { toScreen } from "./viewport";

/** How far outside the edge a chip sits, in screen pixels. */
const OFFSET = 14;

/**
 * Clickable markers on every edge of the selected box body. A free edge shows
 * "+", an edge with a feature shows its name; either opens a picker in place.
 */
export function EdgeChips({ node }: { node: PanelsNode }) {
  const store = useStore();
  const result = useEditor((s) => s.result);
  const view = useEditor((s) => s.view);
  const components = useEdgeComponents();
  const [open, setOpen] = useState<EdgeSlot | null>(null);

  // Close the picker when the selection moves on.
  useEffect(() => setOpen(null), [node.id]);

  const slots = edgeSlots(node, result);

  const choose = (slot: EdgeSlot, component: string) => {
    setOpen(null);
    store.apply((d) =>
      updateNode(d, node.id, (n) => setIn(n, slot.path, component ? { component, ...(slot.feature?.flip ? { flip: true } : {}) } : undefined)),
    );
  };

  const place = (slot: EdgeSlot) => {
    const s = toScreen(slot.at, view);
    return { left: s[0] + slot.out[0] * OFFSET, top: s[1] - slot.out[1] * OFFSET };
  };

  return (
    <>
      {slots.map((slot) => {
        const def = slot.feature ? components.find((c) => c.id === slot.feature!.component) : undefined;
        const pos = place(slot);
        // Names need room; on short edges (or far out) a feature shows as a dot.
        const roomy = slot.length * view.zoom >= 90;
        return (
          <button
            key={slot.path}
            type="button"
            title={`${slot.label}: ${def?.name ?? (slot.feature ? slot.feature.component : "plain edge — click to add")}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setOpen(open?.path === slot.path ? null : slot)}
            className={cn(
              "absolute z-10 flex h-5 -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 rounded-full border text-[10px] font-medium shadow-sm transition-colors",
              slot.feature && roomy && "border-blue-300 bg-white px-1.5 text-blue-700 hover:bg-blue-50",
              slot.feature && !roomy && "size-3 border-blue-600 bg-blue-500 hover:bg-blue-600",
              !slot.feature && "w-5 justify-center border-dashed border-blue-400 bg-white/90 text-blue-600 hover:bg-blue-50",
              open?.path === slot.path && "ring-2 ring-blue-500",
            )}
            style={pos}
          >
            {slot.feature ? (roomy ? (def?.name ?? "?") : null) : <Plus className="size-3" />}
          </button>
        );
      })}

      {open && (
        <div
          className="absolute z-20 w-52 rounded-md border bg-popover p-1 text-xs shadow-lg"
          style={{ left: place(open).left + 12, top: place(open).top + 12 }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="px-2 pb-1 pt-1.5 text-[10px] font-medium uppercase text-muted-foreground">{open.label}</div>
          <MenuItem active={!open.feature} onClick={() => choose(open, "")}>
            Plain cut edge
          </MenuItem>
          {components.map((c) => (
            <MenuItem key={c.id} active={open.feature?.component === c.id} onClick={() => choose(open, c.id)}>
              <span>{c.name}</span>
              {c.category && <span className="ml-auto text-[10px] text-muted-foreground">{c.category}</span>}
            </MenuItem>
          ))}
        </div>
      )}
    </>
  );
}

function MenuItem({ active, onClick, children }: { active?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-accent", active && "font-semibold text-blue-700")}
    >
      {children}
    </button>
  );
}
