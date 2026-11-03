import { parse, type MathNode } from "mathjs";

/**
 * Text edits on expressions, used when the canvas changes a value the designer
 * wrote as a formula.
 *
 * The rule for direct manipulation: a drag adjusts the trailing constant and
 * keeps the formula, so `width + 12` dragged 3 mm becomes `width + 15` and still
 * follows `width`. Only when the designer asks for a plain number (Alt) is the
 * formula replaced.
 */

const NUMBER = /^\s*-?(\d+\.?\d*|\.\d+)\s*$/;
const TRAILING = /\s*([+-])\s*(\d+\.?\d*|\.\d+)\s*$/;
const REF = /@([A-Za-z_][A-Za-z0-9_]*)((?:\.[A-Za-z_][A-Za-z0-9_]*)*)/g;

/** Millimetre values are kept to a thousandth; trailing zeros are dropped. */
export function formatNumber(value: number, decimals = 3): string {
  const factor = 10 ** decimals;
  const rounded = Math.round(value * factor) / factor;
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

function tryParse(source: string): MathNode | null {
  try {
    // References are not mathjs syntax; stand-in symbols keep the structure.
    return parse(source.replace(REF, (_m, node: string) => `__ref_${node}`));
  } catch {
    return null;
  }
}

/** Operators that bind looser than `+`, so appending a term needs parentheses. */
const LOOSE = new Set([
  "equal", "unequal", "smaller", "larger", "smallerEq", "largerEq",
  "and", "or", "xor", "not",
]);

/**
 * Adds `delta` to an expression, preferring to change its trailing constant:
 *
 *   12            + 3  →  15
 *   width + 12    + 3  →  width + 15
 *   width - 2     + 2  →  width
 *   width / 2     + 3  →  width / 2 + 3
 *   a ? b : c     + 1  →  (a ? b : c) + 1
 */
export function offsetExpr(source: string, delta: number): string {
  const d = Number(formatNumber(delta));
  if (d === 0) return source;

  if (NUMBER.test(source)) return formatNumber(Number(source) + d);
  if (source.trim() === "") return formatNumber(d);

  const tree = tryParse(source);
  const op = tree?.type === "OperatorNode" ? (tree as unknown as { fn: string; args: MathNode[] }) : null;

  // `x + c` / `x - c` with a numeric right operand: change c in place.
  if (op && (op.fn === "add" || op.fn === "subtract") && op.args[1]?.type === "ConstantNode") {
    const match = TRAILING.exec(source);
    if (match) {
      const prefix = source.slice(0, match.index);
      const current = (match[1] === "-" ? -1 : 1) * Number(match[2]);
      return appendTerm(prefix, current + d);
    }
  }

  const needsParens =
    tree?.type === "ConditionalNode" || (op !== null && LOOSE.has(op.fn));
  return appendTerm(needsParens ? `(${source.trim()})` : source.trim(), d);
}

function appendTerm(prefix: string, value: number): string {
  const v = Number(formatNumber(value));
  if (v === 0) return prefix.trim();
  return `${prefix.trim()} ${v < 0 ? "-" : "+"} ${formatNumber(Math.abs(v))}`;
}

/** An expression that points at another node's anchor, plus a fixed offset. */
export function refExpr(node: string, anchor: string, axis: "x" | "y", offset = 0): string {
  return offsetExpr(`@${node}.${anchor}.${axis}`, offset);
}

/** Rewrites `@from...` references to `@to...`. */
export function renameRefs(source: string, from: string, to: string): string {
  return source.replace(REF, (match, node: string, rest: string) =>
    node === from ? `@${to}${rest}` : match,
  );
}

/** Names of the nodes an expression references. */
export function referencedNodes(source: string): string[] {
  return [...source.matchAll(REF)].map((m) => m[1]!);
}
