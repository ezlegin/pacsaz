"use client";

import { categories } from "@/data/category";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { ChevronLeft } from "lucide-react";
import SearchCategories, { Category } from "./SearchCategories";
import { updateQueryParam } from "@/utils/updateQueryParam";
import { useRouter, useSearchParams } from "next/navigation";

const DielinesSidebar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onSelect = (cat?: Category | undefined) => {
    updateQueryParam(searchParams, router, "category", cat?.slug);
  };

  return (
    <div className="space-y-3">
      <SearchCategories />
      <Accordion defaultValue="model" type="single" collapsible>
        {categories.map((c, idx) => (
          <AccordionItem key={idx} value={c.key} className="border-none">
            <AccordionTrigger className="p-3 rounded-md hover:bg-accent cursor-pointer">
              {c.groupLabel}
            </AccordionTrigger>
            <AccordionContent className="p-2">
              <ToggleGroup
                dir="rtl"
                type="single"
                defaultValue="all"
                className="flex-col items-start w-full"
                spacing={2}
              >
                <ToggleGroupItem
                  className="w-full justify-start cursor-pointer"
                  key={idx}
                  value={"all"}
                  onClick={() => onSelect(undefined)}
                >
                  <div className="flex gap-2 items-center">
                    <ChevronLeft className="scale-[80%] text-muted-foreground" />{" "}
                    <span>همه</span>
                    <span className="text-muted-foreground">982</span>
                  </div>
                </ToggleGroupItem>
                {c.categories.map((cc, idx) => (
                  <ToggleGroupItem
                    className="w-full justify-start cursor-pointer"
                    key={idx}
                    value={cc.slug}
                    onClick={() => onSelect(cc)}
                  >
                    <div className="flex gap-2 items-center">
                      <ChevronLeft className="scale-[80%] text-muted-foreground" />{" "}
                      <span>{cc.label}</span>
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
