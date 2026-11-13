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
  roots: number[] | undefined = folds?.roots,
  rootFace: number | undefined = folds?.rootFace,
): FoldSettings | undefined {
  const rest = folds?.rest === "base" ? "base" : undefined;
  // A start at the sheet's own place is nothing to store; a step's placement
  // always is, even at zero (that is where the piece goes back to).
  const placed = (pieces ?? []).filter((p) => p.step !== undefined || !isUnplaced(p));
  const standing = [...new Set(roots ?? [])].sort((a, b) => a - b);
  if (overrides.length === 0 && rootFace === undefined && !rest && placed.length === 0 && standing.length === 0) return undefined;
  return {
    faceCount,
    ...(rootFace !== undefined ? { rootFace } : {}),
    ...(rest ? { rest } : {}),
    overrides: [...overrides].sort((a, b) => a.faceIndex - b.faceIndex),
    ...(placed.length ? { pieces: [...placed].sort((a, b) => a.face - b.face || (a.step ?? 0) - (b.step ?? 0)) } : {}),
    ...(standing.length ? { roots: standing } : {}),
  };
}

/**
 * Stands a piece on `face`: the panel that stays still, with everything else
 * folding up from it. `members` are the panels of that piece. Resting on its
 * base, a piece lies on this panel with the drawn side, the inside, up. A fold
 * of its own on that panel is dropped, since the panel no longer folds.
 */
export function setStandsOn(folds: FoldSettings | undefined, face: number, members: readonly number[], faceCount: number): FoldSettings | undefined {
  const inPiece = new Set(members);
  const roots = [...(folds?.roots ?? []).filter((r) => !inPiece.has(r)), face];
  // The template's own still panel would win in its piece; it moves with the choice.
  const rootFace = folds?.rootFace !== undefined && inPiece.has(folds.rootFace) ? face : folds?.rootFace;
  // A placement belongs to the panel a piece stood on, so it moves to the new one.
  const pieces = (folds?.pieces ?? []).map((p) => (inPiece.has(p.face) ? { ...p, face } : p));
  const overrides = (folds?.overrides ?? []).filter((o) => o.faceIndex !== face);
  return withOverrides(folds, overrides, faceCount, pieces, roots, rootFace);
}

/** Where a piece stands when nothing places it: as the sheet puts it. */
export const unplaced = (face: number): PiecePlacement => ({ face, x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 });
const isUnplaced = (p: PiecePlacement) => [p.x, p.y, p.z, p.rx, p.ry, p.rz].every((v) => Math.abs(v) < 1e-9);

/**
 * Where a piece is at the start (no `step`) or when `step` ends: its own
 * placement for that step, else wherever it got to before (the last step
 * before with one, or its start).
 */
export function piecePlacement(folds: FoldSettings | undefined, face: number, step?: number): PiecePlacement {
  const mine = (folds?.pieces ?? []).filter((p) => p.face === face);
  const start = mine.find((p) => p.step === undefined);
  const base: PiecePlacement = { ...unplaced(face), ...start, face };
  delete base.step;
  if (step === undefined) return base;
  const before = mine.filter((p) => p.step !== undefined && p.step <= step).sort((a, b) => b.step! - a.step!)[0];
  return { ...base, ...before, face, step };
}

/** Whether a piece has a placement of its own at this step (or at its start). */
export function hasPiecePlacement(folds: FoldSettings | undefined, face: number, step?: number): boolean {
  return (folds?.pieces ?? []).some((p) => p.face === face && p.step === step);
}

/**
 * Moves or turns one piece (`patch` in millimetres and degrees) at its start,
 * or by the end of `step`, moving there during it. With `null` the piece drops
 * that placement: at the start it goes back where the sheet puts it; at a step
 * it no longer moves then.
 */
