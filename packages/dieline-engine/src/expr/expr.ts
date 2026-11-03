import { all, create, type MathNode } from "mathjs";
import { LIMITS } from "../spec/schema";

/**
 * Restricted expression language.
 *
 * Expressions come from template designers and, in Customize mode, from paying
 * customers, so they are treated as untrusted. Instead of trying to disable
 * every dangerous mathjs feature, the parsed tree is checked against an
 * allow-list: numbers, booleans, identifiers, operators, `a ? b : c`, and calls
 * to the functions listed below. Anything else (assignments, function
 * definitions, matrices, ranges, objects, strings, units) is rejected before it
 * can run.
 */

const math = create(all!, {});

// Degree-based trigonometry: dieline designers think in degrees.
const RAD = Math.PI / 180;
math.import(
  {
    sind: (d: number) => Math.sin(d * RAD),
    cosd: (d: number) => Math.cos(d * RAD),
    tand: (d: number) => Math.tan(d * RAD),
    asind: (v: number) => Math.asin(v) / RAD,
    acosd: (v: number) => Math.acos(v) / RAD,
    atand: (v: number) => Math.atan(v) / RAD,
    atan2d: (y: number, x: number) => Math.atan2(y, x) / RAD,
    clamp: (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v)),
    lerp: (a: number, b: number, t: number) => a + (b - a) * t,
  },
  { override: true },
);

const parse = math.parse;

// Defence in depth: even though the allow-list never lets these be called, make
// sure they are unusable through the instance too.
const disabled = () => {
  throw new Error("Disabled");
};
math.import(
  {
    import: disabled,
    createUnit: disabled,
    evaluate: disabled,
    parse: disabled,
    simplify: disabled,
    derivative: disabled,
    resolve: disabled,
    reviver: disabled,
  },
  { override: true },
);

const ALLOWED_FUNCTIONS = new Set([
  "abs", "ceil", "floor", "round", "fix", "sign", "sqrt", "cbrt", "pow", "exp",
  "log", "log10", "log2", "min", "max", "mod", "hypot",
  "sin", "cos", "tan", "asin", "acos", "atan", "atan2",
  "sind", "cosd", "tand", "asind", "acosd", "atand", "atan2d",
  "clamp", "lerp",
]);

/** Functions with a one-line signature, for autocomplete and help. */
export const EXPRESSION_FUNCTIONS: Record<string, string> = {
  min: "min(a, b, …)", max: "max(a, b, …)", clamp: "clamp(value, low, high)",
  lerp: "lerp(a, b, t)", abs: "abs(x)", round: "round(x)", floor: "floor(x)",
  ceil: "ceil(x)", sqrt: "sqrt(x)", pow: "pow(x, y)", hypot: "hypot(a, b)",
  mod: "mod(a, b)", sign: "sign(x)",
  sind: "sind(degrees)", cosd: "cosd(degrees)", tand: "tand(degrees)",
  asind: "asind(x) → degrees", acosd: "acosd(x) → degrees", atand: "atand(x) → degrees",
  atan2d: "atan2d(y, x) → degrees",
};

/** Constants the language provides; never reported as free identifiers. */
const CONSTANTS = new Set(["pi", "e", "tau", "phi"]);

const ALLOWED_NODE_TYPES = new Set([
  "ConstantNode",
  "SymbolNode",
  "OperatorNode",
  "ParenthesisNode",
  "ConditionalNode",
  "FunctionNode",
]);

export class ExprError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExprError";
  }
}

/** A reference to another node, e.g. `@lid.topRight.x` → node `lid`, path `[topRight, x]`. */
export type Ref = { symbol: string; node: string; path: string[] };

export type Compiled = {
  source: string;
  /** Free identifiers (params, variables, built-ins) the expression reads. */
  symbols: string[];
  refs: Ref[];
  run: (scope: Record<string, unknown>) => unknown;
};

const REF_PATTERN = /@([A-Za-z_][A-Za-z0-9_]*)((?:\.[A-Za-z_][A-Za-z0-9_]*)*)/g;
const NUMBER_PATTERN = /^\s*-?(\d+\.?\d*|\.\d+)\s*$/;

/**
 * mathjs spells logical operators `and` / `or` / `not`, but people type `&&`,
 * `||` and `!`. Multi-character operators are replaced first so `!=` survives.
 */
function normalize(source: string): string {
  return source
    .replace(/&&/g, " and ")
    .replace(/\|\|/g, " or ")
    .replace(/!(?!=)/g, " not ");
}

const cache = new Map<string, Compiled>();
const CACHE_LIMIT = 5000;

/**
 * Parses, checks and compiles an expression. Results are cached by source, so the
 * same expression evaluated for every render is only parsed once.
 */
