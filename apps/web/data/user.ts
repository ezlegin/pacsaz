import { UserType as UserTypes } from "@/components/onboarding/Onboarding";
import { SubPeriod } from "@/components/SubscriptionList";
import { PlanTitle, PlanLevel, PlanKey } from "./plan";
import { PaymentStatusType } from "@repo/ui/components/custom/PaymentStatus";

export type PlanType = {
  title: PlanTitle;
  level: PlanLevel;
  description: string;
  key: PlanKey;
  period: SubPeriod;
};

export function mapUserType(userType: UserTypes) {
  if (userType === "student") return "دانشجو/دانش‌آموز";
}

export function mapUserPlanTitle(userPlan: PlanKey) {
  if (userPlan === "standard") return "استاندارد";
  if (userPlan === "pro") return "حرفه‌ای";
  return "سازمانی";
}

export function mapPeriodLabel(period: SubPeriod) {
  if (period === "monthly") return "ماهیانه";
  if (period === "3-month") return "3 ماهه";
  return "سالیانه";
}

export function mapPaymentStatusLable(status: PaymentStatusType) {
  if (status === "failed") return "ناموفق";
  if (status === "success") return "موفق";
  if (status === "pending") return "در انتظار";
  return "کنسل شده";
}
