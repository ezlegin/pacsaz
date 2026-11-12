import type { FoldRig, RigNode } from "./types";

/**
 * Authored fold configuration.
 *
 * A flat dieline does not record which way a crease bends, so direction is
 * *inferred* from geometry — which is right for simple strips and wrong for real
 * cartons, where dust flaps and glue tabs fold in while other creases fold out.
 * This is where a person says so once, per template.
 *
 * ## Why overrides are keyed by face index
 *
 * A face needs an identity that survives changes. Absolute coordinates are out:
 * dielines are parametric, so changing a dimension moves every panel. Normalising
 * by the pattern's bounding box does not help either, because panels scale with
 * the dimension while flaps often keep a fixed size, so the two drift apart.
 *
 * What *is* stable is the order the planar trace produces faces in: it depends on
 * the order the generator emits geometry, which is fixed by the specification and
 * independent of dimensions. So the index is the key, and `vertexCount` +
 * `faceCount` are stored alongside purely to *detect* when a template has changed
 * shape, so the editor can say "review these folds" instead of silently applying
 * them to the wrong panel.
 */

export type FoldDirection = "in" | "out";

export type FoldOverride = {
  /** Index into `FoldRig.nodes`. */
  faceIndex: number;
  direction: FoldDirection;
  /** Fold angle in degrees, 0–180. */
  angle: number;
  /** Outline vertex count when authored, for drift detection. */
  vertexCount?: number;
  /**
   * When it folds, counted from the flat sheet: every panel of step 1 folds
   * together first, then step 2, and so on. Panels without a step keep the
   * inferred order, after the authored steps (see `foldSchedule`).
   */
  step?: number;
};

export type FoldConfig = {
  version: 1;
  /** Face count when authored, for drift detection. */
  faceCount: number;
  /** Index of the panel that stays still, when the largest is not the right one. */
  rootFace?: number;
  /** "base" lays the still panel on the ground; "end" (default) stands it up. */
  rest?: "end" | "base";
  overrides: FoldOverride[];
  /** Where each separate piece stands, by its still panel's face (see `placePieces`). */
  pieces?: PiecePlacement[];
};

/** Millimetres with Y up, and degrees about the piece's centre, applied X, Y, then Z. */
export type PiecePlacement = { face: number; x: number; y: number; z: number; rx: number; ry: number; rz: number };

const finite = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);

/** Creases close to 90°; a card folds to 180°. */
export const DEFAULT_FOLD_ANGLE = 90;
export const MIN_FOLD_ANGLE = 0;
export const MAX_FOLD_ANGLE = 180;

export const emptyFoldConfig = (): FoldConfig => ({
  version: 1,
  faceCount: 0,
  overrides: [],
});

/** Tolerant parse: malformed stored JSON must never break the viewer. */
export const parseFoldConfig = (
  raw: string | null | undefined,
): FoldConfig | null => {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<FoldConfig> | null;
    if (!parsed || !Array.isArray(parsed.overrides)) return null;

    const overrides: FoldOverride[] = [];

    for (const item of parsed.overrides) {
      if (!item || typeof item.faceIndex !== "number") continue;
      if (item.direction !== "in" && item.direction !== "out") continue;

      overrides.push({
        faceIndex: item.faceIndex,
        direction: item.direction,
        angle: clampFoldAngle(
          typeof item.angle === "number" ? item.angle : DEFAULT_FOLD_ANGLE,
        ),
        vertexCount:
          typeof item.vertexCount === "number" ? item.vertexCount : undefined,
        ...(typeof item.step === "number" && Number.isInteger(item.step) && item.step > 0 ? { step: item.step } : {}),
      });
    }

    return {
      version: 1,
      faceCount:
        typeof parsed.faceCount === "number" ? parsed.faceCount : 0,
      ...(typeof parsed.rootFace === "number" ? { rootFace: parsed.rootFace } : {}),
      ...(parsed.rest === "base" || parsed.rest === "end" ? { rest: parsed.rest } : {}),
      overrides,
      ...(Array.isArray(parsed.pieces)
        ? {
            pieces: parsed.pieces
              .filter((p): p is PiecePlacement => !!p && typeof p.face === "number")
              .map((p) => ({ face: p.face, x: finite(p.x), y: finite(p.y), z: finite(p.z), rx: finite(p.rx), ry: finite(p.ry), rz: finite(p.rz) })),
          }
        : {}),
    };
  } catch {
    return null;
  }
};

