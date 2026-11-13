import { foldAngle, foldSchedule, stageProgress, stepWindows, type FoldWindow } from "./schedule";
import * as THREE from "three";
import { boardTextures, type BoardTextures } from "./board";
import type { PiecePlacement } from "./foldConfig";
import type { FoldRig, Pt, RigNode } from "./types";

/**
 * Turns a fold rig into a three.js scene graph.
 *
 * The scene graph mirrors the fold tree: each panel is wrapped in a pivot group
 * placed on its hinge, with the panel geometry offset back by the hinge. Rotating
 * a pivot therefore rotates every descendant with it, which is exactly how a real
 * carton closes — a flap goes where its parent panel goes.
 */

/* -------------------------------------------------------------------------- */
/*                                 MATERIALS                                  */
/* -------------------------------------------------------------------------- */

export type MaterialStyle = {
  /** Front/back surface colour. */
  color: string;
  /** Edge (cut) colour. */
  edge: string;
  /** Subtle roughness difference so board does not look like plastic. */
  roughness: number;
  label: string;
};

const WHITE_BOARD: MaterialStyle = {
  color: "#f4f4f2",
  edge: "#d8d8d4",
  roughness: 0.9,
  label: "مقوای سفید",
};

const KRAFT_BOARD: MaterialStyle = {
  color: "#c8a273",
  edge: "#a98454",
  roughness: 0.95,
  label: "مقوای کارتنی",
};

/**
 * Paper-faced boards print white; corrugated flutes read as kraft. This mirrors
 * how the physical stock looks before any artwork is applied.
 */
export const materialStyleFor = (material: string): MaterialStyle => {
  const white = ["glossyCardboard", "artPaper"];
  return white.includes(material) ? WHITE_BOARD : KRAFT_BOARD;
};

/* -------------------------------------------------------------------------- */
/*                                  GEOMETRY                                  */
/* -------------------------------------------------------------------------- */

export type PanelMesh = {
  node: RigNode;
  geometry: THREE.ExtrudeGeometry;
};

export type RigScene = {
  group: THREE.Group;
  /** Pivot groups, parallel to `rig.nodes`, for driving the fold animation. */
  pivots: THREE.Group[];
  /** Where each pivot sits in its parent before any layering. */
  rest: THREE.Vector3[];
  /** Modelled board thickness, in mm: one flap layer. */
  thickness: number;
  /** One-piece faces over closed locks, shown from `from` in the fold. */
  caps: { mesh: THREE.Mesh; from: number }[];
  /** The bent board at each fold, reshaped on every `applyFold`. */
  bends: Bend[];
  size: THREE.Vector3;
  style: MaterialStyle;
  /** Surface textures: paper grain, or kraft liner and flute ridges. Null outside a browser. */
  board: BoardTextures | null;
};

/**
 * The strip of board that bends at one fold. It hangs in the parent's pivot and
 * runs from the parent's trimmed edge, round the crease, to the child's trimmed
 * edge wherever the child's rotation has taken it.
 */
type Bend = {
  index: number;
  mesh: THREE.Mesh;
  /** Crease direction, in the parent's frame. */
  along: THREE.Vector3;
  /** Where this piece starts along the crease, from the panel's pivot. */
  start: number;
  length: number;
  /** In the board's plane, at right angles to the crease, towards the parent. */
  towardParent: THREE.Vector3;
  /** Flat (world, unrotated) position of the crease start, for texture mapping. */
  flatStart: THREE.Vector2;
};

/** Steps round a bend: enough that it reads as a curve, few enough to rebuild every frame. */
const BEND_STEPS = 8;
/** Vertices in one copy of a bend's grid: step x end (0, 1) x face (outer, inner). */
const BEND_GRID = (BEND_STEPS + 1) * 2 * 2;
const bendVertex = (step: number, end: number, face: number) => (step * 2 + end) * 2 + face;

/** How far, in mm, a bend strip runs on under each panel it joins. */
const BEND_OVERLAP = 0.2;

/** How wide the bend is: a few board thicknesses, as a crease rounds over in real board. */
export const bendWidth = (thickness: number) => Math.max(1.5 * thickness, 1);

/**
 * Pulls a panel's outline back from one crease, only along the crease's own
 * length, so the bend strip there fits in between. Points on or near the crease
 * move straight off it by `reach`. Where the outline carries on along the same
 * line past an end of the crease (a cut edge beside a shorter flap), the point at
 * that end is kept as well, so the outline steps in there instead of losing a
 * sliver along the whole edge; the step is exactly the strip's cut end.
 */
export const trimAtCrease = (polygon: Pt[], origin: Pt, unit: Pt, inward: Pt, first: number, last: number, reach: number): Pt[] => {
  const eps = 1e-6;
  const along = (p: Pt) => (p[0] - origin[0]) * unit[0] + (p[1] - origin[1]) * unit[1];
  const depth = (p: Pt) => (p[0] - origin[0]) * inward[0] + (p[1] - origin[1]) * inward[1];
  const within = (p: Pt) => along(p) >= first - eps && along(p) <= last + eps;
  const onLine = (p: Pt) => Math.abs(depth(p)) < 1e-4;
  const outside = (p: Pt) => onLine(p) && !within(p);
  const out: Pt[] = [];
  polygon.forEach((v, i) => {
    const d = depth(v);
    if (!within(v) || d < -1e-4 || d >= reach - eps) {
      out.push(v);
      return;
    }
    const moved: Pt = [v[0] + inward[0] * (reach - d), v[1] + inward[1] * (reach - d)];
    const prev = polygon[(i - 1 + polygon.length) % polygon.length]!;
    const next = polygon[(i + 1) % polygon.length]!;
    if (onLine(v) && outside(prev)) out.push(v);
    out.push(moved);
    if (onLine(v) && outside(next)) out.push(v);
  });
  return out;
};

