import type { FoldSettings } from "@repo/dieline-engine";

/**
 * Fold authoring for the 3D dock: which way and how far panels fold, and in
 * which step. Pure functions over the document's `folds`; the dock only turns
 * clicks into calls to them and applies the result as one undo step.
 */

export type FoldOverride = FoldSettings["overrides"][number];
export type PiecePlacement = NonNullable<FoldSettings["pieces"]>[number];

/** A panel as the dock sees it: its face, and how it folds when nothing is authored. */
export type FoldPanel = {
  faceIndex: number;
  vertexCount: number;
  /** The inferred direction: true folds in (a valley). */
  valley: boolean;
  /** The inferred angle, in degrees. */
  angle: number;
};

export type FoldPatch = { direction: "in" | "out"; angle: number };

/**
 * Settings with these overrides, keeping the template's still panel, the side
 * it rests on and where its pieces stand. Nothing authored is stored as
 * nothing, so an untouched template keeps no fold settings.
 */
export function withOverrides(
  folds: FoldSettings | undefined,
  overrides: FoldOverride[],
  faceCount: number,
  pieces: PiecePlacement[] | undefined = folds?.pieces,
): FoldSettings | undefined {
  const rootFace = folds?.rootFace;
  const rest = folds?.rest === "base" ? "base" : undefined;
  const placed = (pieces ?? []).filter((p) => !isUnplaced(p));
  if (overrides.length === 0 && rootFace === undefined && !rest && placed.length === 0) return undefined;
  return {
    faceCount,
    ...(rootFace !== undefined ? { rootFace } : {}),
    ...(rest ? { rest } : {}),
    overrides: [...overrides].sort((a, b) => a.faceIndex - b.faceIndex),
    ...(placed.length ? { pieces: [...placed].sort((a, b) => a.face - b.face) } : {}),
  };
}

/** Where a piece stands when nothing places it: as the sheet puts it. */
export const unplaced = (face: number): PiecePlacement => ({ face, x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 });
const isUnplaced = (p: PiecePlacement) => [p.x, p.y, p.z, p.rx, p.ry, p.rz].every((v) => Math.abs(v) < 1e-9);

/** A piece's placement, or none: by its still panel's face. */
export function piecePlacement(folds: FoldSettings | undefined, face: number): PiecePlacement {
  return folds?.pieces?.find((p) => p.face === face) ?? unplaced(face);
}

/**
 * Moves or turns one piece (`patch` in millimetres and degrees), or with
 * `null` puts it back where the sheet puts it.
 */
export function setPiecePlacement(
  folds: FoldSettings | undefined,
  face: number,
  patch: Partial<Omit<PiecePlacement, "face">> | null,
  faceCount: number,
): FoldSettings | undefined {
  const others = (folds?.pieces ?? []).filter((p) => p.face !== face);
  const next = patch === null ? [] : [{ ...piecePlacement(folds, face), ...patch, face }];
  return withOverrides(folds, folds?.overrides ?? [], faceCount, [...others, ...next]);
}

/** The same settings resting on another side. */
export function withRest(folds: FoldSettings | undefined, rest: "end" | "base", faceCount: number): FoldSettings | undefined {
  return withOverrides({ ...(folds ?? { faceCount, overrides: [] }), rest }, folds?.overrides ?? [], faceCount);
}

const inferred = (panel: FoldPanel): FoldPatch => ({ direction: panel.valley ? "in" : "out", angle: Math.round(panel.angle) });

/** An override that only repeats what inference does, with no step: storing it would change nothing but mark the fold authored. */
const redundant = (override: FoldOverride, panel: FoldPanel) =>
  override.step === undefined && override.direction === inferred(panel).direction && Math.abs(override.angle - panel.angle) < 0.5;

/**
 * Sets the direction and angle of every panel given, or with `"auto"` hands
 * them back to inference. A panel keeps the step it folds in either way; an
 * automatic panel with a step is stored at its inferred fold.
 */
