"use client";

import { toFoldSVG, type FoldSettings, type RenderResult } from "@repo/dieline-engine";
import { ArtworkPlacer } from "@repo/dieline-3d/ArtworkPlacer";
import { buildFoldRig, DEFAULT_FOLD_ANGLE, extractSegmentsFromSvg, extractWindows, parseFoldConfig, rigPieces, stepWindows } from "@repo/dieline-3d/rig";
import { cn } from "@repo/ui/lib/utils";
import { Box, ImagePlus, Maximize2, Minimize2, Play, RotateCcw, Scan, Trash2, X } from "lucide-react";
import { lazy, Suspense, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  common,
  compactFoldSteps,
  deleteFoldStep,
  foldSteps,
  keepFoldPlace,
  nextFoldStep,
  hasPiecePlacement,
  piecePlacement,
  setPanelFolds,
  setPanelSteps,
  setPiecePlacement,
  setStandsOn,
  withRest,
  type FoldPanel,
  type FoldPatch,
} from "../model/folds";
import { useEditor, useStore } from "../state/react";

// three.js is heavy; it loads the first time the dock opens, not with the editor.
const DielineViewer = lazy(() => import("@repo/dieline-3d/viewer").then((m) => ({ default: m.DielineViewer })));

/** The Studio's dock: the template folded, with fold directions, angles and steps editable. */
export function Preview3D() {
  const store = useStore();
  const result = useEditor((s) => s.result);
  const thickness = useEditor((s) => s.inputs.thickness);
  const folds = useEditor((s) => s.doc.folds);
  const material = useEditor((s) => s.display.material);
  return (
    <FoldPreview
      result={result}
      thickness={thickness}
      material={material}
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
  rest: string;
  restEnd: string;
  restBase: string;
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
  panels: string;
  pickPanel: string;
  auto: string;
  inward: string;
  outward: string;
  angle: string;
  root: string;
  rootSkipped: string;
  mixed: string;
  step: string;
  newStep: string;
  steps: string;
  flat: string;
  closed: string;
  play: string;
  selectStep: string;
  clear: string;
  pieces: string;
  piece: string;
  position: string;
  rotation: string;
  resetPiece: string;
  resetMove: string;
  at: string;
  start: string;
  movesIn: string;
  carried: string;
  atSheet: string;
  standsOn: string;
  deleteStep: string;
  fit: string;
  standsOnHint: string;
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
  panels: "panels",
  pickPanel: "Click a panel to set how it folds; Shift-click to pick several.",
  auto: "Auto",
  inward: "In",
  outward: "Out",
  angle: "Angle",
  root: "This is the panel everything folds around.",
  rootSkipped: "(the still panel is left out)",
  mixed: "mixed",
  step: "Step",
  newStep: "New step",
  steps: "Steps",
  flat: "Flat",
  closed: "Closed",
  play: "Play the fold from flat",
  selectStep: "Select step",
  clear: "Clear selection",
  pieces: "Pieces",
  piece: "Piece",
  position: "Position (mm)",
  rotation: "Rotation (°)",
  resetPiece: "Back where the sheet puts it",
  resetMove: "No move in this step",
  at: "At",
  start: "Start",
  movesIn: "Moves in step",
  carried: "(where the step before left it)",
  atSheet: "(where the sheet puts it)",
  standsOn: "Stands on this",
  deleteStep: "Delete step",
  fit: "Fit to screen",
  standsOnHint: "Its piece stands on this panel, drawn side (the inside) up; everything else folds up from it.",
  rest: "Rests on",
  restEnd: "Its end",
  restBase: "Its base",
  dragHint: "Drag to move",
  imageSize: "Image size",
  resetImage: "Reset placement",
};

type Artwork = { url: string; transform: { scale: number; cx: number; cy: number } };

/** How long one step takes when the player runs, in milliseconds. */
const STEP_MS = 900;

/**
 * A docked 3D view of any render result; the Studio and the Customizer both use
 * it. With `onFoldsChange` panels can be clicked (Shift-click for several) to set
 * their fold direction, angle and the step they fold in; with `artwork` an image
 * can be printed on the model (never uploaded).
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
  material = "glossyCardboard",
}: {
  result: RenderResult;
  thickness: number;
  /** The board to show, as the site's material keys: flute materials get kraft and flutes. */
  material?: string;
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
  const [selected, setSelected] = useState<number[]>([]);
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [fitRequest, setFitRequest] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const playing = useRef<number | null>(null);

  // Rebuilding the rig on every keystroke would stutter; the deferred value lets
  // typing stay responsive and the 3D view catch up.
  const deferred = useDeferredValue(result);
  const svg = useMemo(() => toFoldSVG(deferred), [deferred]);
  const foldConfig = useMemo(() => (folds ? JSON.stringify({ version: 1, ...folds }) : null), [folds]);

  // The rig with nothing authored: what a panel does on its own, which is what
  // "Auto" means and what a panel put into a step starts from.
  const inferredRig = useMemo(() => {
    try {
      return buildFoldRig(extractSegmentsFromSvg(svg), null, extractWindows(svg));
    } catch {
      return null;
    }
  }, [svg]);
  // The rig the viewer folds: the steps' places on the fold slider, and its pieces.
  const foldedRig = useMemo(() => {
    try {
      return buildFoldRig(extractSegmentsFromSvg(svg), parseFoldConfig(foldConfig), extractWindows(svg));
    } catch {
      return null;
    }
  }, [svg, foldConfig]);
  // Every authored step, of panels or of piece moves, and where it runs on the fold slider.
  const timeline = useMemo(() => (foldedRig ? stepWindows(foldedRig) : []), [foldedRig]);
  // Adding or removing a step re-divides the fold slider; keep the view at
  // the same moment of the same step instead of wherever the number lands now.
  const lastTimeline = useRef(timeline);
  useEffect(() => {
    const before = lastTimeline.current;
    lastTimeline.current = timeline;
    if (JSON.stringify(before) === JSON.stringify(timeline)) return;
    setProgress((p) => keepFoldPlace(p, before, timeline));
  }, [timeline]);
  const pieces = useMemo(() => (foldedRig ? rigPieces(foldedRig) : []), [foldedRig]);
  const [piece, setPiece] = useState<number | null>(null);
  const activePiece = pieces.find((p) => p.face === piece) ?? null;
  const panelCount = inferredRig ? inferredRig.nodes.filter((n) => !n.isHole).length : 0;

  // A rebuilt template may have fewer panels; forget any that are gone.
  useEffect(() => {
    if (!inferredRig) return;
    setSelected((s) => (s.every((i) => inferredRig.nodes[i] && !inferredRig.nodes[i]!.isHole) ? s : s.filter((i) => inferredRig.nodes[i] && !inferredRig.nodes[i]!.isHole)));
  }, [inferredRig]);

  useEffect(() => {
    const url = artwork?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [artwork?.url]);

  useEffect(() => () => {
    if (playing.current !== null) cancelAnimationFrame(playing.current);
  }, []);

  /** Runs the fold slider from one place to another, a step's worth of time per step. */
  const playTo = useCallback((to: number, from?: number) => {
    if (playing.current !== null) cancelAnimationFrame(playing.current);
    const start = from ?? progress;
    const span = Math.abs(to - start);
    if (span < 1e-6) return setProgress(to);
    const steps = Math.max(1, timeline.length + 1);
    const duration = Math.max(250, span * steps * STEP_MS);
    const began = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - began) / duration);
      const eased = k * k * (3 - 2 * k);
      setProgress(start + (to - start) * eased);
      playing.current = k < 1 ? requestAnimationFrame(tick) : null;
    };
    playing.current = requestAnimationFrame(tick);
  }, [progress, timeline.length]);

  const stopPlaying = () => {
    if (playing.current !== null) cancelAnimationFrame(playing.current);
    playing.current = null;
  };

  const nodes = inferredRig?.nodes ?? [];
  const chosen = selected.filter((i) => nodes[i] && !nodes[i]!.isHole);
  // The still panel never folds, so it is left out of every edit.
  // Which panels stand still is the folded rig's word: a piece may stand on a chosen panel.
  const movable = chosen.filter((i) => (foldedRig?.nodes[i] ?? nodes[i])!.parent !== null);
  const panels: FoldPanel[] = movable.map((i) => {
    const node = nodes[i]!;
    return { faceIndex: i, vertexCount: node.face.outline.length, valley: node.valley, angle: (node.angle * 180) / Math.PI };
  });
  // Every panel that folds, as `deleteFoldStep` needs them.
  const allPanels: FoldPanel[] = nodes.flatMap((node, i) =>
    node.isHole || (foldedRig?.nodes[i] ?? node).parent === null ? [] : [{ faceIndex: i, vertexCount: node.face.outline.length, valley: node.valley, angle: (node.angle * 180) / Math.PI }],
  );
  const overrides = movable.map((i) => folds?.overrides.find((o) => o.faceIndex === i));
  const direction = common(overrides.map((o) => o?.direction ?? "auto"));
  const angle = common(overrides.map((o) => o?.angle));
  const step = common(overrides.map((o) => o?.step ?? null));
  const steps = foldSteps(folds);

  const editable = !!onFoldsChange;
  const save = (next: FoldSettings | undefined) => onFoldsChange?.(compactFoldSteps(next));
  const setFold = (patch: FoldPatch | "auto") => save(setPanelFolds(folds, panels, patch, panelCount));
  const setStep = (value: number | null) => save(setPanelSteps(folds, panels, value, panelCount));

  // Which moment of the piece is being set: its start, or the end of a step.
  const [pieceStep, setPieceStep] = useState<number | undefined>(undefined);
  const placement = activePiece ? piecePlacement(folds, activePiece.face, pieceStep) : null;
  const ownPlacement = activePiece ? hasPiecePlacement(folds, activePiece.face, pieceStep) : false;
  const place = (patch: Parameters<typeof setPiecePlacement>[2]) => {
    if (activePiece) save(setPiecePlacement(folds, activePiece.face, patch, panelCount, pieceStep));
  };

  const pick = (i: number, additive: boolean) => {
    setPiece(null);
    if (additive) setSelected((s) => (s.includes(i) ? s.filter((j) => j !== i) : [...s, i]));
    else setSelected((s) => (s.length === 1 && s[0] === i ? [] : [i]));
  };

  const chip = (on: boolean) =>
    cn("rounded border", expanded ? "px-2 py-1" : "px-1.5 py-0.5", on ? "border-blue-500 bg-blue-500/10 text-blue-700" : "text-muted-foreground hover:text-foreground");
  // The full-screen view is for working in, so its controls are a size up.
  const bar = expanded ? "text-[13px]" : "text-[11px]";

  return (
    <div
      dir="ltr"
      className={cn(
        "flex flex-col overflow-hidden border bg-background shadow-xl",
        // Large, it takes the whole screen; small, it docks in a corner of the canvas.
        expanded ? "fixed inset-0 z-50" : cn("absolute bottom-10 right-3 z-20 h-[400px] w-[400px] rounded-lg", className),
      )}
      data-own-wheel
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === "Escape" && selected.length) {
          e.stopPropagation();
          setSelected([]);
        }
      }}
    >
      <div className={cn("flex shrink-0 items-center gap-1.5 border-b px-2", expanded ? "h-11 text-sm" : "h-8 text-xs")}>
        <Box className="size-3.5 text-muted-foreground" />
        <span className="font-medium">{t.title}</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.005}
          value={progress}
          title={t.fold}
          onChange={(e) => {
            stopPlaying();
            setProgress(Number(e.target.value));
          }}
          className={cn("ml-auto", expanded ? "w-64" : "w-28")}
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
        <DockButton title={t.fit} onClick={() => setFitRequest((n) => n + 1)}>
          <Scan className="size-3.5" />
        </DockButton>
        <DockButton title={expanded ? t.shrink : t.expand} onClick={() => setExpanded(!expanded)}>
          {expanded ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
        </DockButton>
        {onClose && (
          <DockButton title={t.close} onClick={onClose}>
            <X className="size-3.5" />
          </DockButton>
        )}
      </div>

      {/* The step player: the fold stopped at the end of each step, flat to closed. */}
      {timeline.length > 0 && (
        <div className={cn("flex min-h-8 shrink-0 flex-wrap items-center gap-1 border-b px-2 py-1", bar)}>
          <DockButton title={t.play} onClick={() => playTo(1, 0)}>
            <Play className="size-3.5" />
          </DockButton>
          <span className="mr-1 text-muted-foreground">{t.steps}</span>
          <button type="button" className={chip(progress < 1e-3)} onClick={() => playTo(0)}>
            {t.flat}
          </button>
          {timeline.map(({ step: s, start, end }) => (
            <button
              key={s}
              type="button"
              title={`${t.step} ${s}`}
              // Lit while the fold is inside this step or just finished it.
              className={chip(progress > start + 1e-3 && progress <= end + 1e-3)}
              onClick={() => playTo(end, progress > end - 1e-3 || progress < start - 1e-3 ? start : undefined)}
            >
              {s}
            </button>
          ))}
          <button type="button" className={chip(progress > 1 - 1e-3)} onClick={() => playTo(1)}>
            {t.closed}
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <div className="relative min-h-0 min-w-0 flex-1 bg-muted/30">
          <Suspense fallback={<p className="p-4 text-xs text-muted-foreground">{t.loading}</p>}>
            <DielineViewer
              svg={svg}
              material={material}
              thickness={thickness}
              progress={progress}
              foldConfig={foldConfig}
              artwork={artwork}
              selectedPanels={editable ? (activePiece ? activePiece.members : chosen) : undefined}
              unlimitedZoom={editable}
              fitRequest={fitRequest}
              onPanelClick={editable ? (i, click) => pick(i, click.additive) : undefined}
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
        <div className={cn("flex min-h-8 shrink-0 flex-wrap items-center gap-1.5 border-t px-2 py-1", bar)}>
          <span className="text-muted-foreground">{t.rest}</span>
          {(
            [
              ["end", t.restEnd],
              ["base", t.restBase],
            ] as const
          ).map(([value, label]) => (
            <button key={value} type="button" onClick={() => save(withRest(folds, value, panelCount))} className={chip((folds?.rest ?? "end") === value)}>
              {label}
            </button>
          ))}
          <span className="ml-3 text-muted-foreground">{t.pieces}</span>
          {pieces.map((p, k) => (
            <button
              key={p.face}
              type="button"
              title={`${p.members.length} ${t.panels}`}
              onClick={() => {
                setSelected([]);
                setPiece(piece === p.face ? null : p.face);
              }}
              className={chip(piece === p.face)}
            >
              {pieces.length > 1 ? `${t.piece} ${k + 1}` : t.piece}
            </button>
          ))}
        </div>
      )}

      {editable && activePiece && placement && (
        <div className={cn("flex min-h-9 shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-t px-2 py-1", bar)}>
          <span className="font-medium">{pieces.length > 1 ? `${t.piece} ${pieces.indexOf(activePiece) + 1}` : t.piece}</span>
          {/* The moment being set: the start, or where the piece is when a step ends. */}
          <span className="flex flex-wrap items-center gap-1">
            <span className="text-muted-foreground">{t.at}</span>
            <button
              type="button"
              className={chip(pieceStep === undefined)}
              onClick={() => {
                setPieceStep(undefined);
                playTo(0);
              }}
            >
              {t.start}
            </button>
            {[...new Set([...timeline.map((w) => w.step), ...(pieceStep !== undefined ? [pieceStep] : [])])]
              .sort((a, b) => a - b)
              .map((s) => (
                <button
                  key={s}
                  type="button"
                  title={hasPiecePlacement(folds, activePiece.face, s) ? `${t.movesIn} ${s}` : undefined}
                  className={cn(chip(pieceStep === s), hasPiecePlacement(folds, activePiece.face, s) && "font-semibold")}
                  onClick={() => {
                    setPieceStep(s);
                    const end = timeline.find((w) => w.step === s)?.end;
                    if (end !== undefined) playTo(end);
                  }}
                >
                  {s}
                </button>
              ))}
            <button type="button" className={chip(false)} onClick={() => setPieceStep(nextFoldStep(folds))}>
              + {t.newStep}
            </button>
          </span>
          {!ownPlacement && <span className="text-muted-foreground">{pieceStep === undefined ? t.atSheet : t.carried}</span>}
          <span className="flex items-center gap-1">
            <span className="text-muted-foreground">{t.position}</span>
            {(["x", "y", "z"] as const).map((axis) => (
              <NumberField key={axis} label={axis.toUpperCase()} value={placement[axis]} step={1} onChange={(v) => place({ [axis]: v })} wide={expanded} />
            ))}
          </span>
          <span className="flex items-center gap-1">
            <span className="text-muted-foreground">{t.rotation}</span>
            {(
              [
                ["rx", "X"],
                ["ry", "Y"],
                ["rz", "Z"],
              ] as const
            ).map(([axis, label]) => (
              <NumberField key={axis} label={label} value={placement[axis]} step={1} onChange={(v) => place({ [axis]: v })} wide={expanded} />
            ))}
          </span>
          <button type="button" title={pieceStep === undefined ? t.resetPiece : t.resetMove} className={chip(false)} onClick={() => place(null)}>
            <RotateCcw className="size-3" />
          </button>
          <ClearButton title={t.clear} onClick={() => setPiece(null)} />
        </div>
      )}

      {editable && (
        <div className={cn("flex min-h-9 shrink-0 flex-col justify-center gap-1 border-t px-2 py-1", bar)}>
          {chosen.length === 0 ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-muted-foreground">{t.pickPanel}</span>
              {steps.length > 0 && (
                <>
                  <span className="ml-auto text-muted-foreground">{t.selectStep}</span>
                  {steps.map(({ step: s, faces }) => (
                    <span key={s} className="inline-flex items-center">
                      <button type="button" title={`${faces.length} ${t.panels}`} className={cn(chip(false), "rounded-r-none")} onClick={() => setSelected(faces)}>
                        {s}
                      </button>
                      <button
                        type="button"
                        title={`${t.deleteStep} ${s}`}
                        aria-label={`${t.deleteStep} ${s}`}
                        className={cn(chip(false), "rounded-l-none border-l-0 hover:text-destructive")}
                        onClick={() => save(deleteFoldStep(folds, s, allPanels, panelCount))}
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </>
              )}
            </div>
          ) : movable.length === 0 ? (
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">
                {t.panel} {chosen[0]! + 1}: {t.root}
              </span>
              <ClearButton title={t.clear} onClick={() => setSelected([])} />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-medium">
                  {movable.length === 1 ? `${t.panel} ${movable[0]! + 1}` : `${movable.length} ${t.panels}`}
                </span>
                {movable.length < chosen.length && <span className="text-muted-foreground">{t.rootSkipped}</span>}
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
                    onClick={() => setFold(value === "auto" ? "auto" : { direction: value, angle: angle ?? overrides.find((o) => o)?.angle ?? DEFAULT_FOLD_ANGLE })}
                    className={chip(direction === value)}
                  >
                    {label}
                  </button>
                ))}
                {direction === undefined && <span className="text-muted-foreground">{t.mixed}</span>}
                {direction !== undefined && direction !== "auto" && (
                  <label className="ml-1 flex items-center gap-1">
                    {t.angle}
                    <input
                      type="range"
                      min={0}
                      max={180}
                      step={1}
                      value={angle ?? DEFAULT_FOLD_ANGLE}
                      onChange={(e) => setFold({ direction, angle: Number(e.target.value) })}
                      className={expanded ? "w-40" : "w-24"}
                    />
                    <input
                      type="number"
                      min={0}
                      max={180}
                      step={1}
                      value={angle ?? ""}
                      placeholder={t.mixed}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (e.target.value !== "" && Number.isFinite(value)) setFold({ direction, angle: Math.min(180, Math.max(0, value)) });
                      }}
                      className="w-12 rounded border bg-background px-1 font-mono"
                    />
                    °
                  </label>
                )}
                {movable.length === 1 && (
                  <button
                    type="button"
                    title={t.standsOnHint}
                    className={cn(chip(false), "ml-2")}
                    onClick={() => {
                      const face = movable[0]!;
                      const members = pieces.find((p) => p.members.includes(face))?.members ?? [face];
                      save(setStandsOn(folds, face, members, panelCount));
                    }}
                  >
                    {t.standsOn}
                  </button>
                )}
                <ClearButton title={t.clear} onClick={() => setSelected([])} />
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-muted-foreground">{t.step}</span>
                <button type="button" onClick={() => setStep(null)} className={chip(step === null)}>
                  {t.auto}
                </button>
                {steps.map(({ step: s }) => (
                  <button key={s} type="button" onClick={() => setStep(s)} className={chip(step === s)}>
                    {s}
                  </button>
                ))}
                <button type="button" onClick={() => setStep(nextFoldStep(folds))} className={chip(false)}>
                  + {t.newStep}
                </button>
                {step === undefined && <span className="text-muted-foreground">{t.mixed}</span>}
              </div>
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

/**
 * A number typed or nudged with the arrow keys (Shift for ten times the step).
 * It commits as you type, once the text is a number.
 */
function NumberField({ label, value, step, onChange, wide }: { label: string; value: number; step: number; onChange: (value: number) => void; wide: boolean }) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  return (
    <label className="flex items-center gap-0.5">
      <span className="font-mono text-muted-foreground">{label}</span>
      <input
        type="number"
        value={text}
        step={step}
        onChange={(e) => {
          setText(e.target.value);
          const next = Number(e.target.value);
          if (e.target.value.trim() !== "" && Number.isFinite(next)) onChange(next);
        }}
        onKeyDown={(e) => {
          if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
          e.preventDefault();
          const by = (e.shiftKey ? 10 : 1) * step * (e.key === "ArrowUp" ? 1 : -1);
          onChange(Math.round((value + by) * 1000) / 1000);
        }}
        className={cn("rounded border bg-background px-1 font-mono", wide ? "w-20" : "w-14")}
      />
    </label>
  );
}

function ClearButton({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <button type="button" title={title} className="ml-auto rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground" onClick={onClick}>
      <X className="size-3" />
    </button>
  );
}
