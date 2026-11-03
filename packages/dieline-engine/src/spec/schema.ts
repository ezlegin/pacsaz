import { z } from "zod";
import {
  LINE_TYPES,
  SPEC_VERSION,
  type DielineDocument,
  type LineType,
  type Node,
} from "./types";

/**
 * Runtime validation of a document. Customize mode stores specs written by paying
 * customers, so everything that reaches the server goes through `parseDocument`.
 * The limits bound how much work one document can ask of the renderer.
 */
export const LIMITS = {
  expressionLength: 500,
  nameLength: 64,
  nodes: 2000,
  depth: 16,
  segments: 500,
  arrayCount: 500,
  components: 200,
} as const;

const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

const expr = z.string().max(LIMITS.expressionLength);
const name = z.string().min(1).max(LIMITS.nameLength).regex(NAME_PATTERN, {
  message: "Names start with a letter or _ and use only letters, digits and _",
});
const point = z.object({ x: expr, y: expr });
const lineType = z.enum(LINE_TYPES as [LineType, ...LineType[]]);

const transform = z
  .object({
    x: expr.optional(),
    y: expr.optional(),
    rotate: expr.optional(),
    mirrorX: z.boolean().optional(),
    mirrorY: z.boolean().optional(),
  })
  .strict();

const rule = z.object({
  id: z.string(),
  when: expr,
  action: z.enum(["hide", "show"]),
});

const disabled = { disabled: z.boolean().optional() };

const modifier = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("round"),
    radius: expr,
    corners: z.array(z.number().int().min(0)).optional(),
    ...disabled,
  }),
  z.object({ type: z.literal("roundFull"), ...disabled }),
  z.object({ type: z.literal("array"), count: expr, dx: expr, dy: expr, ...disabled }),
  z.object({
    type: z.literal("mirrorCopy"),
    axis: z.enum(["x", "y"]),
    at: expr,
    ...disabled,
  }),
  z.object({
    type: z.literal("copy"),
    dx: expr,
    dy: expr,
    rotate: expr.optional(),
    mirrorX: z.boolean().optional(),
    mirrorY: z.boolean().optional(),
    ...disabled,
  }),
  z.object({ type: z.literal("offset"), distance: expr, ...disabled }),
]);

const base = {
  id: z.string().min(1),
  name,
  label: z.string().max(200).optional(),
  hidden: z.boolean().optional(),
  locked: z.boolean().optional(),
  transform: transform.optional(),
  modifiers: z.array(modifier).max(32).optional(),
  rules: z.array(rule).max(32).optional(),
};

const shapeBase = { ...base, lineType };

const segmentExtras = {
  lineType: lineType.optional(),
  round: expr.optional(),
};

const segment = z.discriminatedUnion("type", [
  z.object({ type: z.literal("to"), x: expr, y: expr, ...segmentExtras }),
  z.object({ type: z.literal("by"), dx: expr, dy: expr, ...segmentExtras }),
  z.object({
    type: z.literal("polar"),
    length: expr,
    angle: expr,
    ...segmentExtras,
  }),
  z.object({
    type: z.literal("arc"),
    x: expr,
    y: expr,
    relative: z.boolean().optional(),
    radius: expr,
    clockwise: z.boolean().optional(),
    large: z.boolean().optional(),
    ...segmentExtras,
  }),
]);

const side = z.enum(["top", "right", "bottom", "left"]);

// `z.lazy` is needed because groups contain nodes.
const node: z.ZodType<Node> = z.lazy(() =>
  z.discriminatedUnion("kind", [
    z.object({ ...shapeBase, kind: z.literal("line"), from: point, to: point }),
    z.object({
      ...shapeBase,
      kind: z.literal("path"),
      start: point,
      segments: z.array(segment).max(LIMITS.segments),
      closed: z.boolean(),
    }),
    z.object({
      ...shapeBase,
      kind: z.literal("rect"),
      width: expr,
      height: expr,
      radius: z.union([expr, z.tuple([expr, expr, expr, expr])]).optional(),
      openSide: side.optional(),
    }),
    z.object({ ...shapeBase, kind: z.literal("ellipse"), rx: expr, ry: expr }),
    z.object({
      ...shapeBase,
      kind: z.literal("arc"),
      radius: expr,
      start: expr,
      end: expr,
    }),
    z.object({
      ...shapeBase,
      kind: z.literal("polygon"),
      sides: expr,
      radius: expr,
      angle: expr.optional(),
    }),
    z.object({
      ...shapeBase,
      kind: z.literal("star"),
      points: expr,
      radius: expr,
      innerRadius: expr.optional(),
      angle: expr.optional(),
    }),
    z.object({
      ...shapeBase,
      kind: z.literal("belt"),
      radius1: expr,
      radius2: expr,
      distance: expr,
    }),
    z.object({
      ...base,
      kind: z.literal("group"),
      children: z.array(node),
      combine: z
        .union([
          z.object({ op: z.enum(["union", "subtract", "intersect"]) }),
          z.object({ op: z.literal("join") }),
        ])
        .optional(),
    }),
    z.object({
      ...base,
      kind: z.literal("instance"),
      component: z.string().min(1),
      args: z.record(name, expr),
    }),
  ]) as unknown as z.ZodType<Node>,
);

const param = z.object({
  name,
  label: z.string().max(200).optional(),
  default: z.number().finite(),
  min: z.number().finite().optional(),
  max: z.number().finite().optional(),
  step: z.number().positive().optional(),
  unit: z.enum(["mm", "deg", "count"]).optional(),
  exposed: z.boolean().optional(),
});

const variable = z.object({
  name,
  expr,
  cases: z.array(z.object({ when: expr, expr })).max(32).optional(),
  description: z.string().max(500).optional(),
});

const component = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  params: z.array(param),
  variables: z.array(variable),
  nodes: z.array(node),
  anchors: z.array(z.object({ name, at: point })).optional(),
});

const ruler = z.object({
  id: z.string().min(1),
  name,
  hidden: z.boolean().optional(),
  from: point,
  to: point,
  offset: expr,
  rules: z.array(rule).max(32).optional(),
});

export const documentSchema = z.object({
  version: z.literal(SPEC_VERSION),
  params: z.array(param),
  variables: z.array(variable),
  nodes: z.array(node),
  rulers: z.array(ruler),
  components: z.array(component).max(LIMITS.components),
});

export type ParseResult =
  | { ok: true; document: DielineDocument }
  | { ok: false; errors: string[] };

/**
 * Validates an unknown value as a document, including the structural limits a
 * schema cannot express (total node count and nesting depth).
 */
export function parseDocument(input: unknown): ParseResult {
  const parsed = documentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map(
        (issue) => `${issue.path.join(".") || "document"}: ${issue.message}`,
      ),
    };
  }

  const document = parsed.data as DielineDocument;
  const errors: string[] = [];

  let count = 0;
  const walk = (nodes: Node[], depth: number) => {
    if (depth > LIMITS.depth) {
      errors.push(`Groups are nested deeper than ${LIMITS.depth} levels`);
      return;
    }
    for (const n of nodes) {
      count++;
      if (n.kind === "group") walk(n.children, depth + 1);
    }
  };

  walk(document.nodes, 1);
  for (const c of document.components) walk(c.nodes, 1);

  if (count > LIMITS.nodes) {
    errors.push(`Too many nodes (${count}, limit ${LIMITS.nodes})`);
  }

  return errors.length > 0 ? { ok: false, errors } : { ok: true, document };
}
