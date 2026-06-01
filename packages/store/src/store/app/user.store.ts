// import { create } from "zustand";

// type PlanKey = "standard" | "pro" | "organization";
// type PlanTitle = "استاندارد" | "حرفه‌ای" | "سازمانی";
// type PlanLevel = 1 | 2 | 3;
// type PlanPeriod = "monthly" | "threeMonth" | "annual";

// type Plan = {
//   title: PlanTitle;
//   level: PlanLevel;
//   key: PlanKey;
//   period: PlanPeriod;
//   startedAt: Date;
//   endsAt: Date;
//   downloads: {
//     fair: number;
//     downloaded: number;
//   };
// }; // todo

// type User = {
//   fullName: string;
//   email: string;
//   phoneNumber: string;
//   plan: Plan | null;
// }; // todo

// type UserStore = {
//   user: User | null;
//   setUser: (user: User) => void;
// };

// export const useUserStore = create<UserStore>((set) => ({
//   user: null,
//   setUser: (user) => set(() => ({ user })),
// }));

// export const getSessionUser = () => useUserStore.getState().user;
