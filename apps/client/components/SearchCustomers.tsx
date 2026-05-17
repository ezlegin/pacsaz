"use client";

import { getCustomerById } from "@/data/customer";
import { searchCustomers } from "@/data/search";
import { Customer } from "@repo/db";
import SearchField from "@repo/ui/components/custom/SearchField";
import { useEffect, useState } from "react";

const SearchCustomers = ({
  field,
  customerId,
  placeHolder = "Search Customers...",
}: {
  field: any;
  customerId?: number | null;
  placeHolder?: string;
}) => {
  const [defaultCustomer, setDefaultCustomer] = useState<Customer | undefined>(
    undefined,
  );

  const fetchCustomers = async (query: string): Promise<Customer[]> => {
    return await searchCustomers(query);
  };

  useEffect(() => {
    const fetchSelectedCustomer = async () => {
      if (customerId) {
        const customer = await getCustomerById(customerId);
        setDefaultCustomer(customer || undefined);
      }
    };
    fetchSelectedCustomer();
  }, [customerId]);

  return (
    <SearchField<Customer>
      dir="rtl"
      type="search"
      placeholder={placeHolder}
      fetchResults={fetchCustomers}
      onSelect={(customer) =>
        customer
          ? field.onChange(customer.id.toString())
          : field.onChange(undefined)
      }
      getItemLabel={(customer) =>
        `${customer.fullName} - ${customer.phoneNumber}`
      }
      defaultItem={defaultCustomer}
    />
  );
};

export default SearchCustomers;
