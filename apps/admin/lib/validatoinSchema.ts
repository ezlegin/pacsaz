import z from "zod";

export const inputFormSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export type InputFormType = z.infer<typeof inputFormSchema>;

export const dielineFormSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  categories: z.object({
    byModel: z.array(z.string()),
    byUsage: z.array(z.string()),
  }),
});
export type DielineFormType = z.infer<typeof dielineFormSchema>;

export const categoriesFormSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
});
export type CategoriesFormType = z.infer<typeof categoriesFormSchema>;

export const tarrifFormSchema = z.object({
  monthly: z.string(),
  threeMonth: z.string(),
  annual: z.string(),
});
export type TarrifFormType = z.infer<typeof tarrifFormSchema>;