/** Flat (SVG, y-down) point -> world (y-up) point, centred on the pattern. */
const toWorld = (point: Pt, center: Pt): THREE.Vector2 =>
  new THREE.Vector2(point[0] - center[0], -(point[1] - center[1]));

/**
 * Even-odd point-in-polygon test, in flat coordinates.
 *
 * Shared with the rig so windows and perforation ownership use one definition.
 */
import { pointInPolygon, signedArea } from "./polygon";

/**
 * Builds one panel as top face, bottom face, and side walls **only on edges that
 * are not creases**.
 *
 * This is what makes the model read as a single sheet of board rather than a pile
 * of blocks. Extruding each panel independently gives every panel its own wall at
 * the crease, so a fold looks like two solids butted together. Leaving crease edges
 * open means adjacent panels meet exactly along the crease line — continuous when
 * flat, and pinched at the crease when folded, like real folded board.
 *
 * Windows are cut as triangulation holes, so the panel genuinely has a hole in it.
 */
const buildPanelGeometry = (
  outline: Pt[],
  holes: Pt[][],
  center: Pt,
  thickness: number,
  bounds: { width: number; height: number },
  hingeSegments: { from: Pt; to: Pt }[],
  /** How far the panel was trimmed back from its creases for the bends. */
  creaseGap = 0,
): THREE.BufferGeometry | null => {
  const toPoints = (pts: Pt[]) => pts.map((p) => toWorld(p, center));
  // Triangulation drops a repeated point by itself; dropping it here first keeps
  // the flat and world rings in step, edge for edge.
  const same = (p: Pt, q: Pt) => Math.abs(p[0] - q[0]) < 1e-6 && Math.abs(p[1] - q[1]) < 1e-6;
  outline = outline.filter((p, i) => !same(p, outline[(i + 1) % outline.length]!));

  const contour = toPoints(outline);
  if (contour.length < 3) return null;

  const holeRings = holes
    .map((ring) => ({ flat: ring, world: toPoints(ring) }))
    .filter((ring) => ring.world.length >= 3);

  /* ------------------------------ triangulate ------------------------------ */
  /**
   * Wind everything counter-clockwise in **world** space.
   *
   * SVG's y axis points down, so a face traced in SVG coordinates has the
   * opposite orientation once y is flipped. Getting this backwards makes earcut
   * emit clockwise triangles, which flips every surface normal.
   *
   * The flat and world arrays are reversed together so that entry `i` refers to
   * the same edge in both — the crease test reads flat coordinates while the wall
   * is built from world coordinates, and they must agree.
   */
  const worldIsCcw = signedArea(outline) < 0;

  const orientWorld = <T,>(points: T[]): T[] =>
    worldIsCcw ? points : [...points].reverse();

  const contourWorld = orientWorld(contour);
  const contourFlat = orientWorld(outline);

  // Holes wind the opposite way to the contour.
  const holeWorld = holeRings.map((ring) =>
    signedArea(ring.flat) < 0 ? [...ring.world].reverse() : ring.world,
  );

  let triangles: number[][];

  try {
    triangles = THREE.ShapeUtils.triangulateShape(contourWorld, holeWorld);
  } catch {
    // Degenerate or self-intersecting outline: skip this panel rather than
    // taking the whole viewer down.
    return null;
  }

  if (triangles.length === 0) return null;

  /* ------------------------------- vertices ------------------------------- */
  const allPoints = [...contourWorld, ...holeWorld.flat()];

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  const half = thickness / 2;
  const width = Math.max(bounds.width, 1e-3);
  const height = Math.max(bounds.height, 1e-3);

  const pushVertex = (
    point: THREE.Vector2,
    z: number,
    normalZ: 1 | -1,
  ) => {
    positions.push(point.x, point.y, z);
    normals.push(0, 0, normalZ);
    // Planar projection across the flat pattern, so artwork maps correctly.
    uvs.push((point.x + width / 2) / width, (point.y + height / 2) / height);
  };

  // Top face (+Z) and bottom face (-Z), same triangles with opposite winding.
  for (const face of [1, -1] as const) {
    for (const triangle of triangles) {
      const order = face === 1 ? triangle : [triangle[2]!, triangle[1]!, triangle[0]!];

      for (const index of order) {
        pushVertex(allPoints[index]!, face === 1 ? half : -half, face);
      }
    }
  }

  /* --------------------------------- walls -------------------------------- */
  /** True when an outline edge is a crease, and therefore must stay open. */
  const isHingeEdge = (a: Pt, b: Pt): boolean => {
    const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

    return hingeSegments.some((hinge) => {
      const dx = hinge.to[0] - hinge.from[0];
      const dy = hinge.to[1] - hinge.from[1];
      const lengthSq = dx * dx + dy * dy;
      if (lengthSq < 1e-9) return false;

      // Distance from the midpoint to the hinge line, and that it lies within it.
      const px = mid[0] - hinge.from[0];
      const py = mid[1] - hinge.from[1];
      const t = (px * dx + py * dy) / lengthSq;
      if (t < -1e-6 || t > 1 + 1e-6) return false;

      // On the crease, on the edge trimmed back from it, or the short step where
      // that trim ends: the bend strip joins the panel there, so no wall shows.
      const cross = Math.abs(px * dy - py * dx) / Math.sqrt(lengthSq);
      return cross < creaseGap + 0.08;
    });
  };

  /**
   * One quad per edge, wound so its normal points away from the material.
   *
   * `flip` is used for hole rings: they run the other way round, so the material
   * lies on the opposite side and the normal has to take the other branch, or the
   * inside of a window would be lit as if it faced outward.
   */
  const pushWall = (
    a: THREE.Vector2,
    b: THREE.Vector2,
    flip = false,
  ) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy);
    if (length < 1e-6) return;

    // For a counter-clockwise ring the outside is to the right of the edge.
    const sign = flip ? -1 : 1;
    const nx = (sign * dy) / length;
    const ny = (sign * -dx) / length;

    const corners: [number, number, number][] = [
      [a.x, a.y, half],
      [b.x, b.y, half],
      [b.x, b.y, -half],
      [a.x, a.y, -half],
    ];

    for (const index of [0, 1, 2, 0, 2, 3]) {
      const [x, y, z] = corners[index]!;
      positions.push(x, y, z);
      normals.push(nx, ny, 0);
      uvs.push((x + width / 2) / width, (y + height / 2) / height);
    }
  };

  /*
   * Outer boundary edges, skipping creases.
   *
   * `contourFlat` and `contourWorld` are in the same order, so index `i` is the
   * same edge in both: the crease test reads flat coordinates and the wall is
   * built from world coordinates.
   */
  for (let i = 0; i < contourFlat.length; i++) {
    const a = contourFlat[i]!;
    const b = contourFlat[(i + 1) % contourFlat.length]!;
    if (isHingeEdge(a, b)) continue;

    pushWall(contourWorld[i]!, contourWorld[(i + 1) % contourWorld.length]!);
  }

  // Window edges always get a wall: a cut-out has an exposed inner edge.
  holeWorld.forEach((points) => {
    for (let i = 0; i < points.length; i++) {
      pushWall(points[i]!, points[(i + 1) % points.length]!, true);
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeBoundingBox();

  return geometry;
};

/** Clear window film: a faint sheen and a hint of the inside, like thin PET. */
const FILM = new THREE.MeshPhysicalMaterial({
  color: "#dbe7f5",
  transparent: true,
  opacity: 0.38,
  roughness: 0.04,
  metalness: 0,
  clearcoat: 1,
  clearcoatRoughness: 0.03,
  side: THREE.DoubleSide,
  depthWrite: false,
});

export const buildRigScene = ({
  rig,
  material,
  thickness,
  film,
}: {
  rig: FoldRig;
  material: string;
  /**
   * Glaze windows with clear film, as a window box ships: every hole cut inside a
   * panel, plus these outlines of windows that cross a fold (flat coordinates).
   */
  film?: Pt[][];
  /** Board thickness in mm, taken from the selected material or custom value. */
  thickness: number;
}): RigScene => {
  const style = materialStyleFor(material);
  const board = boardTextures(material, rig.bounds, style.color);

  const center: Pt = [
    (rig.bounds.min[0] + rig.bounds.max[0]) / 2,
    (rig.bounds.min[1] + rig.bounds.max[1]) / 2,
  ];

  const root = new THREE.Group();
  const pivots: THREE.Group[] = new Array(rig.nodes.length);

  // Each window's film hangs on the smallest board panel around its centre.
  const filmOwner = (film ?? []).map((window) => {
    const mid: Pt = [window.reduce((sum, p) => sum + p[0], 0) / window.length, window.reduce((sum, p) => sum + p[1], 0) / window.length];
    let owner = -1;
    rig.nodes.forEach((node, index) => {
      if (node.isHole || !pointInPolygon(mid, node.face.outline)) return;
      if (owner < 0 || Math.abs(node.face.area) < Math.abs(rig.nodes[owner]!.face.area)) owner = index;
    });
    return owner;
  });

  // Guard against a non-positive thickness producing invisible panels.
  const safeThickness = Math.max(thickness, 0.1);

  /* --------------------------- create pivot groups -------------------------- */
  /**
   * Each panel is wrapped in a pivot placed at its crease, and a child's pivot is
   * parented to its parent's so folding carries descendants with it. Two details
   * make this easy to get wrong, and both did:
   *
   * 1. A pivot's position must be relative to its **parent's** hinge, not
   *    absolute. The parent's local frame is already translated to its own hinge,
   *    so an absolute position applies that offset twice and detaches the panel.
   * 2. Parents are not guaranteed to appear before their children in the node
   *    list — for a chain the tree is often built root-last. Attaching in a single
   *    pass silently dropped such children onto the root, so they ignored their
   *    parent's rotation. Hence two passes.
   */
  const hinges: THREE.Vector2[] = new Array(rig.nodes.length);

  rig.nodes.forEach((node, index) => {
    hinges[index] =
      node.parent === null
        ? new THREE.Vector2(0, 0)
        : toWorld(node.pivot, center);

    pivots[index] = new THREE.Group();
  });

  rig.nodes.forEach((node, index) => {
    const pivot = pivots[index]!;
    const parentIndex = node.parent;

    if (parentIndex === null) {
      // Root panel keeps the world origin; it never rotates.
      pivot.position.set(0, 0, 0);
      root.add(pivot);
      return;
    }

    const parentPivot = pivots[parentIndex]!;
    const hinge = hinges[index]!;
    const parentHinge = hinges[parentIndex]!;

    pivot.position.set(
      hinge.x - parentHinge.x,
      hinge.y - parentHinge.y,
      0,
    );

    parentPivot.add(pivot);
  });

  /* ----------------------------- create panels ----------------------------- */
  /**
   * Crease lines, so a panel can leave its crease edges open and stay welded to
   * its neighbours. Derived from the rig: each non-root node's pivot and axis is
   * the hinge it rotates about.
   */
  const bends: Bend[] = [];
  const hingeSegments = rig.nodes
    .filter((node) => node.parent !== null)
    .map((node) => ({
      from: node.pivot,
      to: [node.pivot[0] + node.axis[0], node.pivot[1] + node.axis[1]] as Pt,
    }));

  rig.nodes.forEach((node, index) => {
    const pivot = pivots[index];
    if (!pivot) return;

    // Windows are not panels; they are cut out of their container.
    if (node.isHole) return;

    /*
     * The panel stops half a bend short of each of its creases, on both sides of
     * the fold, and the bend strip fills the gap. Only this panel's own creases
     * trim it: its hinge to its parent, and its children's hinges.
     */
    const reach = bendWidth(safeThickness) / 2;
    let outline = node.face.outline;
    const own = rig.nodes.filter((other, j) => (j === index && other.parent !== null) || (other.parent === index && !other.isHole));
    for (const crease of own) {
      const length = Math.hypot(crease.axis[0], crease.axis[1]);
      if (length < 1e-6) continue;
      const unit: Pt = [crease.axis[0] / length, crease.axis[1] / length];
      const normal: Pt = [-unit[1], unit[0]];
      const c = node.face.centroid;
      const side = (c[0] - crease.pivot[0]) * normal[0] + (c[1] - crease.pivot[1]) * normal[1] >= 0 ? 1 : -1;
      // The same extent the bend strip covers: from the first crease piece to the last.
      const ends = (crease.spans?.length ? crease.spans.flat() : [crease.pivot, [crease.pivot[0] + crease.axis[0], crease.pivot[1] + crease.axis[1]] as Pt]).map(
        (p) => (p[0] - crease.pivot[0]) * unit[0] + (p[1] - crease.pivot[1]) * unit[1],
      );
      const trimmed = trimAtCrease(outline, crease.pivot, unit, [normal[0] * side, normal[1] * side], Math.min(...ends), Math.max(...ends), reach);
      if (trimmed.length >= 3) outline = trimmed;
    }

    const geometry = buildPanelGeometry(
      outline,
      node.holes,
      center,
      safeThickness,
      rig.bounds,
      hingeSegments,
      reach,
    );
    if (!geometry) return;

    // Shift the panel so its hinge sits at the pivot's origin. The outline is in
    // world coordinates, and the pivot is already at the hinge, so offset by the
    // negated hinge position.
    const hingeWorld = hinges[index]!;
    geometry.translate(-hingeWorld.x, -hingeWorld.y, 0);

    const materialInstance = new THREE.MeshStandardMaterial({
      color: board ? "#ffffff" : style.color,
      map: board?.map ?? null,
      bumpMap: board?.bumpMap ?? null,
      bumpScale: board && style === KRAFT_BOARD ? 0.5 : 0.15,
      roughness: style.roughness,
      metalness: 0,
      side: THREE.DoubleSide,
      // Slight polygon offset keeps coincident faces from z-fighting when the
      // box is fully closed.
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });

    const mesh = new THREE.Mesh(geometry, materialInstance);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = `panel-${index}`;
    // Lets the viewer report which panel was clicked, for editor selection.
    mesh.userData.panelIndex = index;

    pivot.add(mesh);

    // The film is glued behind the window, so it sits in the board's thickness
    // and folds with its panel.
    if (film) {
      for (const hole of [...node.holes, ...film.filter((_, w) => filmOwner[w] === index)]) {
        const shape = new THREE.Shape(hole.map((point) => toWorld(point, center)));
        const glass = new THREE.ShapeGeometry(shape);
        glass.translate(-hingeWorld.x, -hingeWorld.y, safeThickness / 2);
        const sheet = new THREE.Mesh(glass, FILM);
        sheet.name = `film-${index}`;
        sheet.renderOrder = 2;
        pivot.add(sheet);
      }
    }

    /*
     * The board bends round at a fold rather than breaking into a corner: a strip
     * joins this panel to its parent, so the box is one sheet. Its shape follows
     * the fold angle, so it is built empty here and filled by `shapeBend`.
     */
    if (node.parent !== null && !rig.nodes[node.parent]!.isHole) {
      // One strip along the whole fold. A fold broken by slots is several pieces
      // on one line; the panels are trimmed back along all of it, so the strip
      // runs from the first piece to the last and leaves no slit between them.
      const axisLength = Math.hypot(node.axis[0], node.axis[1]);
      const unit: Pt = axisLength > 1e-9 ? [node.axis[0] / axisLength, node.axis[1] / axisLength] : [1, 0];
      const project = (p: Pt) => (p[0] - node.pivot[0]) * unit[0] + (p[1] - node.pivot[1]) * unit[1];
      const spans = (node.spans?.length ? node.spans : [[node.pivot, [node.pivot[0] + node.axis[0], node.pivot[1] + node.axis[1]]] as [Pt, Pt]]).map(
        ([a, b]) => ({ start: Math.min(project(a), project(b)), end: Math.max(project(a), project(b)) }),
      );
      const first = Math.min(...spans.map((p) => p.start));
      const last = Math.max(...spans.map((p) => p.end));
      for (const { start, length } of [{ start: first, length: last - first }]) {
        if (length <= 1e-3 || axisLength <= 1e-9) continue;
        const along = new THREE.Vector3(node.axis[0], -node.axis[1], 0).normalize();
        const parentCentroid = toWorld(rig.nodes[node.parent]!.face.centroid, center);
        const hingeWorld = hinges[index]!;
        const towardParent = new THREE.Vector3(-along.y, along.x, 0);
        if (towardParent.x * (parentCentroid.x - hingeWorld.x) + towardParent.y * (parentCentroid.y - hingeWorld.y) < 0) towardParent.negate();

        const geometry = new THREE.BufferGeometry();
        // Two copies of the grid: the faces, and the cut ends. The ends get their
        // own vertices so their sideways normals do not bleed into the faces and
        // show the bend as a shaded line.
        const vertexCount = BEND_GRID * 2;
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(vertexCount * 3), 3));
        geometry.setAttribute("normal", new THREE.Float32BufferAttribute(new Float32Array(vertexCount * 3), 3));
        geometry.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(vertexCount * 2), 2));
        const indices: number[] = [];
        for (let k = 0; k < BEND_STEPS; k++) {
          for (const face of [0, 1]) {
            const [a0, a1, b0, b1] = [bendVertex(k, 0, face), bendVertex(k, 1, face), bendVertex(k + 1, 0, face), bendVertex(k + 1, 1, face)];
            // The inner face looks the other way, so it winds the other way.
            if (face === 0) indices.push(a0, b0, a1, a1, b0, b1);
            else indices.push(a0, a1, b0, a1, b1, b0);
          }
          // The two ends of the strip, along the outline's cut edges.
          for (const end of [0, 1]) {
            const [o0, i0, o1, i1] = [k, k, k + 1, k + 1].map((step, j) => BEND_GRID + bendVertex(step, end, j % 2));
            // The two ends face opposite ways along the crease.
            if (end === 0) indices.push(o0!, i0!, o1!, o1!, i0!, i1!);
            else indices.push(o0!, o1!, i0!, o1!, i1!, i0!);
          }
        }
        // Which way the triangles must wind for the board's top to face the
        // viewer depends on the fold's direction; drawn both sides, a triangle
        // seen from its back is lit as if facing away, and the bend goes dark.
        const flat = new THREE.Vector3().crossVectors(along, towardParent.clone().negate());
        if (flat.z > 0) {
          for (let t = 0; t < indices.length; t += 3) [indices[t + 1], indices[t + 2]] = [indices[t + 2]!, indices[t + 1]!];
        }
        geometry.setIndex(indices);

        const bend = new THREE.Mesh(geometry, materialInstance);
        bend.name = `bend-${index}`;
        bend.userData.panelIndex = index;
        bend.castShadow = true;
        bend.receiveShadow = true;
        bend.frustumCulled = false;
        pivots[node.parent]!.add(bend);
        bends.push({ index, mesh: bend, along, start, length, towardParent, flatStart: hingeWorld.clone() });
      }
    }
  });

  /* ----------------------------- closed bottoms ---------------------------- */
  /**
   * A closed snap lock is one flat face: pressed home, the seams between its flaps
   * barely show. So a plain sheet covers the whole bottom once it has closed. It
   * rides on the notched flap, just outside it, and takes the board's texture and
   * any artwork from the same flat-pattern mapping as the panels.
   */
  const caps: RigScene["caps"] = [];

  scheduleOf(rig).forEach((window, index) => {
    const node = rig.nodes[index]!;
    const bends = rig.nodes.filter((n) => n.parent === index && n.kind === "bend");
    const mesh = pivots[index]!.children.find((child) => (child as THREE.Mesh).isMesh) as THREE.Mesh | undefined;
    if (!window.press || bends.length !== 2 || node.parent === null || !mesh) return;

    const along = Math.hypot(node.axis[0], node.axis[1]);
    const u: Pt = [node.axis[0] / along, node.axis[1] / along];
    const dot = (a: Pt, b: Pt) => a[0] * b[0] + a[1] * b[1];
    const from = (p: Pt): Pt => [p[0] - node.pivot[0], p[1] - node.pivot[1]];

    // Across the flap, away from the hinge, and half the box's depth to the bend.
    const toFlap = from(node.face.centroid);
    const side = dot(toFlap, [-u[1], u[0]]) > 0 ? 1 : -1;
    const v: Pt = [-u[1] * side, u[0] * side];
    const depth = 2 * dot(from(bends[0]!.pivot), v);

    // The panel's full width, so the sheet also covers the relief holes.
    const spans = rig.nodes[node.parent]!.face.outline.map((p) => dot(from(p), u));
    const start = Math.min(...spans);
    const end = Math.max(...spans);

    const hinge = hinges[index]!;
    const corners = [[start, 0], [end, 0], [end, depth], [start, depth]].map(([a, b]) =>
      toWorld([node.pivot[0] + u[0] * a! + v[0] * b!, node.pivot[1] + u[1] * a! + v[1] * b!], center),
    );

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(corners.flatMap((c) => [c.x - hinge.x, c.y - hinge.y, -safeThickness / 2 - 0.02]), 3),
    );
    geometry.setAttribute(
      "uv",
      new THREE.Float32BufferAttribute(
        corners.flatMap((c) => [(c.x + rig.bounds.width / 2) / rig.bounds.width, (c.y + rig.bounds.height / 2) / rig.bounds.height]),
        2,
      ),
    );
    geometry.setIndex([0, 1, 2, 0, 2, 3]);
    geometry.computeVertexNormals();

    const cap = new THREE.Mesh(geometry, mesh.material);
    cap.name = `cap-${index}`;
    cap.userData.panelIndex = index;
    cap.visible = false;
    pivots[index]!.add(cap);
    caps.push({ mesh: cap, from: window.press.end });
  });

  /* ---------------------------- perforations ------------------------------- */
  /**
   * Perforations are drawn as a shallow pressed groove rather than geometry.
   *
   * Two hairlines do the work: a soft dark line reads as the bottom of the
   * indentation and a lighter offset line reads as its lit edge, which is what
   * makes a score line look pressed into board instead of drawn on it. Each line
   * is parented to the panel that contains it, so it folds with that panel.
   */
  if (rig.perforations.length > 0) {
    const pressMaterial = new THREE.LineBasicMaterial({
      color: "#6b7280",
      transparent: true,
      opacity: 0.5,
    });
    const highlightMaterial = new THREE.LineBasicMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0.4,
    });

    /** Groove sits just above the front face so it is not hidden by it. */
    const surfaceZ = safeThickness / 2 + 0.01;
    const OFFSET = 0.16;

    const pivotLocal = (
      p: Pt,
      nodeIndex: number,
    ): THREE.Vector3 => {
      const world = toWorld(p, center);
      const hinge = hinges[nodeIndex]!;

      return new THREE.Vector3(world.x - hinge.x, world.y - hinge.y, surfaceZ);
    };

    for (const segment of rig.perforations) {
      const midpoint: Pt = [
        (segment.a[0] + segment.b[0]) / 2,
        (segment.a[1] + segment.b[1]) / 2,
      ];

      const index = rig.nodes.findIndex((node) =>
        pointInPolygon(midpoint, node.face.outline),
      );
      // A perforation on a panel boundary has no single owner; skip rather than
      // guessing, which would leave a groove floating on the wrong panel.
      if (index < 0) continue;

      const pivot = pivots[index];
      if (!pivot) continue;

      const a = pivotLocal(segment.a, index);
      const b = pivotLocal(segment.b, index);

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const length = Math.hypot(dx, dy) || 1;
      // Perpendicular offset, so the highlight sits beside the groove.
      const nx = (-dy / length) * OFFSET;
      const ny = (dx / length) * OFFSET;

      const groove = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([a, b]),
        pressMaterial,
      );

      const highlight = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(a.x + nx, a.y + ny, a.z + 0.001),
          new THREE.Vector3(b.x + nx, b.y + ny, b.z + 0.001),
        ]),
        highlightMaterial,
      );

      pivot.add(groove, highlight);
    }
  }

  /* -------------------------------- extents ------------------------------- */
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);

  const rest = pivots.map((pivot) => pivot.position.clone());

  const scene: RigScene = { group: root, pivots, rest, thickness: safeThickness, caps, bends, size, style, board };
  // Shape the bends once, flat, so a scene that is never folded still shows them.
  for (const bend of bends) shapeBend(scene, bend, rig);
  return scene;
};