export const clampFoldAngle = (degrees: number): number => {
  if (!Number.isFinite(degrees)) return DEFAULT_FOLD_ANGLE;
  return Math.min(MAX_FOLD_ANGLE, Math.max(MIN_FOLD_ANGLE, degrees));
};

export const degreesToRadians = (degrees: number): number =>
  (clampFoldAngle(degrees) * Math.PI) / 180;

export const radiansToDegrees = (radians: number): number =>
  (radians * 180) / Math.PI;

/**
 * Applies authored overrides to inferred nodes.
 *
 * Direction is defined against the flat pattern: `in` folds a panel toward the
 * viewer (+Z, the printed side closing on itself) and `out` folds it away. The
 * inference already aims every child at +Z, so `in` keeps the derived sign and
 * `out` flips it. The root panel never rotates and is left alone.
 *
 * Overrides whose index is out of range, or whose `vertexCount` no longer matches
 * the face, are skipped rather than applied to a different panel.
 */
export const applyFoldOverrides = (
  nodes: RigNode[],
  config: FoldConfig | null | undefined,
): RigNode[] => {
  if (!config || config.overrides.length === 0) return nodes;

  const byIndex = new Map<number, FoldOverride>();
  for (const override of config.overrides) byIndex.set(override.faceIndex, override);

  return nodes.map((node, index) => {
    const override = byIndex.get(index);
    if (!override) return node;

    // The root is the anchor; rotating it would move the whole model.
    if (node.parent === null) return node;

    // A changed vertex count means the template is not the one that was authored.
    if (
      typeof override.vertexCount === "number" &&
      override.vertexCount !== node.face.outline.length
    ) {
      return node;
    }

    const sign: 1 | -1 = override.direction === "out" ? (-node.sign as 1 | -1) : node.sign;

    return {
      ...node,
      sign,
      valley: override.direction === "in",
      angle: degreesToRadians(override.angle),
      authored: true,
      ...(override.step === undefined ? {} : { step: override.step }),
    };
  });
};

/**
 * Compares a stored config with a rebuilt rig so the editor can warn instead of
 * silently misapplying folds.
 */
export const foldConfigStatus = (
  rig: FoldRig,
  config: FoldConfig | null | undefined,
): {
  configured: number;
  /** Overrides pointing at a face that no longer matches. */
  stale: number;
  /** Faces with no override at all — still running on the inferred direction. */
  inferred: number;
  /** True when the template's panel count changed since the config was saved. */
  faceCountChanged: boolean;
} => {
  const overrides = config?.overrides ?? [];
  const byIndex = new Map<number, FoldOverride>();
  for (const override of overrides) byIndex.set(override.faceIndex, override);

  let configured = 0;
  let stale = 0;
  let panels = 0;

  rig.nodes.forEach((node, index) => {
    // Windows are cut-outs, not panels, so they are never configured.
    if (node.isHole) return;
    panels++;

    const override = byIndex.get(index);
    if (!override) return;

    const matches =
      typeof override.vertexCount !== "number" ||
      override.vertexCount === node.face.outline.length;

    if (matches) configured++;
    else stale++;
  });

  const faceCount = panels;

  return {
    configured,
    stale,
    inferred: Math.max(0, faceCount - configured),
    faceCountChanged:
      Boolean(config) && config!.faceCount > 0 && config!.faceCount !== faceCount,
  };
};
