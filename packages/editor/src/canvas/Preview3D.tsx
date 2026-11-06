"use client";

import { toFoldSVG, type FoldSettings, type RenderResult } from "@repo/dieline-engine";
import { ArtworkPlacer } from "@repo/dieline-3d/ArtworkPlacer";
import { buildFoldRig, DEFAULT_FOLD_ANGLE, extractSegmentsFromSvg, extractWindows } from "@repo/dieline-3d/rig";
import { cn } from "@repo/ui/lib/utils";
import { Box, ImagePlus, Maximize2, Minimize2, Trash2, X } from "lucide-react";
import { lazy, Suspense, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useEditor, useStore } from "../state/react";

// three.js is heavy; it loads the first time the dock opens, not with the editor.
const DielineViewer = lazy(() => import("@repo/dieline-3d/viewer").then((m) => ({ default: m.DielineViewer })));

/** The Studio's dock: the template folded, with fold directions and angles editable. */
export function Preview3D() {
  const store = useStore();
  const result = useEditor((s) => s.result);
  const thickness = useEditor((s) => s.inputs.thickness);
  const folds = useEditor((s) => s.doc.folds);
  return (
    <FoldPreview
      result={result}
      thickness={thickness}
      folds={folds}
      onFoldsChange={(next) =>
        store.apply((d) => {
          const doc = { ...d, folds: next };
          if (!next) delete doc.folds;
          return doc;
        })
      }
      artwork
      onClose={() => store.setDisplay({ preview3d: false })}
    />
  );
}

export type FoldPreviewStrings = {
  title: string;
  fold: string;
  close: string;
  loading: string;
  pending: string;
  empty: string;
  failed: string;
  expand: string;
  shrink: string;
  image: string;
  removeImage: string;
  panel: string;
  pickPanel: string;
  auto: string;
  inward: string;
  outward: string;
  angle: string;
  root: string;
  dragHint: string;
  imageSize: string;
  resetImage: string;
};

const FOLD_EN: FoldPreviewStrings = {
  title: "3D preview",
  fold: "Fold",
  close: "Close",
  loading: "Loading 3D…",
  pending: "Building the model…",
  empty: "Nothing to fold yet: draw a closed cut outline with fold lines.",
  failed: "This shape could not be folded. Check that the cut outline is closed.",
  expand: "Larger view",
  shrink: "Smaller view",
  image: "Put an image on the model",
  removeImage: "Remove the image",
  panel: "Panel",
  pickPanel: "Click a panel to set which way it folds and how far.",
  auto: "Auto",
  inward: "In",
  outward: "Out",
  angle: "Angle",
  root: "This is the panel everything folds around.",
  dragHint: "Drag to move",
  imageSize: "Image size",
  resetImage: "Reset placement",
};

type Artwork = { url: string; transform: { scale: number; cx: number; cy: number } };

/**
 * A docked 3D view of any render result; the Studio and the Customizer both use
 * it. With `onFoldsChange` panels can be clicked to set their fold direction and
 * angle; with `artwork` an image can be printed on the model (never uploaded).
 */