export function setPanelFolds(folds: FoldSettings | undefined, panels: FoldPanel[], patch: FoldPatch | "auto", faceCount: number): FoldSettings | undefined {
  const chosen = new Map(panels.map((p) => [p.faceIndex, p]));
  const kept = (folds?.overrides ?? []).filter((o) => !chosen.has(o.faceIndex));
  const changed = panels.flatMap((panel): FoldOverride[] => {
    const step = folds?.overrides.find((o) => o.faceIndex === panel.faceIndex)?.step;
    if (patch === "auto" && step === undefined) return [];
    const fold = patch === "auto" ? inferred(panel) : patch;
    return [{ faceIndex: panel.faceIndex, ...fold, vertexCount: panel.vertexCount, ...(step === undefined ? {} : { step }) }];
  });
  return withOverrides(folds, [...kept, ...changed], faceCount);
}

/**
 * Puts every panel given into `step` (counted from the flat sheet), or with
 * `null` back into the automatic order. A panel with no fold of its own gets
 * its inferred one, so the step changes when it folds and nothing else.
 */
export function setPanelSteps(folds: FoldSettings | undefined, panels: FoldPanel[], step: number | null, faceCount: number): FoldSettings | undefined {
  const chosen = new Map(panels.map((p) => [p.faceIndex, p]));
  const kept = (folds?.overrides ?? []).filter((o) => !chosen.has(o.faceIndex));
  const changed = panels.flatMap((panel): FoldOverride[] => {
    const current = folds?.overrides.find((o) => o.faceIndex === panel.faceIndex);
    const fold = current ?? { faceIndex: panel.faceIndex, ...inferred(panel), vertexCount: panel.vertexCount };
    const next: FoldOverride = { faceIndex: fold.faceIndex, direction: fold.direction, angle: fold.angle, vertexCount: panel.vertexCount, ...(step === null ? {} : { step }) };
    return redundant(next, panel) ? [] : [next];
  });
  return withOverrides(folds, [...kept, ...changed], faceCount);
}

/** The authored steps in order, each with its panels. */
export function foldSteps(folds: FoldSettings | undefined): { step: number; faces: number[] }[] {
  const byStep = new Map<number, number[]>();
  for (const o of folds?.overrides ?? []) {
    if (o.step === undefined) continue;
    byStep.set(o.step, [...(byStep.get(o.step) ?? []), o.faceIndex]);
  }
  return [...byStep.entries()].sort((a, b) => a[0] - b[0]).map(([step, faces]) => ({ step, faces: faces.sort((a, b) => a - b) }));
}

/** The step after the last one: where a new step goes. */
export function nextFoldStep(folds: FoldSettings | undefined): number {
  return Math.max(0, ...foldSteps(folds).map((s) => s.step)) + 1;
}

/**
 * Renumbers the steps 1, 2, 3… in their order, so removing every panel from a
 * step leaves no hole in the numbering.
 */
export function compactFoldSteps(folds: FoldSettings | undefined): FoldSettings | undefined {
  if (!folds) return folds;
  const order = foldSteps(folds).map((s) => s.step);
  if (order.every((s, k) => s === k + 1)) return folds;
  return {
    ...folds,
    overrides: folds.overrides.map((o) => (o.step === undefined ? o : { ...o, step: order.indexOf(o.step) + 1 })),
  };
}

/** One shared value when every panel agrees, else `undefined`. */
export function common<T>(values: T[]): T | undefined {
  const [first, ...rest] = values;
  return rest.every((v) => v === first) ? first : undefined;
}

type Window = { start: number; end: number; webThen?: { start: number; end: number } };

/**
 * Where on the fold slider (0 flat, 1 closed) each authored step is finished,
 * from the schedule the viewer runs. A corner web authored after its walls
 * finishes in its own step (`webThen`), not with the walls it follows up.
 */
export function stepTimeline(nodes: readonly { step?: number }[], windows: readonly Window[]): { step: number; start: number; end: number }[] {
  const ends = new Map<number, number>();
  nodes.forEach((node, i) => {
    const w = windows[i];
    if (node.step === undefined || !w) return;
    const end = w.webThen?.end ?? w.end;
    ends.set(node.step, Math.max(ends.get(node.step) ?? 0, end));
  });
  const steps = [...ends.entries()].sort((a, b) => a[0] - b[0]);
  return steps.map(([step, end], k) => ({ step, start: k === 0 ? 0 : steps[k - 1]![1], end }));
}
