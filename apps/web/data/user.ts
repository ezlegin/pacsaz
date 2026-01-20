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

type UserType = {
  fullName: string;
  email: string;
  phone: string;
  subscribed: Date;
  subscriptionEndsAt: Date;
  userType: UserTypes;
  plan: PlanType;
  fairDownload: number;
  downloaded: number;
  paid: number;
};

export const testUser: UserType = {
  fullName: "علیرضا ازلگینی",
  email: "ezlegini.ir@gmail.com",
  phone: "09127452859",
  subscribed: new Date("2026-01-01"),
  subscriptionEndsAt: new Date("2026-01-29"),
  userType: "student",
  plan: {
    period: "monthly",
    key: "standard",
    get title() {
      return mapUserPlanTitle(this.key);
    },
    get level() {
      return mapUserPlanLevel(this.key);
    },
    description: "مخصوص مبتدیان و تازه کار",
  },
  paid: 399000,
  fairDownload: 50,
  downloaded: 39,
};

export function mapUserType(userType: UserTypes) {
  if (userType === "student") return "دانشجو/دانش‌آموز";
}

export function mapUserPlanTitle(userPlan: PlanKey) {
  if (userPlan === "standard") return "استاندارد";
  if (userPlan === "pro") return "حرفه‌ای";
  return "سازمانی";
}

function mapUserPlanLevel(userPlan: PlanKey) {
  if (userPlan === "standard") return 1;
  if (userPlan === "pro") return 2;
  return 3;
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
