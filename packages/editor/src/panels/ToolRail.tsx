"use client";

import { LINE_STYLES, LINE_TYPES } from "@repo/dieline-engine";
import { cn } from "@repo/ui/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/components/tooltip";
import { Circle, Hand, Hexagon, MousePointer2, Pill, PenTool, Ruler, Slash, Square, Star, Undo, type LucideIcon } from "lucide-react";
import type { PlaceableKind } from "../model/create";
import { useEditor, useStore } from "../state/react";
import type { Tool } from "../state/store";

type Item = { id: string; label: string; keys?: string; Icon: LucideIcon; tool: Tool; kind?: PlaceableKind };

const GROUPS: Item[][] = [
  [
    { id: "select", label: "Select", keys: "V", Icon: MousePointer2, tool: "select" },
    { id: "hand", label: "Pan", keys: "H / Space", Icon: Hand, tool: "hand" },
    { id: "measure", label: "Measure", keys: "M", Icon: Ruler, tool: "measure" },
  ],
  [
    { id: "pen", label: "Pen — click points, Enter to finish, click the first point to close", keys: "P", Icon: PenTool, tool: "pen" },
    { id: "rect", label: "Rectangle — drag corner to corner", keys: "R", Icon: Square, tool: "place", kind: "rect" },
    { id: "line", label: "Line", keys: "L", Icon: Slash, tool: "place", kind: "line" },
    { id: "ellipse", label: "Ellipse — drag from the centre", keys: "E", Icon: Circle, tool: "place", kind: "ellipse" },
    { id: "arc", label: "Arc", Icon: Undo, tool: "place", kind: "arc" },
    { id: "polygon", label: "Polygon", Icon: Hexagon, tool: "place", kind: "polygon" },
    { id: "star", label: "Star", Icon: Star, tool: "place", kind: "star" },
    { id: "belt", label: "Belt (handle slot)", Icon: Pill, tool: "place", kind: "belt" },
  ],
];

/** Tools down the left edge, plus the line type new shapes are drawn with. */
export function ToolRail() {
  const store = useStore();
  const tool = useEditor((s) => s.tool);
  const placeKind = useEditor((s) => s.placeKind);
  const lineType = useEditor((s) => s.drawLineType);

  return (
    <nav className="flex w-11 shrink-0 flex-col items-center gap-0.5 border-r bg-background py-2">
      {GROUPS.map((group, g) => (
        <div key={g} className="flex flex-col items-center gap-0.5">
          {g > 0 && <div className="my-1.5 h-px w-6 bg-border" />}
          {group.map((item) => {
            const active = tool === item.tool && (item.tool !== "place" || placeKind === item.kind);
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => store.setTool(item.tool, item.kind)}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                      active && "bg-blue-600 text-white hover:bg-blue-600 hover:text-white",
                    )}
                  >
                    <item.Icon className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {item.label}
                  {item.keys && <span className="ml-2 opacity-60">{item.keys}</span>}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      ))}

      <div className="my-1.5 h-px w-6 bg-border" />
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button type="button" className="flex size-8 items-center justify-center rounded-md hover:bg-accent">
                <span className="size-3.5 rounded-full ring-2 ring-background" style={{ background: LINE_STYLES[lineType].color }} />
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">New shapes: {LINE_STYLES[lineType].label}</TooltipContent>
        </Tooltip>
        <PopoverContent side="right" align="start" className="w-48 p-1">
          {LINE_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => store.setDrawLineType(t)}
              className={cn("flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-accent", t === lineType && "bg-accent")}
            >
              <svg width="28" height="6" className="shrink-0">
                <line
                  x1="0"
                  y1="3"
                  x2="28"
                  y2="3"
                  stroke={LINE_STYLES[t].color}
                  strokeWidth="2"
                  strokeDasharray={LINE_STYLES[t].dash.map((d) => d * 2).join(" ") || undefined}
                />
              </svg>
              {LINE_STYLES[t].label}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </nav>
  );
}
