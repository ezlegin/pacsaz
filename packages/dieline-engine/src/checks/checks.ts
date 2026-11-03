import type { RenderResult } from "../eval/render";
import { distance, endpoints, polar, primLength, sweep } from "../geometry/math";
import type { Path, Pt } from "../geometry/types";
import type { LineType } from "../spec/types";

/**
 * Design checks: the mistakes that waste a cutting die or a production run,
 * found on the rendered geometry so they cover hand-drawn shapes, bodies and
 * components alike.
 */

export type IssueCode = "gap" | "openCut" | "doubleKnife" | "crossing" | "danglingFold" | "tinySegment";

export type Issue = {
  code: IssueCode;
  severity: "error" | "warning";
  message: string;
  /** Where to look, in world coordinates. */
  at: Pt;
  /** Nodes whose geometry is involved. */
  nodeIds: string[];
};

export type CheckOptions = {
  /** Points closer than this are the same point (mm). */
  tolerance?: number;
  /** Ends closer than this but not joined are a gap rather than a slit (mm). */
  gapDistance?: number;
  /** Segments shorter than this are suspicious (mm). */
  minSegment?: number;
};

/** Lines that become steel in the die. Glue areas and guides are drawn, not cut. */
const TOOLING = new Set<LineType>(["cut", "crease", "reverseCrease", "perf", "cutCrease", "halfCut"]);
const FOLDS = new Set<LineType>(["crease", "reverseCrease", "cutCrease"]);
const MAX_ISSUES = 200;

type Seg = { a: Pt; b: Pt; path: Path; index: number };

/** Arcs and circles as short chords, so every test can work on straight lines. */
function segmentsOf(paths: Path[]): Seg[] {
  const out: Seg[] = [];
  paths.forEach((path, index) => {
    if (path.kind === "line") {
      out.push({ a: path.a, b: path.b, path, index });
      return;
    }
    const start = path.kind === "arc" ? path.start : 0;
    const total = path.kind === "arc" ? sweep(path.start, path.end) : 360;
    const steps = Math.max(2, Math.ceil(total / 5));
    let prev = polar(start, path.r, path.c);
    for (let i = 1; i <= steps; i++) {
      const next = polar(start + (total * i) / steps, path.r, path.c);
      out.push({ a: prev, b: next, path, index });
      prev = next;
    }
  });
  return out;
}

const keyOf = (p: Pt, tol: number) => `${Math.round(p[0] / tol)},${Math.round(p[1] / tol)}`;

/** Distance from `p` to the segment a–b, and where along it (0…1) the foot lies. */
function toSegment(p: Pt, a: Pt, b: Pt): { d: number; t: number } {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2));
  return { d: Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy)), t };
}

function boxesTouch(s: Seg, o: Seg, pad: number): boolean {
  return (
    Math.min(s.a[0], s.b[0]) - pad <= Math.max(o.a[0], o.b[0]) &&
    Math.min(o.a[0], o.b[0]) - pad <= Math.max(s.a[0], s.b[0]) &&
    Math.min(s.a[1], s.b[1]) - pad <= Math.max(o.a[1], o.b[1]) &&
    Math.min(o.a[1], o.b[1]) - pad <= Math.max(s.a[1], s.b[1])
  );
}

