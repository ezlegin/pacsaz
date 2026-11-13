import { describe, expect, it } from "vitest";
import { render } from "../eval/render";
import { rteBox } from "../fixtures/rte";
import { PRESETS, presetBody } from "../library/presets";
import { parseDocument } from "../spec/schema";
import type { Node, PanelsNode } from "../spec/types";
import { doc, errors, INPUTS, isClosedOutline } from "./helpers";

const body = (more: Partial<PanelsNode> = {}): PanelsNode => ({
  id: "b",
  name: "b",
  kind: "panels",
  height: "height",
  panels: [
    { id: "p1", name: "front", width: "length" },
    { id: "p2", name: "side", width: "width" },
  ],
  ...more,
});

const cutsAndCreases = (r: ReturnType<typeof render>) => ({
  cut: r.paths.filter((p) => p.lineType === "cut"),
  crease: r.paths.filter((p) => p.lineType === "crease"),
});

describe("box bodies", () => {
  it("shortens an inset panel at both ends and slopes a panel inset on one side", () => {
    const node = body({
      panels: [
        { id: "p1", name: "inner", width: "length", inset: { left: "2", right: "2" } },
        { id: "p2", name: "strip", width: "10", inset: { left: "2" } },
        { id: "p3", name: "wall", width: "width" },
      ],
    });
    const r = render(doc({ nodes: [node] }), INPUTS);
    expect(errors(r)).toEqual([]);
    const { cut, crease } = cutsAndCreases(r);
    const has = (lines: typeof cut, a: [number, number], b: [number, number]) =>
      lines.some((p) => p.kind === "line" && ((near(p.a, a) && near(p.b, b)) || (near(p.a, b) && near(p.b, a))));
    const near = (p: [number, number], q: [number, number]) => Math.abs(p[0] - q[0]) < 1e-6 && Math.abs(p[1] - q[1]) < 1e-6;
    // The inner panel's top and bottom sit 2 in; the fold beside it is 4 shorter.
    expect(has(cut, [0, 118], [60, 118])).toBe(true);
    expect(has(cut, [60, 2], [0, 2])).toBe(true);
    expect(has(crease, [60, 2], [60, 118])).toBe(true);
    // The strip slopes from the inner panel's edge up to the wall's.
    expect(has(cut, [60, 118], [70, 120])).toBe(true);
    expect(has(crease, [70, 0], [70, 120])).toBe(true);
    // The outer side edge is pulled in to the shortened ends.
    expect(has(cut, [0, 2], [0, 118])).toBe(true);
    expect(isClosedOutline(cut)).toBe(true);
    expect(parseDocument(JSON.parse(JSON.stringify(doc({ nodes: [node] }))))).toMatchObject({ ok: true });
  });

  it("refuses a part on a sloping edge", () => {
    const node = body({
      panels: [
        { id: "p1", name: "strip", width: "10", inset: { left: "2" }, top: { component: "lib:plainFlap" } },
        { id: "p2", name: "wall", width: "width" },
      ],
    });
    const r = render(doc({ nodes: [node] }), INPUTS);
    expect(r.diagnostics.some((d) => d.target.type === "node" && d.target.field === "panels.0.top.component")).toBe(true);
  });

  it("lays panels side by side with folds between and cut edges around", () => {
    const r = render(doc({ nodes: [body()] }), INPUTS);
    expect(errors(r)).toEqual([]);
    expect(r.bounds).toEqual({ minX: 0, minY: 0, maxX: 160, maxY: 120 });
    const { cut, crease } = cutsAndCreases(r);
    expect(crease).toHaveLength(1);
    expect(isClosedOutline(cut)).toBe(true);
  });

  it("names each panel's corners and width", () => {
    const r = render(doc({ nodes: [body()] }), INPUTS);
    expect(r.nodes.b!.anchors["side.topRight"]).toEqual([160, 120]);
    expect(r.nodes.b!.scalars["front.width"]).toBe(60);
    expect(r.nodes.b!.scalars.bodyHeight).toBe(120);
  });

  it("lets other shapes reference panels by name", () => {
    const r = render(
      doc({
        nodes: [
          body(),
          { id: "hole", name: "hole", kind: "ellipse", lineType: "cut", rx: "5", ry: "5", transform: { x: "@b.side.center.x", y: "@b.side.center.y" } } as Node,
        ],
      }),
      INPUTS,
    );
    expect(r.nodes.hole!.anchors.center).toEqual([110, 60]);
  });

  it("turns an edge with a feature into its hinge and draws the feature outward", () => {
    const r = render(doc({ nodes: [body({ panels: [{ id: "p", name: "p", width: "50", top: { component: "lib:plainFlap", args: { depth: "10" } } }] })] }), INPUTS);
    const { cut, crease } = cutsAndCreases(r);
    expect(crease).toHaveLength(1);
    expect(r.bounds!.maxY).toBe(130);
    // The flap's cut joins the panel's cut edges into one outline; the hinge
    // crease runs across it.
    expect(isClosedOutline(cut)).toBe(true);
  });

  it("places features on every side, facing outwards", () => {
    const flap = { component: "lib:plainFlap", args: { depth: "10" } };
    const r = render(
      doc({ nodes: [body({ panels: [{ id: "p", name: "p", width: "50", top: flap, bottom: flap }], left: flap, right: flap })] }),
      INPUTS,
    );
    expect(r.bounds).toEqual({ minX: -10, minY: -10, maxX: 60, maxY: 130 });
  });

  it("flips a feature end to end", () => {
    const dust = (flip: boolean) =>
      render(doc({ nodes: [body({ panels: [{ id: "p", name: "p", width: "60", top: { component: "lib:dustFlap", flip } }] })] }), INPUTS);
    const peak = (r: ReturnType<typeof render>) =>
      r.paths.filter((p) => p.kind === "line" && p.lineType === "cut" && p.a[1] > 120 && p.b[1] > 120 && Math.abs(p.a[1] - p.b[1]) < 1e-6);
    // The square (lid) side sits at the end unflipped and at the start flipped.
    const [plain] = peak(dust(false));
    const [flipped] = peak(dust(true));
    expect(Math.max(plain!.kind === "line" ? plain!.a[0] : 0, plain!.kind === "line" ? plain!.b[0] : 0)).toBeGreaterThan(50);
    expect(Math.min(flipped!.kind === "line" ? flipped!.a[0] : 0, flipped!.kind === "line" ? flipped!.b[0] : 0)).toBeLessThan(10);
  });

  it("makes a dust flap half as deep as the lid with its tuck", () => {
    // A 60 mm side under a 120 mm lid: lid 60 deep plus a 15 mm tuck, so 37.5.
    const r = render(doc({ nodes: [body({ panels: [{ id: "p", name: "p", width: "60", top: { component: "lib:dustFlap" } }] })] }), { ...INPUTS, width: 60, length: 120, height: 100 });
    const top = Math.max(...r.paths.filter((p) => p.lineType === "cut" && p.kind === "line").flatMap((p) => (p.kind === "line" ? [p.a[1], p.b[1]] : [])));
    expect(top - 100).toBeCloseTo(37.5);
    // Alone on a body there is no lid beside it, so no relief notch.
    expect(r.paths.some((p) => p.kind === "arc" && p.lineType === "cut" && p.r < 2)).toBe(false);
  });

  it("rounds each friction-lock slit into a hook past the tuck fold, which sits below the edge", () => {
    // A 90 mm lid on a 160 mm tall body, 0.5 mm board: the hinge is raised one board to 160.5, the lid
    // is one board short of the 50 mm across the opening (49.5), so the tuck fold is at 210 and the edge at 210.5.
    const r = render(doc({ nodes: [body({ panels: [{ id: "p", name: "p", width: "90", top: { component: "lib:tuckLid" } }] })] }), { ...INPUTS, width: 50, length: 90, height: 160, thickness: 0.5 });
    // The fold sits one board (0.5 mm) below the edge; each hook rounds off the slit and ends
    // another board past the fold.
    const hooks = r.paths.filter((p) => p.kind === "line" && p.lineType === "cut" && p.a[0] === p.b[0] && Math.min(p.a[1], p.b[1]) === 209.5);
    expect(hooks).toHaveLength(2);
    expect(r.paths.filter((p) => p.kind === "arc" && p.lineType === "cut" && Math.abs(p.r - 0.4) < 1e-6)).toHaveLength(2);
    const creases = r.paths.filter((p) => p.kind === "line" && p.lineType === "crease" && p.a[1] === p.b[1]).map((p) => (p.kind === "line" ? p.a[1] : 0));
    expect(creases.sort()).toEqual([160.5, 210]);
  });

  it("notches a dust flap only beside a lid", () => {
    const r = render(doc({ nodes: [presetBody("reverseTuckEnd", "body")] }), { ...INPUTS, width: 50, length: 90, height: 160, thickness: 0.5 });
    // Three of the four dust flaps sit beside a lid; the second side's top flap
    // has the plain back panel on one side and the end of the body on the other.
    // The notch is as wide as the 0.5 mm board: radius 0.25 mm.
    expect(r.paths.filter((p) => p.kind === "arc" && p.lineType === "cut" && Math.abs(p.r - 0.25) < 1e-6)).toHaveLength(3);
  });

  it("steps a dust flap's far side back a board's thickness from the fold, straight up", () => {
    // Reverse tuck end, 90 × 50 × 160, 0.5 mm board: the back panel runs 140–230 at the top,
    // and the side flaps either side of it step one board (0.5 mm) back into their own panels.
    const r = render(doc({ nodes: [presetBody("reverseTuckEnd", "body")] }), { ...INPUTS, width: 50, length: 90, height: 160, thickness: 0.5 });
    const upright = (x: number) =>
      r.paths.some((p) => p.kind === "line" && p.lineType === "cut" && Math.abs(p.a[0] - x) < 1e-6 && Math.abs(p.b[0] - x) < 1e-6 && Math.min(p.a[1], p.b[1]) === 160);
    expect(upright(139.5)).toBe(true);
    expect(upright(230.5)).toBe(true);
  });

  it("reports feature problems on the feature's fields and keeps the edge", () => {
    const r = render(doc({ nodes: [body({ panels: [{ id: "p", name: "p", width: "50", top: { component: "lib:plainFlap", args: { depth: "nope" } } }] })] }), INPUTS);
    expect(errors(r)[0]!.target).toEqual({ type: "node", id: "b", field: "panels.0.top.args.depth" });
    expect(r.nodes.b!.failed).toBe(false);

    const missing = render(doc({ nodes: [body({ left: { component: "lib:nothing" } })] }), INPUTS);
    expect(errors(missing)[0]!.target).toEqual({ type: "node", id: "b", field: "left.component" });
  });

  it("rejects duplicate panel names and empty widths", () => {
    const dup = render(doc({ nodes: [body({ panels: [{ id: "1", name: "a", width: "10" }, { id: "2", name: "a", width: "10" }] })] }), INPUTS);
    expect(errors(dup)[0]!.target).toMatchObject({ field: "panels.1.name" });
    const zero = render(doc({ nodes: [body({ panels: [{ id: "1", name: "a", width: "0" }] })] }), INPUTS);
    expect(errors(zero)[0]!.target).toMatchObject({ field: "panels.0.width" });
  });
});