// The schedule only depends on the rig, and the slider calls `applyFold` per frame.
const schedules = new WeakMap<FoldRig, FoldWindow[]>();
const scheduleOf = (rig: FoldRig): FoldWindow[] => {
  let s = schedules.get(rig);
  if (!s) schedules.set(rig, (s = foldSchedule(rig)));
  return s;
};

/**
 * Stands each piece where its placement says. A piece hangs from its still
 * panel's pivot, which folding never turns, so placing that pivot carries the
 * whole piece. Placements are in the viewer's world frame (Y up), so `lying`
 * (the template resting on its base, the scene turned -90° about X) is undone
 * here: the numbers mean the same thing whichever way the template rests.
 * Rotation is about the still panel's centre, X then Y then Z.
 *
 * Whatever the turn, a piece stays on the ground: it drops or rises until its
 * lowest point is where its lowest point is unplaced, and `y` lifts it from
 * there. Pieces line up front to back through the panels they stand on: each
 * one's base panel centre moves onto the main piece's (the one with the most
 * panels), and `z` moves it off that line. The ground changes as a piece
 * folds, so this runs after every `applyFold`; the line does not, so folding
 * never slides a piece forward or back.
 *
 * A placement without a step is where a piece starts; one with a step is where
 * it is when that step ends, and it moves there during the step (`progress`).
 */
