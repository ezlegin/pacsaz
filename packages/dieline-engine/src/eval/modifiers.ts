import { chainLines, filletPolyline, fullRadii } from "../geometry/fillet";
import { booleanOf, offsetOf, tagPrims } from "../geometry/makerjs";
import { endpoints, distance, placePaths, IDENTITY } from "../geometry/math";
import type { Path, Prim, Pt } from "../geometry/types";
import { LIMITS } from "../spec/schema";
import type { Combine, Modifier } from "../spec/types";
import type { Evaluate } from "../geometry/shapes";
import { GeometryError } from "../geometry/shapes";

/** Applies a node's modifiers, in order, to its local geometry. */
export function applyModifiers(
  paths: Path[],
  modifiers: readonly Modifier[] | undefined,
  ev: Evaluate,
): Path[] {
  let out = paths;

  modifiers?.forEach((mod, i) => {
    if (mod.disabled) return;
    const field = `modifiers.${i}`;

    switch (mod.type) {
      case "round": {
        const radius = ev.num(mod.radius, `${field}.radius`);
        const only = mod.corners ? new Set(mod.corners) : null;
        out = roundCorners(out, (index) => (!only || only.has(index) ? radius : 0));
        break;
      }

      case "roundFull":
        out = roundCorners(out, null);
        break;

      case "array": {
        const count = Math.round(ev.num(mod.count, `${field}.count`));
        if (count < 1 || count > LIMITS.arrayCount) {
          throw new GeometryError(`Count must be between 1 and ${LIMITS.arrayCount}`, `${field}.count`);
        }
        const dx = ev.num(mod.dx, `${field}.dx`);
        const dy = ev.num(mod.dy, `${field}.dy`);
        const original = out;
        out = [];
        for (let k = 0; k < count; k++) {
          out.push(...placePaths(original, { ...IDENTITY, x: dx * k, y: dy * k }));
        }
        break;
      }

      case "mirrorCopy": {
        const at = ev.num(mod.at, `${field}.at`);
        // Mirroring about the line x = at is a flip about x = 0 then a 2·at shift.
        const placement =
          mod.axis === "x"
            ? { ...IDENTITY, mirrorX: true, x: 2 * at }
            : { ...IDENTITY, mirrorY: true, y: 2 * at };
        out = [...out, ...placePaths(out, placement)];
        break;
      }

      case "copy": {
        out = [
          ...out,
          ...placePaths(out, {
            x: ev.num(mod.dx, `${field}.dx`),
            y: ev.num(mod.dy, `${field}.dy`),
            rotate: ev.opt(mod.rotate, `${field}.rotate`, 0),
            mirrorX: !!mod.mirrorX,
            mirrorY: !!mod.mirrorY,
          }),
        ];
        break;
      }

      case "offset": {
        const distanceValue = ev.num(mod.distance, `${field}.distance`);
        out = byTag(out).flatMap(({ prims, tag }) => tagPrims(offsetOf(prims, distanceValue), tag));
        break;
      }
    }
  });

  return out;
}

/**
 * Rounds the corners of every straight chain. Corners are numbered across the
 * chains in order, which is the numbering the editor shows. `radiusAt` null means
 * "the largest radius each corner allows".
 */
function roundCorners(paths: Path[], radiusAt: ((index: number) => number) | null): Path[] {
  const { chains, rest } = chainLines(paths);
  const out: Path[] = [...rest];
  let offset = 0;

  for (const chain of chains) {
    const base = offset;
    const full = radiusAt ? null : fullRadii(chain.points, chain.closed);
    const prims = filletPolyline(chain.points, chain.closed, (i) =>
      full ? full[i]! : radiusAt!(base + i),
    );
    out.push(...tagPrims(prims, chain.template));
    offset += chain.points.length;
  }

  return out;
}

/** Groups paths by line type and node so operations can keep their tags. */
function byTag(paths: Path[]): { prims: Prim[]; tag: Pick<Path, "lineType" | "nodeId"> }[] {
  const groups = new Map<string, { prims: Prim[]; tag: Pick<Path, "lineType" | "nodeId"> }>();
  for (const p of paths) {
    const key = `${p.nodeId}\u0000${p.lineType}`;
    let group = groups.get(key);
    if (!group) {
      group = { prims: [], tag: { lineType: p.lineType, nodeId: p.nodeId } };
      groups.set(key, group);
    }
    group.prims.push(p);
  }
  return [...groups.values()];
}

//! Combine ----------------------------------------------------------------------

/**
 * Merges a group's children before its modifiers run. Booleans need closed
 * outlines of one line type; the result takes the first child's line type and the
 * group's id, since it no longer belongs to any single child.
 */
export function combineChildren(
  operands: Path[][],
  combine: Combine,
  groupId: string,
): Path[] {
  const nonEmpty = operands.filter((o) => o.length > 0);
  if (nonEmpty.length < 2) return nonEmpty.flat();

  const lineType = nonEmpty[0]![0]!.lineType;

  if (combine.op === "join") {
    if (nonEmpty.length !== 2) {
      throw new GeometryError("Join needs exactly two visible children", "combine");
    }
    const a = openEnds(nonEmpty[0]!);
    const b = openEnds(nonEmpty[1]!);
    if (!a || !b) {
      throw new GeometryError("Join needs two open lines or paths", "combine");
    }

    // Connect the closest pair of ends.
    let best: [Pt, Pt] = [a[0], b[0]];
    for (const p of a) {
      for (const q of b) {
        if (distance(p, q) < distance(best[0], best[1])) best = [p, q];
      }
    }

    const joined = nonEmpty.flat();
    if (distance(best[0], best[1]) > 1e-6) {
      joined.push({ kind: "line", a: best[0], b: best[1], lineType, nodeId: groupId });
    }
    return joined;
  }

  const result = booleanOf(nonEmpty, combine.op);
  return tagPrims(result, { lineType, nodeId: groupId });
}

/** The two loose ends of a single open chain (or a lone arc). */
function openEnds(paths: Path[]): [Pt, Pt] | null {
  if (paths.length === 1 && paths[0]!.kind === "arc") {
    return endpoints(paths[0]!);
  }

  const { chains } = chainLines(paths);
  const open = chains.find((c) => !c.closed);
  if (!open || open.points.length < 2) return null;
  return [open.points[0]!, open.points[open.points.length - 1]!];
}
