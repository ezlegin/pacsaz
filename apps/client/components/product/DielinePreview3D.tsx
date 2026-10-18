"use client";

import { DielineViewer } from "@repo/dieline-3d/viewer";
import type { ViewerEmptyReason } from "@repo/dieline-3d/viewer";
import { useAppSelector } from "@repo/store/hooks";
import { cn } from "@repo/ui/lib/utils";
import { Box, Layers } from "lucide-react";
import { useState } from "react";
import { materialStyleFor } from "@repo/dieline-3d/geometry";

const fa = (value: number) =>
  value.toLocaleString("fa-IR", { maximumFractionDigits: 1 });

/** Persian copy for the shared viewer's empty states. */
const emptyMessage = (reason: ViewerEmptyReason) => {
  const message =
    reason === "pending"
      ? "در حال تولید دایلاین..."
      : reason === "no-geometry"
        ? "هندسه‌ی دایلاین خوانده نشد. صفحه را دوباره بارگذاری کن."
        : "ساخت مدل سه‌بعدی ناموفق بود.";

  return (
    <div className="flex items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-4 py-10 text-center">
      <p className="text-[11px] leading-6 text-muted-foreground">{message}</p>
    </div>
  );
};

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
  progress,
  onProgressChange,
}: {
  /** Comes from the generator's transition, not from the store. */
  isRendering: boolean;
  className?: string;
  /** Compact chrome for the sidebar; fuller chrome in the dialog. */
  compact?: boolean;
  /** Controlled fold amount, so a dialog can share it with the inline card. */
  progress?: number;
  onProgressChange?: (value: number) => void;
}) => {
  const [internalProgress, setInternalProgress] = useState(1);

  const value = progress ?? internalProgress;
  const setValue = onProgressChange ?? setInternalProgress;

  const svg = useAppSelector((s) => s.svg.svg);
  const material = useAppSelector((s) => s.dielineSettings.material.value);
  const thickness = useAppSelector((s) => s.dielineSettings.thickness);
  const foldConfig = useAppSelector((s) => s.dielineSettings.foldConfig);

  const style = materialStyleFor(material);
  const percent = Math.round(value * 100);
  const folded = value > 0.02;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <DielineViewer
        svg={svg ?? ""}
        material={material}
        thickness={thickness}
        progress={value}
        isRendering={isRendering}
        foldConfig={foldConfig}
        renderEmpty={emptyMessage}
        className={compact ? "h-56 w-full" : "h-full min-h-80 w-full"}
      >
        {/* --------------------------- view controls --------------------------- */}
        {({ hasHinges }) => (
          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-col gap-2">
            {/* A dieline with no creases is a flat object; a fold slider would do
                nothing, so it is hidden rather than shown inert. */}
            {hasHinges && (
              <div className="pointer-events-auto flex items-center gap-2.5 rounded-xl border bg-background/90 px-3 py-2 backdrop-blur">
                <Layers className="size-3.5 shrink-0 text-primary" />

                <input
                  type="range"
                  min={0}
                  max={100}
                  value={percent}
                  onChange={(e) => setValue(Number(e.target.value) / 100)}
                  aria-label="میزان تا شدن جعبه"
                  className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-[var(--primary)]"
                />

                <span className="w-9 shrink-0 text-center text-[10px] font-bold tabular-nums">
                  {fa(percent)}٪
                </span>
              </div>
            )}
          </div>
        )}
      </DielineViewer>

      {!compact && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Box className="size-3 text-primary" />
            {folded ? "نمای بسته" : "نمای باز (صاف)"}
          </span>
          <span>ضخامت متریال: {fa(thickness)} mm</span>
          <span>{style.label}</span>
        </div>
      )}
    </div>
  );
};

export default DielinePreview3D;
