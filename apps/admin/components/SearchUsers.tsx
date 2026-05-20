"use client";

import { searchUsers } from "@/data/search";
import { getUserById } from "@/data/user";
import { User } from "@repo/db";
import SearchField from "@repo/ui/components/custom/SearchField";
import { useEffect, useState } from "react";

const SearchCustomers = ({
  field,
  customerId: userId,
  placeHolder = "Search Customers...",
}: {
  field: any;
  customerId?: number | null;
  placeHolder?: string;
}) => {
  const [defaultUser, setDefaultUser] = useState<User | undefined>(undefined);

  const fetchUsers = async (query: string): Promise<User[]> => {
    return await searchUsers(query);
  };

  useEffect(() => {
    const fetchSelectedUser = async () => {
      if (userId) {
        const user = await getUserById(userId);
        setDefaultUser(user || undefined);
      }
    };
    fetchSelectedUser();
  }, [userId]);

  return (
    <SearchField<User>
      type="search"
      placeholder={placeHolder}
      fetchResults={fetchUsers}
      onSelect={(user) =>
        user ? field.onChange(user.id.toString()) : field.onChange(undefined)
      }
      getItemLabel={(user) => `${user.fullName} - ${user.phoneNumber}`}
      defaultItem={defaultUser}
    />
  );
};

export default SearchCustomers;
