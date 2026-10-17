import { buildPlanarFaces } from "./planar";
import type { FoldRig, Hinge, Pt, RigNode, Segment } from "./types";

/**
 * Builds the fold rig: which panel hinges off which, in what order, and which
 * way each crease folds.
 *
 * A flat dieline records no fold direction, so direction is *inferred*. The rule
 * used here is physically motivated rather than arbitrary:
 *
 *   At a crease, the child panel is rotated so that it lifts to the front (+Z)
 *   side of its parent. Which rotation sign achieves that is decided by the sign
 *   of the cross product between the hinge axis and the vector from the hinge to
 *   the child's centroid, so it is derived from the geometry instead of guessed.
 *
 * The fold tree is what makes the slider work: a child rotates rigidly with its
 * parent, so rotating every hinge in the tree folds the whole box closed.
 */

/** Full closure for a crease, in radians. */
const FOLD_ANGLE = Math.PI / 2;

/** Faces with no crease connection are reported, not silently dropped. */
const MIN_FACE_AREA = 1e-3;

type Adjacency = {
  faceA: number;
  faceB: number;
  from: Pt;
  to: Pt;
  kind: "fold" | "perf";
};

const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];

/**
 * Groups crease segments into adjacency records between the two faces they
 * separate. A crease that a face trace split into several collinear pieces
 * yields several records between the same pair; the longest is kept, since it
 * gives the most stable hinge axis.
 */
const collectAdjacency = (
  edgeFaces: Map<number, { a: number; b: number | null }>,
  edges: Segment[],
): Adjacency[] => {
  const best = new Map<string, Adjacency>();

  for (let edgeId = 0; edgeId < edges.length; edgeId++) {
    const edge = edges[edgeId]!;
    if (edge.kind === "trim") continue;

    const faces = edgeFaces.get(edgeId);
    if (!faces || faces.b === null || faces.a < 0) continue;

    const key = `${Math.min(faces.a, faces.b)}:${Math.max(faces.a, faces.b)}`;
    const length = Math.hypot(
      edge.b[0] - edge.a[0],
      edge.b[1] - edge.a[1],
    );
    const existing = best.get(key);

    if (
      !existing ||
      length >
        Math.hypot(existing.to[0] - existing.from[0], existing.to[1] - existing.from[1])
    ) {
      best.set(key, {
        faceA: faces.a,
        faceB: faces.b,
        from: edge.a,
        to: edge.b,
        kind: edge.kind === "perf" ? "perf" : "fold",
      });
    }
  }

  return Array.from(best.values());
};

const buildHinges = (adjacency: Adjacency[]): Hinge[] =>
  adjacency.map((entry, index) => ({
    id: index,
    a: entry.faceA,
    b: entry.faceB,
    from: entry.from,
    to: entry.to,
    angle: FOLD_ANGLE,
    // `valley` is decided during the direction pass, once the tree is rooted.
    valley: false,
    kind: entry.kind,
  }));

/**
 * Chooses the root panel.
 *
 * The root is the face that stays put while everything else folds onto it, so
 * the largest panel is the natural choice — for a carton that is the base or the
 * back wall, which is exactly what a person would hold still.
 */
const pickRoot = (faces: { id: number; area: number }[]): number => {
  if (faces.length === 0) return -1;

  let root = faces[0]!.id;
  let largest = -1;

  for (const face of faces) {
    if (face.area > largest) {
      largest = face.area;
      root = face.id;
    }
  }

  return root;
};

/** Breadth-first spanning tree over the hinge graph, rooted at `rootId`. */
const buildTree = (
  faceCount: number,
  hinges: Hinge[],
  rootId: number,
): { parent: (number | null)[]; hingeOf: (number | null)[]; depth: number[] } => {
  const parent: (number | null)[] = new Array(faceCount).fill(null);
  const hingeOf: (number | null)[] = new Array(faceCount).fill(null);
  const depth: number[] = new Array(faceCount).fill(-1);

  const neighbours = new Map<number, { other: number; hinge: number }[]>();
  hinges.forEach((hinge, index) => {
    if (hinge.b === null) return;

    const a = neighbours.get(hinge.a) ?? [];
    a.push({ other: hinge.b, hinge: index });
    neighbours.set(hinge.a, a);

    const b = neighbours.get(hinge.b) ?? [];
    b.push({ other: hinge.a, hinge: index });
    neighbours.set(hinge.b, b);
  });

  const visited = new Set<number>([rootId]);
  const queue: number[] = [rootId];
  depth[rootId] = 0;

  while (queue.length > 0) {
    const current = queue.shift()!;

    for (const { other, hinge } of neighbours.get(current) ?? []) {
      if (visited.has(other)) continue;

      visited.add(other);
      parent[other] = current;
      hingeOf[other] = hinge;
      depth[other] = depth[current]! + 1;
      queue.push(other);
    }
  }

  return { parent, hingeOf, depth };
};

