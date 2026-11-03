import { ExprError } from "../expr/expr";
import type { Pt } from "../geometry/types";

/**
 * Looks up a reference path on a node. Point names may themselves contain dots
 * (a box body names its panels' corners `front.topLeft`), so the path is read as
 * "everything up to a trailing x/y is the point name":
 *
 *   @lid.width               → scalar `width`
 *   @lid.topRight.x          → point `topRight`, x
 *   @body.front.topLeft.y    → point `front.topLeft`, y
 *   @body.front.width        → scalar `front.width`
 */
export function lookupRef(
  info: { anchors: Record<string, Pt>; scalars: Record<string, number> },
  node: string,
  path: string[],
): number {
  if (path.length === 0) throw new ExprError(`Write @${node}.width or @${node}.anchor.x`);

  const last = path[path.length - 1]!;
  if ((last === "x" || last === "y") && path.length >= 2) {
    const key = path.slice(0, -1).join(".");
    const point = info.anchors[key];
    if (!point) throw new ExprError(`"${node}" has no point "${key}"`);
    return last === "x" ? point[0] : point[1];
  }

  const key = path.join(".");
  const scalar = info.scalars[key];
  if (scalar !== undefined) return scalar;
  if (info.anchors[key]) throw new ExprError(`@${node}.${key} is a point; add .x or .y`);
  throw new ExprError(`"${node}" has no "${key}"`);
}
