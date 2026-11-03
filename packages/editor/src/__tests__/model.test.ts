import { emptyDocument, findNode, render, updateNode, type DielineDocument, type Node, type PanelsNode, type RenderInputs } from "@repo/dieline-engine";
import { rteBox, tuckEndBox } from "@repo/dieline-engine/fixtures";
import { edgeSlots } from "../model/body";
import { describe, expect, it } from "vitest";
import { applyCompletion, completionsAt } from "../model/completions";
import { constrain45, drawnPath, placedShape } from "../model/draw";
import { handlesFor } from "../model/handles";
import { moveNodes } from "../model/move";
import { groupNodes, ungroupNode } from "../model/ops";
import { niceStep, snapMoving, snappedDelta, snapTargets, wouldCycle } from "../model/snap";
import { pickable, worldToLocalVector } from "../model/frames";
import { EditorStore } from "../state/store";

const INPUTS: RenderInputs = { width: 100, length: 60, height: 120, thickness: 0.5 };

const rect = (name: string, width: string, height: string, more: Partial<Node> = {}): Node =>
  ({ id: name, name, kind: "rect", lineType: "cut", width, height, ...more }) as Node;

const docOf = (nodes: Node[]): DielineDocument => ({ ...emptyDocument(), nodes });

describe("EditorStore", () => {
  it("records steps, coalesces gestures and undoes them", () => {
    const store = new EditorStore(docOf([rect("a", "10", "10")]), INPUTS);
    store.apply((d) => updateNode(d, "a", (n) => ({ ...n, hidden: true })));
    expect(store.get().canUndo).toBe(true);

    store.begin();
    for (let i = 1; i <= 5; i++) {
      store.preview(updateNode(store.gestureStart, "a", (n) => ({ ...n, transform: { x: String(i) } })));
    }
    store.end();
    expect(findNode(store.get().doc, "a")!.node.transform?.x).toBe("5");

    store.undo();
    expect(findNode(store.get().doc, "a")!.node.transform).toBeUndefined();
    store.undo();
    expect(findNode(store.get().doc, "a")!.node.hidden).toBeUndefined();
    store.redo();
    store.redo();
    expect(findNode(store.get().doc, "a")!.node.transform?.x).toBe("5");
  });

  it("cancels a gesture back to where it started", () => {
    const store = new EditorStore(docOf([rect("a", "10", "10")]), INPUTS);
    store.begin();
    store.preview(updateNode(store.get().doc, "a", (n) => ({ ...n, hidden: true })));
    store.cancel();
    expect(findNode(store.get().doc, "a")!.node.hidden).toBeUndefined();
    expect(store.get().canUndo).toBe(false);
  });

  it("re-renders when inputs change and drops stale selection", () => {
    const store = new EditorStore(docOf([rect("a", "width", "10")]), INPUTS);
    store.select(["a"]);
    store.setInputs({ width: 50 });
    expect(store.get().result.nodes.a!.bounds!.maxX).toBe(50);
    store.apply(() => docOf([]));
    expect(store.get().selection).toEqual([]);
  });
});

