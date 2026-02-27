import z from "zod";
import { validateMathExpression } from "../utils/validateMathExpression";
import { ISpec } from "@repo/store/dieline/dielineSpec.store";

const mathInput = z.string().min(1).refine(validateMathExpression);

const x: [ISpec.ShapesKey, ...ISpec.ShapesKey[]] = [
  "line",
  "circle",
  "rectangle",
] as const;
const generalSchema = z.object({
  layer: z.enum(["trim", "fold", "perf"]),
  hidden: z.boolean(),
  key: z.string(),
  origin: z.tuple([z.string(), z.string()]),
  type: z.enum(x),
  id: z.string(),
});

export const lineFormSchema = z
  .object({
    length: mathInput,
    angle: z.string().min(1),
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
