import { describe, expect, it } from "vitest";
import type { Node } from "../spec/types";
import { byKind, errors, isClosedOutline, rect, renderNodes } from "./helpers";

const near = (actual: number | undefined, expected: number) => expect(actual).toBeCloseTo(expected, 6);

describe("shapes", () => {
  it("draws a rect from its bottom-left corner", () => {
    const r = renderNodes([rect("panel", "width", "height")]);
    expect(r.bounds).toEqual({ minX: 0, minY: 0, maxX: 100, maxY: 120 });
    expect(r.paths).toHaveLength(4);
    expect(isClosedOutline(r.paths)).toBe(true);
  });

  it("rounds rect corners, shrinking radii that do not fit", () => {
    const r = renderNodes([rect("tab", "20", "10", { radius: "8" } as Partial<Node>)]);
    const arcs = byKind(r.paths, "arc");
    expect(arcs).toHaveLength(4);
    // Two corners share a 10 mm edge, so each gets at most 5.
    for (const arc of arcs) expect(arc.kind === "arc" && arc.r).toBeCloseTo(5);
    expect(isClosedOutline(r.paths)).toBe(true);
    expect(r.bounds).toEqual({ minX: 0, minY: 0, maxX: 20, maxY: 10 });
  });

  it("leaves out the open side of a rect", () => {
    const r = renderNodes([rect("panel", "10", "10", { openSide: "top" } as Partial<Node>)]);
    expect(r.paths).toHaveLength(3);
    expect(r.paths.some((p) => p.kind === "line" && p.a[1] === 10 && p.b[1] === 10)).toBe(false);
  });

  it("builds paths from absolute, relative, polar and arc segments", () => {
    const r = renderNodes([
      {
        id: "p",
        name: "p",
        kind: "path",
        lineType: "cut",
        closed: false,
        start: { x: "0", y: "0" },
        segments: [
          { type: "by", dx: "10", dy: "0" },
          { type: "polar", length: "10", angle: "90" },
          { type: "arc", x: "-10", y: "0", relative: true, radius: "5" },
          { type: "to", x: "0", y: "0", lineType: "crease" },
        ],
      },
    ]);
    expect(errors(r)).toEqual([]);
    expect(r.paths.map((p) => p.kind)).toEqual(["line", "line", "arc", "line"]);
    expect(r.paths[3]!.lineType).toBe("crease");
    // The counter-clockwise half circle bulges upwards from (10,10) to (0,10).
    near(r.bounds!.maxY, 15);
    expect(r.nodes.p!.anchors.p2).toEqual([10, 10]);
  });

  it("rounds a corner of a closed path", () => {
    const r = renderNodes([
      {
        id: "tri",
        name: "tri",
        kind: "path",
        lineType: "cut",
        closed: true,
        start: { x: "0", y: "0" },
        segments: [
          { type: "to", x: "40", y: "0", round: "5" },
          { type: "to", x: "0", y: "40" },
        ],
      },
    ]);
    expect(byKind(r.paths, "arc")).toHaveLength(1);
    expect(isClosedOutline(r.paths)).toBe(true);
  });

  it("builds circles, arcs, polygons, stars and belts", () => {
    const r = renderNodes([
      { id: "c", name: "c", kind: "ellipse", lineType: "cut", rx: "5", ry: "5" },
      { id: "e", name: "e", kind: "ellipse", lineType: "cut", rx: "8", ry: "4" },
      { id: "a", name: "a", kind: "arc", lineType: "cut", radius: "10", start: "0", end: "90" },
      { id: "poly", name: "poly", kind: "polygon", lineType: "cut", sides: "6", radius: "10" },
      { id: "s", name: "s", kind: "star", lineType: "cut", points: "5", radius: "10" },
      { id: "b", name: "b", kind: "belt", lineType: "cut", radius1: "6", radius2: "4", distance: "20" },
    ]);
    expect(errors(r)).toEqual([]);
    expect(r.nodes.c!.bounds).toEqual({ minX: -5, minY: -5, maxX: 5, maxY: 5 });
    near(r.nodes.e!.bounds!.maxX, 8);
    expect(r.nodes.a!.bounds).toEqual({ minX: 0, minY: 0, maxX: 10, maxY: 10 });
    expect(r.nodes.poly!.anchors.p0![1]).toBeCloseTo(10);
    expect(r.paths.filter((p) => p.nodeId === "s")).toHaveLength(10);
    near(r.nodes.b!.bounds!.minX, -6);
    near(r.nodes.b!.bounds!.maxX, 24);
    expect(isClosedOutline(r.paths.filter((p) => p.nodeId === "b"))).toBe(true);
  });
});