export const placePieces = (scene: RigScene, rig: FoldRig, pieces: readonly PiecePlacement[] | undefined, lying: boolean, progress = 1) => {
  const center: Pt = [(rig.bounds.min[0] + rig.bounds.max[0]) / 2, (rig.bounds.min[1] + rig.bounds.max[1]) / 2];
  const toScene = new THREE.Matrix4().makeRotationX(lying ? -Math.PI / 2 : 0);
  const fromScene = toScene.clone().invert();
  const windows = new Map(stepWindows(rig).map((w) => [w.step, w]));
  const keys = ["x", "y", "z", "rx", "ry", "rz"] as const;
  // Where a piece is at this point of the fold: its start, carried towards each
  // step's placement while that step runs.
  const placementOf = (face: number): PiecePlacement => {
    const mine = (pieces ?? []).filter((p) => p.face === face);
    const pose: PiecePlacement = { face, x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, ...mine.find((p) => p.step === undefined) };
    for (const key of [...mine].filter((p) => p.step !== undefined).sort((a, b) => a.step! - b.step!)) {
      const w = windows.get(key.step!);
      const t = w ? stageProgress(w, progress) : 1;
      for (const k of keys) pose[k] += (key[k] - pose[k]) * t;
    }
    return pose;
  };
  const deg = THREE.MathUtils.degToRad;
  const box = new THREE.Box3();
  const part = new THREE.Box3();
  const frame = new THREE.Matrix4();
  // Everything hanging from this pivot, boxed in the world frame (Y up); with
  // `only`, just that panel's own board on the pivot (not the bends at its folds).
  const bounds = (pivot: THREE.Group, only?: number) => {
    scene.group.updateMatrixWorld(true);
    // Strip whatever the canvas puts above the scene, then turn it as the viewer does.
    frame.copy(toScene).multiply(scene.group.matrixWorld.clone().invert());
    box.makeEmpty();
    pivot.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh || !mesh.geometry) return;
      if (only !== undefined && (mesh.parent !== pivot || mesh.userData.panelIndex !== only)) return;
      if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
      box.union(part.copy(mesh.geometry.boundingBox!).applyMatrix4(frame.clone().multiply(mesh.matrixWorld)));
    });
    return box.clone();
  };

  const placed = rig.nodes.flatMap((node, index) => {
    const pivot = scene.pivots[index];
    if (node.parent !== null || node.isHole || !pivot) return [];
    const placement = placementOf(index);
    pivot.position.set(0, 0, 0);
    pivot.quaternion.identity();
    const ground = bounds(pivot).min.y;

    const xs = node.face.outline.map((p) => p[0]);
    const ys = node.face.outline.map((p) => p[1]);
    const mid = toWorld([(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2], center);
    const c = new THREE.Vector3(mid.x, mid.y, 0).applyMatrix4(toScene);
    const turn = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(deg(placement.rx), deg(placement.ry), deg(placement.rz), "XYZ"));
    const pose = (lift: number, depth: number) => {
      const world = new THREE.Matrix4()
        .makeTranslation(c.x + placement.x, c.y + lift, c.z + depth)
        .multiply(turn)
        .multiply(new THREE.Matrix4().makeTranslation(-c.x, -c.y, -c.z));
      fromScene.clone().multiply(world).multiply(toScene).decompose(pivot.position, pivot.quaternion, new THREE.Vector3());
    };
    pose(0, 0);
    const turned = bounds(pivot).min.y;
    const lift = (Number.isFinite(ground) && Number.isFinite(turned) ? ground - turned : 0) + placement.y;
    pose(lift, 0);
    // The line runs through the panel the piece stands on, which folding never
    // moves: through the whole piece, the line shifted as walls and flaps rose.
    const base = bounds(pivot, index);
    const depth = base.isEmpty() ? 0 : (base.min.z + base.max.z) / 2;
    return [{ pose, lift, depth, extra: placement.z, panels: rigPanelsUnder(rig, index) }];
  });

  // Front to back, every piece on the main piece's centre line.
  const main = [...placed].sort((a, b) => b.panels - a.panels)[0];
  for (const piece of placed) piece.pose(piece.lift, (placed.length > 1 && main ? main.depth - piece.depth : 0) + piece.extra);
  scene.group.updateMatrixWorld(true);
};

