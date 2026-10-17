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
 * Builds an extruded panel from a face outline.
 *
 * `three`'s `ExtrudeGeometry` extrudes along +Z, so the shape is built in the
 * flat plane and the extrusion becomes the board thickness.
 */
const buildPanelGeometry = (
  outline: Pt[],
  center: Pt,
  thickness: number,
): THREE.ExtrudeGeometry | null => {
  const points = outline.map((p) => toWorld(p, center));
  if (points.length < 3) return null;

  const shape = new THREE.Shape(points);

  try {
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: false,
      curveSegments: 4,
    });

    geometry.computeVertexNormals();
    geometry.computeBoundingBox();

    return geometry;
  } catch {
    // Self-intersecting or degenerate outlines throw inside earcut. Skip the
    // panel rather than taking the whole viewer down.
    return null;
  }
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
  rig.nodes.forEach((node, index) => {
    const pivot = pivots[index];
    if (!pivot) return;

    const geometry = buildPanelGeometry(
      node.face.outline,
      center,
      safeThickness,
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

    pivot.add(mesh);
  });

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