describe("transforms", () => {
  it("mirrors, then rotates about the local origin, then moves", () => {
    const r = renderNodes([
      rect("r", "20", "10", { transform: { rotate: "90", x: "100", y: "0" } } as Partial<Node>),
    ]);
    const b = r.nodes.r!.bounds!;
    near(b.minX, 90);
    near(b.maxX, 100);
    near(b.maxY, 20);
    // Anchors follow the shape: its local top-right corner is now at the top-left.
    near(r.nodes.r!.anchors.topRight![0], 90);
    near(r.nodes.r!.anchors.topRight![1], 20);
  });

  it("mirrors arcs correctly", () => {
    const r = renderNodes([
      {
        id: "a",
        name: "a",
        kind: "arc",
        lineType: "cut",
        radius: "10",
        start: "0",
        end: "90",
        transform: { mirrorX: true },
      },
    ]);
    expect(r.nodes.a!.bounds).toEqual({ minX: -10, minY: 0, maxX: 0, maxY: 10 });
  });

  it("places group children through the group's transform", () => {
    const r = renderNodes([
      {
        id: "g",
        name: "g",
        kind: "group",
        transform: { x: "50", y: "5" },
        children: [rect("inner", "10", "10", { transform: { x: "5" } } as Partial<Node>)],
      },
      rect("follower", "1", "1", { transform: { x: "@inner.right.x" } } as Partial<Node>),
    ]);
    expect(r.nodes.inner!.bounds).toEqual({ minX: 55, minY: 5, maxX: 65, maxY: 15 });
    expect(r.nodes.follower!.bounds!.minX).toBe(65);
  });
});

describe("references", () => {
  it("lets shapes follow each other", () => {
    const r = renderNodes([
      rect("b", "width", "height", { transform: { x: "@a.right.x" } } as Partial<Node>),
      rect("a", "length", "height"),
      rect("c", "@a.width / 2", "@b.height"),
    ]);
    expect(errors(r)).toEqual([]);
    expect(r.nodes.b!.bounds!.minX).toBe(60);
    expect(r.nodes.c!.bounds).toEqual({ minX: 0, minY: 0, maxX: 30, maxY: 120 });
  });

  it("reports circular references without failing other nodes", () => {
    const r = renderNodes([
      rect("a", "@b.width", "10"),
      rect("b", "@a.width", "10"),
      rect("ok", "10", "10"),
    ]);
    expect(r.nodes.a!.failed).toBe(true);
    expect(r.nodes.b!.failed).toBe(true);
    expect(r.nodes.ok!.failed).toBe(false);
    expect(r.diagnostics.some((d) => d.message.includes("Circular"))).toBe(true);
  });

  it("explains bad references", () => {
    const r = renderNodes([
      rect("a", "10", "10"),
      rect("b", "@missing.width", "1"),
      rect("c", "@a.topRight", "1"),
      rect("d", "@a.nowhere.x", "1"),
    ]);
    const messages = errors(r).map((d) => d.message);
    expect(messages).toEqual([
      'No shape is named "missing"',
      "@a.topRight is a point; add .x or .y",
      '"a" has no point "nowhere"',
    ]);
    expect(errors(r)[0]!.target).toEqual({ type: "node", id: "b", field: "width" });
  });
});

describe("rules, modifiers, groups", () => {
  it("applies rules in order with the last match winning", () => {
    const rules = [
      { id: "1", when: "width > 50", action: "hide" as const },
      { id: "2", when: "width > 90", action: "show" as const },
    ];
    expect(renderNodes([rect("r", "1", "1", { rules } as Partial<Node>)], { width: 70 }).paths).toHaveLength(0);
    expect(renderNodes([rect("r", "1", "1", { rules } as Partial<Node>)], { width: 100 }).paths).toHaveLength(4);
  });

  it("keeps hidden nodes available to references", () => {
    const r = renderNodes([
      rect("hiddenRef", "40", "1", { hidden: true } as Partial<Node>),
      rect("user", "@hiddenRef.width", "1"),
    ]);
    expect(r.nodes.user!.bounds!.maxX).toBe(40);
    expect(r.paths.every((p) => p.nodeId === "user")).toBe(true);
  });

  it("repeats, mirrors and copies", () => {
    const r = renderNodes([
      rect("arr", "5", "5", { modifiers: [{ type: "array", count: "3", dx: "10", dy: "0" }] } as Partial<Node>),
      rect("mir", "5", "5", { modifiers: [{ type: "mirrorCopy", axis: "x", at: "20" }] } as Partial<Node>),
      rect("cp", "5", "5", { modifiers: [{ type: "copy", dx: "0", dy: "10" }] } as Partial<Node>),
    ]);
    expect(r.nodes.arr!.bounds!.maxX).toBe(25);
    expect(r.nodes.mir!.bounds!.maxX).toBe(40);
    expect(r.nodes.cp!.bounds!.maxY).toBe(15);
    // A rect's width is the rect itself; its bounds cover the copies.
    expect(r.nodes.arr!.scalars.width).toBe(5);
    expect(r.nodes.arr!.anchors.topRight).toEqual([5, 5]);
  });

  it("rounds selected corners or all of them", () => {
    const some = renderNodes([rect("r", "20", "20", { modifiers: [{ type: "round", radius: "3", corners: [0, 2] }] } as Partial<Node>)]);
    expect(byKind(some.paths, "arc")).toHaveLength(2);

    const full = renderNodes([rect("r", "20", "10", { modifiers: [{ type: "roundFull" }] } as Partial<Node>)]);
    const arcs = byKind(full.paths, "arc");
    expect(arcs).toHaveLength(4);
    for (const arc of arcs) expect(arc.kind === "arc" && arc.r).toBeCloseTo(5);
  });

  it("offsets outlines", () => {
    const r = renderNodes([rect("r", "10", "10", { modifiers: [{ type: "offset", distance: "2" }] } as Partial<Node>)]);
    near(r.bounds!.minX, -2);
    near(r.bounds!.maxX, 12);
  });

  it("combines children with booleans", () => {
    const r = renderNodes([
      {
        id: "g",
        name: "g",
        kind: "group",
        combine: { op: "union" },
        children: [rect("a", "10", "10"), rect("b", "10", "10", { transform: { x: "5" } } as Partial<Node>)],
      },
    ]);
    expect(r.bounds).toEqual({ minX: 0, minY: 0, maxX: 15, maxY: 10 });
    expect(r.paths.every((p) => p.nodeId === "g")).toBe(true);
    expect(isClosedOutline(r.paths)).toBe(true);
  });

  it("joins the nearest open ends of two children", () => {
    const line = (name: string, x: string): Node => ({
      id: name,
      name,
      kind: "line",
      lineType: "cut",
      from: { x, y: "0" },
      to: { x, y: "10" },
    });
    const r = renderNodes([{ id: "g", name: "g", kind: "group", combine: { op: "join" }, children: [line("l1", "0"), line("l2", "5")] }]);
    expect(r.paths).toHaveLength(3);
    expect(r.paths[2]!.nodeId).toBe("g");
  });
});

