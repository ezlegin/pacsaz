// Lives in the app rather than @repo/ui: it imports next/navigation, and Next.js
// imports inside the shared UI package make Vercel treat packages/ui as a
// deployable service.
"use client";

import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Select as UiSelect,
} from "@repo/ui/components/select";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";

interface SelectProps {
  name?: string;
  options: { label: string; value: string }[];
  defaultValue?: string;
  placeholder?: string;
}

/**
 * `useSearchParams` opts the closest Suspense boundary into client rendering, so
 * that boundary has to live inside this component. Without it every page that
 * renders <Filter /> bails out of prerendering and fails the build with
 * "useSearchParams() should be wrapped in a suspense boundary".
 */
const Filter: React.FC<SelectProps> = (props) => (
  <Suspense fallback={null}>
    <FilterSelect {...props} />
  </Suspense>
);

const FilterSelect = ({
  name = "filter",
  options,
  defaultValue = "all",
  placeholder = "Select...",
}: SelectProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQuery = searchParams.get(name) || defaultValue;
  const [value, setValue] = useState<string | undefined>();

  const handleChange = (newValue: string) => {
    setValue(newValue);
    const params = new URLSearchParams(Array.from(searchParams.entries()));

    if (newValue === "all") {
      params.delete(name);
    } else {
      params.set(name, newValue);
    }

    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    setValue(currentQuery);
  }, [currentQuery]);

  return (
    <UiSelect value={value} onValueChange={handleChange}>
      <SelectTrigger className="w-45">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent position="item-aligned">
        <SelectItem value={"all"}>{placeholder}</SelectItem>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="capitalize"
          >
            {option.label.toLowerCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </UiSelect>
  );
};

export default Filter;
