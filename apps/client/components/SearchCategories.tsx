"use client";

import { searchCategories } from "@/data/category";
import { updateQueryParam } from "@/utils/updateQueryParam";
import SearchField from "@repo/ui/components/custom/SearchField";
import { useRouter, useSearchParams } from "next/navigation";

export type Category = {
  id: number;
  label: string;
  slug: string;
};

const SearchCategories = ({
  placeHolder = "جستجوی دسته بندی ها...",
}: {
  placeHolder?: string;
}) => {
  const fetchUsers = (query: string): Category[] => {
    return searchCategories(query);
  };

  const router = useRouter();
  const searchParams = useSearchParams();

  const onSelect = (cat?: Category) => {
    updateQueryParam(searchParams, router, "category", cat?.slug);
  };

  return (
    <SearchField<Category>
      placeholder={placeHolder}
      fetchResults={fetchUsers} //todo
      onSelect={onSelect}
      getItemLabel={(cat) => cat.label}
      dir="rtl"
      type="search"
    />
  );
};

export default SearchCategories;
