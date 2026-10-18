import * as THREE from "three";
import { buildFoldRig } from "./foldRig";
import { applyFold, buildRigScene, materialStyleFor } from "./build";
import type { Segment } from "./types";

let failures = 0;
const assert = (label: string, ok: boolean, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label}${detail ? ` | ${detail}` : ""}`);
};

const check = (label: string, actual: unknown, expected: unknown) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(
    `${ok ? "PASS" : "FAIL"} | ${label} | got=${JSON.stringify(actual)}${ok ? "" : ` want=${JSON.stringify(expected)}`}`,
  );
};

const strip: Segment[] = [
  { a: [0, 0], b: [30, 0], kind: "trim" },
  { a: [30, 0], b: [30, 10], kind: "trim" },
  { a: [30, 10], b: [0, 10], kind: "trim" },
  { a: [0, 10], b: [0, 0], kind: "trim" },
  { a: [10, 0], b: [10, 10], kind: "fold" },
  { a: [20, 0], b: [20, 10], kind: "fold" },
];

const rig = buildFoldRig(strip);
console.log(
  `strip rig: faces=${rig.stats.faceCount} hinges=${rig.stats.hingeCount} root=${rig.rootId}`,
);

/** Flat (SVG, y-down) point in the centred world frame used by buildRigScene. */
const center: [number, number] = [
  (rig.bounds.min[0] + rig.bounds.max[0]) / 2,
  (rig.bounds.min[1] + rig.bounds.max[1]) / 2,
];
const toWorld = (p: [number, number]) =>
  new THREE.Vector3(p[0] - center[0], -(p[1] - center[1]), 0);

/** Farthest outline point from a node's hinge — the best probe of rotation. */
const farthestFromHinge = (index: number) => {
  const node = rig.nodes[index]!;
  return node.face.outline.reduce((best, p) => {
    const d = Math.hypot(p[0] - node.pivot[0], p[1] - node.pivot[1]);
    const bd = Math.hypot(best[0] - node.pivot[0], best[1] - node.pivot[1]);
    return d > bd ? p : best;
  }, node.face.outline[0]!);
};

/* -------------------------------------------------------------------------- */
/* 1. U-fold: both outer panels must end up on the same side of the base      */
/* -------------------------------------------------------------------------- */
{
  const scene = buildRigScene({ rig, material: "glossyCardboard", thickness: 0.5 });
  applyFold(scene, rig, 1);
  scene.group.updateMatrixWorld(true);

  const childIndexes = rig.nodes
    .map((n, i) => ({ n, i }))
    .filter(({ n }) => n.parent !== null)
    .map(({ i }) => i);

  assert("strip has two child panels", childIndexes.length === 2);

  const probe = (index: number) => {
    const node = rig.nodes[index]!;
    const pivot = scene.pivots[index]!;
    const far = farthestFromHinge(index);

    // The panel geometry lives in the pivot's local space with the hinge at the
    // origin, so the local offset is (world point - hinge world point).
    const hingeWorld = toWorld(node.pivot);
    const local = toWorld(far).sub(hingeWorld);

    return pivot.localToWorld(local.clone());
  };

  const points = childIndexes.map(probe);
  const zs = points.map((p) => p.z);

  assert(
    "both outer panels fold to the same side (U-fold)",
    Math.sign(zs[0]!) === Math.sign(zs[1]!),
    `z=${JSON.stringify(zs.map((z) => +z.toFixed(2)))}`,
  );

  assert(
    "fold lifts a panel by its own width (10mm)",
    zs.every((z) => Math.abs(Math.abs(z) - 10) < 0.5),
    `lifts=${JSON.stringify(zs.map((z) => +Math.abs(z).toFixed(2)))}`,
  );
}

/* -------------------------------------------------------------------------- */
/* 2. Flat state leaves every pivot unrotated                                 */
/* -------------------------------------------------------------------------- */
{
  const scene = buildRigScene({ rig, material: "glossyCardboard", thickness: 0.5 });
  applyFold(scene, rig, 0);

  const maxRotation = Math.max(
    ...scene.pivots.map((p) => 2 * Math.acos(Math.min(1, Math.abs(p.quaternion.w)))),
  );

  assert("flat state has no rotation", maxRotation < 1e-6, `max=${maxRotation}`);
}

/* -------------------------------------------------------------------------- */
/* 3. Progress is clamped, so an out-of-range slider cannot invert the model  */
/* -------------------------------------------------------------------------- */
{
  const angleOf = (scene: ReturnType<typeof buildRigScene>, index: number) =>
    2 * Math.acos(Math.min(1, Math.abs(scene.pivots[index]!.quaternion.w)));

  const scene = buildRigScene({ rig, material: "glossyCardboard", thickness: 0.5 });

  applyFold(scene, rig, 5);
  const atOne = rig.nodes.map((_, i) => angleOf(scene, i));

  applyFold(scene, rig, -3);
  const atZero = rig.nodes.map((_, i) => angleOf(scene, i));

  assert(
    "progress clamps to 0",
    atZero.every((a) => Math.abs(a) < 1e-6),
  );
  assert(
    "progress clamps to 1 (90 degrees)",
    atOne.some((a) => Math.abs(a - Math.PI / 2) < 1e-6),
    `angles=${JSON.stringify(atOne.map((a) => +a.toFixed(3)))}`,
  );
}

/* -------------------------------------------------------------------------- */
/* 4. Thickness drives the extrusion depth (custom thickness must be honoured) */
/* -------------------------------------------------------------------------- */
{
  const thin = buildRigScene({ rig, material: "bFlute", thickness: 1.1 });
  const thick = buildRigScene({ rig, material: "bFlute", thickness: 3.4 });

  assert(
    "thicker board produces a larger model",
    thick.size.z > thin.size.z,
    `thin=${thin.size.z.toFixed(2)} thick=${thick.size.z.toFixed(2)}`,
  );

  // A non-positive thickness must not collapse the panels to nothing.
  const zero = buildRigScene({ rig, material: "artPaper", thickness: 0 });
  assert(
    "zero thickness falls back to a visible minimum",
    zero.size.z > 0.05,
    `z=${zero.size.z.toFixed(3)}`,
  );
}

/* -------------------------------------------------------------------------- */
/* 5. Material colour mapping                                                 */
/* -------------------------------------------------------------------------- */
{
  assert(
    "glossyCardboard renders white",
    materialStyleFor("glossyCardboard").label === "مقوای سفید",
  );
  assert(
    "artPaper renders white",
    materialStyleFor("artPaper").label === "مقوای سفید",
  );
  assert(
    "bFlute renders kraft",
    materialStyleFor("bFlute").label === "مقوای کارتنی",
  );
  assert(
    "eFlute renders kraft",
    materialStyleFor("eFlute").label === "مقوای کارتنی",
  );
  assert(
    "fFlute renders kraft",
    materialStyleFor("fFlute").label === "مقوای کارتنی",
  );
}

/* -------------------------------------------------------------------------- */
/* 6. A dieline with no creases still builds a drawable flat model            */
/* -------------------------------------------------------------------------- */
{
  // A business card: geometry worth showing, nothing to fold.
  const card: Segment[] = [
    { a: [0, 0], b: [90, 0], kind: "trim" },
    { a: [90, 0], b: [90, 55], kind: "trim" },
    { a: [90, 55], b: [0, 55], kind: "trim" },
    { a: [0, 55], b: [0, 0], kind: "trim" },
  ];

  const rig = buildFoldRig(card);
  check("business card is one panel", rig.stats.faceCount, 1);
  check("business card has no hinges", rig.stats.hingeCount, 0);

  const scene = buildRigScene({ rig, material: "artPaper", thickness: 0.6 });
  const meshes = scene.pivots.flatMap((pivot) =>
    pivot.children.filter((child) => (child as THREE.Mesh).isMesh),
  );

  assert("flat model has a panel mesh", meshes.length === 1);
  assert(
    "flat model has the card's real size",
    Math.round(scene.size.x) === 90 && Math.round(scene.size.y) === 55,
    `${scene.size.x.toFixed(1)} x ${scene.size.y.toFixed(1)}`,
  );

  // Folding must be a harmless no-op, not a crash.
  applyFold(scene, rig, 1);
  const rotated = scene.pivots.some(
    (pivot) => Math.abs(2 * Math.acos(Math.min(1, Math.abs(pivot.quaternion.w)))) > 1e-6,
  );
  assert("folding a crease-less dieline does nothing", !rotated);
}

/* -------------------------------------------------------------------------- */
/* 7. Perforations are drawn as a pressed groove, parented to their panel     */
/* -------------------------------------------------------------------------- */
{
  const withPerf: Segment[] = [
    { a: [0, 0], b: [100, 0], kind: "trim" },
    { a: [100, 0], b: [100, 50], kind: "trim" },
    { a: [100, 50], b: [0, 50], kind: "trim" },
    { a: [0, 50], b: [0, 0], kind: "trim" },
    { a: [60, 0], b: [60, 50], kind: "perf" },
  ];

  const rig = buildFoldRig(withPerf);
  check("perf keeps it one panel", rig.stats.faceCount, 1);
  check("perf recorded", rig.perforations.length, 1);

  const scene = buildRigScene({ rig, material: "glossyCardboard", thickness: 0.5 });
  const pivot = scene.pivots[0]!;
  const lines = pivot.children.filter(
    (child) => (child as THREE.Line).isLine,
  );

  // Two hairlines per perforation: the groove plus its lit edge.
  assert(
    "perforation renders as a pressed groove (2 hairlines)",
    lines.length === 2,
    `found ${lines.length}`,
  );

  // A perforation on a boundary has no clear owner and must be skipped safely.
  const boundaryPerf: Segment[] = [
    ...withPerf.slice(0, 4),
    { a: [0, 0], b: [100, 0], kind: "perf" },
  ];
  const boundaryRig = buildFoldRig(boundaryPerf);
  const boundaryScene = buildRigScene({
    rig: boundaryRig,
    material: "glossyCardboard",
    thickness: 0.5,
  });
  assert(
    "boundary perforation does not crash the scene",
    boundaryScene.pivots.length > 0,
  );
}

/* -------------------------------------------------------------------------- */
/* 8. Panels are welded at creases, not separate solids                      */
/* -------------------------------------------------------------------------- */
{
  /*
   * A strip of three panels. Extruding each panel independently would put a wall
   * on every crease — the "two blocks stuck together" look. Instead crease edges
   * must be left open, so the walls exist only around the outside of the sheet.
   */
  const segments: Segment[] = [
    { a: [0, 0], b: [30, 0], kind: "trim" },
    { a: [30, 0], b: [30, 10], kind: "trim" },
    { a: [30, 10], b: [0, 10], kind: "trim" },
    { a: [0, 10], b: [0, 0], kind: "trim" },
    { a: [10, 0], b: [10, 10], kind: "fold" },
    { a: [20, 0], b: [20, 10], kind: "fold" },
  ];

  const rig = buildFoldRig(segments);
  const scene = buildRigScene({ rig, material: "glossyCardboard", thickness: 1 });

  /** Number of wall triangles: two per boundary edge, normal.z === 0. */
  const wallTriangles = (index: number) => {
    const mesh = scene.pivots[index]!.children.find(
      (child) => (child as THREE.Mesh).isMesh,
    ) as THREE.Mesh;

    const normals = mesh.geometry.getAttribute("normal");
    let count = 0;
    for (let i = 0; i < normals.count; i += 3) {
      // Vertices are emitted in triangles of three, so sampling the first of
      // each group counts triangles.
      if (Math.abs(normals.getZ(i)) < 1e-6) count++;
    }
    return count;
  };

  // Each panel is 10x10. Walls are two triangles per boundary edge:
  // the outer panels have 3 boundary edges (one side is a crease),
  // the middle has 2 (both sides are creases).
  check("left panel walls (3 edges)", wallTriangles(0), 6);
  check("middle panel walls (2 edges)", wallTriangles(1), 4);
  check("right panel walls (3 edges)", wallTriangles(2), 6);

  // Flat, the panels must still span the whole 30mm without gaps.
  assert(
    "flat sheet is continuous",
    Math.round(scene.size.x) === 30 && Math.round(scene.size.y) === 10,
    `${scene.size.x.toFixed(1)} x ${scene.size.y.toFixed(1)}`,
  );
}

/* -------------------------------------------------------------------------- */
/* 9. A trim loop inside a panel is a window, not a panel                    */
/* -------------------------------------------------------------------------- */
{
  // 100x60 card with a 40x20 rectangular window in the middle.
  const segments: Segment[] = [
    { a: [0, 0], b: [100, 0], kind: "trim" },
    { a: [100, 0], b: [100, 60], kind: "trim" },
    { a: [100, 60], b: [0, 60], kind: "trim" },
    { a: [0, 60], b: [0, 0], kind: "trim" },
    { a: [30, 20], b: [70, 20], kind: "trim" },
    { a: [70, 20], b: [70, 40], kind: "trim" },
    { a: [70, 40], b: [30, 40], kind: "trim" },
    { a: [30, 40], b: [30, 20], kind: "trim" },
  ];

  const rig = buildFoldRig(segments);

  check("window is not counted as a panel", rig.stats.faceCount, 1);

  const panel = rig.nodes.find((node) => !node.isHole)!;
  const window = rig.nodes.find((node) => node.isHole)!;

  assert("window face is marked as a hole", Boolean(window));
  check("panel owns one hole", panel.holes.length, 1);
  assert(
    "hole outline matches the window",
    panel.holes[0]!.length === 4,
    `edges=${panel.holes[0]?.length}`,
  );

  // The geometry must actually have a hole: the window's own area is missing.
  const scene = buildRigScene({ rig, material: "glossyCardboard", thickness: 0.5 });
  const meshes = scene.pivots.flatMap((pivot) =>
    pivot.children.filter((child) => (child as THREE.Mesh).isMesh),
  );

  assert("only the panel gets a mesh", meshes.length === 1);

  // Windows must still stay in `nodes` so fold override indices do not shift.
  check("hole stays in nodes for index stability", rig.nodes.length, 2);
}

console.log(failures === 0 ? "\nALL 3D BUILD CHECKS PASSED" : `\n${failures} FAILED`);
