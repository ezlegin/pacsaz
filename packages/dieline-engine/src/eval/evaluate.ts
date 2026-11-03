import { compile, evalNumber, ExprError } from "../expr/expr";
import type { RenderResult } from "./render";
import { messageOf } from "./scope";

/**
 * Evaluates one expression against a finished render, the way the editor shows
 * "= 120" next to a field. References resolve from the nodes' world anchors and
 * scalars, which is what the renderer itself used.
 */
export function evaluateExpression(
  result: RenderResult,
  source: string,
): { value: number; error?: undefined } | { value?: undefined; error: string } {
  try {
    const compiled = compile(source);
    const byName = new Map(Object.values(result.nodes).map((n) => [n.name, n]));
    const refs: Record<string, number> = {};

    for (const ref of compiled.refs) {
      const info = byName.get(ref.node);
      if (!info) throw new ExprError(`No shape is named "${ref.node}"`);
      if (info.failed) throw new ExprError(`"${ref.node}" has an error`);

      const [first, second] = ref.path;
      if (!first) throw new ExprError(`Write @${ref.node}.width or @${ref.node}.anchor.x`);

      if (second === undefined) {
        const scalar = info.scalars[first];
        if (scalar === undefined) throw new ExprError(`"${ref.node}" has no "${first}"`);
        refs[ref.symbol] = scalar;
      } else {
        const anchor = info.anchors[first];
        if (!anchor) throw new ExprError(`"${ref.node}" has no point "${first}"`);
        if (second !== "x" && second !== "y") throw new ExprError("Use .x or .y");
        refs[ref.symbol] = second === "x" ? anchor[0] : anchor[1];
      }
    }

    return { value: evalNumber(compiled, { ...result.scope, ...refs }) };
  } catch (error) {
    return { error: messageOf(error) };
  }
}
