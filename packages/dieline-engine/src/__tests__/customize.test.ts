import { describe, expect, it } from "vitest";
import {
  applyCustomization,
  customizeOptions,
  edgeKey,
  parseCustomization,
  validateCustomization,
  verifyCustomization,
  type Customization,
} from "../customize/customize";
import { mapExprs, renameSymbol } from "../edit/tree";
import { render } from "../eval/render";
import { presetBody } from "../library/presets";
import { parseDocument } from "../spec/schema";
import type { DielineDocument, PanelsNode } from "../spec/types";
import { doc, errors, INPUTS } from "./helpers";

/** A reverse tuck end box with something of every kind exposed. */
function template(): { d: DielineDocument; body: PanelsNode } {
  const body = presetBody("reverseTuckEnd", "body");
  const front = body.panels[0]!;
  front.top = { ...front.top!, customize: { choices: ["lib:plainFlap"], args: ["depth"] } };
  const side1 = body.panels[1]!;
  side1.top = { ...side1.top!, customize: { args: ["round"] } };

  const d = doc({
    params: [
      { name: "hangHole", label: "Hang hole size", default: 8, min: 4, max: 12, exposed: true },
      { name: "secret", default: 1 },
    ],
    nodes: [
      body,
      {
        id: "hole",
        name: "hole",
        kind: "ellipse",
        lineType: "cut",
        rx: "hangHole / 2",
        ry: "hangHole / 2",
        hidden: true,
        customize: { optional: true, move: 10 },
        transform: { x: "@body.front.center.x", y: "@body.front.center.y" },
      },
    ],
    customize: { cutouts: { shapes: ["rect", "ellipse"], max: 2 } },
  });
  return { d, body };
}

const lidKey = (body: PanelsNode) => edgeKey(body.id, "top", body.panels[0]!.id);

describe("customize options", () => {
  it("lists only what the designer exposed", () => {
    const { d, body } = template();
    const o = customizeOptions(d);
    expect(o.any).toBe(true);
    expect(o.params.map((p) => p.name)).toEqual(["hangHole"]);
    expect(o.nodes).toEqual([expect.objectContaining({ id: "hole", optional: true, move: 10, hiddenByDefault: true })]);
    expect(o.edges.map((e) => e.key)).toEqual([lidKey(body), edgeKey(body.id, "top", body.panels[1]!.id)]);
    expect(o.edges[0]!.choices).toEqual(["lib:tuckLid", "lib:plainFlap"]);
    expect(o.panels).toContain("body.front");
    expect(o.cutouts?.max).toBe(2);
  });

  it("is empty for a template with nothing exposed", () => {
    expect(customizeOptions(doc({ nodes: [presetBody("sleeve", "body")] })).any).toBe(false);
  });

  it("survives the document schema and reference renames", () => {
    const { d } = template();
    expect(parseDocument(JSON.parse(JSON.stringify(d))).ok).toBe(true);
    const renamed = renameSymbol(d, "depth", "deep");
    expect(customizeOptions(renamed).edges[0]!.args).toEqual(["depth"]);
    expect(mapExprs(d, (e) => `(${e})`).customize).toEqual(d.customize);
  });
});

describe("validateCustomization", () => {
  it("accepts allowed changes", () => {
    const { d, body } = template();
    const c: Customization = {
      params: { hangHole: 10 },
      nodes: { hole: { hidden: false, dx: 5 } },
      edges: { [lidKey(body)]: { component: "lib:plainFlap", args: { depth: 20 } } },
      cutouts: [{ id: "w1", shape: "rect", panel: "body.front", cx: 0, cy: 0, width: 20, height: 30, radius: 3 }],
    };
    expect(validateCustomization(d, c)).toEqual([]);
  });

  it("rejects anything not exposed or out of range", () => {
    const { d, body } = template();
    const c: Customization = {
      params: { secret: 2, hangHole: 50 },
      nodes: { hole: { dx: 11 }, [body.id]: { hidden: true } },
      edges: { [lidKey(body)]: { component: "lib:dustFlap" }, [edgeKey(body.id, "left")]: { component: "none" } },
      cutouts: [
        { id: "w1", shape: "rect", panel: "body.nowhere", cx: 0, cy: 0, width: 2, height: 30 },
        { id: "hole", shape: "ellipse", panel: "body.front", cx: 0, cy: 0, width: 10, height: 10 },
        { id: "w3", shape: "ellipse", panel: "body.front", cx: 0, cy: 0, width: 10, height: 10 },
      ],
    };
    const codes = validateCustomization(d, c).map((p) => `${p.code} ${p.path}`);
    expect(codes).toEqual(
      expect.arrayContaining([
        "notExposed params.secret",
        "outOfRange params.hangHole",
        "tooFar nodes.hole",
        `notExposed nodes.${body.id}`,
        `notAllowed edges.${lidKey(body)}`,
        `notExposed edges.${edgeKey(body.id, "left")}`,
        "tooMany cutouts",
        "unknownPanel cutouts.w1",
        "tooSmall cutouts.w1",
        "invalid cutouts.hole",
      ]),
    );
  });

  it("checks edge args against the chosen part's own ranges", () => {
    const { d, body } = template();
    const bad = validateCustomization(d, { edges: { [lidKey(body)]: { component: "lib:plainFlap", args: { depth: 0 } } } });
    expect(bad.map((p) => p.code)).toEqual(["outOfRange"]);
  });

  it("parses only well-formed overlays", () => {
    expect(parseCustomization({ params: { a: 1 } }).ok).toBe(true);
    expect(parseCustomization({ params: { a: "1" } }).ok).toBe(false);
    expect(parseCustomization({ extra: true }).ok).toBe(false);
    expect(parseCustomization({ params: { a: Number.POSITIVE_INFINITY } }).ok).toBe(false);
  });
});

