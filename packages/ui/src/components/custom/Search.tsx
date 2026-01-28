"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const searchSchema = z.object({
  search: z.string().optional(),
});

type SearchFormValues = z.infer<typeof searchSchema>;

const Search = ({
  placeholder = "Search...",
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") || "";

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { search: currentSearch },
  });

  const updateUrl = (searchValue: string | undefined) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));

    if (searchValue && searchValue.trim() !== "") {
      params.set("search", searchValue.trim());
    } else {
      params.delete("search");
    }

    router.push(`?${params.toString()}`);
  };

  const handleSubmit = (values: SearchFormValues) => {
    updateUrl(values.search);
  };

  useEffect(() => {
    form.setValue("search", currentSearch);
  }, [currentSearch, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          name="search"
          control={form.control}
          render={({ field }) => (
            <FormItem className={className}>
              <FormControl>
                <Input
                  className="h-9"
                  placeholder={placeholder}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    if (e.target.value === "") {
                      updateUrl("");
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      form.handleSubmit(handleSubmit)();
                    }
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default Search;
