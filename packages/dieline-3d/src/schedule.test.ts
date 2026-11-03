import { buildFoldRig } from "./foldRig";
import { foldSchedule, stageProgress } from "./schedule";
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

assert("four stages of a quarter each", Math.abs(top.end - top.start - 0.25) < 1e-9, JSON.stringify(schedule));
assert("sides first, one by one", Math.min(left.start, right.start) === 0 && (left.end <= right.start + 1e-9 || right.end <= left.start + 1e-9));
assert("bottom flap after the sides", Math.abs(bottom.start - Math.max(left.end, right.end)) < 1e-9);
assert("top flap closes last", Math.abs(top.start - bottom.end) < 1e-9 && top.end === 1);
assert("root never moves", schedule[at(20, 15)]!.start === 0 && schedule[at(20, 15)]!.end === 1);
assert("progress maps into a stage", stageProgress(bottom, 0.625) === 0.5 && stageProgress(bottom, 0.3) === 0 && stageProgress(bottom, 0.9) === 1);

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

console.log(failures === 0 ? "\nALL FOLD SCHEDULE CHECKS PASSED" : `\n${failures} FAILED`);