/** How many panels hang from a still panel, itself included. */
const rigPanelsUnder = (rig: FoldRig, root: number) =>
  rig.nodes.filter((node, i) => {
    if (node.isHole) return false;
    let k = i;
    for (let guard = 0; rig.nodes[k]!.parent !== null && guard < rig.nodes.length; guard++) k = rig.nodes[k]!.parent!;
    return k === root;
  }).length;

/**
 * Applies the fold amount to every pivot. Panels fold in stages (see
 * `foldSchedule`): body panels one by one, then bottom and top flaps.
 *
 * `progress` runs 0 (flat sheet) to 1 (fully closed). Each node rotates about its
 * own hinge axis — which lies *in* the flat plane — so the panel tilts out of
 * plane. Rotating about Z instead would spin the panel flat, like a lazy Susan.
 */
export const applyFold = (
  scene: RigScene,
  rig: FoldRig,
  progress: number,
) => {
  const clamped = Math.max(0, Math.min(1, progress));
  const schedule = scheduleOf(rig);

  rig.nodes.forEach((node, index) => {
    const pivot = scene.pivots[index];
    if (!pivot || node.parent === null) return;

    // Hinge direction in world space. The flip makes a positive SVG rotation
    // read as clockwise in world space, which the existing `sign` already
    // accounts for — so the axis is mirrored but the sign is kept.
    const axis = new THREE.Vector3(node.axis[0], -node.axis[1], 0);
    if (axis.lengthSq() < 1e-12) return;
    axis.normalize();

    const window = schedule[index] ?? { start: 0, end: 1 };
    pivot.quaternion.setFromAxisAngle(axis, node.sign * foldAngle(window, node.angle, clamped));

    // A layered flap slides along its parent panel, towards the inside of the box.
    if (window.press?.layer) {
      const parent = rig.nodes[node.parent]!.face.centroid;
      const inward = new THREE.Vector3(parent[0] - node.pivot[0], node.pivot[1] - parent[1], 0);
      inward.addScaledVector(axis, -inward.dot(axis)).normalize();
      const slide = window.press.layer * scene.thickness * stageProgress(window.press, clamped);
      pivot.position.copy(scene.rest[index]!).addScaledVector(inward, slide);
    }
  });

  for (const { mesh, from } of scene.caps) mesh.visible = clamped >= from - 1e-9;
  for (const bend of scene.bends) shapeBend(scene, bend, rig);

  scene.group.updateMatrixWorld(true);
};

