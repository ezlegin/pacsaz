import { compile, evalCondition, evalNumber, ExprError } from "../expr/expr";
import type { Param, Variable } from "../spec/types";
import type { Diagnostics } from "./diagnostics";

export const BUILTINS = ["width", "length", "height", "thickness"] as const;
export type Builtins = Record<(typeof BUILTINS)[number], number>;

export type Scope = Record<string, number>;

/**
 * Resolves params and variables into one scope of numbers.
 *
 * Variables may be written in any order and use each other freely; they are
 * evaluated in dependency order. A cycle, or a variable that depends on a broken
 * one, is reported and left out of the scope, so only expressions that actually
 * use it fail.
 */
export function buildScope(
  builtins: Builtins,
  params: readonly Param[],
  variables: readonly Variable[],
  overrides: Record<string, number> | undefined,
  diagnostics: Diagnostics,
  /** Prefix for diagnostics raised inside a component. */
  owner?: string,
  /** Extra built-in values, such as `edge` inside an edge feature. */
  extra: Record<string, number> = {},
): Scope {
  const scope: Scope = { ...builtins, ...extra };
  const taken = new Set<string>([...BUILTINS, ...Object.keys(extra)]);
  const where = owner ? ` (in ${owner})` : "";

  for (const param of params) {
    if (taken.has(param.name)) {
      diagnostics.error({ type: "param", name: param.name }, `"${param.name}" is already defined${where}`);
      continue;
    }
    taken.add(param.name);

    let value = overrides?.[param.name] ?? param.default;
    if (!Number.isFinite(value)) value = param.default;

    if (param.min !== undefined && value < param.min) {
      diagnostics.warn({ type: "param", name: param.name }, `Raised to the minimum ${param.min}${where}`);
      value = param.min;
    }
    if (param.max !== undefined && value > param.max) {
      diagnostics.warn({ type: "param", name: param.name }, `Lowered to the maximum ${param.max}${where}`);
      value = param.max;
    }
    scope[param.name] = value;
  }

  // Collect each variable's dependencies on other variables.
  const byName = new Map<string, Variable>();
  const deps = new Map<string, Set<string>>();

  for (const v of variables) {
    if (taken.has(v.name) || byName.has(v.name)) {
      diagnostics.error({ type: "variable", name: v.name }, `"${v.name}" is already defined${where}`);
      continue;
    }
    byName.set(v.name, v);
  }

  const broken = new Set<string>();

  for (const [name, v] of byName) {
    const needs = new Set<string>();
    const sources: [string, string][] = [
      ["expr", v.expr],
      ...(v.cases ?? []).flatMap((c, i): [string, string][] => [
        [`cases.${i}.when`, c.when],
        [`cases.${i}.expr`, c.expr],
      ]),
    ];

    for (const [field, source] of sources) {
      try {
        const compiled = compile(source);
        if (compiled.refs.length > 0) {
          throw new ExprError("Variables cannot reference shapes; use the reference in the shape itself");
        }
        for (const s of compiled.symbols) if (byName.has(s)) needs.add(s);
      } catch (error) {
        diagnostics.error({ type: "variable", name, field }, messageOf(error));
        broken.add(name);
      }
    }
    deps.set(name, needs);
  }

  // Depth-first topological order with cycle detection.
  const state = new Map<string, "visiting" | "done">();
  const order: string[] = [];
  const cyclic = new Set<string>();

  const visit = (name: string, trail: string[]) => {
    const s = state.get(name);
    if (s === "done") return;
    if (s === "visiting") {
      const cycle = trail.slice(trail.indexOf(name));
      for (const member of cycle) cyclic.add(member);
      return;
    }
    state.set(name, "visiting");
    for (const dep of deps.get(name) ?? []) visit(dep, [...trail, name]);
    state.set(name, "done");
    order.push(name);
  };

  for (const name of byName.keys()) visit(name, []);

  for (const name of cyclic) {
    diagnostics.error(
      { type: "variable", name },
      `"${name}" depends on itself through other variables`,
    );
    broken.add(name);
  }

  for (const name of order) {
    if (broken.has(name)) continue;

    const v = byName.get(name)!;
    const failedDep = [...(deps.get(name) ?? [])].find((d) => broken.has(d));
    if (failedDep) {
      diagnostics.error({ type: "variable", name }, `Uses "${failedDep}", which has an error`);
      broken.add(name);
      continue;
    }

    // `field` always names the expression being evaluated when something fails.
    let field = "expr";
    try {
      let source: string | null = null;
      for (const [i, c] of (v.cases ?? []).entries()) {
        field = `cases.${i}.when`;
        if (evalCondition(compile(c.when), scope)) {
          source = c.expr;
          field = `cases.${i}.expr`;
          break;
        }
      }
      if (source === null) {
        source = v.expr;
        field = "expr";
      }

      scope[name] = evalNumber(compile(source), scope);
    } catch (error) {
      diagnostics.error({ type: "variable", name, field }, messageOf(error));
      broken.add(name);
    }
  }

  return scope;
}

export function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