export function setPiecePlacement(
  folds: FoldSettings | undefined,
  face: number,
  patch: Partial<Omit<PiecePlacement, "face" | "step">> | null,
  faceCount: number,
  step?: number,
): FoldSettings | undefined {
  const others = (folds?.pieces ?? []).filter((p) => !(p.face === face && p.step === step));
  const next = patch === null ? [] : [{ ...piecePlacement(folds, face, step), ...patch, face, ...(step === undefined ? {} : { step }) }];
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

/** The authored steps in order, each with its panels and the pieces that move in it. */
export function foldSteps(folds: FoldSettings | undefined): { step: number; faces: number[]; moves: number[] }[] {
  const byStep = new Map<number, { faces: number[]; moves: number[] }>();
  const at = (step: number) => byStep.get(step) ?? byStep.set(step, { faces: [], moves: [] }).get(step)!;
  for (const o of folds?.overrides ?? []) if (o.step !== undefined) at(o.step).faces.push(o.faceIndex);
  for (const p of folds?.pieces ?? []) if (p.step !== undefined) at(p.step).moves.push(p.face);
  return [...byStep.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([step, { faces, moves }]) => ({ step, faces: faces.sort((a, b) => a - b), moves: moves.sort((a, b) => a - b) }));
}

/**
 * Deletes a step: its panels go back to the automatic order, keeping their
 * own direction and angle, and the steps after it move up one. `panels` are
 * the template's panels as the dock sees them; those of this step are used.
 */
export function deleteFoldStep(folds: FoldSettings | undefined, step: number, panels: FoldPanel[], faceCount: number): FoldSettings | undefined {
  const found = foldSteps(folds).find((s) => s.step === step);
  if (!found) return folds;
  const faces = new Set(found.faces);
  const unfolded = setPanelSteps(folds, panels.filter((p) => faces.has(p.faceIndex)), null, faceCount);
  // Its piece moves go too: a piece then goes on from where it was before.
  const pieces = (unfolded?.pieces ?? []).filter((p) => p.step !== step);
  return compactFoldSteps(withOverrides(unfolded, unfolded?.overrides ?? [], faceCount, pieces));
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
  const renumber = (step: number) => order.indexOf(step) + 1;
  return {
    ...folds,
    overrides: folds.overrides.map((o) => (o.step === undefined ? o : { ...o, step: renumber(o.step) })),
    ...(folds.pieces ? { pieces: folds.pieces.map((p) => (p.step === undefined ? p : { ...p, step: renumber(p.step) })) } : {}),
  };
}

/** One shared value when every panel agrees, else `undefined`. */
export function common<T>(values: T[]): T | undefined {
  const [first, ...rest] = values;
  return rest.every((v) => v === first) ? first : undefined;
}

type Timeline = readonly { step: number; start: number; end: number }[];

/**
 * Where the fold slider should be once the steps have changed, so the view
 * stays at the same moment of the same step. The slider is one 0–1 timeline
 * shared by every step; adding or removing a step re-divides it, and the same
 * number would land somewhere else (the end of step 4 in the middle of it).
 * Flat and closed stay put; past the last step, the share of what is left
 * stays the same. A step that is gone keeps the place where it ended.
 */
export function keepFoldPlace(progress: number, before: Timeline, after: Timeline): number {
  if (progress <= 0 || progress >= 1) return progress;
  const lastBefore = before[before.length - 1]?.end ?? 0;
  const lastAfter = after[after.length - 1]?.end ?? 0;
  // Past the authored steps: the same share of the automatic part.
  if (progress > lastBefore + 1e-9) {
    const share = lastBefore >= 1 ? 0 : (progress - lastBefore) / (1 - lastBefore);
    return lastAfter + share * (1 - lastAfter);
  }
  // The step this moment is in; its own end counts as in it.
  const k = before.findIndex((s) => progress <= s.end + 1e-9);
  const here = before[k];
  if (!here) return progress;
  const span = here.end - here.start;
  const share = span > 0 ? (progress - here.start) / span : 1;
  const same = after.find((s) => s.step === here.step);
  if (same) return same.start + share * (same.end - same.start);
  // The step was removed: where the step before it ends, or flat.
  const earlier = [...before.slice(0, k)].reverse().find((s) => after.some((a) => a.step === s.step));
  return earlier ? after.find((a) => a.step === earlier.step)!.end : 0;
}
