"use client";

import { getUserById } from "@/data/user";
import { ProgressProvider } from "@bprogress/next/app";
import { useUserStore } from "@repo/store/app/user.store";
import { ReactNode, useEffect } from "react";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProgressBarProvider>
      <UserProvider>{children}</UserProvider>
    </ProgressBarProvider>
  );
};

export default Providers;

const ProgressBarProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProgressProvider
      height="2px"
      color="#7f22fe"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
};

export function UserProvider({ children }: { children: ReactNode }) {
  const { setUser } = useUserStore();

  const userIdFromAuth = 1; //todo: get from auth token

  useEffect(() => {
    (async () => {
      try {
        const u = await getUserById(userIdFromAuth);
        if (u) setUser(u);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    })();
  }, []);

  return children;
}
