import z from "zod";

export const userType = [
  "student",
  "designer",
  "designStudio",
  "printHouse",
  "dielineMaker",
  "packagingFactory",
  "other",
] as const;

export const planKey = ["standard", "pro", "organization"] as const;
export const planPeriod = ["monthly", "3-month", "annual"] as const;
export const paymentStatus = [
  "success",
  "failed",
  "canceled",
  "pending",
] as const;

export const inputFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
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
  monthly: z.string().min(1),
  threeMonth: z.string().min(1),
  annual: z.string(),
});
export type TarrifFormType = z.infer<typeof tarrifFormSchema>;

export const userFormSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().min(1),
  userType: z.enum(userType),
});
export type UserFormType = z.infer<typeof userFormSchema>;

export const subscriptionFormSchema = z.object({
  date: z.date(),
  userId: z.string().min(1),
  planKey: z.enum(planKey),
  period: z.enum(planPeriod),
  discountCode: z.string().optional(),
  status: z.enum(paymentStatus),
});
export type SubscriptionFormType = z.infer<typeof subscriptionFormSchema>;
