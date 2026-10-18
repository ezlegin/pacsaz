import { buildFoldRig } from "./foldRig";
import {
  applyFoldOverrides,
  clampFoldAngle,
  DEFAULT_FOLD_ANGLE,
  emptyFoldConfig,
  foldConfigStatus,
  parseFoldConfig,
  radiansToDegrees,
  type FoldConfig,
} from "./foldConfig";
import type { Segment } from "./types";

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

/** The real postal-card export: 180x160 sheet, one centre crease. */
const segments: Segment[] = [
  { a: [35, 195], b: [215, 195], kind: "trim" },
  { a: [215, 195], b: [215, 35], kind: "trim" },
  { a: [215, 35], b: [35, 35], kind: "trim" },
  { a: [35, 35], b: [35, 195], kind: "trim" },
  { a: [125, 195], b: [125, 35], kind: "fold" },
];

/* -------------------------------------------------------------------------- */
/* 1. No config -> inference unchanged                                       */
/* -------------------------------------------------------------------------- */
const baseRig = buildFoldRig(segments);
{
  check("two panels", baseRig.stats.faceCount, 2);
  assert("base rig has one rotating panel", baseRig.nodes.filter((n) => n.parent !== null).length === 1);

  const inferred = baseRig.nodes.find((n) => n.parent !== null)!;
  assert(
    "inferred angle is 90 degrees",
    Math.abs(radiansToDegrees(inferred.angle) - 90) < 1e-6,
    `${radiansToDegrees(inferred.angle).toFixed(2)}`,
  );
}

/* -------------------------------------------------------------------------- */
/* 2. Empty / null config is a no-op                                         */
/* -------------------------------------------------------------------------- */
{
  const a = buildFoldRig(segments, null);
  const b = buildFoldRig(segments, emptyFoldConfig());

  check(
    "null config leaves signs alone",
    a.nodes.map((n) => n.sign),
    baseRig.nodes.map((n) => n.sign),
  );
  check(
    "empty config leaves signs alone",
    b.nodes.map((n) => n.sign),
    baseRig.nodes.map((n) => n.sign),
  );
}

/* -------------------------------------------------------------------------- */
/* 3. "out" flips the direction; "in" preserves it                           */
/* -------------------------------------------------------------------------- */
{
  const childIndex = baseRig.nodes.findIndex((n) => n.parent !== null);
  const child = baseRig.nodes[childIndex]!;

  const outConfig: FoldConfig = {
    version: 1,
    faceCount: 2,
    overrides: [
      {
        faceIndex: childIndex,
        direction: "out",
        angle: 90,
        vertexCount: child.face.outline.length,
      },
    ],
  };

  const outRig = buildFoldRig(segments, outConfig);
  const outChild = outRig.nodes[childIndex]!;

  check("out negates the inferred sign", outChild.sign, -child.sign);
  check("out marks the crease as a mountain", outChild.valley, false);

  const inConfig: FoldConfig = {
    version: 1,
    faceCount: 2,
    overrides: [
      {
        faceIndex: childIndex,
        direction: "in",
        angle: 90,
        vertexCount: child.face.outline.length,
      },
    ],
  };

  const inChild = buildFoldRig(segments, inConfig).nodes[childIndex]!;
  check("in preserves the inferred sign", inChild.sign, child.sign);
  check("in marks the crease as a valley", inChild.valley, true);
}

/* -------------------------------------------------------------------------- */
/* 4. Angle override is honoured and clamped                                 */
/* -------------------------------------------------------------------------- */
{
  const childIndex = baseRig.nodes.findIndex((n) => n.parent !== null);
  const child = baseRig.nodes[childIndex]!;

  const config = (angle: number): FoldConfig => ({
    version: 1,
    faceCount: 2,
    overrides: [
      {
        faceIndex: childIndex,
        direction: "in",
        angle,
        vertexCount: child.face.outline.length,
      },
    ],
  });

  const at180 = buildFoldRig(segments, config(180)).nodes[childIndex]!;
  assert(
    "180 degree override applied",
    Math.abs(radiansToDegrees(at180.angle) - 180) < 1e-6,
    `${radiansToDegrees(at180.angle).toFixed(2)}`,
  );

  const at45 = buildFoldRig(segments, config(45)).nodes[childIndex]!;
  assert(
    "45 degree override applied",
    Math.abs(radiansToDegrees(at45.angle) - 45) < 1e-6,
  );

  check("clamp above range", clampFoldAngle(999), 180);
  check("clamp below range", clampFoldAngle(-40), 0);
  check("clamp keeps NaN safe", clampFoldAngle(Number.NaN), DEFAULT_FOLD_ANGLE);
}

