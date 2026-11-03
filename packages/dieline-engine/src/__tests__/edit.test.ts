import { describe, expect, it } from "vitest";
import { offsetExpr, refExpr, renameRefs } from "../edit/exprEdit";
import { duplicateNodes, findNode, insertNodes, removeNodes, renameNode, uniqueName, updateNode } from "../edit/tree";
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

  it("generates unique names", () => {
    expect(uniqueName(["panel"], "panel")).toBe("panel2");
    expect(uniqueName(["panel", "panel2"], "panel2")).toBe("panel3");
    expect(uniqueName([], "my panel")).toBe("my_panel");
    expect(uniqueName([], "3d")).toBe("_3d");
  });
});
