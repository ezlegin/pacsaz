import { describe, expect, it } from "vitest";
import { compile, evalCondition, evalNumber, ExprError } from "../expr/expr";

const num = (source: string, scope: Record<string, unknown> = {}) =>
  evalNumber(compile(source), scope);

describe("expressions", () => {
  it("evaluates arithmetic against a scope", () => {
    expect(num("width + 2 * thickness", { width: 100, thickness: 1.5 })).toBe(103);
    expect(num("12.5")).toBe(12.5);
    expect(num("-3")).toBe(-3);
  });

  it("offers degree trigonometry and helpers", () => {
    expect(num("sind(30)")).toBeCloseTo(0.5);
    expect(num("atan2d(1, 1)")).toBeCloseTo(45);
    expect(num("clamp(50, 12, 25)")).toBe(25);
    expect(num("max(3, 7) + min(1, 2)")).toBe(8);
    expect(num("pi")).toBeCloseTo(Math.PI);
  });

  it("accepts JavaScript-style logic and conditionals", () => {
    const scope = { width: 120 };
    expect(evalCondition(compile("width > 100 && width < 130"), scope)).toBe(true);
    expect(evalCondition(compile("!(width > 100)"), scope)).toBe(false);
    expect(evalCondition(compile("width != 100 || false"), scope)).toBe(true);
    expect(num("width > 100 ? 10 : 20", scope)).toBe(10);
  });

  it("reports the free names an expression reads", () => {
    expect(compile("width + glue * 2 - sind(angle)").symbols.sort()).toEqual(["angle", "glue", "width"]);
  });

  it("extracts references", () => {
    const c = compile("@lid.topRight.x + @side.width");
    expect(c.refs.map((r) => [r.node, r.path])).toEqual([
      ["lid", ["topRight", "x"]],
      ["side", ["width"]],
    ]);
    expect(evalNumber(c, { __ref0: 10, __ref1: 5 })).toBe(15);
  });

  it.each([
    ["a = 1", "Assignment"],
    ["f(x) = x", "Defining functions"],
    ["[1, 2]", "Arrays"],
    ["{a: 1}", "Objects"],
    ["1:10", "Ranges"],
    ['"text"', "Only numbers"],
    ["import({}, {})", "Unknown function"],
    ["evaluate(\"1\")", "Unknown function"],
    ["range(1, 1e9)", "Unknown function"],
    ["1; 2", "Multiple statements"],
  ])("rejects %s", (source, message) => {
    expect(() => compile(source)).toThrow(message);
  });

  it("rejects unknown names, including units", () => {
    expect(() => num("5 cm")).toThrow('Unknown name "cm"');
    expect(() => num("width")).toThrow('Unknown name "width"');
  });

  it("rejects results that are not finite numbers", () => {
    expect(() => num("1 / 0")).toThrow("infinite");
    expect(() => num("sqrt(-1)")).toThrow(ExprError);
  });

  it("rejects empty and oversized expressions", () => {
    expect(() => compile("  ")).toThrow("Empty");
    expect(() => compile("1+".repeat(300) + "1")).toThrow("longer than");
  });

  it("rejects malformed references", () => {
    expect(() => compile("@ + 1")).toThrow("reference");
  });
});
