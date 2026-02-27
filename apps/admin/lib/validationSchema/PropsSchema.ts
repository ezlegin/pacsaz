import z from "zod";
import { validateMathExpression } from "../utils/validateMathExpression";

const mathInput = z.string().min(1).refine(validateMathExpression);

const generalSchema = z.object({
  layer: z.enum(["trim", "fold", "perf"]).optional(),
  hidden: z.boolean().optional(),
  origin: z
    .object({
      x: mathInput,
      y: mathInput,
    })
    .optional(),
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
