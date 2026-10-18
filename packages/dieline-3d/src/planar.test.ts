import { buildPlanarFaces } from "./planar";
import { parsePathToPolylines, polylinesToSegments } from "./path";
import type { Segment, SegmentKind } from "./types";

let failures = 0;
const check = (label: string, actual: unknown, expected: unknown) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(
    `${ok ? "PASS" : "FAIL"} | ${label} | got=${JSON.stringify(actual)}${ok ? "" : ` want=${JSON.stringify(expected)}`}`,
  );
};

/* -------------------------------------------------------------------------- */
/* 1. Square divided down the middle: 2 faces, 1 internal edge               */
/* -------------------------------------------------------------------------- */
{
  const square: Segment[] = [
    { a: [0, 0], b: [10, 0], kind: "trim" },
    { a: [10, 0], b: [10, 10], kind: "trim" },
    { a: [10, 10], b: [0, 10], kind: "trim" },
    { a: [0, 10], b: [0, 0], kind: "trim" },
    { a: [5, 0], b: [5, 10], kind: "fold" },
  ];
  const { faces, edgeFaces } = buildPlanarFaces(square);
  check("square+divider face count", faces.length, 2);
  const interior = Array.from(edgeFaces.values()).filter((e) => e.b !== null);
  check("square+divider interior edges", interior.length, 1);
}

/* -------------------------------------------------------------------------- */
/* 2. Tuck-end style net: 3 panels in a row -> 3 faces                       */
/* -------------------------------------------------------------------------- */
{
  const segments: Segment[] = [];
  const add = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    kind: SegmentKind,
  ) => segments.push({ a: [x1, y1], b: [x2, y2], kind });

  // outline of a 30x10 strip
  add(0, 0, 30, 0, "trim");
  add(30, 0, 30, 10, "trim");
  add(30, 10, 0, 10, "trim");
  add(0, 10, 0, 0, "trim");
  // two folds splitting it into 3 panels
  add(10, 0, 10, 10, "fold");
  add(20, 0, 20, 10, "fold");

  const { faces, edgeFaces } = buildPlanarFaces(segments);
  check("strip face count", faces.length, 3);

  const areas = faces.map((f) => Math.round(f.area)).sort((a, b) => a - b);
  check("strip face areas", areas, [100, 100, 100]);

  const interior = Array.from(edgeFaces.values()).filter((e) => e.b !== null);
  check("strip interior hinges", interior.length, 2);
}

/* -------------------------------------------------------------------------- */
/* 3. Crossing lines must split: a plus sign creates 4 faces                 */
/* -------------------------------------------------------------------------- */
{
  const plus: Segment[] = [
    // outer square
    { a: [-5, -5], b: [5, -5], kind: "trim" },
    { a: [5, -5], b: [5, 5], kind: "trim" },
    { a: [5, 5], b: [-5, 5], kind: "trim" },
    { a: [-5, 5], b: [-5, -5], kind: "trim" },
    // internal cross
    { a: [0, -5], b: [0, 5], kind: "fold" },
    { a: [-5, 0], b: [5, 0], kind: "fold" },
  ];
  const { faces } = buildPlanarFaces(plus);
  check("cross face count", faces.length, 4);
}

/* -------------------------------------------------------------------------- */
/* 4. Path parsing: arcs flatten into real geometry                          */
/* -------------------------------------------------------------------------- */
{
  // Per the SVG spec, radii too small to span the endpoints are scaled up, so
  // `A5 5` between points 10 apart becomes r≈7.07 and the arc bulges past x=10.
  const lines = parsePathToPolylines("M0 0 L10 0 A5 5 0 0 1 10 10 Z");
  const segments = polylinesToSegments(lines, "trim");

  check("arc path produces segments", segments.length > 5, true);

  const total = segments.reduce(
    (sum, s) => sum + Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]),
    0,
  );
  // straight 10 + quarter-ish arc ≈ 11.1 + closing diagonal ≈ 14.14
  check("arc path length in range", total > 30 && total < 45, true);

  const maxX = Math.max(...lines[0]!.map((p) => p[0]));
  check("arc bulges past the endpoint as the spec requires", maxX > 14, true);
}

/* -------------------------------------------------------------------------- */
/* 4b. Curves flatten without exploding                                      */
/* -------------------------------------------------------------------------- */
{
  const lines = parsePathToPolylines("M0 0 C5 0 10 5 10 10 L0 10 Z");
  const segments = polylinesToSegments(lines, "trim");
  check("curve path parses", segments.length >= 14, true);
}

/* -------------------------------------------------------------------------- */
/* 5. Degenerate input must not hang or throw                                */
/* -------------------------------------------------------------------------- */
{
  const { faces } = buildPlanarFaces([]);
  check("empty input yields no faces", faces.length, 0);

  const single = buildPlanarFaces([
    { a: [0, 0], b: [1, 1], kind: "trim" },
  ]);
  check("single dangling edge yields no faces", single.faces.length, 0);
}

console.log(failures === 0 ? "\nALL GEOMETRY CHECKS PASSED" : `\n${failures} FAILED`);
