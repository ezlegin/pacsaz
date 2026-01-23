import { create } from "zustand";

type PlanKey = "standard" | "pro" | "organization";
type PlanTitle = "استاندارد" | "حرفه‌ای" | "سازمانی";
type PlanLevel = 1 | 2 | 3;
type PlanPeriod = "monthly" | "3-month" | "annual";

type Plan = {
  title: PlanTitle;
  level: PlanLevel;
  key: PlanKey;
  period: PlanPeriod;
};

export type User = {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  plan: Plan | null;
};

type UserStore = {
  user: User | null;
  isSubscribed: boolean;
  isPremium: boolean;
  setUser: (user: User) => void;
};

// todo: DB Fetch (from root layout and set to user)
const plan: Plan = {
  title: "استاندارد",
  key: "standard",
  level: 2,
  period: "monthly",
};

// todo: DB Fetch (from root layout and set to user)
const user: User | null = {
  id: 1,
  email: "ezleigni.ir@gmail.com",
  fullName: "علیرضا ازلگینی",
  phoneNumber: "09127452859",
  plan: plan,
};

export const useUserStore = create<UserStore>((set) => ({
  user,
  isSubscribed: !!user.plan,
  isPremium: !!user?.plan && user.plan.level > 1,
  setUser: (user) => set(() => ({ user })),
}));

export const isSubscribed = useUserStore.getState().isSubscribed;
