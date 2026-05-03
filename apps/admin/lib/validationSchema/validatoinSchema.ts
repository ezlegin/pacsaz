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
export const planPeriod = ["monthly", "threeMonth", "annual"] as const;
export const paymentStatus = [
  "success",
  "failed",
  "canceled",
  "pending",
] as const;

const period = z.object({
  monthly: z.string(),
  threeMonth: z.string(),
  annual: z.string(),
});

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
  title: z.string().min(1),
  key: z.enum(planKey),
  description: z.string().min(1),
  shortDescription: z.string().min(1),
  discountAmount: z.string().min(1),
  fairDownload: period,
  price: period,
  isRecommended: z.boolean(),
  selectedFeatures: z.array(z.string()),
});
export type TarrifFormType = z.infer<typeof tarrifFormSchema>;

export const featureFormSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["paid", "general"]),
});
export type FeatureFormType = z.infer<typeof featureFormSchema>;

export const userFormSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().min(1),
  type: z.enum(userType),
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

export const dielineSettingsFormSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  categoryByModel: z.array(z.string()),
  categoryByUsage: z.array(z.string()),
  active: z.boolean(),
});
export type DielineSettingsFormType = z.infer<typeof dielineSettingsFormSchema>;