export function compile(source: string): Compiled {
  const hit = cache.get(source);
  if (hit) return hit;

  const compiled = compileUncached(source);

  if (cache.size >= CACHE_LIMIT) cache.clear();
  cache.set(source, compiled);
  return compiled;
}

function compileUncached(source: string): Compiled {
  if (source.length > LIMITS.expressionLength) {
    throw new ExprError(
      `Expression is longer than ${LIMITS.expressionLength} characters`,
    );
  }
  if (source.trim().length === 0) throw new ExprError("Empty expression");

  // Plain numbers are by far the most common input; skip mathjs for them.
  if (NUMBER_PATTERN.test(source)) {
    const value = Number(source);
    return { source, symbols: [], refs: [], run: () => value };
  }

  const refs: Ref[] = [];
  const rewritten = normalize(source).replace(
    REF_PATTERN,
    (_match, node: string, rest: string) => {
      const symbol = `__ref${refs.length}`;
      refs.push({ symbol, node, path: rest.split(".").filter(Boolean) });
      return symbol;
    },
  );

  if (rewritten.includes("@")) {
    throw new ExprError("A reference must look like @name.anchor.x");
  }

  let tree: MathNode;
  try {
    tree = parse(rewritten);
  } catch (error) {
    throw new ExprError(cleanMessage(error));
  }

  const symbols = new Set<string>();
  tree.traverse((node, path, parent) => {
    if (!ALLOWED_NODE_TYPES.has(node.type)) {
      throw new ExprError(`${describe(node.type)} is not allowed`);
    }

    if (node.type === "ConstantNode") {
      const value = (node as unknown as { value: unknown }).value;
      if (typeof value !== "number" && typeof value !== "boolean") {
        throw new ExprError("Only numbers are allowed");
      }
    }

    if (node.type === "FunctionNode") {
      const fn = (node as unknown as { fn: MathNode }).fn;
      const fnName =
        fn.type === "SymbolNode" ? (fn as unknown as { name: string }).name : "";
      if (!ALLOWED_FUNCTIONS.has(fnName)) {
        throw new ExprError(`Unknown function "${fnName || "?"}"`);
      }
    }

    if (node.type === "SymbolNode") {
      // The callee of a function call is a SymbolNode too; it is not a variable.
      if (parent?.type === "FunctionNode" && path === "fn") return;

      const symbolName = (node as unknown as { name: string }).name;
      if (!symbolName.startsWith("__ref") && !CONSTANTS.has(symbolName)) {
        symbols.add(symbolName);
      }
    }
  });

  const code = tree.compile();

  return {
    source,
    symbols: [...symbols],
    refs,
    run: (scope) => code.evaluate({ ...scope }),
  };
}

/** Evaluates to a finite number or throws an `ExprError`. */
export function evalNumber(
  compiled: Compiled,
  scope: Record<string, unknown>,
): number {
  const value = runSafely(compiled, scope);

  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value !== "number") throw new ExprError("Result is not a number");
  if (!Number.isFinite(value)) {
    throw new ExprError(
      Number.isNaN(value) ? "Result is not a number" : "Result is infinite",
    );
  }
  return value;
}

/** Evaluates a condition. Any non-zero number counts as true. */
export function evalCondition(
  compiled: Compiled,
  scope: Record<string, unknown>,
): boolean {
  const value = runSafely(compiled, scope);
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0 && !Number.isNaN(value);
  throw new ExprError("Condition is not true/false");
}

function runSafely(compiled: Compiled, scope: Record<string, unknown>) {
  for (const name of compiled.symbols) {
    if (!(name in scope)) throw new ExprError(`Unknown name "${name}"`);
  }

  try {
    return compiled.run(scope);
  } catch (error) {
    if (error instanceof ExprError) throw error;
    throw new ExprError(cleanMessage(error));
  }
}

function cleanMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/__ref\d+/g, "reference");
}

function describe(type: string): string {
  switch (type) {
    case "AssignmentNode":
      return "Assignment";
    case "FunctionAssignmentNode":
      return "Defining functions";
    case "ArrayNode":
    case "IndexNode":
      return "Arrays";
    case "ObjectNode":
    case "AccessorNode":
      return "Objects";
    case "RangeNode":
      return "Ranges";
    case "BlockNode":
      return "Multiple statements";
    default:
      return type.replace(/Node$/, "");
  }
}

/** Every name an expression depends on, for dependency ordering and renames. */
export function dependencies(source: string): {
  symbols: string[];
  nodes: string[];
} {
  const compiled = compile(source);
  return {
    symbols: compiled.symbols,
    nodes: [...new Set(compiled.refs.map((r) => r.node))],
  };
}
