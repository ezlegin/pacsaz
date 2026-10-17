import { buildFoldRig } from "./foldRig";
import { extractSegmentsFromSvg, svgHasFoldLayer, svgLayerIds } from "./extract";

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

/**
 * The REAL export shape, copied verbatim from the live generator:
 *  - one `<g id="svgGroup">` wrapping everything,
 *  - layers named by the `id` on each `<path>`,
 *  - a filled bleed path enclosing the pattern,
 *  - the crease written as `M 125 195 125 35` (moveto + implicit lineto).
 *
 * This is the structure that produced "دایلاین باید حداقل یک خط تا داشته باشد"
 * while the extractor only looked at group ids.
 */
const realSvg = `<svg width="250mm" height="230mm" viewBox="0 0 250 230" xmlns="http://www.w3.org/2000/svg"><g id="svgGroup" stroke-linecap="butt" fill-rule="evenodd" font-size="9pt" stroke="#000" stroke-width="0.25mm" fill="none" style="stroke:#000;stroke-width:0.25mm;fill:none"><path d="M 35 200 L 215 200 L 220 200 L 220 195 L 220 35 L 220 30 L 215 30 L 35 30 L 30 30 L 30 35 L 30 195 L 30 200 L 35 200 Z" id="bleed"/><path d="M 35 230 L 215 230 L 250 230 L 250 195 L 250 35 L 250 0 L 215 0 L 35 0 L 0 0 L 0 35 L 0 195 L 0 230 L 35 230 Z" id="container"/><path d="M 125 195 125 35" id="fold"/><path d="M 35 195 L 215 195 L 215 35 L 35 35 L 35 195 Z" id="trim"/></g></svg>`;

const segments = extractSegmentsFromSvg(realSvg);
const kinds = segments.reduce<Record<string, number>>((acc, s) => {
  acc[s.kind] = (acc[s.kind] ?? 0) + 1;
  return acc;
}, {});

console.log("layer ids found:", svgLayerIds(realSvg).join(", "));
console.log("extracted:", segments.length, JSON.stringify(kinds));

/* -------------------- the exact bug that was reported --------------------- */
{
  assert(
    "creates segments from a path-id export at all",
    segments.length > 0,
    `count=${segments.length}`,
  );
  check("fold layer is discovered", (kinds.fold ?? 0) > 0, true);
  check("trim layer is discovered", (kinds.trim ?? 0) > 0, true);
  assert("svgHasFoldLayer reports the crease", svgHasFoldLayer(realSvg));
}

/* ------------------------------ bleed ignored ----------------------------- */
{
  // The bleed path encloses 30..220 by 30..200. Nothing may reproduce it.
  const bleedish = segments.filter(
    (s) =>
      (Math.abs(s.a[0] - 30) < 0.01 && Math.abs(s.b[0] - 220) < 0.01) ||
      (Math.abs(s.a[1] - 30) < 0.01 && Math.abs(s.b[1] - 200) < 0.01),
  );
  check("bleed path excluded", bleedish.length, 0);

  // The container spans the full 0..250 page.
  const containerish = segments.filter((s) =>
    [s.a[0], s.b[0]].some((x) => Math.abs(x) < 0.01 || Math.abs(x - 250) < 0.01),
  );
  check("container path excluded", containerish.length, 0);
}

/* -------------------------- the crease is parsed -------------------------- */
{
  const fold = segments.find((s) => s.kind === "fold");
  assert("crease exists", Boolean(fold));

  if (fold) {
    const length = Math.hypot(fold.b[0] - fold.a[0], fold.b[1] - fold.a[1]);
    assert(
      "crease is vertical and 160mm long",
      Math.abs(length - 160) < 0.01 && Math.abs(fold.a[0] - fold.b[0]) < 0.01,
      `len=${length.toFixed(2)} from=${JSON.stringify(fold.a)} to=${JSON.stringify(fold.b)}`,
    );
  }
}

/* -------------------------------- it folds -------------------------------- */
{
  const rig = buildFoldRig(segments);
  console.log(
    `rig: faces=${rig.stats.faceCount} hinges=${rig.stats.hingeCount} degenerate=${rig.stats.degenerate}`,
  );

  // 180 x 160 trim split down the middle by one crease -> two 90x160 panels.
  check("two panels", rig.stats.faceCount, 2);
  check("one hinge", rig.stats.hingeCount, 1);
  check("not degenerate", rig.stats.degenerate, false);
  check("no orphans", rig.stats.orphanCount, 0);
  check(
    "bounds match the trim (180 x 160), not the bleed",
    [Math.round(rig.bounds.width), Math.round(rig.bounds.height)],
    [180, 160],
  );

  const areas = rig.nodes
    .map((n) => Math.round(n.face.area))
    .sort((a, b) => a - b);
  check("both panels are 90x160", areas, [14400, 14400]);
}

/* --------------------- group-based exports still work --------------------- */
{
  const grouped = `<svg xmlns="http://www.w3.org/2000/svg">
    <g id="bleed" fill="white"><path d="M0 0 L320 0 L320 180 L0 180 Z" /></g>
    <g id="trim"><path d="M10 10 L310 10 L310 170 L10 170 Z" /></g>
    <g id="fold"><path d="M160 10 L160 170" /></g>
  </svg>`;

  const segs = extractSegmentsFromSvg(grouped);
  const rig = buildFoldRig(segs);

  check("grouped export: bleed excluded", segs.length, 5);
  check("grouped export: two panels", rig.stats.faceCount, 2);
  check(
    "grouped export: bounds from trim",
    [Math.round(rig.bounds.width), Math.round(rig.bounds.height)],
    [300, 160],
  );
}

/* ---------------------- defs/watermark never geometry --------------------- */
{
  const withDefs = `<svg xmlns="http://www.w3.org/2000/svg">
    <g id="svgGroup">
      <path d="M 0 0 L 100 0 L 100 50 L 0 50 Z" id="trim"/>
      <path d="M 50 0 L 50 50" id="fold"/>
    </g>
    <defs>
      <clipPath id="watermarkClip"><path d="M0 0 L320 0 L320 180 L0 180 Z"/></clipPath>
    </defs>
  </svg>`;

  const segs = extractSegmentsFromSvg(withDefs);
  const rig = buildFoldRig(segs);

  check("defs path is not geometry", segs.length, 5);
  check("defs does not add faces", rig.stats.faceCount, 2);
}

/* ------------------------------ empty states ------------------------------ */
{
  check(
    "no segments yields a degenerate rig",
    buildFoldRig([]).stats.degenerate,
    true,
  );
  assert(
    "svgHasFoldLayer false for trim-only",
    !svgHasFoldLayer(
      `<svg><g id="svgGroup"><path d="M0 0 L10 0 L10 10 Z" id="trim"/></g></svg>`,
    ),
  );
}

console.log(failures === 0 ? "\nALL EXTRACTION CHECKS PASSED" : `\n${failures} FAILED`);
