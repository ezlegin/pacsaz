"use client";

import { updateQueryParam } from "@/utils/updateQueryParam";
import { DielineCategoryByModel, DielineCategoryByUsage } from "@repo/db";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { Input } from "@repo/ui/components/input";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { ChevronLeft, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface Props {
  categoriesByUsage: DielineCategoryByUsage[];
  categoriesByModel: DielineCategoryByModel[];
}

const DielinesSidebar = ({ categoriesByModel, categoriesByUsage }: Props) => {
  const [query, setQuery] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const onSelect = (slug?: string | undefined) => {
    updateQueryParam(searchParams, router, "category", slug);
  };

  const categories = [
    {
      groupLabel: "بر اساس استفاده",
      key: "usage",
      categories: query
        ? categoriesByUsage.filter((cat) => cat.title.includes(query))
        : categoriesByUsage,
    },
    {
      groupLabel: "بر اساس قالب",
      key: "model",
      categories: query
        ? categoriesByModel.filter((cat) => cat.title.includes(query))
        : categoriesByModel,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          className="pr-10"
          placeholder="جستجوی دسته بندی ها..."
          onChange={(e) => {
            const value = e.target.value;
            if (value === "") {
              setQuery(null);
              return;
            }
            setQuery(value);
          }}
        />
        <Search
          size={18}
          className="absolute top-1/2 -translate-y-1/2 right-3 text-muted-foreground"
        />
      </div>
      <Accordion defaultValue={"model"} type="single" collapsible>
        {categories.map((c, idx) => (
          <AccordionItem key={idx} value={c.key} className="border-none">
            <AccordionTrigger className="p-3 rounded-md hover:bg-accent cursor-pointer">
              {c.groupLabel}
            </AccordionTrigger>
            <AccordionContent className="p-2">
              <ToggleGroup
                onValueChange={(val) => {
                  if (val === "") {
                    onSelect(undefined);
                    return;
                  } else {
                    onSelect(val);
                  }
                }}
                dir="rtl"
                type="single"
                defaultValue="all"
                className="flex-col items-start w-full"
                spacing={2}
              >
                {c.categories.map((cc, idx) => (
                  <ToggleGroupItem
                    className="w-full justify-start cursor-pointer"
                    key={idx}
                    value={cc.slug}
                  >
                    <div className="flex gap-2 items-center">
                      <ChevronLeft className="scale-[80%] text-muted-foreground" />{" "}
                      <span>{cc.title}</span>
                      <span className="text-muted-foreground">116</span>
                    </div>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default DielinesSidebar;