export function checkDieline(result: RenderResult, options: CheckOptions = {}): Issue[] {
  const tol = options.tolerance ?? 0.01;
  const gapDistance = options.gapDistance ?? 1;
  const minSegment = options.minSegment ?? 0.2;

  const tooling = result.paths.filter((p) => TOOLING.has(p.lineType));
  const cuts = tooling.filter((p) => p.lineType === "cut");
  const segs = segmentsOf(tooling);
  const issues: Issue[] = [];
  const push = (issue: Issue) => {
    if (issues.length < MAX_ISSUES) issues.push(issue);
  };

  //! Open ends and gaps in the cut ---------------------------------------------
  // Every cut end should meet another cut end; a lone end is a slit at best and
  // an unclosed outline at worst. Two lone ends close together are a gap.
  const ends = new Map<string, { p: Pt; nodes: Set<string>; count: number }>();
  for (const c of cuts) {
    const e = endpoints(c);
    if (!e) continue;
    for (const p of e) {
      const k = keyOf(p, tol * 10);
      const entry = ends.get(k) ?? { p, nodes: new Set<string>(), count: 0 };
      entry.count++;
      entry.nodes.add(c.nodeId);
      ends.set(k, entry);
    }
  }

  // Three cuts meeting is a T (a slit leaving an outline), not an open end; and
  // a slit that runs on as a fold, like the friction lock at a tuck, ends where
  // the fold begins.
  const foldEnds = tooling.filter((p) => FOLDS.has(p.lineType)).flatMap((f) => endpoints(f) ?? []);
  // An end landing part way along another cut is a T too (a flap standing on a
  // panel's edge).
  const cutSegs = segs.filter((s) => s.path.lineType === "cut");
  const onCut = (p: Pt) => cutSegs.some((s) => {
    const { d, t } = toSegment(p, s.a, s.b);
    return d <= tol * 5 && t > 1e-6 && t < 1 - 1e-6;
  });
  const atFold = (p: Pt) => foldEnds.some((f) => distance(f, p) <= tol * 5);
  // A friction lock's hook: a short cut (at most 3 mm) ending in the board,
  // with a fold beginning on it.
  const isHook = (p: Pt) =>
    cutSegs.some((s) => {
      const ends = distance(s.a, p) <= tol * 5 || distance(s.b, p) <= tol * 5;
      return ends && distance(s.a, s.b) <= 3 && foldEnds.some((f) => toSegment(f, s.a, s.b).d <= tol * 5);
    });
  const loose = [...ends.values()].filter((e) => e.count === 1 && !atFold(e.p) && !onCut(e.p) && !isHook(e.p));
  const paired = new Set<number>();
  loose.forEach((e, i) => {
    if (paired.has(i)) return;
    let best = -1;
    let bestD = Infinity;
    loose.forEach((o, j) => {
      if (j === i || paired.has(j)) return;
      const d = distance(e.p, o.p);
      if (d < bestD) {
        bestD = d;
        best = j;
      }
    });
    if (best >= 0 && bestD <= gapDistance) {
      paired.add(i);
      paired.add(best);
      const o = loose[best]!;
      push({
        code: "gap",
        severity: "error",
        message: `Cut lines almost meet but leave a ${bestD.toFixed(2)} mm gap`,
        at: [(e.p[0] + o.p[0]) / 2, (e.p[1] + o.p[1]) / 2],
        nodeIds: [...new Set([...e.nodes, ...o.nodes])],
      });
    }
  });
  loose.forEach((e, i) => {
    if (paired.has(i)) return;
    push({
      code: "openCut",
      severity: "warning",
      message: "A cut line ends in the board. Fine for a slit; otherwise the outline is open here",
      at: e.p,
      nodeIds: [...e.nodes],
    });
  });

  //! Double knives and crossings --------------------------------------------------
  const reported = new Set<string>();
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i]!;
    for (let j = i + 1; j < segs.length; j++) {
      const o = segs[j]!;
      if (o.index === s.index) continue;
      if (!boxesTouch(s, o, tol)) continue;

      const dx1 = s.b[0] - s.a[0];
      const dy1 = s.b[1] - s.a[1];
      const dx2 = o.b[0] - o.a[0];
      const dy2 = o.b[1] - o.a[1];
      const len1 = Math.hypot(dx1, dy1);
      const len2 = Math.hypot(dx2, dy2);
      if (len1 < tol || len2 < tol) continue;
      const cross = dx1 * dy2 - dy1 * dx2;

      // Parallel: if both ends of one lie on the other's line, measure the overlap.
      if (Math.abs(cross) / (len1 * len2) < 1e-6) {
        const ux = dx1 / len1;
        const uy = dy1 / len1;
        const offLine = (p: Pt) => Math.abs((p[0] - s.a[0]) * uy - (p[1] - s.a[1]) * ux);
        if (offLine(o.a) > tol || offLine(o.b) > tol) continue;
        const proj = (p: Pt) => (p[0] - s.a[0]) * ux + (p[1] - s.a[1]) * uy;
        const lo = Math.max(0, Math.min(proj(o.a), proj(o.b)));
        const hi = Math.min(len1, Math.max(proj(o.a), proj(o.b)));
        if (hi - lo <= 0.1) continue;

        const key = `dk:${[s.index, o.index].sort().join("-")}`;
        if (reported.has(key)) continue;
        reported.add(key);
        const mid = (lo + hi) / 2;
        const both = s.path.lineType === o.path.lineType;
        push({
          code: "doubleKnife",
          severity: "error",
          message: both
            ? `Two ${s.path.lineType} lines lie on top of each other (${(hi - lo).toFixed(1)} mm): a double knife`
            : `A ${s.path.lineType} and a ${o.path.lineType} line overlap (${(hi - lo).toFixed(1)} mm)`,
          at: [s.a[0] + ux * mid, s.a[1] + uy * mid],
          nodeIds: [...new Set([s.path.nodeId, o.path.nodeId])],
        });
        continue;
      }

      // Proper crossing: strictly inside both segments. Lines that merely meet
      // at an end (corners, T-joints) are how dielines are built.
      const t = ((o.a[0] - s.a[0]) * dy2 - (o.a[1] - s.a[1]) * dx2) / cross;
      const u = ((o.a[0] - s.a[0]) * dy1 - (o.a[1] - s.a[1]) * dx1) / cross;
      const et = tol / len1;
      const eu = tol / len2;
      if (t <= et || t >= 1 - et || u <= eu || u >= 1 - eu) continue;
      // Folds meeting folds cross on purpose (corner of a lid and a tuck fold).
      if (FOLDS.has(s.path.lineType) && FOLDS.has(o.path.lineType)) continue;

      const at: Pt = [s.a[0] + t * dx1, s.a[1] + t * dy1];
      const key = `x:${keyOf(at, 1)}`;
      if (reported.has(key)) continue;
      reported.add(key);
      push({
        code: "crossing",
        severity: "error",
        message:
          s.path.nodeId === o.path.nodeId
            ? "Lines of this shape cross each other"
            : "Lines of two shapes cross: they probably overlap on the sheet",
        at,
        nodeIds: [...new Set([s.path.nodeId, o.path.nodeId])],
      });
    }
  }

  //! Folds that stop in the middle of nowhere -------------------------------------
  for (const f of tooling.filter((p) => FOLDS.has(p.lineType))) {
    const e = endpoints(f);
    if (!e) continue;
    for (const p of e) {
      const touches = segs.some((s) => s.path !== f && toSegment(p, s.a, s.b).d <= tol * 5);
      if (!touches) {
        push({
          code: "danglingFold",
          severity: "warning",
          message: "A fold line stops without reaching another line, so the board will not fold cleanly",
          at: p,
          nodeIds: [f.nodeId],
        });
      }
    }
  }

  //! Tiny segments ---------------------------------------------------------------
  for (const p of tooling) {
    if (p.kind === "circle") continue;
    const len = primLength(p);
    if (len > 0 && len < minSegment) {
      const e = endpoints(p)!;
      push({
        code: "tinySegment",
        severity: "warning",
        message: `A ${len.toFixed(2)} mm ${p.lineType} segment: too short to make, usually left over from editing`,
        at: e[0],
        nodeIds: [p.nodeId],
      });
    }
  }

  return issues;
}
