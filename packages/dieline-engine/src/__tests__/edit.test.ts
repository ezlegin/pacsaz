import { describe, expect, it } from "vitest";
import { offsetExpr, refExpr, renameRefs } from "../edit/exprEdit";
import {
  duplicateNodes,
  findNode,
  insertNodes,
  moveNode,
  removeNodes,
  renameNode,
  renameSymbol,
  uniqueName,
  updateNode,
} from "../edit/tree";
import { evaluateExpression } from "../eval/evaluate";
import { render } from "../eval/render";
import { tuckEndBox } from "../fixtures/tuckEnd";
import type { Node } from "../spec/types";
import { doc, errors, INPUTS, rect } from "./helpers";

describe("offsetExpr", () => {
  it.each([
    ["12", 3, "15"],
    ["width + 12", 3, "width + 15"],
    ["width - 2", 2, "width"],
    ["width - 2", 5, "width + 3"],
    ["width + 1", -4, "width - 3"],
    ["width / 2", 3, "width / 2 + 3"],
    ["width", -1.5, "width - 1.5"],
    ["width * 2 + 3", 1, "width * 2 + 4"],
    ["@lid.right.x + 2", 1, "@lid.right.x + 3"],
    ["width > 1 ? 4 : 5", 1, "(width > 1 ? 4 : 5) + 1"],
    ["2 * (width + 3)", 1, "2 * (width + 3) + 1"],
    ["", 4, "4"],
    ["width", 0, "width"],
    ["0.1", 0.2, "0.3"],
  ])("%s %+d → %s", (source, delta, expected) => {
    expect(offsetExpr(source, delta)).toBe(expected);
  });

  it("writes references with offsets", () => {
    expect(refExpr("side", "topRight", "x")).toBe("@side.topRight.x");
    expect(refExpr("side", "topRight", "y", -2)).toBe("@side.topRight.y - 2");
  });

  it("renames references only for the given node", () => {
    expect(renameRefs("@a.x + @ab.width + @a.top.y", "a", "b")).toBe("@b.x + @ab.width + @b.top.y");
  });
});

describe("tree operations", () => {
  const base = doc({
    nodes: [
      rect("a", "10", "10"),
      { id: "g", name: "g", kind: "group", children: [rect("b", "@a.width", "5")] },
    ],
  });

  it("finds, updates, inserts and removes without mutating", () => {
    expect(findNode(base, "b")?.parent?.id).toBe("g");
    const updated = updateNode(base, "b", (n) => ({ ...n, hidden: true }));
    expect(findNode(updated, "b")?.node.hidden).toBe(true);
    expect(findNode(base, "b")?.node.hidden).toBeUndefined();

    const inserted = insertNodes(base, [rect("c", "1", "1")], "g", 0);
    expect((findNode(inserted, "g")!.node as Extract<Node, { kind: "group" }>).children[0]!.id).toBe("c");

    expect(findNode(removeNodes(base, ["b"]), "b")).toBeNull();
  });

  it("renames and rewrites references across the document", () => {
    const renamed = renameNode(tuckEndBox, "front", "frontPanel");
    expect(errors(render(renamed, INPUTS))).toEqual([]);
    expect(JSON.stringify(renamed)).not.toContain("@front.");
  });

  it("duplicates with fresh names and keeps internal links internal", () => {
    const linked = doc({
      nodes: [
        {
          id: "g",
          name: "pair",
          kind: "group",
          children: [rect("left", "10", "10"), rect("right", "10", "10", { transform: { x: "@left.right.x" } } as Partial<Node>)],
        },
      ],
    });
    const { doc: next, ids } = duplicateNodes(linked, ["g"]);
    const copy = findNode(next, ids[0]!)!.node as Extract<Node, { kind: "group" }>;
    expect(copy.name).toBe("pair2");
    expect(copy.children.map((c) => c.name)).toEqual(["left2", "right2"]);
    expect(copy.children[1]!.transform?.x).toBe("@left2.right.x");
    expect(errors(render(next, INPUTS))).toEqual([]);
  });

  it("moves nodes between groups and refuses moving a group into itself", () => {
    const moved = moveNode(base, "a", "g", 0);
    expect(findNode(moved, "a")?.parent?.id).toBe("g");
    expect(moveNode(base, "g", "g", 0)).toBe(base);

    const reordered = moveNode(base, "g", null, 0);
    expect(reordered.nodes.map((n) => n.id)).toEqual(["g", "a"]);
  });

  it("evaluates a single expression against a render", () => {
    const result = render(tuckEndBox, INPUTS);
    expect(evaluateExpression(result, "@side1.right.x + glue").value).toBe(160 + 18);
    expect(evaluateExpression(result, "@nope.x").error).toContain("nope");
    expect(evaluateExpression(result, "width +").error).toBeDefined();
  });

  it("renames variables everywhere they are used, and nothing else", () => {
    const renamed = renameSymbol(tuckEndBox, "glue", "glueWidth");
    const json = JSON.stringify(renamed);
    expect(json).toContain("@side2.topRight.x + glueWidth");
    // No expression still says `glue` (the quoted name of the variable itself is data).
    expect(json).not.toMatch(/[^@.\w"]glue[^\w"]/);
    // The variable's own name is data, not an expression.
    expect(renamed.variables.find((v) => v.name === "glue")).toBeDefined();
    expect(renameSymbol(doc({ nodes: [rect("from", "@from.width + from", "1")] }), "from", "f").nodes[0]).toMatchObject({
      width: "@from.width + f",
    });
  });

  it("skips disabled modifiers", () => {
    const d = doc({ nodes: [rect("a", "10", "10", { modifiers: [{ type: "array", count: "3", dx: "20", dy: "0", disabled: true }] } as Partial<Node>)] });
    expect(render(d, INPUTS).bounds!.maxX).toBe(10);
  });

  it("generates unique names", () => {
    expect(uniqueName(["panel"], "panel")).toBe("panel2");
    expect(uniqueName(["panel", "panel2"], "panel2")).toBe("panel3");
    expect(uniqueName([], "my panel")).toBe("my_panel");
    expect(uniqueName([], "3d")).toBe("_3d");
  });
});