/**
 * Reshapes one fold's strip to the child's current rotation. In the parent's
 * frame the strip's middle line is a quadratic curve from the parent's trimmed
 * edge, through the crease, to the child's trimmed edge: it leaves each panel
 * along that panel's surface, so the sheet has no corner, only a bend. The two
 * faces sit half a board either side of it.
 */
const shapeBend = (scene: RigScene, bend: Bend, rig: FoldRig) => {
  const pivot = scene.pivots[bend.index];
  const rest = scene.rest[bend.index];
  if (!pivot || !rest) return;
  const position = bend.mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
  const uv = bend.mesh.geometry.getAttribute("uv") as THREE.BufferAttribute;
  const normals = bend.mesh.geometry.getAttribute("normal") as THREE.BufferAttribute;
  // A little past where the panels stop, so the strip overlaps them: the panels'
  // trimmed edges have points the strip has not (at each slot), and edges that
  // only meet would open hairline cracks at a low angle.
  const reach = bendWidth(scene.thickness) / 2 + BEND_OVERLAP;
  const half = scene.thickness / 2;
  const width = Math.max(rig.bounds.width, 1e-3);
  const height = Math.max(rig.bounds.height, 1e-3);

  const towardChild = bend.towardParent.clone().negate().applyQuaternion(pivot.quaternion);
  // The board's +Z side when flat, so the faces keep their sides as it bends.
  const flip = new THREE.Vector3().crossVectors(bend.along, bend.towardParent.clone().negate()).z < 0 ? -1 : 1;
  const p0 = new THREE.Vector3();
  const p1 = new THREE.Vector3();
  const p2 = new THREE.Vector3();
  const d0 = new THREE.Vector3();
  const d1 = new THREE.Vector3();
  const point = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const normal = new THREE.Vector3();

  for (let step = 0; step <= BEND_STEPS; step++) {
    const s = step / BEND_STEPS;
    for (const end of [0, 1]) {
      const offset = bend.start + end * bend.length;
      // The crease moves with the child's pivot (a layered ear slides).
      p1.copy(pivot.position).addScaledVector(bend.along, offset);
      p0.copy(rest).addScaledVector(bend.along, offset).addScaledVector(bend.towardParent, reach);
      p2.copy(p1).addScaledVector(towardChild, reach);

      // B(s) = (1-s)^2 p0 + 2s(1-s) p1 + s^2 p2, and its direction.
      point.set(0, 0, 0).addScaledVector(p0, (1 - s) ** 2).addScaledVector(p1, 2 * s * (1 - s)).addScaledVector(p2, s * s);
      d0.subVectors(p1, p0);
      d1.subVectors(p2, p1);
      tangent.set(0, 0, 0).addScaledVector(d0, 1 - s).addScaledVector(d1, s);
      if (tangent.lengthSq() < 1e-12) tangent.copy(bend.towardParent).negate();
      normal.crossVectors(bend.along, tangent).normalize().multiplyScalar(flip);

      // Texture: where this point lies on the flat sheet.
      const fx = bend.flatStart.x + bend.along.x * offset + bend.towardParent.x * reach * (1 - 2 * s);
      const fy = bend.flatStart.y + bend.along.y * offset + bend.towardParent.y * reach * (1 - 2 * s);

      for (const face of [0, 1]) {
        const i = bendVertex(step, end, face);
        const z = face === 0 ? half : -half;
        const sign = face === 0 ? 1 : -1;
        const x = point.x + normal.x * z;
        const y = point.y + normal.y * z;
        const w = point.z + normal.z * z;
        // The faces' normals come straight from the curve, so they match the
        // panels' exactly where the strip meets them.
        position.setXYZ(i, x, y, w);
        normals.setXYZ(i, normal.x * sign, normal.y * sign, normal.z * sign);
        uv.setXY(i, (fx + width / 2) / width, (fy + height / 2) / height);
        // The cut end faces out along the crease.
        const endSign = end === 0 ? -1 : 1;
        position.setXYZ(BEND_GRID + i, x, y, w);
        normals.setXYZ(BEND_GRID + i, bend.along.x * endSign, bend.along.y * endSign, bend.along.z * endSign);
        uv.setXY(BEND_GRID + i, (fx + width / 2) / width, (fy + height / 2) / height);
      }
    }
  }
  position.needsUpdate = true;
  normals.needsUpdate = true;
  uv.needsUpdate = true;
  bend.mesh.geometry.computeBoundingSphere();
};

