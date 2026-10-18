import * as THREE from "three";
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
  roughness: 0.72,
  label: "مقوای سفید",
};

const KRAFT_BOARD: MaterialStyle = {
  color: "#c8a273",
  edge: "#a98454",
  roughness: 0.88,
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
  size: THREE.Vector3;
  style: MaterialStyle;
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
): THREE.BufferGeometry | null => {
  const toPoints = (pts: Pt[]) => pts.map((p) => toWorld(p, center));

  const contour = toPoints(outline);
  if (contour.length < 3) return null;

  const holePoints = holes
    .map(toPoints)
    .filter((ring) => ring.length >= 3);

  /* ------------------------------ triangulate ------------------------------ */
  // earcut wants the contour counter-clockwise and holes clockwise.
  const contourCcw =
    signedArea(outline) < 0 ? [...contour].reverse() : contour;
  const holesCw = holePoints.map((ring, index) => {
    const source = holes[index]!;
    return signedArea(source) > 0 ? [...ring].reverse() : ring;
  });

  let triangles: number[][];

  try {
    triangles = THREE.ShapeUtils.triangulateShape(contourCcw, holesCw);
  } catch {
    // Degenerate or self-intersecting outline: skip this panel rather than
    // taking the whole viewer down.
    return null;
  }

  if (triangles.length === 0) return null;

  /* ------------------------------- vertices ------------------------------- */
  const allPoints = [...contourCcw, ...holesCw.flat()];

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
      if (t < 0 || t > 1) return false;

      const cross = Math.abs(px * dy - py * dx) / Math.sqrt(lengthSq);
      return cross < 0.08;
    });
  };

  const pushWall = (a: THREE.Vector2, b: THREE.Vector2) => {
    // Two triangles per edge, wound so the normal points outward.
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy);
    if (length < 1e-6) return;

    const nx = dy / length;
    const ny = -dx / length;

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

  // Outer boundary edges, skipping creases.
  for (let i = 0; i < contour.length; i++) {
    const a = outline[i]!;
    const b = outline[(i + 1) % outline.length]!;
    if (isHingeEdge(a, b)) continue;

    pushWall(contourCcw[i]!, contourCcw[(i + 1) % contourCcw.length]!);
  }

  // Window edges always get a wall: a cut-out has an exposed inner edge.
  holesCw.forEach((points) => {
    for (let i = 0; i < points.length; i++) {
      pushWall(points[i]!, points[(i + 1) % points.length]!);
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

export const buildRigScene = ({
  rig,
  material,
  thickness,
}: {
  rig: FoldRig;
  material: string;
  /** Board thickness in mm, taken from the selected material or custom value. */
  thickness: number;
}): RigScene => {
  const style = materialStyleFor(material);

  const center: Pt = [
    (rig.bounds.min[0] + rig.bounds.max[0]) / 2,
    (rig.bounds.min[1] + rig.bounds.max[1]) / 2,
  ];

  const root = new THREE.Group();
  const pivots: THREE.Group[] = new Array(rig.nodes.length);

  // Guard against a non-positive thickness producing invisible panels.
  const safeThickness = Math.max(thickness, 0.1);

  /* --------------------------- create pivot groups -------------------------- */
  rig.nodes.forEach((node, index) => {
    const pivot = new THREE.Group();

    if (node.parent === null) {
      // Root panel keeps the world origin; it never rotates.
      pivot.position.set(0, 0, 0);
      root.add(pivot);
    } else {
      const parentIndex = node.parent;
      const parentPivot = pivots[parentIndex];

      const hingeWorld = toWorld(node.pivot, center);
      // Pivot at the hinge, in the parent's local space.
      pivot.position.set(hingeWorld.x, hingeWorld.y, 0);

      if (parentPivot) parentPivot.add(pivot);
      else root.add(pivot);
    }

    pivots[index] = pivot;
  });

  /* ----------------------------- create panels ----------------------------- */
  /**
   * Crease lines, so a panel can leave its crease edges open and stay welded to
   * its neighbours. Derived from the rig: each non-root node's pivot and axis is
   * the hinge it rotates about.
   */
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

    const geometry = buildPanelGeometry(
      node.face.outline,
      node.holes,
      center,
      safeThickness,
      rig.bounds,
      hingeSegments,
    );
    if (!geometry) return;

    // Shift the panel so its hinge sits at the pivot's origin. The outline is in
    // world coordinates, and the pivot is already at the hinge, so offset by the
    // negated hinge position.
    const hingeWorld =
      node.parent === null
        ? new THREE.Vector2(0, 0)
        : toWorld(node.pivot, center);
    geometry.translate(-hingeWorld.x, -hingeWorld.y, 0);

    const materialInstance = new THREE.MeshStandardMaterial({
      color: style.color,
      roughness: style.roughness,
      metalness: 0.02,
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

    const pivotLocal = (p: Pt, node: RigNode): THREE.Vector3 => {
      const world = toWorld(p, center);
      const hinge =
        node.parent === null
          ? new THREE.Vector2(0, 0)
          : toWorld(node.pivot, center);

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

      const node = rig.nodes[index]!;
      const pivot = pivots[index];
      if (!pivot) continue;

      const a = pivotLocal(segment.a, node);
      const b = pivotLocal(segment.b, node);

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

  return { group: root, pivots, size, style };
};

/**
 * Applies the fold amount to every pivot.
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

  rig.nodes.forEach((node, index) => {
    const pivot = scene.pivots[index];
    if (!pivot || node.parent === null) return;

    // Hinge direction in world space. The flip makes a positive SVG rotation
    // read as clockwise in world space, which the existing `sign` already
    // accounts for — so the axis is mirrored but the sign is kept.
    const axis = new THREE.Vector3(node.axis[0], -node.axis[1], 0);
    if (axis.lengthSq() < 1e-12) return;
    axis.normalize();

    pivot.quaternion.setFromAxisAngle(axis, node.sign * node.angle * clamped);
  });

  scene.group.updateMatrixWorld(true);
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

    material.map = map;
    material.color.set(map ? "#ffffff" : scene.style.color);
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
