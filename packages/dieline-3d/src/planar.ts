import type { Face, Pt, Segment, SegmentKind } from "./types";

/**
 * Planar subdivision of the flat dieline.
 *
 * Trim / fold / perf segments are merged into one graph: vertices are snapped
 * together within a tolerance and edges are split at every crossing, so the
 * pattern becomes a true planar subdivision. Faces are then traced by walking
 * half-edges in rotational order — the standard approach for extracting the
 * regions of a planar graph.
 */

/** Endpoints closer than this are the same vertex, in mm. */
const SNAP_TOLERANCE = 0.05;

type HalfEdge = {
  id: number;
  from: number;
  to: number;
  /** Twin half-edge. */
  twin: number;
  kind: SegmentKind;
  /** Index of the next half-edge in CCW angular order around `from`. */
  next: number;
  /** Set once a face claims this edge. */
  visited: boolean;
};

const key = (p: Pt) =>
  `${Math.round(p[0] / SNAP_TOLERANCE)}:${Math.round(p[1] / SNAP_TOLERANCE)}`;

/** Squared distance from point `p` to segment `a`–`b`. */
const distanceToSegmentSq = (p: Pt, a: Pt, b: Pt): number => {
  const dx = b[0]! - a[0]!;
  const dy = b[1]! - a[1]!;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) {
    const px = p[0]! - a[0]!;
    const py = p[1]! - a[1]!;
    return px * px + py * py;
  }

  let t =
    ((p[0]! - a[0]!) * dx + (p[1]! - a[1]!) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));

  const cx = a[0]! + t * dx;
  const cy = a[1]! + t * dy;
  const ex = p[0]! - cx;
  const ey = p[1]! - cy;

  return ex * ex + ey * ey;
};

/**
 * Collects the vertices each segment passes through.
 *
 * Rather than a full Bentley–Ottmann sweep, every segment is tested against
 * every other. Dielines have hundreds of segments, not hundreds of thousands, so
 * the O(n²) pass is a few tens of thousands of cheap comparisons and is far
 * easier to keep correct.
 */
const splitSegments = (segments: Segment[]): Segment[] => {
  const cuts: number[][] = segments.map(() => []);

  /**
   * A cut is accepted when it lands on the segment including its endpoints.
   *
   * This matters more than it looks: in a dieline a fold line almost always
   * starts and ends exactly on a trim line, so rejecting endpoint hits (the
   * usual `0 < t < 1` open-interval test) leaves every crease disconnected from
   * the outline and the panel trace degenerates. Samples at t≈0 or t≈1 are
   * dropped later as zero-length pieces.
   */
  const inRange = (t: number) => t >= -1e-9 && t <= 1 + 1e-9;

  for (let i = 0; i < segments.length; i++) {
    const si = segments[i]!;
    const [ax, ay] = si.a;
    const [bx, by] = si.b;
    const rx = bx - ax;
    const ry = by - ay;

    for (let j = i + 1; j < segments.length; j++) {
      const sj = segments[j]!;
      const [cx, cy] = sj.a;
      const [dx, dy] = sj.b;
      const sx = dx - cx;
      const sy = dy - cy;

      // Proper intersection of two segments.
      const denom = rx * sy - ry * sx;

      if (Math.abs(denom) > 1e-12) {
        const qpx = cx - ax;
        const qpy = cy - ay;
        const t = (qpx * sy - qpy * sx) / denom;
        const u = (qpx * ry - qpy * rx) / denom;

        if (inRange(t) && inRange(u)) {
          cuts[i]!.push(Math.max(0, Math.min(1, t)));
          cuts[j]!.push(Math.max(0, Math.min(1, u)));
        }
        continue;
      }

      // Parallel. Collinear segments split at each other's endpoints; truly
      // parallel ones share nothing.
      const cross = Math.abs((cx - ax) * ry - (cy - ay) * rx);
      if (cross > 1e-9) continue;

      const lengthSq = rx * rx + ry * ry;
      if (lengthSq < 1e-12) continue;

      const project = (p: Pt) =>
        ((p[0]! - ax) * rx + (p[1]! - ay) * ry) / lengthSq;

      for (const p of [sj.a, sj.b]) {
        const t = project(p);
        if (inRange(t)) cuts[i]!.push(Math.max(0, Math.min(1, t)));
      }
      for (const p of [si.a, si.b]) {
        const u = project(p);
        if (inRange(u)) cuts[j]!.push(Math.max(0, Math.min(1, u)));
      }
    }
  }

  const output: Segment[] = [];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]!;
    const ts = Array.from(new Set(cuts[i]!.map((t) => +t.toFixed(6)))).sort(
      (a, b) => a - b,
    );

    let previous = segment.a;
    for (const t of ts) {
      const point: Pt = [
        segment.a[0] + (segment.b[0] - segment.a[0]) * t,
        segment.a[1] + (segment.b[1] - segment.a[1]) * t,
      ];

      if (Math.hypot(point[0] - previous[0], point[1] - previous[1]) > 1e-6) {
        output.push({ a: previous, b: point, kind: segment.kind });
      }
      previous = point;
    }

    if (
      Math.hypot(segment.b[0] - previous[0], segment.b[1] - previous[1]) > 1e-6
    ) {
      output.push({ a: previous, b: segment.b, kind: segment.kind });
    }
  }

  return output;
};

