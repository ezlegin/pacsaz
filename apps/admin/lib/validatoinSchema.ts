import z from "zod";

export const inputFormSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export type InputFormType = z.infer<typeof inputFormSchema>;
