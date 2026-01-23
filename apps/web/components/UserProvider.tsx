"use client";

import { ReactNode, useEffect } from "react";
import { useUserStore, User } from "@repo/store/app/user.store";

interface Props {
  user: User | null;
  children: ReactNode;
}

export default function UserProvider({ user, children }: Props) {
  const { setUser } = useUserStore();

  useEffect(() => {
    if (user) setUser(user);
  }, [user, setUser]);

  return children;
}
