import { allNodes, newId, offsetExpr, uniqueName, type DielineDocument, type Expr, type LineType, type ShapeKind, type ShapeNode } from "@repo/dieline-engine";

export type PlaceableKind = Exclude<ShapeKind, "path">;

export const SHAPE_LABELS: Record<ShapeKind, string> = {
  rect: "Rectangle",
  line: "Line",
  path: "Path",
  ellipse: "Ellipse",
  arc: "Arc",
  polygon: "Polygon",
  star: "Star",
  belt: "Belt",
};

/**
 * A new shape of `kind` with sensible defaults, placed with its origin at `at`.
 * `size` (world mm) comes from a drag; without it the shape gets a default size.
 */
export function createShape(
  doc: DielineDocument,
  kind: PlaceableKind,
  at: { x: Expr; y: Expr },
  size?: { w: number; h: number },
  lineType: LineType = "cut",
  /** A line's far end, when it was placed (and perhaps snapped) explicitly. */
  end?: { x: Expr; y: Expr },
): ShapeNode {
  const name = uniqueName(allNodes(doc).map((n) => n.name), kind);
  const base = { id: newId(), name, lineType, transform: { x: at.x, y: at.y } };
  const n = (v: number) => String(Math.round(v * 100) / 100);
  const w = size ? Math.max(Math.abs(size.w), 1) : 40;
  const h = size ? Math.max(Math.abs(size.h), 1) : 30;

  switch (kind) {
    case "rect":
      return { ...base, kind, width: n(w), height: n(h) };
    case "line":
      // A line keeps both ends absolute so either can link to another shape.
      return {
        id: base.id,
        name,
        lineType,
        kind,
        from: { x: at.x, y: at.y },
        to: end ?? { x: offsetExpr(at.x, size ? size.w : 40), y: offsetExpr(at.y, size ? size.h : 0) },
      };
    case "ellipse":
      return { ...base, kind, rx: n(size ? w / 2 : 20), ry: n(size ? h / 2 : 20) };
    case "arc":
      return { ...base, kind, radius: n(size ? Math.max(w, h) / 2 : 20), start: "0", end: "180" };
    case "polygon":
      return { ...base, kind, sides: "6", radius: n(size ? Math.max(w, h) / 2 : 20) };
    case "star":
      return { ...base, kind, points: "5", radius: n(size ? Math.max(w, h) / 2 : 20) };
    case "belt":
      return { ...base, kind, radius1: "8", radius2: "8", distance: n(size ? Math.max(w, 20) : 30) };
  }
}
