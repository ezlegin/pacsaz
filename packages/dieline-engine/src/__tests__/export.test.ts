import { describe, expect, it } from "vitest";
import { toDXF } from "../export/dxf";
import { closedPathD, toSVG } from "../export/svg";
import { cutParts, overallRulers, sheetLoops } from "../geometry/sheet";
import { parseDocument } from "../spec/schema";
import { render } from "../eval/render";
import { resolveDimensions } from "../eval/dimensions";
import { tuckEndBox } from "../fixtures/tuckEnd";
import { pathsBounds } from "../geometry/math";
import type { Path } from "../geometry/types";
import { rteBox } from "../fixtures/rte";
import { PRESETS, presetBody, type PresetId } from "../library/presets";
import { doc, errors, INPUTS, isClosedOutline, rect, renderNodes } from "./helpers";

describe("tuck end fixture", () => {
  const result = render(tuckEndBox, INPUTS);

  it("renders without diagnostics", () => {
    expect(result.diagnostics).toEqual([]);
  });

  it("has one closed cut outline", () => {
    expect(isClosedOutline(result.paths.filter((p) => p.lineType === "cut"))).toBe(true);
  });

  it("follows the dimensions", () => {
    const { width, length, height } = INPUTS;
    const glue = Math.min(25, Math.max(12, height * 0.15));
    const tuck = 15;
    expect(result.bounds!.minX).toBeCloseTo(0);
    expect(result.bounds!.maxX).toBeCloseTo(2 * length + 2 * width + glue);
    expect(result.bounds!.maxY).toBeCloseTo(height + width + tuck);
    expect(result.bounds!.minY).toBeCloseTo(-width - tuck);
  });

  it("re-renders at another size", () => {
    const bigger = render(tuckEndBox, { ...INPUTS, width: 200, length: 150 });
    expect(errors(bigger)).toEqual([]);
    expect(isClosedOutline(bigger.paths.filter((p) => p.lineType === "cut"))).toBe(true);
    expect(bigger.scope.tuck).toBe(25);
  });

  it("is a valid document", () => {
    expect(parseDocument(JSON.parse(JSON.stringify(tuckEndBox)))).toMatchObject({ ok: true });
  });
});

describe("export", () => {
  const result = render(tuckEndBox, { ...INPUTS, bleed: 3 });

  it("writes an SVG with node ids, line types, rulers and no guides", () => {
    const svg = toSVG(result, { nodeIds: true, includeRulers: true });
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain('data-node-id="outline"');
    expect(svg).toContain('data-line-type="crease"');
    expect(svg).toContain("data-ruler-id");
    expect(svg).not.toContain('data-line-type="guide"');
    expect(toSVG(result, { includeGuides: true })).toContain('data-line-type="guide"');
  });

  it("writes a DXF with one layer per line type", () => {
    const dxf = toDXF(result);
    expect(dxf).toContain("CUT");
    expect(dxf).toContain("CREASE");
    expect(dxf).not.toContain("GUIDE");
  });
});

describe("documents", () => {
  it("rejects invalid input with readable errors", () => {
    const parsed = parseDocument({ version: 2, params: [], variables: [], rulers: [], components: [], nodes: [{ id: "x", name: "1bad", kind: "rect" }] });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.errors.join(" ")).toContain("nodes.0");
  });

  it("rejects documents nested too deeply", () => {
    let node: unknown = { id: "leaf", name: "leaf", kind: "rect", lineType: "cut", width: "1", height: "1" };
    for (let i = 0; i < 20; i++) node = { id: `g${i}`, name: `g${i}`, kind: "group", children: [node] };
    const parsed = parseDocument({ version: 2, params: [], variables: [], rulers: [], components: [], nodes: [node] });
    expect(parsed.ok).toBe(false);
  });

  it("resolves inner and outer sizes", () => {
    const size = { width: 100, length: 50, height: 80 };
    expect(resolveDimensions(size, "manufacture", { thickness: 1 })).toEqual(size);
    expect(resolveDimensions(size, "inner", { thickness: 1 })).toEqual({ width: 102, length: 52, height: 82 });
    expect(resolveDimensions(size, "outer", { thickness: 1, outerOffset: 1.5 }).width).toBe(97);
  });
});

describe("bleed", () => {
  const dist = (p: [number, number], a: [number, number], b: [number, number]) => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
  };

  it("grows a rectangle by the bleed with round corners", () => {
    const r = renderNodes([rect("a", "10", "10")], { bleed: 3 });
    const b = pathsBounds(r.bleed)!;
    expect([b.minX, b.minY, b.maxX, b.maxY].map((v) => Math.round(v * 100) / 100)).toEqual([-3, -3, 13, 13]);
  });

  it("closes into one fillable outline for clipping", () => {
    const r = renderNodes([rect("a", "10", "10")], { bleed: 3 });
    const d = closedPathD(r.bleed);
    expect(d.match(/M/g)).toHaveLength(1);
    expect(d.endsWith("Z")).toBe(true);
  });

  // 1.5 and 3 make the FEFCO slots (3 mm) exactly twice and once the bleed: offsets that touch instead of crossing.
  const cases = ["rte", ...PRESETS.map((p) => p.id)].flatMap((id) => [1.5, 3, 5].map((bleed) => [id, bleed] as const));
  it.each(cases)("follows the %s outline at a %s mm bleed, fast", (id, bleed) => {
    const d = id === "rte" ? rteBox : doc({ nodes: [presetBody(id as PresetId, "body")] });
    const t0 = performance.now();
    const r = render(d, { ...INPUTS, bleed });
    expect(performance.now() - t0).toBeLessThan(500);
    expect(r.bleed.length).toBeGreaterThan(0);

    const cut = r.paths.filter((p) => p.lineType === "cut" && p.kind === "line") as Extract<Path, { kind: "line" }>[];
    const b = pathsBounds(r.bleed)!;
    const c = r.bounds!;
    expect(b.minX).toBeCloseTo(c.minX - bleed, 1);
    expect(b.maxY).toBeCloseTo(c.maxY + bleed, 1);
    // Every bleed point is at least the bleed away from every cut line: no inner strays.
    for (const seg of r.bleed) {
      if (seg.kind !== "line") continue;
      const nearest = Math.min(...cut.map((l) => dist(seg.a, l.a, l.b)));
      expect(nearest).toBeGreaterThan(bleed - 0.05);
    }
  });
});

describe("sheet and overall rulers", () => {
  it("leaves windows open in the printed sheet", () => {
    const r = renderNodes([rect("a", "100", "50"), rect("w", "20", "10", { transform: { x: "40", y: "20" } })], { bleed: 3 });
    const { outlines, holes } = cutParts(r);
    expect(outlines).toHaveLength(1);
    expect(holes).toHaveLength(1);
    expect(sheetLoops(r)).toHaveLength(2);
    expect(toSVG(r, { sheetFill: "#fff" })).toContain('fill-rule="evenodd"');
  });

  it("measures each separate part", () => {
    const r = renderNodes([rect("a", "100", "50"), rect("b", "30", "40", { transform: { x: "150" } })]);
    const rulers = overallRulers(r);
    expect(rulers.map((x) => Math.round(x.value))).toEqual([100, 50, 30, 40]);
    expect(toSVG(r, { includeRulers: true, overallRulers: true })).toContain("100 mm");
  });
});