describe("presets", () => {
  it.each(PRESETS.map((p) => p.id))("%s renders cleanly and closes at several sizes", (id) => {
    for (const size of [INPUTS, { ...INPUTS, width: 200, length: 150, height: 80 }, { ...INPUTS, width: 40, length: 40, height: 60 }]) {
      const r = render(doc({ nodes: [presetBody(id, "body")] }), size);
      expect(errors(r)).toEqual([]);
      const tool = r.paths.filter((p) => p.lineType === "cut" || p.lineType === "crease");
      expect(isClosedOutline(r.paths.filter((p) => p.lineType === "cut"))).toBe(true);
      expect(tool.length).toBeGreaterThan(10);
    }
  });

  it("matches the hand-drawn tuck end's outer size", () => {
    const r = render(rteBox, INPUTS);
    // front + side + back + side + glue flap (a quarter of the 60 mm side, 15). Front and back take the larger
    // of length and width (100), so the lids sit on them, one board short of the
    // sides (59.5), with a tuck sized from the lid's own 100 mm width (15).
    expect(r.bounds!.maxX).toBeCloseTo(100 + 60 + 100 + 60 + 15);
    // Plus the raised hinge and the tuck fold's step below the lid's edge, one board (0.5 mm) each.
    expect(r.bounds!.maxY).toBeCloseTo(120 + 59.5 + 15 + 1);
    expect(r.bounds!.minY).toBeCloseTo(-74.5 - 1);
    expect(r.rulers[0]!.value).toBe(100);
  });

  it("is a valid document", () => {
    expect(parseDocument(JSON.parse(JSON.stringify(rteBox)))).toMatchObject({ ok: true });
  });

  it("keeps the step each authored fold animates in", () => {
    const fold = { faceIndex: 2, direction: "out", angle: 45, vertexCount: 5 };
    const withSteps = (step: unknown) => JSON.parse(JSON.stringify({ ...rteBox, folds: { faceCount: 10, overrides: [{ ...fold, step }] } }));
    const parsed = parseDocument(withSteps(1));
    expect(parsed.ok && parsed.document.folds?.overrides[0]?.step).toBe(1);
    // Steps count from 1, whole numbers only.
    expect(parseDocument(withSteps(0)).ok).toBe(false);
    expect(parseDocument(withSteps(1.5)).ok).toBe(false);
  });

  it("keeps where each piece stands in 3D, and refuses a broken placement", () => {
    const withPieces = (pieces: unknown) => JSON.parse(JSON.stringify({ ...rteBox, folds: { faceCount: 10, overrides: [], pieces } }));
    const placed = { face: 17, x: 150, y: 0, z: -20, rx: 0, ry: 90, rz: 0 };
    const parsed = parseDocument(withPieces([placed]));
    expect(parsed.ok && parsed.document.folds?.pieces).toEqual([placed]);
    expect(parseDocument(withPieces([{ face: 17, x: 1 }])).ok).toBe(false);
    expect(parseDocument(withPieces([{ ...placed, extra: 1 }])).ok).toBe(false);
    // Where it is when a step ends: steps count from 1, whole numbers only.
    const moved = parseDocument(withPieces([placed, { ...placed, x: 250, step: 2 }]));
    expect(moved.ok && moved.document.folds?.pieces?.[1]?.step).toBe(2);
    expect(parseDocument(withPieces([{ ...placed, step: 0 }])).ok).toBe(false);
  });

  it("keeps the panel each piece stands on", () => {
    const withRoots = (roots: unknown) => JSON.parse(JSON.stringify({ ...rteBox, folds: { faceCount: 10, overrides: [], roots } }));
    const parsed = parseDocument(withRoots([19, 3]));
    expect(parsed.ok && parsed.document.folds?.roots).toEqual([19, 3]);
    expect(parseDocument(withRoots([-1])).ok).toBe(false);
    expect(parseDocument(withRoots([1.5])).ok).toBe(false);
  });
});