describe("moving", () => {
  it("adjusts the constant and keeps the formula", () => {
    const doc = docOf([rect("a", "10", "10", { transform: { x: "width + 2" } })]);
    const moved = moveNodes(doc, render(doc, INPUTS), ["a"], [3, 0]);
    expect(findNode(moved, "a")!.node.transform).toEqual({ x: "width + 5" });
  });

  it("writes plain numbers with Alt", () => {
    const doc = docOf([rect("a", "10", "10", { transform: { x: "width + 2" } })]);
    const moved = moveNodes(doc, render(doc, INPUTS), ["a"], [3, 1], { plain: true });
    expect(findNode(moved, "a")!.node.transform).toEqual({ x: "105", y: "1" });
  });

  it("links a node whose origin snaps onto another node", () => {
    const doc = docOf([rect("a", "width", "10"), rect("b", "10", "10", { transform: { x: "150", y: "0" } })]);
    const result = render(doc, INPUTS);
    const targets = snapTargets(result, ["b"]);
    // b's origin (150, 0) dragged near a's bottom-right corner (100, 0).
    const raw: [number, number] = [-48, 0.3];
    const snap = snapMoving([[150 + raw[0], raw[1]]], targets, 3);
    const moved = moveNodes(doc, result, ["b"], snappedDelta(raw, snap, 0.5), { snap });
    expect(findNode(moved, "b")!.node.transform).toEqual({ x: "@a.bottomRight.x", y: "@a.bottomRight.y" });

    // And it follows when the dimensions change.
    expect(render(moved, { ...INPUTS, width: 140 }).nodes.b!.bounds!.minX).toBe(140);
  });

  it("does not freeze sizes into references when a far edge snaps", () => {
    const doc = docOf([rect("a", "width", "10"), rect("b", "10", "10", { transform: { x: "150" } })]);
    const result = render(doc, INPUTS);
    // b's right edge (160) snapped onto a's right edge (100).
    const snap = snapMoving([[100.5, 5]], snapTargets(result, ["b"]), 3);
    const moved = moveNodes(doc, result, ["b"], snappedDelta([-59.5, 0], snap, 0.5), { snap });
    expect(findNode(moved, "b")!.node.transform?.x).toBe("90");
  });

  it("moves children of a rotated group along the group's axes", () => {
    const doc = docOf([
      { id: "g", name: "g", kind: "group", transform: { rotate: "90" }, children: [rect("a", "10", "10")] },
    ]);
    const result = render(doc, INPUTS);
    const moved = moveNodes(doc, result, ["a"], [0, 5]);
    // World "up" is the group's local +x after a 90° rotation.
    expect(findNode(moved, "a")!.node.transform).toEqual({ x: "5" });
    expect(worldToLocalVector([0, 5], [result.nodes.g!.placement])).toEqual([5, expect.closeTo(0, 9)]);
  });

  it("moves a group once even when its children are selected too", () => {
    const doc = docOf([{ id: "g", name: "g", kind: "group", children: [rect("a", "10", "10")] }]);
    const moved = moveNodes(doc, render(doc, INPUTS), ["g", "a"], [1, 0]);
    expect(findNode(moved, "g")!.node.transform).toEqual({ x: "1" });
    expect(findNode(moved, "a")!.node.transform).toBeUndefined();
  });
});

describe("references and cycles", () => {
  const result = render(tuckEndBox, INPUTS);

  it("allows siblings in a group to reference each other", () => {
    expect(wouldCycle(tuckEndBox, result, "back", "front")).toBe(false);
  });

  it("refuses links that loop back", () => {
    // side1 is placed from front's right edge, so front cannot follow side1.
    expect(wouldCycle(tuckEndBox, result, "front", "side1")).toBe(true);
    expect(wouldCycle(tuckEndBox, result, "panels", "front")).toBe(true);
    expect(wouldCycle(tuckEndBox, result, "front", "front")).toBe(true);
  });

  it("lets a single drawn point land on a nearby corner over closer stray alignments", () => {
    // Near side1's top-left (60, 120); the outline has a vertex at x = 61 too.
    const snap = snapMoving([[60.6, 120.4]], snapTargets(result, []), 5);
    expect(snap.x!.target).toBe(snap.y!.target);
    expect([snap.x!.value, snap.y!.value]).toEqual([60, 120]);
  });

  it("prefers one target for coinciding corners", () => {
    const snap = snapMoving([[60.2, 0.1]], snapTargets(result, []), 2);
    expect(snap.x!.target).toBe(snap.y!.target);
  });

  it("picks tidy steps for free movement", () => {
    expect(niceStep(1)).toBe(5);
    expect(niceStep(4)).toBe(1);
    expect(niceStep(20)).toBe(0.2);
  });
});

