"use client";

import { toDXF, toSVG } from "@repo/dieline-engine";
import { Button } from "@repo/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/utils";
import { Box, CircleAlert, Command, Download, Grid2x2, Layers2, Loader2, Magnet, MoveHorizontal, Redo2, Ruler, Scissors, SquareDashed, Undo2, UserRound, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { downloadFile } from "../commands";
import { useEditor, useStore } from "../state/react";

function BarButton({ Icon, label, active, onClick, disabled }: { Icon: LucideIcon; label: string; active?: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          onClick={onClick}
          className={cn(
            "flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
            active && "text-blue-600",
          )}
        >
          <Icon className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

const SIZE: { key: "width" | "length" | "height" | "thickness"; label: string; step: number }[] = [
  { key: "width", label: "W", step: 1 },
  { key: "length", label: "L", step: 1 },
  { key: "height", label: "H", step: 1 },
  { key: "thickness", label: "T", step: 0.1 },
];

export function TopBar({
  title,
  leading,
  trailing,
  onSave,
  saving,
  onPalette,
  customerView,
  onCustomerView,
}: {
  title: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  onSave?: () => void;
  saving?: boolean;
  onPalette: () => void;
  customerView?: boolean;
  onCustomerView?: (on: boolean) => void;
}) {
  const store = useStore();
  const canUndo = useEditor((s) => s.canUndo);
  const canRedo = useEditor((s) => s.canRedo);
  const dirty = useEditor((s) => s.dirty);
  const snapping = useEditor((s) => s.snapping);
  const display = useEditor((s) => s.display);
  const inputs = useEditor((s) => s.inputs);
  const range = useEditor((s) => s.sizeRange);
  const nicks = useEditor((s) => s.nicks);
  const exportOptions = () => (display.nicks ? { nicks } : {});

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-2">
      {leading}
      <div className="flex min-w-0 items-center gap-2 pr-2">
        <span className="truncate text-sm font-semibold">{title}</span>
        {onSave && (
          <span className={cn("shrink-0 text-[11px]", dirty ? "text-amber-600" : "text-muted-foreground")}>
            {saving ? "Saving…" : dirty ? "Unsaved changes" : "Saved"}
          </span>
        )}
      </div>

      <div className="mx-1 h-5 w-px bg-border" />
      <BarButton Icon={Undo2} label="Undo (Ctrl+Z)" disabled={!canUndo} onClick={() => store.undo()} />
      <BarButton Icon={Redo2} label="Redo (Ctrl+Shift+Z)" disabled={!canRedo} onClick={() => store.redo()} />
      <div className="mx-1 h-5 w-px bg-border" />

      {/* Preview size: what the template is drawn at while editing. */}
      <div className="flex items-center gap-1" title="Preview size (mm)">
        {SIZE.map((f) => (
          <label key={f.key} className="flex h-7 items-center rounded-md border bg-background text-xs focus-within:border-blue-500">
            <span className="pl-1.5 pr-1 text-[11px] text-muted-foreground">{f.label}</span>
            <input
              type="number"
              step={f.step}
              min={0}
              value={inputs[f.key]}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isFinite(v) && v > 0) store.setInputs({ [f.key]: v });
              }}
              className="h-full w-12 bg-transparent pr-1 font-mono text-[11.5px] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
          </label>
        ))}
      </div>

      <div className="mx-1 h-5 w-px bg-border" />
      <BarButton Icon={Magnet} label={`Snapping ${snapping ? "on" : "off"} (S)`} active={snapping} onClick={() => store.setSnapping(!snapping)} />
      <BarButton Icon={Grid2x2} label={`Guides ${display.guides ? "shown" : "hidden"}`} active={display.guides} onClick={() => store.setDisplay({ guides: !display.guides })} />
      <BarButton Icon={Ruler} label={`Screen rulers ${display.rulers ? "shown" : "hidden"}`} active={display.rulers} onClick={() => store.setDisplay({ rulers: !display.rulers })} />
      <BarButton
        Icon={MoveHorizontal}
        label={`Overall size of each part ${display.overall ? "shown" : "hidden"}`}
        active={display.overall}
        onClick={() => store.setDisplay({ overall: !display.overall })}
      />
      <BarButton
        Icon={SquareDashed}
        label={inputs.bleed ? `Bleed (${inputs.bleed} mm) ${display.bleed ? "shown" : "hidden"}` : "Bleed: set a bleed in the Settings tab"}
        active={display.bleed && !!inputs.bleed}
        onClick={() => store.setDisplay({ bleed: !display.bleed })}
      />
      <BarButton Icon={CircleAlert} label={`Problem markers ${display.issues ? "shown" : "hidden"}`} active={display.issues} onClick={() => store.setDisplay({ issues: !display.issues })} />
      <BarButton
        Icon={Layers2}
        label={range ? `Smallest and largest sizes ${display.ghosts ? "shown" : "hidden"} (violet / orange)` : "Smallest and largest sizes: the template has no size range"}
        active={display.ghosts}
        disabled={!range}
        onClick={() => store.setDisplay({ ghosts: !display.ghosts })}
      />
      <BarButton Icon={Scissors} label={`Nicks ${display.nicks ? "on" : "off"}: bridges in the cut lines`} active={display.nicks} onClick={() => store.setDisplay({ nicks: !display.nicks })} />
      <BarButton Icon={Box} label={`3D preview ${display.preview3d ? "open" : "closed"}`} active={display.preview3d} onClick={() => store.setDisplay({ preview3d: !display.preview3d })} />

      <div className="ml-auto flex items-center gap-1.5">
        {onCustomerView && (
          <Button variant={customerView ? "default" : "outline"} size="sm" onClick={() => onCustomerView(!customerView)} title="See and try what customers can change">
            <UserRound /> Customer view
          </Button>
        )}
        <button
          type="button"
          onClick={onPalette}
          className="flex h-8 items-center gap-2 rounded-md border px-2.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Command className="size-3.5" /> Commands <kbd className="text-[10px] opacity-70">Ctrl K</kbd>
        </button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Download /> Export
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-1 text-sm">
            <button
              type="button"
              className="flex w-full flex-col rounded px-2 py-1.5 text-left hover:bg-accent"
              onClick={() => downloadFile("dieline.svg", toSVG(store.get().result, { includeRulers: true, ...exportOptions() }), "image/svg+xml")}
            >
              SVG <span className="text-[11px] text-muted-foreground">With rulers, for preview and print</span>
            </button>
            <button
              type="button"
              className="flex w-full flex-col rounded px-2 py-1.5 text-left hover:bg-accent"
              onClick={() => downloadFile("dieline.dxf", toDXF(store.get().result, exportOptions()), "application/dxf")}
            >
              DXF <span className="text-[11px] text-muted-foreground">CUT / CREASE / … layers for die makers</span>
            </button>
            <div className="mt-1 border-t px-2 pb-1 pt-2 text-xs">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={display.nicks} onChange={(e) => store.setDisplay({ nicks: e.target.checked })} />
                Nicks in cut lines
              </label>
              {display.nicks && (
                <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                  {(["width", "spacing"] as const).map((k) => (
                    <label key={k} className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground">{k === "width" ? "Width (mm)" : "Every (mm)"}</span>
                      <input
                        type="number"
                        step={k === "width" ? 0.1 : 5}
                        min={0}
                        value={nicks[k]}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (Number.isFinite(v) && v > 0) store.setNicks({ [k]: v });
                        }}
                        className="h-7 w-full rounded border bg-background px-1.5 font-mono text-[11px]"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {trailing}

        {onSave && (
          <Button size="sm" onClick={onSave} disabled={saving || !dirty}>
            {saving && <Loader2 className="animate-spin" />}
            Save
          </Button>
        )}
      </div>
    </header>
  );
}
