import { describe, expect, it } from "vitest";
import { render } from "../eval/render";
import { doc, INPUTS } from "./helpers";

describe("params and variables", () => {
  it("evaluates variables in dependency order, whatever order they are written in", () => {
    const result = render(
      doc({
        variables: [
          { name: "c", expr: "b * 2" },
          { name: "b", expr: "a + 1" },
          { name: "a", expr: "width / 10" },
        ],
      }),
      INPUTS,
    );
    expect(result.scope).toMatchObject({ a: 10, b: 11, c: 22 });
    expect(result.diagnostics).toEqual([]);
  });

  it("uses the first matching case", () => {
    const variables = [
      {
        name: "flap",
        expr: "11",
        cases: [
          { when: "width >= 180", expr: "25" },
          { when: "width >= 100", expr: "15" },
        ],
      },
    ];
    expect(render(doc({ variables }), INPUTS).scope.flap).toBe(15);
    expect(render(doc({ variables }), { ...INPUTS, width: 200 }).scope.flap).toBe(25);
    expect(render(doc({ variables }), { ...INPUTS, width: 50 }).scope.flap).toBe(11);
  });

  it("reports cycles and only breaks what depends on them", () => {
    const result = render(
      doc({
        variables: [
          { name: "a", expr: "b + 1" },
          { name: "b", expr: "a + 1" },
          { name: "c", expr: "a * 2" },
          { name: "ok", expr: "5" },
        ],
      }),
      INPUTS,
    );
    const names = result.diagnostics.map((d) => (d.target.type === "variable" ? d.target.name : "")).sort();
    expect(names).toEqual(["a", "b", "c"]);
    expect(result.scope.ok).toBe(5);
    expect(result.scope.a).toBeUndefined();
  });

  it("pins errors to the failing case field", () => {
    const result = render(
      doc({ variables: [{ name: "v", expr: "1", cases: [{ when: "nope > 1", expr: "2" }] }] }),
      INPUTS,
    );
    expect(result.diagnostics[0]?.target).toEqual({ type: "variable", name: "v", field: "cases.0.when" });
  });

  it("applies param overrides within their range", () => {
    const params = [{ name: "flap", default: 10, min: 5, max: 20 }];
    expect(render(doc({ params }), INPUTS).scope.flap).toBe(10);
    expect(render(doc({ params }), { ...INPUTS, params: { flap: 15 } }).scope.flap).toBe(15);

    const clamped = render(doc({ params }), { ...INPUTS, params: { flap: 99 } });
    expect(clamped.scope.flap).toBe(20);
    expect(clamped.diagnostics[0]?.severity).toBe("warning");
  });

  it("rejects names that shadow built-ins or each other", () => {
    const result = render(
      doc({
        params: [{ name: "width", default: 1 }],
        variables: [
          { name: "x", expr: "1" },
          { name: "x", expr: "2" },
        ],
      }),
      INPUTS,
    );
    expect(result.diagnostics.filter((d) => d.severity === "error")).toHaveLength(2);
    expect(result.scope.width).toBe(INPUTS.width);
  });

  it("does not let variables reference shapes", () => {
    const result = render(doc({ variables: [{ name: "v", expr: "@lid.width" }] }), INPUTS);
    expect(result.diagnostics[0]?.message).toContain("cannot reference shapes");
  });
});