export function FoldPreview({
  result,
  thickness,
  onClose,
  strings,
  className,
  folds,
  onFoldsChange,
  artwork: allowArtwork,
}: {
  result: RenderResult;
  thickness: number;
  onClose?: () => void;
  strings?: Partial<FoldPreviewStrings>;
  /** Placement of the small, docked view (the large one is always centred). */
  className?: string;
  folds?: FoldSettings;
  onFoldsChange?: (folds: FoldSettings | undefined) => void;
  artwork?: boolean;
}) {
  const t = { ...FOLD_EN, ...strings };
  const [progress, setProgress] = useState(1);
  // Opens large in the middle of the canvas; it can be shrunk into a corner.
  const [expanded, setExpanded] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Rebuilding the rig on every keystroke would stutter; the deferred value lets
  // typing stay responsive and the 3D view catch up.
  const deferred = useDeferredValue(result);
  const svg = useMemo(() => toFoldSVG(deferred), [deferred]);

  // The same rig the viewer builds, for naming panels and recording overrides.
  const rig = useMemo(() => {
    try {
      return buildFoldRig(extractSegmentsFromSvg(svg), null, extractWindows(svg));
    } catch {
      return null;
    }
  }, [svg]);
  const panelCount = rig ? rig.nodes.filter((n) => !n.isHole).length : 0;
  const foldConfig = useMemo(() => (folds ? JSON.stringify({ version: 1, ...folds }) : null), [folds]);

  useEffect(() => {
    const url = artwork?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [artwork?.url]);

  const node = selected !== null ? rig?.nodes[selected] : undefined;
  const override = folds?.overrides.find((o) => o.faceIndex === selected);

  const setOverride = (patch: { direction: "in" | "out"; angle: number } | null) => {
    if (selected === null || !node || !onFoldsChange) return;
    const others = (folds?.overrides ?? []).filter((o) => o.faceIndex !== selected);
    const overrides = patch ? [...others, { faceIndex: selected, ...patch, vertexCount: node.face.outline.length }] : others;
    // The root is the template's own choice: editing a panel's fold keeps it.
    const rootFace = folds?.rootFace;
    onFoldsChange(
      overrides.length || rootFace !== undefined
        ? { faceCount: panelCount, ...(rootFace !== undefined ? { rootFace } : {}), overrides: overrides.sort((a, b) => a.faceIndex - b.faceIndex) }
        : undefined,
    );
  };

  const editable = !!onFoldsChange;

  return (
    <div
      dir="ltr"
      className={cn(
        "absolute z-20 flex flex-col overflow-hidden rounded-lg border bg-background shadow-xl",
        expanded
          ? "left-1/2 top-1/2 h-[min(640px,88%)] w-[min(1000px,92%)] -translate-x-1/2 -translate-y-1/2"
          : cn("bottom-10 right-3 h-[340px] w-[360px]", className),
      )}
      data-own-wheel
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex h-8 shrink-0 items-center gap-1.5 border-b px-2 text-xs">
        <Box className="size-3.5 text-muted-foreground" />
        <span className="font-medium">{t.title}</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.005}
          value={progress}
          title={t.fold}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="ml-auto w-28"
        />
        {allowArtwork && (
          <>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file?.type.startsWith("image/")) setArtwork({ url: URL.createObjectURL(file), transform: { scale: 1, cx: 0.5, cy: 0.5 } });
                e.target.value = "";
              }}
            />
            <DockButton title={t.image} onClick={() => fileInput.current?.click()}>
              <ImagePlus className="size-3.5" />
            </DockButton>
            {artwork && (
              <DockButton title={t.removeImage} onClick={() => setArtwork(null)}>
                <Trash2 className="size-3.5" />
              </DockButton>
            )}
          </>
        )}
        <DockButton title={expanded ? t.shrink : t.expand} onClick={() => setExpanded(!expanded)}>
          {expanded ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
        </DockButton>
        {onClose && (
          <DockButton title={t.close} onClick={onClose}>
            <X className="size-3.5" />
          </DockButton>
        )}
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="relative min-h-0 min-w-0 flex-1 bg-muted/30">
          <Suspense fallback={<p className="p-4 text-xs text-muted-foreground">{t.loading}</p>}>
            <DielineViewer
              svg={svg}
              material="glossyCardboard"
              thickness={thickness}
              progress={progress}
              foldConfig={foldConfig}
              artwork={artwork}
              selectedPanel={editable ? selected : null}
              onPanelClick={editable ? (i) => setSelected(i === selected ? null : i) : undefined}
              className="h-full w-full"
              renderEmpty={(reason) => (
                <p className="p-4 text-xs text-muted-foreground">
                  {reason === "pending" ? t.pending : reason === "no-geometry" ? t.empty : t.failed}
                </p>
              )}
            />
          </Suspense>
        </div>
        {expanded && artwork && (
          <div className="w-72 shrink-0 overflow-y-auto border-l p-2">
            <ArtworkPlacer
              svg={svg}
              imageUrl={artwork.url}
              value={artwork.transform}
              onChange={(transform) => setArtwork({ ...artwork, transform })}
              labels={{ dragHint: t.dragHint, sizeLabel: t.imageSize, reset: t.resetImage, noGeometry: t.empty }}
            />
          </div>
        )}
      </div>

      {editable && (
        <div className="flex min-h-9 shrink-0 flex-wrap items-center gap-1.5 border-t px-2 py-1 text-[11px]">
          {!node ? (
            <span className="text-muted-foreground">{t.pickPanel}</span>
          ) : node.parent === null ? (
            <span className="text-muted-foreground">
              {t.panel} {selected! + 1}: {t.root}
            </span>
          ) : (
            <>
              <span className="font-medium">
                {t.panel} {selected! + 1}
              </span>
              {(
                [
                  ["auto", t.auto],
                  ["in", t.inward],
                  ["out", t.outward],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setOverride(value === "auto" ? null : { direction: value, angle: override?.angle ?? DEFAULT_FOLD_ANGLE })}
                  className={cn(
                    "rounded border px-1.5 py-0.5",
                    (override?.direction ?? "auto") === value ? "border-blue-500 bg-blue-500/10 text-blue-700" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
              {override && (
                <label className="ml-1 flex items-center gap-1">
                  {t.angle}
                  <input
                    type="range"
                    min={0}
                    max={180}
                    step={5}
                    value={override.angle}
                    onChange={(e) => setOverride({ direction: override.direction, angle: Number(e.target.value) })}
                    className="w-24"
                  />
                  <span className="w-8 font-mono">{override.angle}°</span>
                </label>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function DockButton({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" title={title} className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground" onClick={onClick}>
      {children}
    </button>
  );
}
