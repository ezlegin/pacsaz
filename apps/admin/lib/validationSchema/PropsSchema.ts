import z from "zod";
import { validateMathExpression } from "../utils/validateMathExpression";
import { ISpec } from "@repo/store/editor/dielineSpec.store";

const mathInput = z.string().min(1).refine(validateMathExpression);
const pointInput = z.tuple([mathInput, mathInput]);

const shapesKey: [ISpec.ShapesKey, ...ISpec.ShapesKey[]] = [
  "line",
  "lines",
  "circle",
  "rectangle",
  "polygon",
  "arc",
] as const;
const direction = ["down", "right", "up", "left"] as const;
const pointDirection = [...direction, "draw"] as const;

const generalSchema = z.object({
  layer: z.enum(["trim", "fold", "perf"]),
  hidden: z.boolean(),
  key: z.string(),
  origin: pointInput,
  type: z.enum(shapesKey),
  id: z.string(),
  dup: z.array(
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
  value: z.string(),
  key: z.string(),
  offset: mathInput,
  type: z.enum(["ruler"]),
  id: z.string(),
  hidden: z.boolean(),
});
