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
const pointDirection = ["down", "draw", "right", "up", "left"] as const;
const semiCircleDirection = ["down", "right", "up", "left"] as const;

const generalSchema = z.object({
  layer: z.enum(["trim", "fold", "perf"]),
  hidden: z.boolean(),
  key: z.string(),
  origin: pointInput,
  type: z.enum(shapesKey),
  id: z.string(),
  dup: z.array(
    z.object({
      zero: z.boolean().optional(),
      center: z.boolean().optional(),
      mirror: z.object({ x: z.boolean(), y: z.boolean() }).optional(),
      move: pointInput,
      moveTo: pointInput,
      rotate: mathInput,
      scale: mathInput,
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
    relativePts: z.object({
      pts: z
        .array(
          z.tuple([mathInput, mathInput.optional(), z.enum(pointDirection)]),
        )
        .optional(),
      startPt: pointInput,
    }),
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
  })
  .merge(generalSchema);

export const circleFormSchema = z
  .object({
    radius: mathInput,
    semiCircleDirection: z.enum(semiCircleDirection).optional(),
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
