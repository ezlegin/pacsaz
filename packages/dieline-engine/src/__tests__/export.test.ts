import { describe, expect, it } from "vitest";
import { toDXF } from "../export/dxf";
import { closedPathD, toSVG } from "../export/svg";
import { cutParts, overallRulers, sheetLoops } from "../geometry/sheet";
import { parseDocument } from "../spec/schema";
import { render } from "../eval/render";
import { resolveDimensions, typedRulers } from "../eval/dimensions";
import { tuckEndBox } from "../fixtures/tuckEnd";
import { pathsBounds } from "../geometry/math";
import type { Path } from "../geometry/types";
import type { Node } from "../spec/types";
import { checkDieline } from "../checks/checks";
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
    // Bleed is a design aid; the die maker must never get it.
    expect(dxf).not.toContain("BLEED");
  });

  it("colours DXF layers blue for cut and red for crease", () => {
    const dxf = toDXF(result).split(/\r?\n/).map((l) => l.trim());
    // A LAYER table entry: 2 <name> ... 62 <colour>.
    const colourOf = (layer: string) => {
      const at = dxf.findIndex((l, i) => l === layer && dxf[i - 1] === "2" && dxf.slice(i - 6, i).includes("LAYER"));
      const code = dxf.indexOf("62", at);
      return Number(dxf[code + 1]);
    };
    expect(colourOf("CUT")).toBe(5);
    expect(colourOf("CREASE")).toBe(1);
  });

  it("writes glue before cut and crease, so they draw over its outline", () => {
    const dxf = toDXF(render(rteBox, INPUTS));
    const entities = dxf.slice(dxf.indexOf("ENTITIES"));
    const firstGlue = entities.indexOf("\nGLUE");
    expect(firstGlue).toBeGreaterThan(-1);
    expect(firstGlue).toBeLessThan(entities.indexOf("\nCUT"));
    expect(firstGlue).toBeLessThan(entities.indexOf("\nCREASE"));
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
    expect(resolveDimensions(size, "manufacture", 1)).toEqual(size);
    expect(resolveDimensions(size, "inner", 1)).toEqual({ width: 103, length: 53, height: 82 });
    expect(resolveDimensions({ width: 90, length: 50, height: 160 }, "inner", 0.5)).toEqual({ width: 92, length: 52, height: 161 });
    expect(resolveDimensions(size, "outer", 1.5).width).toBe(97);
  });

  it("moves only the rulers that measure the size when it is typed as inner or outer", () => {
    const ruler = (id: string, length: number) => ({ id, name: id, from: [0, 0] as [number, number], to: [length, 0] as [number, number], offset: 5, value: length });
    const result = { rulers: [ruler("w", 100), ruler("flap", 12)], bounds: { minX: 0, minY: 0, maxX: 200, maxY: 100 } } as unknown as Parameters<typeof typedRulers>[0];
    const size = { width: 100, length: 50, height: 80 };

    const all = (d: number) => ({ width: d, length: d, height: d });
    // Nothing moves at the crease size, but the ruler still says what it measures.
    const [same, other] = typedRulers(result, size, all(0));
    expect(same).toEqual({ ...result.rulers[0], dimension: "width" });
    expect(other).toBe(result.rulers[1]);
    const [inner, flap] = typedRulers(result, size, all(4));
    expect(inner).toMatchObject({ from: [1.5, 0], to: [98.5, 0], value: 96 });
    expect(flap).toEqual(result.rulers[1]);
    expect(typedRulers(result, size, all(-2))[0]).toMatchObject({ from: [-1.5, 0], to: [101.5, 0], value: 102 });
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

  it("grows the bleed into each window", () => {
    const r = renderNodes([rect("a", "100", "50"), rect("w", "20", "10", { transform: { x: "40", y: "20" } })], { bleed: 3 });
    const [, hole] = sheetLoops(r);
    const xs = hole!.map((p) => Math.round(p[0] * 100) / 100);
    const ys = hole!.map((p) => Math.round(p[1] * 100) / 100);
    expect([Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]).toEqual([43, 23, 57, 27]);
  });

  it("drops a window narrower than twice the bleed", () => {
    const r = renderNodes([rect("a", "100", "50"), rect("w", "4", "4", { transform: { x: "40", y: "20" } })], { bleed: 3 });
    expect(sheetLoops(r)).toHaveLength(1);
  });

  it("keeps the drawing still when rulers are toggled with reserveRulers", () => {
    const r = renderNodes([rect("a", "100", "50")]);
    const box = (overall: boolean) => /viewBox="([^"]+)"/.exec(toSVG(r, { includeRulers: true, overallRulers: overall, reserveRulers: true }))?.[1];
    expect(box(false)).toBe(box(true));
    expect(toSVG(r, { includeRulers: true, overallRulers: false, reserveRulers: true })).not.toContain("100 mm");
  });

  it("hatches glue areas instead of outlining them", () => {
    const r = render(doc({ nodes: [presetBody("reverseTuckEnd", "body")] }), INPUTS);
    const svg = toSVG(r);
    expect(svg).toContain('id="glue-hatch"');
    // One closed shape per glue area, so the hatch has something to fill.
    expect(svg).toMatch(/data-line-type="glue" d="M[^"]*Z"/);
    expect(svg).toMatch(/data-line-type="glue"[^>]*fill="url\(#glue-hatch\)" stroke="none"/);
  });

  it("interrupts a fold where a window crosses it", () => {
    // A 100 × 50 sheet with a fold at x = 50 and a 20 × 10 window across it.
    const fold = { id: "f", name: "f", kind: "line", lineType: "crease", from: { x: "50", y: "0" }, to: { x: "50", y: "50" } } as Node;
    const r = renderNodes([rect("a", "100", "50"), fold, rect("w", "20", "10", { transform: { x: "40", y: "20" } })]);
    const creases = r.paths.filter((p) => p.lineType === "crease" && p.kind === "line");
    expect(creases.map((p) => (p.kind === "line" ? [p.a[1], p.b[1]].sort((x, y) => x - y) : []))).toEqual([[0, 20], [30, 50]]);
    expect(checkDieline(r)).toEqual([]);
  });

  it("gives every separate part its own bleed", () => {
    const r = renderNodes([rect("a", "100", "50"), rect("b", "30", "40", { transform: { x: "150" } })], { bleed: 3 });
    expect(sheetLoops(r)).toHaveLength(2);
  });

  it("measures each separate part", () => {
    const r = renderNodes([rect("a", "100", "50"), rect("b", "30", "40", { transform: { x: "150" } })]);
    const rulers = overallRulers(r);
    expect(rulers.map((x) => Math.round(x.value))).toEqual([100, 50, 30, 40]);
    expect(toSVG(r, { includeRulers: true, overallRulers: true })).toContain("100 mm");
  });
});

