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
] as const;
const pointDirection: [ISpec.PointDirection, ...ISpec.PointDirection[]] = [
  "down",
  "draw",
  "right",
  "up",
  "left",
] as const;

const generalSchema = z.object({
  layer: z.enum(["trim", "fold", "perf"]),
  hidden: z.boolean(),
  key: z.string(),
  origin: pointInput,
  type: z.enum(shapesKey),
  id: z.string(),
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
  })
  .merge(generalSchema);

export const polygonFormSchema = z
  .object({
    radius: mathInput,
    sides: z.string(),
  })
  .merge(generalSchema);
