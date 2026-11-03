import {
  allNodes,
  formatNumber,
  newId,
  refExpr,
  uniqueName,
  type DielineDocument,
  type Expr,
  type LineType,
  type PathNode,
  type Pt,
  type RenderResult,
  type ShapeNode,
} from "@repo/dieline-engine";
import { createShape, type PlaceableKind } from "./create";
import { axisAligned, chainOffset, fullChain, worldToLocalPoint } from "./frames";
import type { SnapTarget } from "./snap";

/** A drawn point: where it is, and the anchor it snapped onto, if any. */
export type DrawPoint = { p: Pt; target?: SnapTarget };

/**
 * Turns drawn points into expressions in the frame the new node lives in (the
 * root, or the entered group). A point that snapped onto an anchor becomes a
 * reference, so freshly drawn geometry is already linked to the shapes it was
 * drawn from. Inside a moved or rotated group references would be in the wrong
 * frame, so plain numbers are written there.
 */
export function drawFrame(result: RenderResult, scope: string | null) {
  const chain = scope ? fullChain(result, scope) : [];
  const offset = chainOffset(chain);
  const linkable = axisAligned(chain);

  return (point: DrawPoint, axis: "x" | "y"): Expr => {
    const i = axis === "x" ? 0 : 1;
    if (point.target && linkable && offset[i] === 0) {
      return refExpr(point.target.nodeName, point.target.anchor, axis);
    }
    return formatNumber(worldToLocalPoint(point.p, chain)[i]);
  };
}

/** The shape a press-drag-release with the place tool creates. */
export function placedShape(
  doc: DielineDocument,
  result: RenderResult,
  scope: string | null,
  kind: PlaceableKind,
  start: DrawPoint,
  end: DrawPoint | null,
  lineType: LineType,
): ShapeNode {
  const expr = drawFrame(result, scope);
  const dx = end ? end.p[0] - start.p[0] : 0;
  const dy = end ? end.p[1] - start.p[1] : 0;

  switch (kind) {
    case "rect": {
      // Corner to corner: the origin is the lower-left of the two points, and
      // each axis takes its expression from whichever point supplied it.
      const xFrom = !end || dx >= 0 ? start : end;
      const yFrom = !end || dy >= 0 ? start : end;
      return createShape(doc, kind, { x: expr(xFrom, "x"), y: expr(yFrom, "y") }, end ? { w: dx, h: dy } : undefined, lineType);
    }
    case "line":
      return createShape(
        doc,
        kind,
        { x: expr(start, "x"), y: expr(start, "y") },
        end ? { w: dx, h: dy } : undefined,
        lineType,
        end ? { x: expr(end, "x"), y: expr(end, "y") } : undefined,
      );
    case "ellipse":
      // Centre out: the drag gives the radii.
      return createShape(doc, kind, { x: expr(start, "x"), y: expr(start, "y") }, end ? { w: 2 * Math.abs(dx), h: 2 * Math.abs(dy) } : undefined, lineType);
    case "belt":
      return createShape(doc, kind, { x: expr(start, "x"), y: expr(start, "y") }, end ? { w: Math.abs(dx), h: 0 } : undefined, lineType);
    default: {
      const r = Math.hypot(dx, dy);
      return createShape(doc, kind, { x: expr(start, "x"), y: expr(start, "y") }, end ? { w: 2 * r, h: 2 * r } : undefined, lineType);
    }
  }
}

/** The path the pen tool draws through `points`. */
export function drawnPath(
  doc: DielineDocument,
  result: RenderResult,
  scope: string | null,
  points: DrawPoint[],
  closed: boolean,
  lineType: LineType,
): PathNode {
  const expr = drawFrame(result, scope);
  const [first, ...rest] = points;
  return {
    id: newId(),
    name: uniqueName(allNodes(doc).map((n) => n.name), "path"),
    kind: "path",
    lineType,
    closed,
    start: { x: expr(first!, "x"), y: expr(first!, "y") },
    segments: rest.map((p) => ({ type: "to", x: expr(p, "x"), y: expr(p, "y") })),
  };
}

/** Holding Shift with the pen keeps the new segment at a multiple of 45°. */
export function constrain45(from: Pt, to: Pt): Pt {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy);
  const angle = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4);
  return [from[0] + Math.round(Math.cos(angle) * length * 1e6) / 1e6, from[1] + Math.round(Math.sin(angle) * length * 1e6) / 1e6];
}
