"use client";

import { useUserStore } from "@repo/store/app/user.store";
import { ReactNode, useEffect } from "react";

const UserProvider = ({
  children,
  user,
}: {
  user: any | null; // todo
  children: ReactNode;
}) => {
  if (!user) return children;

  const { setUser } = useUserStore();

  useEffect(() => {
    setUser(user);
  }, []);
  return children;
};

export default UserProvider;
