import { BUILTINS, EXPRESSION_FUNCTIONS, formatNumber, type DielineDocument, type RenderResult } from "@repo/dieline-engine";

export type CompletionKind = "builtin" | "param" | "variable" | "function" | "node" | "anchor" | "scalar" | "axis";

export type Completion = {
  label: string;
  /** Text that replaces `from`…`to` in the input. */
  insert: string;
  from: number;
  to: number;
  kind: CompletionKind;
  detail?: string;
};

const TOKEN = /@?[A-Za-z_]?[A-Za-z0-9_]*(?:\.[A-Za-z0-9_]*)*$/;
const LIMIT = 14;

/**
 * Suggestions for the word being typed at `caret`:
 *
 *   wid|            → width, …               (built-ins, params, variables, functions)
 *   @si|            → @side1., @side2.        (node names)
 *   @side1.top|     → @side1.topLeft., @side1.top., @side1.width
 *   @side1.top.|    → @side1.top.x, @side1.top.y
 *
 * `force` (Ctrl+Space) lists everything even for an empty word.
 */
export function completionsAt(
  text: string,
  caret: number,
  context: { doc: DielineDocument; result: RenderResult; selfId?: string },
  force = false,
): Completion[] {
  const before = text.slice(0, caret);
  const match = TOKEN.exec(before);
  const token = match?.[0] ?? "";
  const from = caret - token.length;

  // Don't pop up inside numbers ("12.5") or right after a closing bracket.
  if (!force && (token === "" || /^\d/.test(token))) return [];

  const { result } = context;

  if (token.startsWith("@")) {
    const parts = token.slice(1).split(".");
    const nodes = Object.values(result.nodes).filter((n) => n.id !== context.selfId);

    if (parts.length === 1) {
      return rank(
        nodes.map((n) => ({ label: n.name, insert: `@${n.name}.`, kind: "node" as const, detail: n.kind })),
        parts[0]!,
      ).map((c) => ({ ...c, from, to: caret }));
    }

    const node = nodes.find((n) => n.name === parts[0]);
    if (!node) return [];

    if (parts.length === 2) {
      const anchors = Object.entries(node.anchors).map(([name, p]) => ({
        label: name,
        insert: `@${node.name}.${name}.`,
        kind: "anchor" as const,
        detail: `${formatNumber(p[0], 1)}, ${formatNumber(p[1], 1)}`,
      }));
      const scalars = Object.entries(node.scalars).map(([name, v]) => ({
        label: name,
        insert: `@${node.name}.${name}`,
        kind: "scalar" as const,
        detail: formatNumber(v, 2),
      }));
      return rank([...scalars, ...anchors], parts[1]!, true).map((c) => ({ ...c, from, to: caret }));
    }

    if (parts.length === 3 && node.anchors[parts[1]!]) {
      const p = node.anchors[parts[1]!]!;
      return rank(
        (["x", "y"] as const).map((axis, i) => ({
          label: axis,
          insert: `@${node.name}.${parts[1]}.${axis}`,
          kind: "axis" as const,
          detail: formatNumber(p[i]!, 2),
        })),
        parts[2]!,
      ).map((c) => ({ ...c, from, to: caret }));
    }

    return [];
  }

  // A plain word: names in scope, then functions.
  const builtins = new Set<string>(BUILTINS);
  const params = new Set(context.doc.params.map((p) => p.name));
  const names = Object.entries(result.scope).map(([name, value]) => ({
    label: name,
    insert: name,
    kind: (builtins.has(name) ? "builtin" : params.has(name) ? "param" : "variable") as CompletionKind,
    detail: formatNumber(value, 2),
  }));
  const functions = Object.entries(EXPRESSION_FUNCTIONS).map(([name, signature]) => ({
    label: name,
    insert: `${name}(`,
    kind: "function" as const,
    detail: signature,
  }));

  return rank([...names, ...functions], token).map((c) => ({ ...c, from, to: caret }));
}

/**
 * Prefix matches first, then substring matches. A word typed out in full is
 * dropped (Enter should commit the field, not re-insert it), except for anchor
 * names, where accepting still continues the reference with a dot.
 */
function rank<T extends { label: string }>(items: T[], prefix: string, keepExact = false): T[] {
  const p = prefix.toLowerCase();
  const starts = items.filter((i) => i.label.toLowerCase().startsWith(p) && (keepExact || i.label !== prefix));
  const contains = items.filter((i) => !i.label.toLowerCase().startsWith(p) && i.label.toLowerCase().includes(p));
  return [...starts, ...contains].slice(0, LIMIT);
}

/** Applies a completion to the text, returning the new text and caret. */
export function applyCompletion(text: string, c: Completion): { text: string; caret: number } {
  return { text: text.slice(0, c.from) + c.insert + text.slice(c.to), caret: c.from + c.insert.length };
}