describe("picking", () => {
  const result = render(tuckEndBox, INPUTS);

  it("selects the top-level node, or the child of the entered group", () => {
    expect(pickable(result, "foldGlue", null)).toBe("creases");
    expect(pickable(result, "foldGlue", "creases")).toBe("foldGlue");
    expect(pickable(result, "outline", "creases")).toBeNull();
  });
});

describe("handles", () => {
  it("resizes a rect from its right edge and from its left edge", () => {
    const doc = docOf([rect("a", "width", "20", { transform: { x: "5" } })]);
    const result = render(doc, INPUTS);
    const handles = handlesFor(findNode(doc, "a")!.node, result);
    expect(handles).toHaveLength(8);

    const right = handles.find((h) => h.key === "rect:1,0")!;
    expect(right.local).toEqual([100, 10]);
    expect(right.apply(findNode(doc, "a")!.node, [4, 0], { plain: false })).toMatchObject({ width: "width + 4" });

    const left = handles.find((h) => h.key === "rect:-1,0")!;
    expect(left.apply(findNode(doc, "a")!.node, [4, 0], { plain: false })).toMatchObject({
      width: "width - 4",
      transform: { x: "9" },
    });
  });

  it("moves a path point without dragging the rest of a relative path", () => {
    const path: Node = {
      id: "p",
      name: "p",
      kind: "path",
      lineType: "cut",
      closed: false,
      start: { x: "0", y: "0" },
      segments: [
        { type: "by", dx: "10", dy: "0" },
        { type: "by", dx: "0", dy: "10" },
      ],
    };
    const doc = docOf([path]);
    const result = render(doc, INPUTS);
    const handle = handlesFor(path, result).find((h) => h.key === "path:0")!;
    const next = handle.apply(path, [2, 3], { plain: false });
    expect(next.kind === "path" && next.segments).toEqual([
      { type: "by", dx: "12", dy: "3" },
      { type: "by", dx: "-2", dy: "7" },
    ]);

    const after = render(docOf([next]), INPUTS);
    expect(after.nodes.p!.anchors.p2).toEqual([10, 10]);
  });

  it("turns a snapped line end into a reference", () => {
    const line: Node = { id: "l", name: "l", kind: "line", lineType: "crease", from: { x: "0", y: "0" }, to: { x: "5", y: "5" } };
    const doc = docOf([line]);
    const handle = handlesFor(line, render(doc, INPUTS)).find((h) => h.key === "line:to")!;
    const next = handle.apply(line, [0, 0], { plain: false, refs: { x: "@a.topRight.x" } });
    expect(next.kind === "line" && next.to).toEqual({ x: "@a.topRight.x", y: "5" });
  });
});

describe("autocomplete", () => {
  const result = render(tuckEndBox, INPUTS);
  const ctx = { doc: tuckEndBox, result };
  const labels = (text: string, force = false) => completionsAt(text, text.length, ctx, force).map((c) => c.label);

  it("offers names in scope and functions", () => {
    expect(labels("wid")).toContain("width");
    expect(labels("glu")).toEqual(["glue", "glueTaper"]);
    expect(labels("cl")).toContain("clamp");
    expect(labels("12.")).toEqual([]);
  });

  it("walks references: nodes, then anchors and sizes, then axes", () => {
    // Prefix matches first, then names that merely contain the text.
    expect(labels("@si").slice(0, 2)).toEqual(["side1", "side2"]);
    expect(labels("@si")).toContain("foldBackSide");
    expect(labels("@side1.top")).toEqual(expect.arrayContaining(["top", "topLeft", "topRight"]));
    expect(labels("@side1.wi")).toEqual(["width"]);
    expect(labels("@side1.topLeft.")).toEqual(["x", "y"]);
  });

  it("completes a box body's dotted panel points", () => {
    const body = render(rteBox, INPUTS);
    const c = (text: string) => completionsAt(text, text.length, { doc: rteBox, result: body }).map((x) => x.label);
    expect(c("@body.front.top")).toEqual(expect.arrayContaining(["front.top", "front.topLeft", "front.topRight"]));
    expect(c("@body.front.topLeft.")).toEqual(["x", "y"]);
    expect(c("@body.side1.wi")).toEqual(["side1.width"]);
  });

  it("lists every edge of a body, pointing outwards", () => {
    const body = render(rteBox, INPUTS);
    const slots = edgeSlots(rteBox.nodes[0] as PanelsNode, body);
    expect(slots).toHaveLength(10);
    expect(slots.find((s) => s.path === "panels.0.bottom")).toMatchObject({ at: [30, 0], out: [0, -1] });
    expect(slots.find((s) => s.path === "right")!.feature?.component).toBe("lib:glueFlap");
  });

  it("replaces just the word being typed", () => {
    const text = "@front.right.x + gl";
    const [first] = completionsAt(text, text.length, ctx);
    expect(applyCompletion(text, first!)).toEqual({ text: "@front.right.x + glue", caret: 21 });
  });
});

