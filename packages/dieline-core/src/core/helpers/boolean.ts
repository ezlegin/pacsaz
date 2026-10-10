import M from "makerjs";

export type BooleanMode = "union" | "subtract" | "intersect";

/**
 * Combine a list of models with a boolean operation, folding left.
 *   union      → a ∪ b ∪ c …
 *   intersect  → a ∩ b ∩ c …
 *   subtract   → a − b − c …   (order matters: first is the base)
 *
 * Each intermediate result is wrapped (as returned by combineX) so it can
 * act as an operand for the next fold. Operands are cloned so the caller's
 * originals aren't mutated by makerjs.
 */
export function applyBoolean(
  children: M.IModel[],
  mode: BooleanMode,
): M.IModel {
  if (children.length === 0) return { models: {} };
  if (children.length === 1) return M.model.clone(children[0]) as M.IModel;

  const combine =
    mode === "union"
      ? M.model.combineUnion
      : mode === "intersect"
        ? M.model.combineIntersection
        : M.model.combineSubtraction;

  let acc: M.IModel = M.model.clone(children[0]) as M.IModel;

  for (let i = 1; i < children.length; i++) {
    const b = M.model.clone(children[i]) as M.IModel;
    acc = combine(acc, b);
  }

  return acc;
}