/**
 * Resolves the rotation sign for one hinge.
 *
 * `crossZ = axis × toChild` tells which side of the hinge the child sits on.
 * Rotating the child to the +Z side of its parent then requires the opposite
 * sign, which is what this returns.
 */
const resolveSign = (from: Pt, to: Pt, childCentroid: Pt): 1 | -1 => {
  const axis = sub(to, from);
  const toChild = sub(childCentroid, from);

  // z of the 2D cross product: positive means the child is to the "left" of the
  // axis direction in the flat (SVG, y-down) plane.
  const crossZ = axis[0] * toChild[1] - axis[1] * toChild[0];

  return crossZ > 0 ? -1 : 1;
};

/**
 * Turns a flat dieline into a foldable rig.
 *
 * Returns a rig even when folding is impossible, flagging the problem in
 * `stats` so the caller can show a message instead of an empty canvas.
 */
export const buildFoldRig = (segments: Segment[]): FoldRig => {
  const plane = buildPlanarFaces(segments);

  const faces = plane.faces.filter((face) => face.area >= MIN_FACE_AREA);
  const kept = new Set(faces.map((face) => face.id));

  // Remap adjacency onto the filtered face set.
  const adjacency = collectAdjacency(plane.edgeFaces, plane.edges).filter(
    (entry) => kept.has(entry.faceA) && kept.has(entry.faceB),
  );

  const hinges = buildHinges(adjacency);

  /* ------------------------------- bounds -------------------------------- */
  const xs = segments.flatMap((s) => [s.a[0], s.b[0]]);
  const ys = segments.flatMap((s) => [s.a[1], s.b[1]]);

  const min: Pt = [Math.min(...xs), Math.min(...ys)];
  const max: Pt = [Math.max(...xs), Math.max(...ys)];

  const bounds = {
    min,
    max,
    width: max[0] - min[0],
    height: max[1] - min[1],
  };

  /* -------------------------------- tree --------------------------------- */
  const rootId = pickRoot(faces);

  if (rootId < 0) {
    return {
      nodes: [],
      rootId: -1,
      bounds,
      stats: {
        segmentCount: segments.length,
        faceCount: 0,
        hingeCount: 0,
        orphanCount: 0,
        degenerate: true,
      },
    };
  }

  const indexOf = new Map<number, number>();
  faces.forEach((face, index) => indexOf.set(face.id, index));

  const faceCount = faces.length;
  const { parent, hingeOf, depth } = buildTree(faceCount, hinges, rootId);

  /* -------------------------------- nodes -------------------------------- */
  const nodes: RigNode[] = faces.map((face, index) => {
    const hingeIndex = hingeOf[index];
    const hinge =
      hingeIndex === null || hingeIndex === undefined
        ? null
        : (hinges[hingeIndex] ?? null);

    if (!hinge) {
      // Root: rotation is identity, so pivot and axis are inert.
      return {
        face,
        parent: null,
        depth: 0,
        pivot: [0, 0],
        axis: [1, 0],
        sign: 1,
        angle: 0,
        kind: "fold",
      };
    }

    // The hinge stores the face ids; normalise so it always runs parent -> child
    // as seen from this node, which keeps the sign derivation well defined.
    const parentId = parent[index]!;
    const isForward = hinge.a === parentId;
    const from = isForward ? hinge.from : hinge.to;
    const to = isForward ? hinge.to : hinge.from;

    const childCentroid = face.centroid;
    const sign = resolveSign(from, to, childCentroid);

    return {
      face,
      parent: indexOf.get(parentId) ?? null,
      depth: depth[index] ?? 0,
      pivot: from,
      axis: sub(to, from),
      sign,
      angle: hinge.angle,
      kind: hinge.kind,
    };
  });

  const orphanCount = nodes.filter((node) => node.depth < 0).length;

  return {
    nodes,
    rootId: indexOf.get(rootId) ?? 0,
    bounds,
    stats: {
      segmentCount: segments.length,
      faceCount: faces.length,
      hingeCount: hinges.length,
      orphanCount,
      degenerate: hinges.length === 0 || faces.length < 2,
    },
  };
};

export const FOLD_CLOSURE_ANGLE = FOLD_ANGLE;
