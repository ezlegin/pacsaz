import * as THREE from "three";
import { buildFoldRig } from "./foldRig";
import { applyFold, buildRigScene, materialStyleFor } from "./build";
import type { Segment } from "./types";

let failures = 0;
const assert = (label: string, ok: boolean, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label}${detail ? ` | ${detail}` : ""}`);
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

console.log(failures === 0 ? "\nALL 3D BUILD CHECKS PASSED" : `\n${failures} FAILED`);
