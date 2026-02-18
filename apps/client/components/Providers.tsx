"use client";

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

  const user = null; //todo: AUTH Fetch
  useEffect(() => {
    if (user) setUser(user);
  }, [user, setUser]);

  return children;
}
