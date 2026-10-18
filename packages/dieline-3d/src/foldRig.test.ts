import { buildFoldRig } from "./foldRig";
import type { Pt, Segment } from "./types";

let failures = 0;
const check = (label: string, actual: unknown, expected: unknown) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(
    `${ok ? "PASS" : "FAIL"} | ${label} | got=${JSON.stringify(actual)}${ok ? "" : ` want=${JSON.stringify(expected)}`}`,
  );
};
const assert = (label: string, ok: boolean, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label}${detail ? ` | ${detail}` : ""}`);
};

/** Rotates `p` about `pivot` by `angle` around the Z axis (flat -> 3D). */
const rotateZ = (p: Pt, pivot: Pt, angle: number): Pt => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const x = p[0] - pivot[0];
  const y = p[1] - pivot[1];
  return [pivot[0] + x * c - y * s, pivot[1] + x * s + y * c];
};

/* -------------------------------------------------------------------------- */
/* 1. Three-panel strip: root in the middle by area tie, flat tree           */
/* -------------------------------------------------------------------------- */
{
  const segments: Segment[] = [
    { a: [0, 0], b: [30, 0], kind: "trim" },
    { a: [30, 0], b: [30, 10], kind: "trim" },
    { a: [30, 10], b: [0, 10], kind: "trim" },
    { a: [0, 10], b: [0, 0], kind: "trim" },
    { a: [10, 0], b: [10, 10], kind: "fold" },
    { a: [20, 0], b: [20, 10], kind: "fold" },
  ];

  const rig = buildFoldRig(segments);

  check("strip faceCount", rig.stats.faceCount, 3);
  check("strip hingeCount", rig.stats.hingeCount, 2);
  check("strip orphanCount", rig.stats.orphanCount, 0);
  check("strip not degenerate", rig.stats.degenerate, false);
  check("strip bounds", [rig.bounds.width, rig.bounds.height], [30, 10]);

  // Exactly one root, and it has no parent.
  const roots = rig.nodes.filter((n) => n.parent === null);
  check("strip single root", roots.length, 1);

  // Every non-root node must be reachable and have a real hinge axis.
  const childNodes = rig.nodes.filter((n) => n.parent !== null);
  check("strip child count", childNodes.length, 2);

  childNodes.forEach((node, i) => {
    const axisLength = Math.hypot(node.axis[0], node.axis[1]);
    assert(
      `strip child ${i} has a hinge axis`,
      axisLength > 1,
      `|axis|=${axisLength.toFixed(2)} sign=${node.sign} depth=${node.depth}`,
    );
    assert(
      `strip child ${i} folds 90deg`,
      Math.abs(node.angle - Math.PI / 2) < 1e-9,
    );
  });

  // A strip folds into a U: both children should lift to the SAME side of the
  // parent, because both creases have the same orientation.
  const zSigns = childNodes.map((node) => {
    // Signed lift of the child centroid about its own hinge.
    const axis = node.axis;
    const toChild: Pt = [
      node.face.centroid[0] - node.pivot[0],
      node.face.centroid[1] - node.pivot[1],
    ];
    const crossZ = axis[0] * toChild[1] - axis[1] * toChild[0];
    return Math.sign(-node.sign * crossZ);
  });

  assert(
    "strip children lift to the same side (U-fold)",
    zSigns[0] === zSigns[1],
    `signs=${JSON.stringify(zSigns)}`,
  );

  // Both panels adjacent to the middle must be depth 1.
  check(
    "strip depths are 0 and 1",
    rig.nodes.map((n) => n.depth).sort(),
    [0, 1, 1],
  );
}

/* -------------------------------------------------------------------------- */
/* 2. Rotating a child must be a rigid motion (area preserved)               */
/* -------------------------------------------------------------------------- */
{
  const segments: Segment[] = [
    { a: [0, 0], b: [20, 0], kind: "trim" },
    { a: [20, 0], b: [20, 10], kind: "trim" },
    { a: [20, 10], b: [0, 10], kind: "trim" },
    { a: [0, 10], b: [0, 0], kind: "trim" },
    { a: [10, 0], b: [10, 10], kind: "fold" },
  ];

  const rig = buildFoldRig(segments);
  const child = rig.nodes.find((n) => n.parent !== null)!;

  const originalArea = child.face.area;
  const rotated = child.face.outline.map((p) =>
    rotateZ(p, child.pivot, child.sign * child.angle),
  );

  let area = 0;
  for (let i = 0; i < rotated.length; i++) {
    const p = rotated[i]!;
    const q = rotated[(i + 1) % rotated.length]!;
    area += p[0] * q[1] - q[0] * p[1];
  }
  area = Math.abs(area / 2);

  assert(
    "rigid fold preserves panel area",
    Math.abs(area - originalArea) < 0.5,
    `before=${originalArea.toFixed(2)} after=${area.toFixed(2)}`,
  );
}

/* -------------------------------------------------------------------------- */
/* 3. Perforations never split a panel and never become a hinge               */
/* -------------------------------------------------------------------------- */
{
  const segments: Segment[] = [
    { a: [0, 0], b: [20, 0], kind: "trim" },
    { a: [20, 0], b: [20, 10], kind: "trim" },
    { a: [20, 10], b: [0, 10], kind: "trim" },
    { a: [0, 10], b: [0, 0], kind: "trim" },
    { a: [10, 0], b: [10, 10], kind: "perf" },
  ];

  const rig = buildFoldRig(segments);

  // A perforation is a weakness line, not a crease: the sheet stays one panel.
  check("perf does not split the panel", rig.stats.faceCount, 1);
  check("perf creates no hinge", rig.stats.hingeCount, 0);
  check("perf is recorded for display", rig.perforations.length, 1);
  check(
    "perf geometry is preserved",
    [rig.perforations[0]!.a, rig.perforations[0]!.b],
    [
      [10, 0],
      [10, 10],
    ],
  );
}

/* -------------------------------------------------------------------------- */
/* 3b. A crease plus a perforation: only the crease folds                    */
/* -------------------------------------------------------------------------- */
{
  const segments: Segment[] = [
    { a: [0, 0], b: [30, 0], kind: "trim" },
    { a: [30, 0], b: [30, 10], kind: "trim" },
    { a: [30, 10], b: [0, 10], kind: "trim" },
    { a: [0, 10], b: [0, 0], kind: "trim" },
    { a: [20, 0], b: [20, 10], kind: "fold" },
    { a: [10, 0], b: [10, 10], kind: "perf" },
  ];

  const rig = buildFoldRig(segments);

  check("fold splits, perf does not", rig.stats.faceCount, 2);
  check("exactly one hinge", rig.stats.hingeCount, 1);
  check("hinge kind is fold", rig.nodes.find((n) => n.parent !== null)?.kind, "fold");
  check("perf still recorded", rig.perforations.length, 1);
}

/* -------------------------------------------------------------------------- */
/* 4. No fold lines at all -> flagged degenerate, no crash                   */
/* -------------------------------------------------------------------------- */
{
  const segments: Segment[] = [
    { a: [0, 0], b: [10, 0], kind: "trim" },
    { a: [10, 0], b: [10, 10], kind: "trim" },
    { a: [10, 10], b: [0, 10], kind: "trim" },
    { a: [0, 10], b: [0, 0], kind: "trim" },
  ];

  const rig = buildFoldRig(segments);
  check("solid square is one face", rig.stats.faceCount, 1);
  check("solid square has no hinges", rig.stats.hingeCount, 0);
  check("solid square flagged degenerate", rig.stats.degenerate, true);
  check("solid square still has a root", rig.nodes.length, 1);
}

/* -------------------------------------------------------------------------- */
/* 5. Empty input                                                        */
/* -------------------------------------------------------------------------- */
{
  const rig = buildFoldRig([]);
  check("empty rig has no nodes", rig.nodes.length, 0);
  check("empty rig is degenerate", rig.stats.degenerate, true);
}

console.log(failures === 0 ? "\nALL FOLD RIG CHECKS PASSED" : `\n${failures} FAILED`);
