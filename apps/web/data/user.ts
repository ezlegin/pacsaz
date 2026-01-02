import { UserType } from "@/components/onboarding/Onboarding";

export const testUser = {
  fullName: "علیرضا ازلگینی",
  email: "ezlegini.ir@gmail.com",
  phone: "09127452859",
  subscribed: "2026-01-01",
  subscriptionEndsAt: "2026-01-29",
  userType: "student",
  plan: "standard",
  fairDownload: 50,
  downloaded: 39,
};

export function mapUserType(userType: UserType) {
  if (userType === "student") return "دانشجو/دانش‌آموز";
}
export type PlanType = "standard" | "pro" | "organization";
export function mapUserPlan(userPlan: PlanType) {
  if (userPlan === "standard") return "استاندارد";
  if (userPlan === "pro") return "حرفه‌ای";
  if (userPlan === "organization") return "سازمانی";
}
