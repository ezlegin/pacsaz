import z from "zod";
import { validateMathExpression } from "../utils/validateMathExpression";

const mathInput = z.string().min(1).refine(validateMathExpression);
export const pointInput = z.tuple([mathInput, mathInput]);

const shapesKey = [
  "line",
  "lines",
  "circle",
  "rectangle",
  "polygon",
  "arc",
] as const;
const stack = ["model", "ruler", "shape", "group"] as const;
const direction = ["down", "right", "up", "left"] as const;
const pointDirection = [...direction, "draw"] as const;
const dustSide = ["left", "right", "both"] as const;

const dup = z.array(
  z.object({
    operations: z.array(
      z.discriminatedUnion("type", [
        z.object({ type: z.literal("zero") }),
        z.object({ type: z.literal("center") }),
        z.object({
          type: z.literal("mirror"),
          x: z.boolean(),
          y: z.boolean(),
        }),
        z.object({
          type: z.literal("move"),
          value: pointInput,
        }),
        z.object({
          type: z.literal("moveTo"),
          value: pointInput,
        }),
        z.object({
          type: z.literal("rotate"),
          value: mathInput,
        }),
        z.object({
          type: z.literal("scale"),
          value: mathInput,
        }),
      ]),
    ),
  }),
);
const generalSchema = z.object({
  layer: z.enum(["trim", "fold", "perf"]),
  hidden: z.boolean(),
  key: z.string(),
  origin: pointInput,
  type: z.enum(shapesKey),
  stack: z.enum(stack),
  id: z.string(),
  dup: dup,
  effects: z.array(
    z.object({
      type: z.enum(["readius"]),
      value: mathInput,
      targets: z.array(z.string()),
    }),
  ),
});

export const lineFormSchema = z
  .object({
    length: mathInput,
    angle: z.string().min(1),
  })
  .merge(generalSchema);

export const linesFormSchema = z
  .object({
    absolutePts: z.array(z.tuple([mathInput, mathInput])).optional(),
    relativePts: z
      .object({
        pts: z
          .array(
            z.tuple([mathInput, mathInput.optional(), z.enum(pointDirection)]),
          )
          .optional(),
        startPt: pointInput,
      })
      .optional(),
    isClosed: z.boolean(),
    filletRadius: z.string().optional(),
    indices: z.string().optional(),
    isRelative: z.boolean(),
  })
  .merge(generalSchema);

export const rectangleFormSchema = z
  .object({
    width: mathInput,
    height: mathInput,
    radius: z.string().optional(),
    deleteSide: z.enum(direction).optional(),
  })
  .merge(generalSchema);

export const circleFormSchema = z
  .object({
    radius: mathInput,
    radiusX: mathInput,
    radiusY: mathInput,
    semiCircleDirection: z.enum(direction).optional(),
  })
  .merge(generalSchema);

export const polygonFormSchema = z
  .object({
    radius: mathInput,
    sides: z.string(),
  })
  .merge(generalSchema);

export const arcFormSchema = z
  .object({
    radius: mathInput,
    startAngle: mathInput,
    endAngle: mathInput,
  })
  .merge(generalSchema);

export const rulerFormSchema = z.object({
  from: pointInput,
  to: pointInput,
  stack: z.enum(stack),
  value: z.string(),
  key: z.string(),
  offset: mathInput,
  type: z.enum(["ruler"]),
  id: z.string(),
  hidden: z.boolean(),
});

/**
 * Model nodes. A model is stored as one opaque node — `modelKey` plus its
 * `params` — so each model type keeps its own parameter shape here. The Drawer
 * rebuilds the real geometry from these params, which is why they stay symbolic
 * strings rather than resolved numbers.
 */
const modelGenerals = z.object({
  stack: z.literal("model"),
  type: z.literal("model"),
  id: z.string(),
  key: z.string(),
  hidden: z.boolean(),
  origin: pointInput,
  dup: dup,
});

export const glueFormSchema = z
  .object({
    modelKey: z.literal("glue"),
    from: pointInput,
    to: pointInput,
  })
  .merge(modelGenerals);

export const doorFormSchema = z
  .object({
    modelKey: z.literal("door"),
    dustSide: z.enum(dustSide).optional(),
    mirror: z.object({
      x: z.boolean(),
      y: z.boolean(),
    }),
    indentAt: z
      .object({
        l: z.boolean().default(false),
        r: z.boolean().default(false),
      })
      .optional(),
  })
  .merge(modelGenerals);

export const holeFormSchema = z
  .object({
    modelKey: z.literal("hole"),
    angleBetweenStartAndEnd: mathInput,
    rotation: z.string(),
    handleDir: z.enum(["left", "right"]),
    heightOfLine: mathInput,
  })
  .merge(modelGenerals);

export const snapLockFormSchema = z
  .object({
    modelKey: z.literal("snapLock"),
  })
  .merge(modelGenerals);

/** Lookup used by the models props panel. */
export const modelFormSchemas = {
  glue: glueFormSchema,
  door: doorFormSchema,
  hole: holeFormSchema,
  snapLock: snapLockFormSchema,
} as const;

/**
 * Groups are edited as a whole node (rename / dup); their children keep their own
 * shapes. `nodes` is intentionally loose because it holds an arbitrary node tree.
 */
export const groupFormSchema = z.object({
  id: z.string(),
  type: z.literal("group"),
  stack: z.literal("group"),
  key: z.string(),
  hidden: z.boolean(),
  nodes: z.array(z.any()),
  dup: dup,
  effects: z.array(z.any()),
});
