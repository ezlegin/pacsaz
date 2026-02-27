import z from "zod";

const generalSchema = z.object({
  layer: z.enum(["trim", "fold", "perf"]).optional(),
  hidden: z.boolean().optional(),
  origin: z
    .object({
      x: z.string(),
      y: z.string(),
    })
    .optional(),
});

export const lineFormSchema = z
  .object({
    length: z.string().min(1),
    angle: z.string().min(1),
  })
  .merge(generalSchema);

export const rectangleFormSchema = z
  .object({
    width: z.string().min(1),
    height: z.string().min(1),
  })
  .merge(generalSchema);