/** Removes duplicate edges, preferring the "cut" kinds over folds. */
const dedupe = (segments: Segment[]): Segment[] => {
  const rank: Record<SegmentKind, number> = { trim: 0, perf: 1, fold: 2 };
  const seen = new Map<string, Segment>();

  for (const segment of segments) {
    const ka = key(segment.a);
    const kb = key(segment.b);
    const id = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
    const existing = seen.get(id);

    if (!existing || rank[segment.kind] < rank[existing.kind]) {
      seen.set(id, segment);
    }
  }

  return Array.from(seen.values());
};

export type PlanarResult = {
  faces: Face[];
  /** Edge index -> the faces on either side. */
  edgeFaces: Map<number, { a: number; b: number | null }>;
  /** Segment for each edge id, indexed by position in `edges`. */
  edges: Segment[];
};

/**
 * Builds the planar subdivision and traces its faces.
 *
 * Only edges whose two sides are different faces are real hinges, so the caller
 * uses `edgeFaces` to decide which edges fold.
 */
export const buildPlanarFaces = (rawSegments: Segment[]): PlanarResult => {
  const split = dedupe(splitSegments(rawSegments));

  /* ------------------------------ vertices ------------------------------ */
  const vertexIndex = new Map<string, number>();
  const vertices: Pt[] = [];

  const vertexOf = (p: Pt) => {
    const k = key(p);
    let index = vertexIndex.get(k);

    if (index === undefined) {
      index = vertices.length;
      vertices.push(p);
      vertexIndex.set(k, index);
    }

    return index;
  };

  /* ----------------------------- half-edges ----------------------------- */
  const halves: HalfEdge[] = [];
  const edges: Segment[] = [];
  const edgeOfHalf: number[] = [];

  for (const segment of split) {
    const from = vertexOf(segment.a);
    const to = vertexOf(segment.b);
    if (from === to) continue;

    const edgeId = edges.length;
    edges.push(segment);

    const forward = halves.length;
    halves.push({
      id: forward,
      from,
      to,
      twin: forward + 1,
      kind: segment.kind,
      next: -1,
      visited: false,
    });
    halves.push({
      id: forward + 1,
      from: to,
      to: from,
      twin: forward,
      kind: segment.kind,
      next: -1,
      visited: false,
    });

    edgeOfHalf.push(edgeId, edgeId);
  }

  /* --------------------- angular order around vertices -------------------- */
  const outgoing = new Map<number, number[]>();
  for (const half of halves) {
    const list = outgoing.get(half.from);
    if (list) list.push(half.id);
    else outgoing.set(half.from, [half.id]);
  }

  const angleOf = (half: HalfEdge) => {
    const a = vertices[half.from]!;
    const b = vertices[half.to]!;
    return Math.atan2(b[1] - a[1], b[0] - a[0]);
  };

  for (const list of outgoing.values()) {
    list.sort((x, y) => angleOf(halves[x]!) - angleOf(halves[y]!));

    for (let i = 0; i < list.length; i++) {
      const current = halves[list[i]!]!;
      // Walk clockwise from the twin: that is the next edge of the face on the
      // left-hand side, which yields counter-clockwise interior faces.
      const next = halves[list[(i + 1) % list.length]!]!;
      current.next = next.twin;
    }
  }

  /* -------------------------------- faces -------------------------------- */
  type RawFace = {
    outline: Pt[];
    /** Shoelace area in SVG coordinates: positive is CCW. */
    signedArea: number;
  };

  const rawFaces: RawFace[] = [];
  const faceOfHalf = new Map<number, number>();

  for (const start of halves) {
    if (start.visited) continue;

    const loop: number[] = [];
    let half: HalfEdge | undefined = start;
    let guard = 0;

    while (half && !half.visited && guard++ < halves.length + 4) {
      half.visited = true;
      loop.push(half.id);
      half = halves[half.next];
    }

    if (loop.length < 3) {
      // Not a closed region (dangling edge): discard.
      for (const id of loop) halves[id]!.visited = false;
      continue;
    }

    const outline: Pt[] = loop.map((id) => vertices[halves[id]!.from]!);

    // Shoelace over the SVG coordinates. Note this is *not* flip-invariant: the
    // sign is what distinguishes a bounded face from the outer boundary.
    let signedArea = 0;
    for (let i = 0; i < outline.length; i++) {
      const p = outline[i]!;
      const q = outline[(i + 1) % outline.length]!;
      signedArea += p[0] * q[1] - q[0] * p[1];
    }
    signedArea /= 2;

    for (const id of loop) faceOfHalf.set(id, rawFaces.length);
    rawFaces.push({ outline, signedArea });
  }

  /**
   * Winding convention, verified against known shapes: bounded faces come out
   * with a NEGATIVE shoelace area and the unbounded outer face with a positive
   * one. So a non-negative area marks the surrounding face, which is dropped.
   * Faces are stored with a positive area for consumers.
   */
  const keptIndex = new Map<number, number>();
  const faces: Face[] = [];

  rawFaces.forEach((raw, index) => {
    if (raw.signedArea >= -1e-9) return;

    keptIndex.set(index, faces.length);

    const centroid = raw.outline.reduce<Pt>(
      (acc, p) => [
        acc[0] + p[0] / raw.outline.length,
        acc[1] + p[1] / raw.outline.length,
      ],
      [0, 0],
    );

    faces.push({
      id: faces.length,
      outline: raw.outline,
      area: -raw.signedArea,
      centroid,
    });
  });

  /* --------------------------- edges to faces ---------------------------- */
  const edgeFaces = new Map<number, { a: number; b: number | null }>();

  for (let edgeId = 0; edgeId < edges.length; edgeId++) {
    const forward = halves[edgeId * 2]!;
    const backward = halves[edgeId * 2 + 1]!;

    const leftRaw = faceOfHalf.get(forward.id);
    const rightRaw = faceOfHalf.get(backward.id);

    const left = leftRaw === undefined ? undefined : keptIndex.get(leftRaw);
    const right = rightRaw === undefined ? undefined : keptIndex.get(rightRaw);

    // An edge with a dropped (outer) side is a boundary edge, not a hinge.
    if (left === undefined && right === undefined) continue;

    if (left === undefined) {
      edgeFaces.set(edgeId, { a: right!, b: null });
      continue;
    }

    if (right === undefined) {
      edgeFaces.set(edgeId, { a: left, b: null });
      continue;
    }

    edgeFaces.set(edgeId, { a: left, b: left === right ? null : right });
  }

  return { faces, edgeFaces, edges };
};

export const PLANAR_TOLERANCE = SNAP_TOLERANCE;
export { distanceToSegmentSq };
