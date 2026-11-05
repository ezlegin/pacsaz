import { describe, expect, it } from "vitest";
import { checkDieline } from "../checks/checks";
import { render } from "../eval/render";
import { addNicks } from "../export/nicks";
import { toFoldSVG } from "../export/fold";
import { tuckEndBox } from "../fixtures/tuckEnd";
import { PRESETS, presetBody } from "../library/presets";
import type { Node } from "../spec/types";
import { doc, INPUTS, rect, renderNodes } from "./helpers";

const line = (name: string, a: [number, number], b: [number, number], lineType = "cut"): Node =>
  ({ id: name, name, kind: "line", lineType, from: { x: String(a[0]), y: String(a[1]) }, to: { x: String(b[0]), y: String(b[1]) } }) as Node;

const codes = (nodes: Node[]) => checkDieline(renderNodes(nodes)).map((i) => i.code);

describe("design checks", () => {
  it.each(PRESETS.map((p) => p.id))("finds nothing wrong with the %s preset", (id) => {
    for (const size of [INPUTS, { ...INPUTS, width: 200, length: 150, height: 80 }]) {
      expect(checkDieline(render(doc({ nodes: [presetBody(id, "body")] }), size))).toEqual([]);
    }
  });

  it.each([[90, 50, 0.5], [120, 33, 2], [60, 60, 1], [100, 100, 0.5], [100, 90, 2], [40, 150, 1]])("keeps the barbed snap lock whole at %d x %d", (width, length, thickness) => {
    const result = render(doc({ nodes: [presetBody("snapLockBottom", "body")] }), { width, length, height: 100, thickness });
    expect(result.diagnostics).toEqual([]);
    expect(checkDieline(result)).toEqual([]);
  });

  it.each(PRESETS.map((p) => p.id))("takes the %s preset's friction locks as hooks on thick board", (id) => {
    expect(checkDieline(render(doc({ nodes: [presetBody(id, "body")] }), { width: 60, length: 120, height: 80, thickness: 3 }))).toEqual([]);
  });

  it("draws the auto-lock's glue area inside its triangle", () => {
    const result = render(doc({ nodes: [presetBody("autoLockBottom", "body")] }), INPUTS);
    expect(result.paths.filter((p) => p.lineType === "glue").length).toBeGreaterThan(10);
  });

  it("moves the glue flap up to the hole of a lock flap at the end of the body", () => {
    const body = presetBody("snapLockBottom", "body");
    const result = render(doc({ nodes: [{ ...body, left: body.right, right: undefined }] }), { ...INPUTS, thickness: 2 });
    expect(checkDieline(result)).toEqual([]);
    const creases = result.paths.flatMap((p) => (p.kind === "line" && p.lineType === "crease" && p.a[0] === 0 && p.b[0] === 0 ? [p.a[1], p.b[1]] : []));
    expect(Math.min(...creases)).toBe(1);
  });

  it("finds nothing wrong with the hand-drawn tuck end", () => {
    expect(checkDieline(render(tuckEndBox, INPUTS)).filter((i) => i.severity === "error")).toEqual([]);
  });

  it("finds a small gap in an outline", () => {
    const issues = checkDieline(
      renderNodes([line("a", [0, 0], [50, 0]), line("b", [50, 0], [50, 50]), line("c", [50, 50], [0, 50]), line("d", [0, 50], [0, 0.4])]),
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ code: "gap", severity: "error", at: [0, 0.2] });
  });

  it("calls a lone cut a slit, not an error", () => {
    expect(checkDieline(renderNodes([rect("r", "50", "50"), line("slit", [10, 10], [30, 10])])).map((i) => [i.code, i.severity])).toEqual([
      ["openCut", "warning"],
      ["openCut", "warning"],
    ]);
  });

  it("finds double knives and cut-on-crease overlaps", () => {
    expect(codes([rect("a", "50", "50"), rect("b", "50", "50", { transform: { x: "20" } } as Partial<Node>)])).toContain("doubleKnife");
    const overlap = checkDieline(renderNodes([rect("a", "50", "50"), line("c", [0, 0], [30, 0], "crease")]));
    expect(overlap.find((i) => i.code === "doubleKnife")?.message).toContain("cut and a crease");
  });

  it("finds shapes that cross", () => {
    const issues = checkDieline(renderNodes([rect("a", "50", "50"), rect("b", "50", "50", { transform: { x: "25", y: "25" } } as Partial<Node>)]));
    expect(issues.filter((i) => i.code === "crossing")).toHaveLength(2);
    expect(issues[0]!.nodeIds.sort()).toEqual(["a", "b"]);
  });

  it("finds a fold that stops in the board", () => {
    expect(codes([rect("a", "50", "50"), line("f", [0, 25], [30, 25], "crease")])).toEqual(["danglingFold"]);
  });

  it("finds tiny leftover segments", () => {
    expect(codes([rect("a", "50", "50"), line("t", [10, 10], [10.1, 10])])).toContain("tinySegment");
  });
});

describe("nicks", () => {
  it("spreads bridges evenly along cut lines", () => {
    const r = renderNodes([line("a", [0, 0], [100, 0]), line("f", [0, 10], [100, 10], "crease")]);
    const nicked = addNicks(r.paths, { width: 0.5, spacing: 30 });
    const cuts = nicked.filter((p) => p.lineType === "cut");
    expect(cuts).toHaveLength(4);
    const total = cuts.reduce((s, p) => s + (p.kind === "line" ? Math.hypot(p.b[0] - p.a[0], p.b[1] - p.a[1]) : 0), 0);
    expect(total).toBeCloseTo(98.5, 9);
    // Creases are never nicked.
    expect(nicked.filter((p) => p.lineType === "crease")).toHaveLength(1);
  });

  it("leaves short lines whole", () => {
    expect(addNicks(renderNodes([line("a", [0, 0], [5, 0])]).paths, { width: 0.5, spacing: 30 })).toHaveLength(1);
  });

  it("nicks arcs along their length", () => {
    const r = renderNodes([{ id: "c", name: "c", kind: "arc", lineType: "cut", radius: "50", start: "0", end: "180" }]);
    expect(addNicks(r.paths, { width: 1, spacing: 50 })).toHaveLength(4);
  });
});

describe("fold export", () => {
  it("writes the layers the 3D rig reads", () => {
    const svg = toFoldSVG(render(doc({ nodes: [presetBody("reverseTuckEnd", "b")] }), INPUTS));
    expect(svg).toContain('id="trim"');
    expect(svg).toContain('id="fold"');
    expect(svg).not.toContain(" A ");
  });
});
