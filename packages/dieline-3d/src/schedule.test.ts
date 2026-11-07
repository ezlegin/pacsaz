import { buildFoldRig } from "./foldRig";
import { foldAngle, foldSchedule, stageProgress } from "./schedule";
import type { Pt, Segment } from "./types";

let failures = 0;
const assert = (label: string, ok: boolean, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label}${detail ? ` | ${detail}` : ""}`);
};

/*
  A small carton, in SVG coordinates (y down):

            [top flap]           y 0..5,   x 10..30
  [side][  root panel  ][side]   y 5..25,  x 0..10 | 10..30 | 30..40
            [bottom flap]        y 25..30, x 10..30
*/
const loop = (pts: Pt[]): Segment[] => pts.map((a, i) => ({ a, b: pts[(i + 1) % pts.length]!, kind: "trim" as const }));
const segments: Segment[] = [
  ...loop([
    [10, 0], [30, 0], [30, 5], [40, 5], [40, 25], [30, 25], [30, 30], [10, 30], [10, 25], [0, 25], [0, 5], [10, 5],
  ]),
  { a: [10, 5], b: [30, 5], kind: "fold" },
  { a: [10, 25], b: [30, 25], kind: "fold" },
  { a: [10, 5], b: [10, 25], kind: "fold" },
  { a: [30, 5], b: [30, 25], kind: "fold" },
];

const rig = buildFoldRig(segments);
const schedule = foldSchedule(rig);
const at = (x: number, y: number) =>
  rig.nodes.findIndex((n) => Math.abs(n.face.centroid[0] - x) < 1 && Math.abs(n.face.centroid[1] - y) < 1);

const top = schedule[at(20, 2.5)]!;
const bottom = schedule[at(20, 27.5)]!;
const left = schedule[at(5, 15)]!;
const right = schedule[at(35, 15)]!;

// Symmetric with no glue flap: it closes like a tray, mirrored panels together.
assert("two stages of a half each", Math.abs(top.end - top.start - 0.5) < 1e-9, JSON.stringify(schedule));
assert("both end flaps first, together", top.start === 0 && bottom.start === 0 && Math.abs(top.end - 0.5) < 1e-9 && bottom.end === top.end);
assert("then both sides at once", left.start === right.start && left.end === right.end && Math.abs(left.start - 0.5) < 1e-9 && left.end === 1);
assert("progress maps into a stage", stageProgress(top, 0.25) === 0.5 && stageProgress(left, 0.3) === 0 && stageProgress(top, 0.9) === 1);
assert("root never moves", schedule[at(20, 15)]!.start === 0 && schedule[at(20, 15)]!.end === 1);

/*
  A tuck end: lid with a tuck on the root's top, a dust flap on the left side's
  top, and a narrow glue flap on the right.

            [tuck]               y -3..0,  x 10..30
            [ lid ]              y 0..5,   x 10..30
  [dust]                         y 2..5,   x 0..9.5 (slit beside the lid)
  [side][  root panel  ][side][g] y 5..25, x 0..10 | 10..30 | 30..40 | 40..43
*/
const tuckSegs: Segment[] = [
  ...loop([
    [10, -3], [30, -3], [30, 5], [43, 5], [43, 25], [0, 25], [0, 2], [9.5, 2], [9.5, 5], [10, 5],
  ]),
  { a: [10, 0], b: [30, 0], kind: "fold" },
  { a: [10, 5], b: [30, 5], kind: "fold" },
  { a: [0, 5], b: [9.5, 5], kind: "fold" },
  { a: [10, 5], b: [10, 25], kind: "fold" },
  { a: [30, 5], b: [30, 25], kind: "fold" },
  { a: [40, 5], b: [40, 25], kind: "fold" },
];
const rig2 = buildFoldRig(tuckSegs);
const s2 = foldSchedule(rig2);
const at2 = (x: number, y: number) =>
  rig2.nodes.findIndex((n) => Math.abs(n.face.centroid[0] - x) < 1 && Math.abs(n.face.centroid[1] - y) < 1);
const tuck = s2[at2(20, -1.5)]!;
const lid = s2[at2(20, 2.5)]!;
const dust = s2[at2(4.75, 3.5)]!;
const glue = s2[at2(41.5, 15)]!;
const right2 = s2[at2(35, 15)]!;
const left2 = s2[at2(5.9, 13)]!;
assert("glue flap folds first", glue.start === 0, JSON.stringify(s2));
assert("far end closes onto the glue last among the sides", left2.start >= right2.end - 1e-9);
assert("dust, then tuck, then lid", dust.end <= tuck.start + 1e-9 && tuck.end <= lid.start + 1e-9 && lid.end === 1);
assert("dust flap tucks past square under the lid", (dust.angle ?? 0) > Math.PI / 2);
assert("glue flap tucks past square", (glue.angle ?? 0) > Math.PI / 2);
assert("lid keeps its own angle", lid.angle === undefined);

/*
  A snap lock bottom: panels 20, 10, 20, 10 wide with flaps 8 deep, separated by
  small gaps. The first flap has a notch and the third narrows to a tab.
*/
const lockSegs: Segment[] = [
  ...loop([
    [0, 0], [60, 0], [60, 34], [56, 38], [50.5, 38], [50.5, 30], [50, 30], [49, 30], [45, 38], [35, 38], [31, 30], [30, 30],
    [29.5, 30], [29.5, 34], [25, 38], [20.5, 38], [20.5, 30], [20, 30], [19.5, 30], [19.5, 38], [15, 38], [15, 34], [5, 34], [5, 38], [0, 38],
  ]),
  { a: [20, 0], b: [20, 30], kind: "fold" },
  { a: [30, 0], b: [30, 30], kind: "fold" },
  { a: [50, 0], b: [50, 30], kind: "fold" },
  { a: [0, 30], b: [19.5, 30], kind: "fold" },
  { a: [20.5, 30], b: [29.5, 30], kind: "fold" },
  { a: [31, 30], b: [49, 30], kind: "fold" },
  { a: [50.5, 30], b: [60, 30], kind: "fold" },
  { a: [0, 34], b: [5, 34], kind: "bend" },
  { a: [15, 34], b: [19.5, 34], kind: "bend" },
  { a: [33, 34], b: [47, 34], kind: "bend" },
];
const rig3 = buildFoldRig(lockSegs);
const s3 = foldSchedule(rig3);
const flaps3 = rig3.nodes
  .map((n, i) => ({ i, y: n.face.centroid[1], x: n.face.centroid[0], kind: n.kind }))
  .filter((n) => n.y > 30 && n.kind !== "bend")
  .sort((a, b) => a.x - b.x);
assert("snap lock has four flaps", flaps3.length === 4, JSON.stringify(rig3.stats));
if (flaps3.length === 4) {
  const [one, sideA, three, sideB] = flaps3.map((f) => s3[f.i]!);
  assert("notched flap first", one!.end <= sideA!.start + 1e-9, JSON.stringify(s3));
  assert("side flaps fold together", sideA!.start === sideB!.start);
  assert("tab flap third", sideA!.end <= three!.start + 1e-9);
  const press = one!.press!;
  assert("all flaps settle together after the third", press.start >= three!.end - 1e-9 && three!.press!.start === press.start);
  const node = rig3.nodes[flaps3[0]!.i]!;
  const deg = (r: number) => Math.round((r * 180) / Math.PI);
  assert("pressed to 110 before settling", deg(foldAngle(one!, node.angle, press.start)) === 110);
  assert("finishes square", [one, sideA, sideB, three].map((w) => deg(foldAngle(w!, node.angle, 1))).join() === "90,90,90,90");
  assert("layers run notched, tab, sides", [one, three, sideA, sideB].map((w) => w!.press!.layer).join() === "0,1,2,2");
  const parts = rig3.nodes.flatMap((n, i) => (n.kind === "bend" ? [foldAngle(s3[i]!, n.angle, 1)] : []));
  assert("the flaps stay straight", parts.length === 3 && parts.every((a) => a === 0));
  const bent = rig3.nodes.flatMap((n, i) => (n.kind === "bend" ? [{ n, w: s3[i]! }] : []));
  assert("three parts bend, each with its flap", bent.length === 3 && bent.every(({ n, w }) => w.start === s3[n.parent!]!.start));
}

/* Plain deep flaps, as on a wide FEFCO 0201, are not a lock. */
const plainSegs: Segment[] = [
  ...loop([
    [0, 0], [60, 0], [60, 38], [50.5, 38], [50.5, 30], [50, 30], [49.5, 30], [49.5, 38], [30.5, 38], [30.5, 30], [30, 30],
    [29.5, 30], [29.5, 38], [20.5, 38], [20.5, 30], [20, 30], [19.5, 30], [19.5, 38], [0, 38],
  ]),
  { a: [20, 0], b: [20, 30], kind: "fold" },
  { a: [30, 0], b: [30, 30], kind: "fold" },
  { a: [50, 0], b: [50, 30], kind: "fold" },
  { a: [0, 30], b: [19.5, 30], kind: "fold" },
  { a: [20.5, 30], b: [29.5, 30], kind: "fold" },
  { a: [30.5, 30], b: [49.5, 30], kind: "fold" },
  { a: [50.5, 30], b: [60, 30], kind: "fold" },
];
assert("plain deep flaps are not pressed", foldSchedule(buildFoldRig(plainSegs)).every((w) => !w.press));

/*
  A FEFCO 0201: four flaps a side, none carrying another. The long panels' flaps
  hinge one board further out, so the short ones close first and the long ones
  over them; bottom before top. Opening runs it back: top long, top short,
  bottom long, bottom short, then the sides.
*/
{
  // Glue x -10..0, panels 0..40 | 40..70 | 70..110 | 110..139, body y 0..30 (y down).
  // Long panels' flaps hinge at y -1 and 31, short ones' on the body edge; all
  // tips at y -16 and 46; slots end in a point on the short panels' crease.
  const outline: Pt[] = [
    [0, 0], [1, -1], [1, -16], [39, -16], [39, -1], [40, 0], [41, -1], [41, -16], [69, -16], [69, -1], [70, 0],
    [71, -1], [71, -16], [109, -16], [109, -1], [110, 0], [111, -1], [111, -16], [138, -16], [138, -1], [139, 0],
    [139, 30], [138, 31], [138, 46], [111, 46], [111, 31], [110, 30], [109, 31], [109, 46], [71, 46], [71, 31], [70, 30],
    [69, 31], [69, 46], [41, 46], [41, 31], [40, 30], [39, 31], [39, 46], [1, 46], [1, 31], [0, 30], [-10, 27], [-10, 3],
  ];
  const fold = (a: Pt, b: Pt): Segment => ({ a, b, kind: "fold" });
  const fr = buildFoldRig([
    ...loop(outline),
    ...[0, 40, 70, 110].map((x) => fold([x, 0], [x, 30])),
    fold([1, -1], [39, -1]), fold([71, -1], [109, -1]), fold([40, 0], [70, 0]), fold([110, 0], [139, 0]),
    fold([1, 31], [39, 31]), fold([71, 31], [109, 31]), fold([40, 30], [70, 30]), fold([110, 30], [139, 30]),
  ]);
  const fs = foldSchedule(fr);
  const by = (y: number) => fr.nodes.flatMap((n, i) => (n.parent !== null && Math.abs(n.pivot[1] - y) < 0.01 && Math.abs(n.axis[0]) > Math.abs(n.axis[1]) ? [fs[i]!] : []));
  const [topLong, topShort, bottomLong, bottomShort] = [by(-1), by(0), by(31), by(30)];
  const body = fs.filter((_, i) => fr.nodes[i]!.parent !== null && Math.abs(fr.nodes[i]!.axis[1]) > Math.abs(fr.nodes[i]!.axis[0]));
  const same = (ws: typeof fs) => ws.length === 2 && ws[0]!.start === ws[1]!.start;
  assert("fefco: two flaps in each group, together", [topLong, topShort, bottomLong, bottomShort].every(same), [topLong, topShort, bottomLong, bottomShort].map((g) => g.length).join());
  const order = [Math.max(...body.map((w) => w.end)), bottomShort[0]?.start, bottomShort[0]?.end, bottomLong[0]?.start, bottomLong[0]?.end, topShort[0]?.start, topShort[0]?.end, topLong[0]?.start].map((v) => v ?? NaN);
  assert("fefco: sides, bottom short, bottom long, top short, top long", order.every((v, k) => k === 0 || v >= order[k - 1]! - 1e-9) && topLong[0]?.end === 1, JSON.stringify(order));
  assert("fefco: short flaps stay square under the long ones", [...topShort, ...bottomShort].every((w) => w.angle === undefined));
}

console.log(failures === 0 ? "\nALL FOLD SCHEDULE CHECKS PASSED" : `\n${failures} FAILED`);
