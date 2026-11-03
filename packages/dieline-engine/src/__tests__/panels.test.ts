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
    // The flat top sits towards the start unflipped and towards the end flipped.
    const [plain] = peak(dust(false));
    const [flipped] = peak(dust(true));
    expect(Math.min(plain!.kind === "line" ? plain!.a[0] : 0, plain!.kind === "line" ? plain!.b[0] : 0)).toBeLessThan(5);
    expect(Math.max(flipped!.kind === "line" ? flipped!.a[0] : 0, flipped!.kind === "line" ? flipped!.b[0] : 0)).toBeGreaterThan(55);
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
    // front + side + back + side + glue flap (18); lids as deep as `width`, with
    // a tuck sized from the lid's own 60 mm width (13).
    expect(r.bounds!.maxX).toBeCloseTo(60 + 100 + 60 + 100 + 18);
    expect(r.bounds!.maxY).toBeCloseTo(120 + 100 + 13);
    expect(r.bounds!.minY).toBeCloseTo(-113);
    expect(r.rulers[0]!.value).toBe(60);
  });

  it("is a valid document", () => {
    expect(parseDocument(JSON.parse(JSON.stringify(rteBox)))).toMatchObject({ ok: true });
  });
});