/**
 * Maps an artwork texture onto every panel, or clears it when given `null`.
 *
 * Applied imperatively rather than baked into `buildRigScene`, so swapping the
 * image never rebuilds geometry or resets the fold pose. While artwork is present
 * the base colour goes white, otherwise the texture would be tinted by the board
 * colour; clearing restores the stock colour.
 */
export const applyArtwork = (
  scene: RigScene,
  map: THREE.Texture | null,
): void => {
  scene.group.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;

    const material = mesh.material as THREE.MeshStandardMaterial;
    if (!material) return;

    // Artwork is printed over the board; the flutes still show through it.
    material.map = map ?? scene.board?.map ?? null;
    material.color.set(material.map ? "#ffffff" : scene.style.color);
    material.needsUpdate = true;
  });
};

/** Edge overlay so cut and crease lines stay readable on the folded model. */
export const buildEdgeLines = (
  rig: FoldRig,
  thickness: number,
  style: MaterialStyle,
): THREE.Group => {
  const group = new THREE.Group();

  const center: Pt = [
    (rig.bounds.min[0] + rig.bounds.max[0]) / 2,
    (rig.bounds.min[1] + rig.bounds.max[1]) / 2,
  ];

  const edgesMaterial = new THREE.LineBasicMaterial({
    color: style.edge,
    transparent: true,
    opacity: 0.5,
  });

  rig.nodes.forEach((node) => {
    const points = node.face.outline.map((p) => {
      const world = toWorld(p, center);
      return new THREE.Vector3(world.x, world.y, thickness + 0.01);
    });

    if (points.length < 2) return;
    points.push(points[0]!.clone());

    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      edgesMaterial,
    );
    group.add(line);
  });

  return group;
};