describe("applyCustomization", () => {
  it("leaves the template untouched without changes", () => {
    const { d } = template();
    const { document, params } = applyCustomization(d, {});
    expect(document.nodes).toEqual(d.nodes);
    expect(params).toEqual({});
  });

  it("switches parts on, moves them and swaps flaps", () => {
    const { d, body } = template();
    const plain = { ...INPUTS };
    const before = render(d, plain);
    expect(before.nodes.hole?.visible).toBe(false);

    const { document, params } = applyCustomization(d, {
      params: { hangHole: 10 },
      nodes: { hole: { hidden: false, dx: 5, dy: -3 } },
      edges: { [lidKey(body)]: { component: "lib:plainFlap", args: { depth: 20 } } },
    });
    const after = render(document, { ...plain, params });
    expect(errors(after)).toEqual([]);

    const hole = after.nodes.hole!;
    const front = after.nodes[body.id]!.anchors["front.center"]!;
    expect(hole.visible).toBe(true);
    expect((hole.bounds!.minX + hole.bounds!.maxX) / 2).toBeCloseTo(front[0] + 5);
    expect((hole.bounds!.minY + hole.bounds!.maxY) / 2).toBeCloseTo(front[1] - 3);
    expect(hole.bounds!.maxX - hole.bounds!.minX).toBeCloseTo(10);

    // The plain flap is 20 deep above the front panel; the tuck lid was deeper.
    const top = after.nodes[body.id]!.anchors["front.topLeft"]![1];
    expect(after.bounds!.maxY).toBeLessThan(before.bounds!.maxY);
    expect(after.bounds!.maxY).toBeGreaterThanOrEqual(top + 20 - 1e-6);
  });

  it("places windows relative to their panel, so they follow the size", () => {
    const { d, body } = template();
    const c: Customization = { cutouts: [{ id: "w1", shape: "rect", panel: "body.front", cx: 0, cy: 10, width: 20, height: 30 }] };
    const { document } = applyCustomization(d, c);
    for (const length of [60, 120]) {
      const r = render(document, { ...INPUTS, length });
      const w = r.nodes.w1!.bounds!;
      const centre = r.nodes[body.id]!.anchors["front.center"]!;
      expect((w.minX + w.maxX) / 2).toBeCloseTo(centre[0]);
      expect((w.minY + w.maxY) / 2).toBeCloseTo(centre[1] + 10);
    }
  });
});

describe("verifyCustomization", () => {
  it("passes a sensible customer copy", () => {
    const { d, body } = template();
    const v = verifyCustomization(
      d,
      {
        nodes: { hole: { hidden: false } },
        edges: { [lidKey(body)]: { component: "lib:plainFlap", args: { depth: 25 } } },
        cutouts: [{ id: "w1", shape: "ellipse", panel: "body.front", cx: 0, cy: -20, width: 20, height: 20 }],
      },
      INPUTS,
    );
    expect(v.problems).toEqual([]);
    expect(v.ok).toBe(true);
  });

  it("rejects windows across a fold or on top of each other", () => {
    const { d } = template();
    d.customize = { cutouts: { shapes: ["rect"], max: 3 } };
    const v = verifyCustomization(
      d,
      {
        cutouts: [
          { id: "w1", shape: "rect", panel: "body.front", cx: 45, cy: 0, width: 20, height: 20 },
          { id: "w2", shape: "rect", panel: "body.back", cx: 0, cy: 0, width: 20, height: 20 },
          { id: "w3", shape: "rect", panel: "body.back", cx: 0, cy: 22, width: 20, height: 20 },
        ],
      },
      INPUTS,
    );
    expect(v.ok).toBe(false);
    expect(v.problems.map((p) => `${p.code} ${p.path}`)).toEqual(
      expect.arrayContaining(["outsidePanel cutouts.w1", "overlap cutouts.w3"]),
    );
  });

  it("catches a moved part that now crosses a cut line", () => {
    const { d } = template();
    // The front panel is 100 wide: moving the hole 10 mm still keeps it inside,
    // so widen the move to push it over the fold.
    const hole = d.nodes[1]!;
    hole.customize = { optional: true, move: 60 };
    const v = verifyCustomization(d, { nodes: { hole: { hidden: false, dx: 49 } } }, INPUTS);
    expect(v.ok).toBe(false);
    expect(v.problems.some((p) => p.code === "geometry" && p.path === "nodes.hole")).toBe(true);
  });
});