describe("bleed over narrow gaps", () => {
  it("bridges the FEFCO slots instead of running a hairline down them", () => {
    // 6 mm slots at a 3 mm bleed: the offsets would meet in the middle of each slot.
    const r = render(doc({ nodes: [presetBody("fefco0201", "body")] }), { width: 400, length: 300, height: 300, thickness: 3, bleed: 3 } as never);
    const inSlot = r.bleed.some((p) => p.kind === "line" && [p.a, p.b].some(([x, y]) => Math.abs(x - 400) < 3 && y > 0 && y < 449));
    expect(inSlot).toBe(false);
    // The bleed crosses the slot's mouth, a bleed past the flap tips.
    expect(r.bleed.some((p) => p.kind === "line" && Math.abs(p.a[1] - 452) < 1e-6 && Math.abs(p.b[1] - 452) < 1e-6 && Math.min(p.a[0], p.b[0]) < 400 && Math.max(p.a[0], p.b[0]) > 400)).toBe(true);
  });

  it("keeps following a gap wider than the threshold", () => {
    // Two flaps 30 mm apart on one strip: the bleed still goes down between them.
    const comb: Node = {
      id: "c", name: "c", kind: "path", lineType: "cut", closed: true, start: { x: "0", y: "0" },
      segments: [{ type: "to", x: "100", y: "0" }, { type: "to", x: "100", y: "80" }, { type: "to", x: "65", y: "80" }, { type: "to", x: "65", y: "20" }, { type: "to", x: "35", y: "20" }, { type: "to", x: "35", y: "80" }, { type: "to", x: "0", y: "80" }],
    };
    const r = renderNodes([comb], { bleed: 3 });
    expect(r.bleed.some((p) => p.kind === "line" && Math.abs(p.a[1] - 23) < 1e-6 && Math.abs(p.b[1] - 23) < 1e-6)).toBe(true);
  });
});
