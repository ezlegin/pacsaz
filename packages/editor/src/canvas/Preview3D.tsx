"use client";

import { toFoldSVG } from "@repo/dieline-engine";
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
  const [progress, setProgress] = useState(0.6);

  // Rebuilding the rig on every keystroke would stutter; the deferred value lets
  // typing stay responsive and the 3D view catch up.
  const deferred = useDeferredValue(result);
  const svg = useMemo(() => toFoldSVG(deferred), [deferred]);

  return (
    <div
      className="absolute bottom-10 right-3 z-20 flex h-[300px] w-[340px] flex-col overflow-hidden rounded-lg border bg-background shadow-xl"
      data-own-wheel
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex h-8 shrink-0 items-center gap-2 border-b px-2 text-xs">
        <Box className="size-3.5 text-muted-foreground" />
        <span className="font-medium">3D preview</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={progress}
          title="Fold"
          onChange={(e) => setProgress(Number(e.target.value))}
          className="ml-auto w-28"
        />
        <button type="button" title="Close" className="rounded p-1 text-muted-foreground hover:bg-accent" onClick={() => store.setDisplay({ preview3d: false })}>
          <X className="size-3.5" />
        </button>
      </div>
      <div className="relative min-h-0 flex-1 bg-muted/30">
        <Suspense fallback={<p className="p-4 text-xs text-muted-foreground">Loading 3D…</p>}>
          <DielineViewer
            svg={svg}
            material="glossyCardboard"
            thickness={thickness}
            progress={progress}
            className="h-full w-full"
            renderEmpty={(reason) => (
              <p className="p-4 text-xs text-muted-foreground">
                {reason === "pending"
                  ? "Building the model…"
                  : reason === "no-geometry"
                    ? "Nothing to fold yet: draw a closed cut outline with fold lines."
                    : "This shape could not be folded. Check that the cut outline is closed."}
              </p>
            )}
          />
        </Suspense>
      </div>
    </div>
  );
}
