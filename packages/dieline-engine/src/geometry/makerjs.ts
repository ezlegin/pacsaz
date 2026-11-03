import M from "makerjs";
import { norm } from "./math";
import type { Path, Prim, Pt } from "./types";

/**
 * The bridge to makerjs. The engine keeps its own flat primitives and only
 * crosses over for operations makerjs does well: booleans, outlines and DXF.
 */

export function toMaker(prims: readonly Prim[]): M.IModel {
  const paths: M.IPathMap = {};

  prims.forEach((p, i) => {
    switch (p.kind) {
      case "line":
        paths[`p${i}`] = new M.paths.Line([...p.a], [...p.b]);
        break;
      case "arc":
        paths[`p${i}`] = new M.paths.Arc([...p.c], p.r, p.start, p.end);
        break;
      case "circle":
        paths[`p${i}`] = new M.paths.Circle([...p.c], p.r);
        break;
    }
  });

  return { paths };
}

/** Flattens a makerjs model (nested models, origins) back into primitives. */
export function fromMaker(model: M.IModel): Prim[] {
  const out: Prim[] = [];

  M.model.walk(model, {
    onPath: (walked) => {
      const offset = walked.offset ?? [0, 0];
      const shift = (p: M.IPoint): Pt => [p[0]! + offset[0]!, p[1]! + offset[1]!];
      const path = walked.pathContext;

      switch (path.type) {
        case M.pathType.Line: {
          const line = path as M.IPathLine;
          out.push({ kind: "line", a: shift(line.origin), b: shift(line.end) });
          break;
        }
        case M.pathType.Arc: {
          const arc = path as M.IPathArc;
          out.push({
            kind: "arc",
            c: shift(arc.origin),
            r: arc.radius,
            start: norm(arc.startAngle),
            end: norm(arc.endAngle),
          });
          break;
        }
        case M.pathType.Circle: {
          const circle = path as M.IPathCircle;
          out.push({ kind: "circle", c: shift(circle.origin), r: circle.radius });
          break;
        }
      }
    },
  });

  return out;
}

export type BooleanOp = "union" | "subtract" | "intersect";

/**
 * Folds a boolean over operands left to right: `a − b − c` for subtract. Each
 * operand should be one closed outline; open geometry passes through makerjs
 * unchanged, which is the least surprising result.
 */
export function booleanOf(operands: Prim[][], op: BooleanOp): Prim[] {
  const [first, ...rest] = operands;
  if (!first) return [];

  const combine =
    op === "union"
      ? M.model.combineUnion
      : op === "intersect"
        ? M.model.combineIntersection
        : M.model.combineSubtraction;

  let acc: M.IModel = toMaker(first);
  for (const operand of rest) {
    acc = combine(acc, toMaker(operand));
  }

  return fromMaker(acc);
}

/**
 * Offsets closed outlines. Positive grows, negative shrinks. Rounded joints keep
 * the result smooth, which is what a bleed or a clearance needs.
 */
export function offsetOf(prims: Prim[], distance: number): Prim[] {
  if (Math.abs(distance) < 1e-9) return prims;

  const model = toMaker(prims);
  const outline = M.model.outline(model, Math.abs(distance), 1, distance < 0);
  return fromMaker(outline);
}

export function tagPrims(
  prims: Prim[],
  tag: Pick<Path, "lineType" | "nodeId">,
): Path[] {
  return prims.map((p) => ({ ...p, ...tag }));
}