describe("drawing", () => {
  const result = render(tuckEndBox, INPUTS);
  const corner = snapTargets(result, []).find((t) => t.nodeName === "side1" && t.anchor === "topLeft")!;

  it("links a shape drawn from a corner to that corner", () => {
    const node = placedShape(tuckEndBox, result, null, "rect", { p: [60, 120], target: corner }, { p: [90, 140] }, "cut");
    expect(node).toMatchObject({ kind: "rect", width: "30", height: "20", transform: { x: "@side1.topLeft.x", y: "@side1.topLeft.y" } });
  });

  it("takes the origin from the lower-left point when dragged backwards", () => {
    const node = placedShape(tuckEndBox, result, null, "rect", { p: [60, 120], target: corner }, { p: [30, 100] }, "crease");
    expect(node).toMatchObject({ width: "30", height: "20", lineType: "crease", transform: { x: "30", y: "100" } });
  });

  it("writes local numbers inside a moved group", () => {
    const doc = docOf([{ id: "g", name: "g", kind: "group", transform: { x: "100" }, children: [rect("a", "1", "1")] }]);
    const r = render(doc, INPUTS);
    const path = drawnPath(doc, r, "g", [{ p: [110, 0] }, { p: [120, 5] }], false, "cut");
    expect(path.start).toEqual({ x: "10", y: "0" });
    expect(path.segments).toEqual([{ type: "to", x: "20", y: "5" }]);
  });

  it("holds pen segments to 45° steps", () => {
    expect(constrain45([0, 0], [10, 1])).toEqual([expect.closeTo(Math.hypot(10, 1), 6), 0]);
  });
});

describe("grouping", () => {
  it("groups siblings and ungroups without moving anything", () => {
    const doc = docOf([rect("a", "10", "10"), rect("b", "10", "10", { transform: { x: "20" } })]);
    const grouped = groupNodes(doc, render(doc, INPUTS), ["b", "a"])!;
    expect(grouped.doc.nodes).toHaveLength(1);

    const shifted = updateNode(grouped.doc, grouped.id, (n) => ({ ...n, transform: { x: "width", y: "3" } }));
    const before = render(shifted, INPUTS).nodes.b!.bounds;
    const ungrouped = ungroupNode(shifted, grouped.id)!;
    expect(render(ungrouped.doc, INPUTS).nodes.b!.bounds).toEqual(before);
    expect(findNode(ungrouped.doc, "b")!.node.transform).toEqual({ x: "20 + (width)", y: "3" });
  });

  it("refuses to group nodes from different parents", () => {
    const doc = docOf([rect("a", "1", "1"), { id: "g", name: "g", kind: "group", children: [rect("b", "1", "1")] }]);
    expect(groupNodes(doc, render(doc, INPUTS), ["a", "b"])).toBeNull();
  });
});