describe("components", () => {
  it("renders instances with arguments and exposes their anchors", () => {
    const r = renderNodes(
      [
        { id: "i1", name: "flap", kind: "instance", component: "tab", args: { depth: "width / 4" }, transform: { x: "10" } },
        rect("after", "1", "1", { transform: { x: "@flap.hinge.x" } } as Partial<Node>),
      ],
      {},
      {
        components: [
          {
            id: "tab",
            name: "Tab",
            params: [{ name: "depth", default: 5 }],
            variables: [{ name: "w", expr: "depth * 2" }],
            nodes: [rect("body", "w", "depth")],
            anchors: [{ name: "hinge", at: { x: "@body.right.x", y: "0" } }],
          },
        ],
      },
    );
    expect(errors(r)).toEqual([]);
    expect(r.nodes.i1!.bounds).toEqual({ minX: 10, minY: 0, maxX: 60, maxY: 25 });
    expect(r.nodes.i1!.scalars.depth).toBe(25);
    expect(r.nodes.after!.bounds!.minX).toBe(60);
    expect(r.paths.every((p) => p.nodeId === "i1" || p.nodeId === "after")).toBe(true);
  });

  it("reports problems inside a component on the instance", () => {
    const r = renderNodes([{ id: "i", name: "i", kind: "instance", component: "bad", args: {} }], {}, {
      components: [{ id: "bad", name: "Bad", params: [], variables: [], nodes: [rect("x", "nope", "1")] }],
    });
    expect(errors(r)[0]).toMatchObject({ target: { type: "node", id: "i" } });
    expect(errors(r)[0]!.message).toContain("Bad › x");
  });

  it("stops components that place themselves", () => {
    const r = renderNodes([{ id: "i", name: "i", kind: "instance", component: "loop", args: {} }], {}, {
      components: [
        { id: "loop", name: "Loop", params: [], variables: [], nodes: [{ id: "j", name: "j", kind: "instance", component: "loop", args: {} }] },
      ],
    });
    expect(errors(r).length).toBeGreaterThan(0);
  });
});

describe("error isolation", () => {
  it("keeps rendering when one node fails and names the field", () => {
    const r = renderNodes([rect("bad", "width +", "10"), rect("good", "10", "10")]);
    expect(r.nodes.bad!.failed).toBe(true);
    expect(r.paths.every((p) => p.nodeId === "good")).toBe(true);
    expect(errors(r)[0]!.target).toEqual({ type: "node", id: "bad", field: "width" });
  });

  it("rejects impossible sizes with a clear message", () => {
    const r = renderNodes([rect("neg", "-5", "10")]);
    expect(errors(r)[0]).toMatchObject({ message: "Width must be greater than 0", target: { field: "width" } });
  });

  it("flags duplicate names", () => {
    const r = renderNodes([rect("same", "1", "1"), { ...rect("same", "1", "1"), id: "same2" } as Node]);
    expect(errors(r)[0]!.target).toEqual({ type: "node", id: "same2", field: "name" });
  });
});

describe("rulers and bleed", () => {
  it("measures between references", () => {
    const r = renderNodes([rect("a", "width", "10")], {}, {
      rulers: [{ id: "r", name: "r", from: { x: "@a.left.x", y: "0" }, to: { x: "@a.right.x", y: "0" }, offset: "5" }],
    });
    expect(r.rulers[0]!.value).toBe(100);
  });

  it("builds bleed around cut lines", () => {
    const r = renderNodes([rect("a", "10", "10")], { bleed: 3 });
    expect(r.bleed.length).toBeGreaterThan(0);
  });
});
