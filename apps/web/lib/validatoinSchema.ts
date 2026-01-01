import z from "zod";

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
