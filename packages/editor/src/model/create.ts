import { allNodes, emptyDocument, newId, offsetExpr, render, uniqueName, type DielineDocument, type Expr, type LineType, type ShapeKind, type ShapeNode } from "@repo/dieline-engine";

/** Shapes the place tool draws. A triangle is a three-sided polygon sized by its side. */
export type PlaceableKind = Exclude<ShapeKind, "path"> | "triangle";

export const SHAPE_LABELS: Record<ShapeKind | "triangle", string> = {
  triangle: "Triangle",
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
 * A new shape is positioned by its centre. It still lands where it was drawn:
 * `at` is the point it was drawn from, so its position moves by that point's
 * distance from the centre, found by rendering the shape on its own.
 */
function centred(node: ShapeNode): ShapeNode {
  const t = node.transform;
  if (!t || node.kind === "line" || node.kind === "path") return node;
  // A shape linked to a point keeps that link: a centre would need today's size frozen in.
  if (`${t.x}${t.y}`.includes("@")) return node;
  const alone = render({ ...emptyDocument(), nodes: [{ ...node, transform: undefined }] }, { width: 1, length: 1, height: 1, thickness: 1 });
  const b = alone.nodes[node.id]?.bounds;
  if (!b) return node;
  const x = offsetExpr(t.x ?? "0", (b.minX + b.maxX) / 2);
  const y = offsetExpr(t.y ?? "0", (b.minY + b.maxY) / 2);
  return { ...node, transform: { ...t, x, y, origin: "center" } };
}

/**
 * A new shape of `kind` with sensible defaults, drawn from `at`.
 * `size` (world mm) comes from a drag; without it the shape gets a default size.
 */
export function createShape(doc: DielineDocument, kind: PlaceableKind, at: { x: Expr; y: Expr }, size?: { w: number; h: number }, lineType: LineType = "cut", end?: { x: Expr; y: Expr }): ShapeNode {
  return centred(drawnShape(doc, kind, at, size, lineType, end));
}

function drawnShape(
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
    case "triangle":
      // Dragged from the centre: the drag reaches a corner, and the side of an
      // equilateral triangle is √3 times that radius.
      return { ...base, kind: "polygon", sides: "3", sizeBy: "side", radius: n(size ? (Math.max(w, h) / 2) * Math.sqrt(3) : 40) };
    case "star":
      return { ...base, kind, points: "5", radius: n(size ? Math.max(w, h) / 2 : 20) };
    case "belt":
      return { ...base, kind, radius1: "8", radius2: "8", distance: n(size ? Math.max(w, 20) : 30) };
  }
}
