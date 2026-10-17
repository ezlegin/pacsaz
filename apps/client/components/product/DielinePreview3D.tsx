"use client";

import DielineViewer from "@/components/product/DielineViewer";
import { useAppSelector } from "@repo/store/hooks";
import { cn } from "@repo/ui/lib/utils";
import { Box, Layers } from "lucide-react";
import { useState } from "react";
import { materialStyleFor } from "@/lib/dieline3d/build";

const fa = (value: number) =>
  value.toLocaleString("fa-IR", { maximumFractionDigits: 1 });

/**
 * Live 3D preview of the current dieline.
 *
 * Everything it needs already lives in the store, so the model rebuilds whenever
 * a specification change produces new SVG output. The fold slider is local state:
 * it is a view control, not a dieline setting, so it must not dispatch.
 */
const DielinePreview3D = ({
  isRendering,
  className,
  compact,
  renderControls,
}: {
  /** Comes from the generator's transition, not from the store. */
  isRendering: boolean;
  className?: string;
  /** Compact chrome for the sidebar; fuller chrome in the dialog. */
  compact?: boolean;
  /** Extra content inside the overlay, e.g. the dialog's upload button. */
  renderControls?: React.ReactNode;
}) => {
  const [progress, setProgress] = useState(1);

  const svg = useAppSelector((s) => s.svg.svg);
  const material = useAppSelector((s) => s.dielineSettings.material.value);
  const thickness = useAppSelector((s) => s.dielineSettings.thickness);

  const style = materialStyleFor(material);
  const percent = Math.round(progress * 100);
  const folded = progress > 0.02;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <DielineViewer
        svg={svg ?? ""}
        material={material}
        thickness={thickness}
        progress={progress}
        isRendering={isRendering}
        className={compact ? "h-56 w-full" : "h-full min-h-80 w-full"}
      >
        {/* --------------------------- view controls --------------------------- */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-col gap-2">
          <div className="pointer-events-auto flex items-center gap-2.5 rounded-xl border bg-background/90 px-3 py-2 backdrop-blur">
            <Layers className="size-3.5 shrink-0 text-primary" />

            <input
              type="range"
              min={0}
              max={100}
              value={percent}
              onChange={(e) => setProgress(Number(e.target.value) / 100)}
              aria-label="میزان تا شدن جعبه"
              className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-[var(--primary)]"
            />

            <span className="w-9 shrink-0 text-center text-[10px] font-bold tabular-nums">
              {fa(percent)}٪
            </span>
          </div>

          {renderControls}
        </div>
      </DielineViewer>

      {!compact && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Box className="size-3 text-primary" />
            {folded ? "نمای بسته" : "نمای باز (صاف)"}
          </span>
          <span>
            ضخامت متریال: {fa(thickness)} mm
          </span>
          <span>{style.label}</span>
        </div>
      )}
    </div>
  );
};

export default DielinePreview3D;
