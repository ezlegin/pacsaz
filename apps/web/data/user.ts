import { UserType as UserTypes } from "@/components/onboarding/Onboarding";
import { plans } from "@/components/UpgradeSubscription";

export type PlanKey = "standard" | "pro" | "organization";
export type PlanTitle = "استاندارد" | "حرفه‌ای" | "سازمانی";
type PlanLevel = 1 | 2 | 3;

export type PlanType = {
  title: PlanTitle;
  level: PlanLevel;
  price: number;
  description: string;
  key: PlanKey;
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
};

export const testUser: UserType = {
  fullName: "علیرضا ازلگینی",
  email: "ezlegini.ir@gmail.com",
  phone: "09127452859",
  subscribed: new Date("2026-01-01"),
  subscriptionEndsAt: new Date("2026-01-29"),
  userType: "student",
  plan: {
    key: "standard",

    get title() {
      return mapUserPlanTitle(this.key);
    },
    get level() {
      return mapUserPlanLevel(this.key);
    },
    price: 399,
    description: "مخصوص مبتدیان و تازه کار",
  },
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

plans;
