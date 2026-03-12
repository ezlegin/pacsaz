import z from "zod";

const material = [
  "abFlute",
  "artPaper",
  "bFlute",
  "bcFlute",
  "beFlute",
  "cFlute",
  "fFlute",
  "eFlute",
  "glossyCardboard",
] as const;

const dimensionType = ["manufacture", "inner", "outer"] as const;

export const inputFormSchema = z.object({
  phoneNumber: z.string().regex(/^09\d{9}$/),
});
export type InputFormType = z.infer<typeof inputFormSchema>;

export const otpFormSchema = z.object({
  otp: z.string().regex(/^\d{5}$/),
});
export type OTPFormType = z.infer<typeof otpFormSchema>;

export const onboardingStep2Schema = z.object({
  fullName: z.string().min(2).trim(),
  email: z.string().email().trim(),
});
export type OnboardingStep2Type = z.infer<typeof onboardingStep2Schema>;

export const contactFormSchema = z.object({
  fullName: z.string().min(3, "نام و نام خانوادگی حداقل باید ۳ کاراکتر باشد"),
  email: z.string().email("ایمیل وارد شده معتبر نیست"),
  phone: z
    .string()
    .min(10, "شماره تماس معتبر نیست")
    .max(15, "شماره تماس معتبر نیست"),
  subject: z.string().min(3, "عنوان باید حداقل ۳ کاراکتر باشد"),
  message: z.string().min(10, "پیام باید حداقل ۱۰ کاراکتر باشد"),
});

export type ContactFormType = z.infer<typeof contactFormSchema>;

export const profileFormSchema = z.object({
  fullName: z.string().min(3, "نام و نام خانوادگی حداقل باید ۳ کاراکتر باشد"),
  userType: z.string(),
});

export type ProfileFormType = z.infer<typeof profileFormSchema>;

export const discountFormSchema = z.object({
  discountCode: z.string().min(1),
});

export type DiscountFormType = z.infer<typeof discountFormSchema>;

export const saveDielineFormSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  // customer: z.string().optional(),
  bleed: z.number(),
  width: z.number(),
  length: z.number(),
  height: z.number(),
  thickness: z.number(),
  material: z.enum(material),
  dimensionType: z.enum(dimensionType),
});

export type SaveDielineFormType = z.infer<typeof saveDielineFormSchema>;

export const customerFormSchema = z.object({
  fullName: z.string().min(1),
  phoneNumber: z
    .string()
    .regex(/^09\d{9}$/)
    .optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
});

export type CustomerFormType = z.infer<typeof customerFormSchema>;
