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
  "could_not_initiate",
] as const;
export const couponTypes = ["fixed", "percent"] as const;

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
  firstName: z.string().min(1),
  lastName: z.string().min(1),
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

export const paymentFormSchema = z.object({
  from: z.date(),
  amount: z.number(),
  total: z.number(),
  discountCodeAmount: z.number(),
  discountCode: z.string(),
  userId: z.string().min(1),
  planKey: z.enum(planKey),
  period: z.enum(planPeriod),
  status: z.enum(paymentStatus),
});
export type PaymentFormType = z.infer<typeof paymentFormSchema>;

export const dielineSettingsFormSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  categoryByModel: z.array(z.string()),
  categoryByUsage: z.array(z.string()),
  active: z.boolean(),
});
export type DielineSettingsFormType = z.infer<typeof dielineSettingsFormSchema>;

const dimension = z.object({
  width: z.number(),
  length: z.number(),
  height: z.number(),
});

export const dielineMetadataFormSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  bleed: z.number(),
  defaultDimensions: dimension,
  minDimensions: dimension,
  dimensionTypes: z.string(),
  materials: z.string(),
  categoryByModel: z.array(z.string()),
  categoryByUsage: z.array(z.string()),
});

export type DielineMetadataFormType = z.infer<typeof dielineMetadataFormSchema>;

export const couponFormSchema = z.object({
  code: z.string().min(1),
  amount: z.string().min(1),
  type: z.enum(couponTypes),
  expiresAt: z.date(),
  limit: z.string().min(1),
  plans: z.array(z.string()),
});
export type CouponFormType = z.infer<typeof couponFormSchema>;

export const dielineUpdateFormSchema = z.object({
  specification: z.string().min(1),
  variable: z.string(),
});
export type DielineUpdateFormType = z.infer<typeof dielineUpdateFormSchema>;