describe("FEFCO 0201", () => {
  // Measured from the real B-flute die in Sample.pdf: 400 × 300 × 300 on 3 mm board,
  // joint on the front panel's outer edge. y is from the side panels' bottom crease.
  const { right, ...rest } = presetBody("fefco0201", "body");
  const r = render(doc({ nodes: [{ ...rest, left: right }] }), { width: 400, length: 300, height: 300, thickness: 3, bleed: 0 } as never);
  const lines = (type: string) =>
    r.paths.filter((p) => p.lineType === type && p.kind === "line").map((p) => (p.kind === "line" ? [...p.a, ...p.b].map((n) => +n.toFixed(2)) : []));
  const hasLine = (type: string, a: [number, number], b: [number, number]) =>
    lines(type).some((l) => (l[0] === a[0] && l[1] === a[1] && l[2] === b[0] && l[3] === b[1]) || (l[0] === b[0] && l[1] === b[1] && l[2] === a[0] && l[3] === a[1]));

  it("renders clean", () => expect(errors(r)).toEqual([]));

  it("has the sample's panels, creases and flap tips", () => {
    // Panels 400 / 300 / 400 / 299, folds the side panels' height.
    for (const x of [0, 400, 700, 1100]) expect(hasLine("crease", [x, 0], [x, 296])).toBe(true);
    expect(hasLine("cut", [1399, 0], [1399, 296])).toBe(true);
    // Side creases on the body edge, edge to edge; front and back raised one board.
    expect(hasLine("crease", [400, 296], [700, 296])).toBe(true);
    expect(hasLine("crease", [1100, 0], [1399, 0])).toBe(true);
    expect(hasLine("crease", [3, 299], [397, 299])).toBe(true);
    expect(hasLine("crease", [703, -3], [1097, -3])).toBe(true);
    // All tips on one line: 150 from a raised crease, 153 from a side crease.
    expect(hasLine("cut", [3, 449], [397, 449])).toBe(true);
    expect(hasLine("cut", [1103, -153], [1396, -153])).toBe(true);
  });

  it("ends each slot in a half circle of the board's radius", () => {
    const arcs = r.paths.filter((p) => p.kind === "arc" && p.lineType === "cut");
    expect(arcs).toHaveLength(16);
    for (const a of arcs) if (a.kind === "arc") expect(a.r).toBeCloseTo(3);
    expect(arcs.filter((a) => a.kind === "arc" && Math.abs(a.c[0] - 400) < 1e-6 && Math.abs(a.c[1] - 299) < 1e-6)).toHaveLength(2);
  });

  it("has a 45 mm joint with 15° tapers along the side height", () => {
    expect(hasLine("cut", [0, 0], [-45, 12.06])).toBe(true);
    expect(hasLine("cut", [-45, 12.06], [-45, 283.94])).toBe(true);
    expect(hasLine("cut", [-45, 283.94], [0, 296])).toBe(true);
  });
});
