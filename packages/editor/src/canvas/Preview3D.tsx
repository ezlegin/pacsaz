"use client";

import { toFoldSVG, type RenderResult } from "@repo/dieline-engine";
import { cn } from "@repo/ui/lib/utils";
import { Box, X } from "lucide-react";
import { lazy, Suspense, useDeferredValue, useMemo, useState } from "react";
import { useEditor, useStore } from "../state/react";

// three.js is heavy; it loads the first time the dock opens, not with the editor.
const DielineViewer = lazy(() => import("@repo/dieline-3d/viewer").then((m) => ({ default: m.DielineViewer })));

/**
 * The folded box next to the flat drawing, updated as the template changes.
 * Fold directions are inferred by the rig; authoring them comes later.
 */
export function Preview3D() {
  const store = useStore();
  const result = useEditor((s) => s.result);
  const thickness = useEditor((s) => s.inputs.thickness);
  return <FoldPreview result={result} thickness={thickness} onClose={() => store.setDisplay({ preview3d: false })} />;
}

export type FoldPreviewStrings = { title: string; fold: string; close: string; loading: string; pending: string; empty: string; failed: string };

const FOLD_EN: FoldPreviewStrings = {
  title: "3D preview",
  fold: "Fold",
  close: "Close",
  loading: "Loading 3D…",
  pending: "Building the model…",
  empty: "Nothing to fold yet: draw a closed cut outline with fold lines.",
  failed: "This shape could not be folded. Check that the cut outline is closed.",
};

/** A docked 3D view of any render result; the Studio and the Customizer both use it. */
export function FoldPreview({
  result,
  thickness,
  onClose,
  strings,
  className,
}: {
  result: RenderResult;
  thickness: number;
  onClose?: () => void;
  strings?: Partial<FoldPreviewStrings>;
  className?: string;
}) {
  const t = { ...FOLD_EN, ...strings };
  const [progress, setProgress] = useState(0.6);

  // Rebuilding the rig on every keystroke would stutter; the deferred value lets
  // typing stay responsive and the 3D view catch up.
  const deferred = useDeferredValue(result);
  const svg = useMemo(() => toFoldSVG(deferred), [deferred]);

  return (
    <div
      dir="ltr"
      className={cn("absolute bottom-10 right-3 z-20 flex h-[300px] w-[340px] flex-col overflow-hidden rounded-lg border bg-background shadow-xl", className)}
      data-own-wheel
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex h-8 shrink-0 items-center gap-2 border-b px-2 text-xs">
        <Box className="size-3.5 text-muted-foreground" />
        <span className="font-medium">{t.title}</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={progress}
          title={t.fold}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="ml-auto w-28"
        />
        {onClose && (
          <button type="button" title={t.close} className="rounded p-1 text-muted-foreground hover:bg-accent" onClick={onClose}>
            <X className="size-3.5" />
          </button>
        )}
      </div>
      <div className="relative min-h-0 flex-1 bg-muted/30">
        <Suspense fallback={<p className="p-4 text-xs text-muted-foreground">{t.loading}</p>}>
          <DielineViewer
            svg={svg}
            material="glossyCardboard"
            thickness={thickness}
            progress={progress}
            className="h-full w-full"
            renderEmpty={(reason) => (
              <p className="p-4 text-xs text-muted-foreground">
                {reason === "pending" ? t.pending : reason === "no-geometry" ? t.empty : t.failed}
              </p>
            )}
          />
        </Suspense>
      </div>
    </div>
  );
}
