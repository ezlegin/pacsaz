"use client";

import {
  buildFoldRig,
  DEFAULT_FOLD_ANGLE,
  defaultArtworkTransform,
  extractSegmentsFromSvg,
  foldConfigStatus,
  MAX_FOLD_ANGLE,
  MIN_FOLD_ANGLE,
  parseFoldConfig,
  type ArtworkTransform,
  type FoldConfig,
  type FoldOverride,
} from "@repo/dieline-3d/geometry";
import { DielineViewer } from "@repo/dieline-3d/viewer";
import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import {
  foldConfigSelectors,
  setFoldConfigJson,
} from "@repo/store/slices/foldConfigSlice";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { Separator } from "@repo/ui/components/separator";
import {
  Box,
  ExternalLink,
  ImagePlus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { ArtworkPlacer } from "@repo/dieline-3d/ArtworkPlacer";
import { useEffect, useMemo, useRef, useState } from "react";

/** Upserts one override and serialises back into the store. */
const withOverride = (
  config: FoldConfig | null,
  faceIndex: number,
  patch: Partial<Omit<FoldOverride, "faceIndex">>,
  faceCount: number,
  vertexCount: number,
): string => {
  const base: FoldConfig = config ?? {
    version: 1,
    faceCount,
    overrides: [],
  };

  const existing = base.overrides.find((o) => o.faceIndex === faceIndex);

  const merged: FoldOverride = {
    faceIndex,
    direction: patch.direction ?? existing?.direction ?? "in",
    angle: patch.angle ?? existing?.angle ?? DEFAULT_FOLD_ANGLE,
    vertexCount: existing?.vertexCount ?? vertexCount,
  };

  const overrides = base.overrides.filter((o) => o.faceIndex !== faceIndex);
  overrides.push(merged);

  return JSON.stringify({ ...base, faceCount, overrides });
};

const FoldPanel = () => {
  const dispatch = useAppDispatch();

  const svg = useAppSelector((s) => s.svg.svg);
  const json = useAppSelector(foldConfigSelectors.json);
  const material = useAppSelector((s) => s.dielineSettings.material.value);
  const thickness = useAppSelector((s) => s.dielineSettings.thickness);

  const [selected, setSelected] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(1);

  /**
   * Preview-only artwork, exactly as in the client app: an object URL held in
   * memory, never uploaded and never saved with the dieline. It exists so folds
   * can be reviewed against real artwork, not a blank board.
   */
  const [artwork, setArtwork] = useState<{
    url: string;
    name: string;
    transform: ArtworkTransform;
  } | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);

  // Free the blob URL when it is replaced, keyed on the URL so replacing the
  // transform does not revoke a URL that is still in use.
  useEffect(() => {
    const url = artwork?.url;
    if (!url) return;

    return () => URL.revokeObjectURL(url);
  }, [artwork?.url]);

  const pickArtwork = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;

    setArtwork({
      url: URL.createObjectURL(file),
      name: file.name,
      transform: defaultArtworkTransform(),
    });
  };

  const config = useMemo(() => parseFoldConfig(json), [json]);

  /** The rig the editor edits — same pipeline the viewer uses. */
  const rig = useMemo(() => {
    if (!svg) return null;

    try {
      const segments = extractSegmentsFromSvg(svg);
      if (segments.length === 0) return null;

      return buildFoldRig(segments, config);
    } catch (error) {
      console.error("[Folds] rig failed", error);
      return null;
    }
  }, [svg, config]);

  if (!rig || rig.nodes.length === 0) {
    return (
      <p className="px-1 py-6 text-xs text-muted-foreground">
        No foldable geometry yet. Add a fold line to the dieline first.
      </p>
    );
  }

  const status = foldConfigStatus(rig, config);
  // Windows are cut-outs, not panels, so they never appear as folds.
  const panels = rig.nodes
    .map((node, index) => ({ node, index }))
    .filter(({ node }) => node.parent !== null && !node.isHole);

  const selectedNode = selected === null ? null : (rig.nodes[selected] ?? null);

  const update = (
    faceIndex: number,
    patch: Partial<Omit<FoldOverride, "faceIndex">>,
  ) => {
    const vertexCount = rig.nodes[faceIndex]?.face.outline.length ?? 0;
    dispatch(
      setFoldConfigJson(
        withOverride(config, faceIndex, patch, panels.length, vertexCount),
      ),
    );
  };

  return (
    <div className="space-y-3">
      {/* ------------------------------- summary ------------------------------ */}
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
        <Badge variant="secondary">{panels.length} panels</Badge>
        <Badge variant={status.configured > 0 ? "default" : "outline"}>
          {status.configured} configured
        </Badge>
        {status.inferred > 0 && (
          <Badge variant="outline">{status.inferred} inferred</Badge>
        )}
        {status.stale > 0 && (
          <Badge variant="destructive">{status.stale} stale</Badge>
        )}
      </div>

      {status.faceCountChanged && (
        <p className="rounded-md bg-amber-50 px-2 py-1.5 text-[11px] leading-5 text-amber-800">
          Panel count changed since these folds were saved. Review them.
        </p>
      )}

      {/* ------------------------------- open 3D ----------------------------- */}
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setSelected(null);
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Box size={14} className="mr-1.5" />
            Open 3D fold editor
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-6xl h-full max-h-200">
          <DialogHeader>
            <DialogTitle>Fold directions</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-[minmax(0,1fr)_20rem] gap-4">
            <DielineViewer
              svg={svg ?? ""}
              material={material}
              thickness={thickness}
              progress={progress}
              foldConfig={json}
              artwork={
                artwork
                  ? { url: artwork.url, transform: artwork.transform }
                  : null
              }
              selectedPanel={selected}
              onPanelClick={(index) => setSelected(index)}
              className="h-[720px] w-full rounded-xl"
            />

            {/* ------------------------ selected panel ------------------------ */}
            <div className="space-y-3">
              <div className="space-y-3 rounded-lg border p-3 h-min">
                {selectedNode && selected !== null ? (
                  <>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold">Panel {selected + 1}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {selectedNode.face.outline.length} edges ·{" "}
                        {Math.round(selectedNode.face.area)} mm²
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-1.5">
                      <p className="text-[11px] font-medium">Direction</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        <Button
                          size="sm"
                          variant={selectedNode.valley ? "default" : "outline"}
                          onClick={() => update(selected, { direction: "in" })}
                        >
                          Inside
                        </Button>
                        <Button
                          size="sm"
                          variant={selectedNode.valley ? "outline" : "default"}
                          onClick={() => update(selected, { direction: "out" })}
                        >
                          Outside
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium">Angle</p>
                        <span className="text-[11px] tabular-nums text-muted-foreground">
                          {Math.round((selectedNode.angle * 180) / Math.PI)}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min={MIN_FOLD_ANGLE}
                        max={MAX_FOLD_ANGLE}
                        value={Math.round((selectedNode.angle * 180) / Math.PI)}
                        onChange={(e) =>
                          update(selected, {
                            angle: Number(e.target.value),
                          })
                        }
                        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-muted accent-[var(--primary)]"
                      />
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full"
                      onClick={() =>
                        update(selected, {
                          direction: "in",
                          angle: DEFAULT_FOLD_ANGLE,
                        })
                      }
                    >
                      <RotateCcw size={13} className="mr-1.5" />
                      Reset panel
                    </Button>
                  </>
                ) : (
                  <p className="py-8 text-center text-[11px] leading-5 text-muted-foreground">
                    Click a panel in the model to set whether it folds inside or
                    outside.
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 border p-3 rounded-lg">
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  Fold
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(progress * 100)}
                  onChange={(e) => setProgress(Number(e.target.value) / 100)}
                  className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-[var(--primary)]"
                />
                <span className="w-9 text-right text-[11px] tabular-nums">
                  {Math.round(progress * 100)}%
                </span>
              </div>

              {/* -------------------------- artwork --------------------------- */}
              <div className="space-y-3 rounded-lg border p-3">
                <div>
                  <p className="text-[11px] font-medium">Artwork preview</p>
                  <p className="text-[10px] leading-4 text-muted-foreground">
                    Local only — never uploaded or saved.
                  </p>
                </div>

                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    pickArtwork(e.target.files?.[0]);
                    // Allow re-picking the same file.
                    e.target.value = "";
                  }}
                />

                {artwork ? (
                  <>
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={artwork.url}
                        alt=""
                        className="size-8 shrink-0 rounded border bg-white object-cover"
                      />

                      <p
                        className="min-w-0 flex-1 truncate text-[10px] text-muted-foreground"
                        title={artwork.name}
                      >
                        {artwork.name}
                      </p>

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setArtwork(null)}
                        aria-label="Remove artwork"
                        title="Remove artwork"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>

                    <ArtworkPlacer
                      svg={svg ?? ""}
                      imageUrl={artwork.url}
                      value={artwork.transform}
                      labels={{
                        dragHint: "Drag to position",
                        sizeLabel: "Artwork size",
                        reset: "Reset position",
                        noGeometry: "Dieline geometry not found.",
                      }}
                      onChange={(transform) =>
                        setArtwork((current) =>
                          current ? { ...current, transform } : current,
                        )
                      }
                    />

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => fileInput.current?.click()}
                    >
                      <ImagePlus size={13} className="mr-1.5" />
                      Change image
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInput.current?.click()}
                  >
                    <ImagePlus size={13} className="mr-1.5" />
                    Choose image
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ------------------------------- panel list --------------------------- */}
      {panels.length === 0 ? (
        <p className="rounded-md bg-muted/60 px-2 py-2 text-[11px] leading-5 text-muted-foreground">
          This dieline has no creases, so there is nothing to fold. The 3D view
          still shows the flat geometry.
        </p>
      ) : (
        <ul className="space-y-1">
          {panels.map(({ node, index }) => {
            const override = config?.overrides.find(
              (o) => o.faceIndex === index,
            );
            const degrees = Math.round((node.angle * 180) / Math.PI);

            return (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(index);
                    setOpen(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-md border bg-background px-2 py-1.5 text-left text-[11px] transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="w-12 shrink-0 font-medium">
                    P{index + 1}
                  </span>

                  <Badge
                    variant={node.valley ? "default" : "secondary"}
                    className="shrink-0"
                  >
                    {node.valley ? "in" : "out"}
                  </Badge>

                  <span className="w-9 shrink-0 tabular-nums text-muted-foreground">
                    {degrees}°
                  </span>

                  <span className="min-w-0 flex-1 truncate text-right text-muted-foreground">
                    {override ? "set" : "inferred"}
                  </span>

                  <ExternalLink size={11} className="shrink-0 opacity-50" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FoldPanel;