/* -------------------------------------------------------------------------- */
/* 5. The root panel is never rotated                                        */
/* -------------------------------------------------------------------------- */
{
  const rootIndex = baseRig.nodes.findIndex((n) => n.parent === null);

  const rig = buildFoldRig(segments, {
    version: 1,
    faceCount: 2,
    overrides: [{ faceIndex: rootIndex, direction: "out", angle: 170 }],
  });

  const root = rig.nodes[rootIndex]!;
  check("root keeps zero angle", root.angle, 0);
  check("root has no parent", root.parent, null);
}

/* -------------------------------------------------------------------------- */
/* 6. Stale overrides are skipped, not misapplied                            */
/* -------------------------------------------------------------------------- */
{
  const childIndex = baseRig.nodes.findIndex((n) => n.parent !== null);
  const child = baseRig.nodes[childIndex]!;

  // Pretend the template had a different panel shape when authored.
  const rig = buildFoldRig(segments, {
    version: 1,
    faceCount: 2,
    overrides: [
      {
        faceIndex: childIndex,
        direction: "out",
        angle: 30,
        vertexCount: child.face.outline.length + 3,
      },
    ],
  });

  const resulting = rig.nodes[childIndex]!;
  check("stale override does not flip", resulting.sign, child.sign);
  assert(
    "stale override does not change the angle",
    Math.abs(resulting.angle - child.angle) < 1e-9,
  );
}

/* -------------------------------------------------------------------------- */
/* 7. Out-of-range index is ignored                                         */
/* -------------------------------------------------------------------------- */
{
  const rig = buildFoldRig(segments, {
    version: 1,
    faceCount: 2,
    overrides: [{ faceIndex: 99, direction: "out", angle: 10 }],
  });

  check(
    "out-of-range override is harmless",
    rig.nodes.map((n) => n.sign),
    baseRig.nodes.map((n) => n.sign),
  );
}

/* -------------------------------------------------------------------------- */
/* 8. Status reporting for the editor                                        */
/* -------------------------------------------------------------------------- */
{
  const childIndex = baseRig.nodes.findIndex((n) => n.parent !== null);

  const none = foldConfigStatus(baseRig, null);
  check("no config -> nothing configured", none.configured, 0);

  const partial = foldConfigStatus(baseRig, {
    version: 1,
    faceCount: 2,
    overrides: [
      {
        faceIndex: childIndex,
        direction: "in",
        angle: 90,
        vertexCount: baseRig.nodes[childIndex]!.face.outline.length,
      },
    ],
  });
  check("one configured", partial.configured, 1);
  check("no stale", partial.stale, 0);
  check("face count unchanged", partial.faceCountChanged, false);

  const drifted = foldConfigStatus(baseRig, {
    version: 1,
    faceCount: 5,
    overrides: [
      { faceIndex: childIndex, direction: "in", angle: 90, vertexCount: 99 },
    ],
  });
  check("vertex mismatch counts as stale", drifted.stale, 1);
  check("face count change detected", drifted.faceCountChanged, true);
}

/* -------------------------------------------------------------------------- */
/* 9. Persistence round-trip is tolerant                                     */
/* -------------------------------------------------------------------------- */
{
  const config: FoldConfig = {
    version: 1,
    faceCount: 3,
    overrides: [
      { faceIndex: 1, direction: "out", angle: 120, vertexCount: 4 },
      { faceIndex: 2, direction: "in", angle: 90 },
    ],
  };

  const round = parseFoldConfig(JSON.stringify(config));
  check("round-trips overrides", round?.overrides.length, 2);
  check("round-trips faceCount", round?.faceCount, 3);
  check("round-trips direction", round?.overrides[0]?.direction, "out");

  check("null input", parseFoldConfig(null), null);
  check("empty string", parseFoldConfig(""), null);
  check("garbage JSON", parseFoldConfig("{not json"), null);
  check("wrong shape", parseFoldConfig('{"overrides":"nope"}'), null);

  // Unknown/invalid entries are dropped rather than throwing.
  const messy = parseFoldConfig(
    JSON.stringify({
      overrides: [
        { faceIndex: 1, direction: "sideways", angle: 90 },
        { faceIndex: 2, direction: "in", angle: 900 },
        { direction: "in", angle: 90 },
      ],
    }),
  );
  check("invalid direction dropped", messy?.overrides.length, 1);
  check("angle clamped on parse", messy?.overrides[0]?.angle, 180);
}

/* -------------------------------------------------------------------------- */
/* 10. applyFoldOverrides is pure                                           */
/* -------------------------------------------------------------------------- */
{
  const before = JSON.stringify(baseRig.nodes);
  applyFoldOverrides(baseRig.nodes, {
    version: 1,
    faceCount: 2,
    overrides: [{ faceIndex: 1, direction: "out", angle: 10 }],
  });
  check("input nodes are not mutated", JSON.stringify(baseRig.nodes), before);
}

console.log(failures === 0 ? "\nALL FOLD CONFIG CHECKS PASSED" : `\n${failures} FAILED`);
