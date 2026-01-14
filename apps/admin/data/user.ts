import { PlanKey, PlanLevel, PlanPeriod } from "./subscription";

export type PlanType = {
  level: PlanLevel;
  key: PlanKey;
  period: PlanPeriod;
};

type User = {
  fullName: string;
  email: string;
  phone: string;
  subscribed: Date;
  subscriptionEndsAt: Date;
  userType: UserType;
  plan: PlanType;
  fairDownload: number;
  downloaded: number;
  paid: number;
};

export const testUser: User = {
  fullName: "علیرضا ازلگینی",
  email: "ezlegini.ir@gmail.com",
  phone: "09127452859",
  subscribed: new Date("2026-01-01"),
  subscriptionEndsAt: new Date("2026-01-29"),
  userType: "student",
  plan: {
    period: "monthly",
    key: "standard",
    get level() {
      return mapUserPlanLevel(this.key);
    },
  },
  paid: 399000,
  fairDownload: 50,
  downloaded: 39,
};

function mapUserPlanLevel(userPlan: PlanKey) {
  if (userPlan === "standard") return 1;
  if (userPlan === "pro") return 2;
  return 3;
}

export type UserType =
  | "student"
  | "designer"
  | "designStudio"
  | "printHouse"
  | "dielineMaker"
  | "packagingFactory"
  | "other";
