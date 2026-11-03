import { describe, expect, it } from "vitest";
import { toDXF } from "../export/dxf";
import { toSVG } from "../export/svg";
import { parseDocument } from "../spec/schema";
import { render } from "../eval/render";
import { resolveDimensions } from "../eval/dimensions";
import { tuckEndBox } from "../fixtures/tuckEnd";
import { errors, INPUTS, isClosedOutline } from "./helpers";

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
