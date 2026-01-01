import z from "zod";

export const inputFormSchema = z.object({
  phoneNumber: z.string().regex(/^09\d{9}$/),
});
export type InputFormType = z.infer<typeof inputFormSchema>;

export const otpFormSchema = z.object({
  otp: z.string().regex(/^\d{5}$/),
});
export type OTPFormType = z.infer<typeof otpFormSchema>;
