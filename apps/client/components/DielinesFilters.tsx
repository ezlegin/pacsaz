"use client";

import { updateQueryParam } from "@/utils/updateQueryParam";
import { DielineCategoryByModel, DielineCategoryByUsage } from "@repo/db";
import { Button } from "@repo/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/sheet";
import { SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import DielinesSidebar from "./DielinesSidebar";

type DielineCount = { _count: { dieline: number } };

/**
 * Mobile filter drawer. Lives in its own client component so the sidebar can
 * close the sheet after a category is picked — the Sheet primitive is
 * controlled here, not inside DielinesSidebar.
 */
const DielinesFilters = ({
  categoriesByUsage,
  categoriesByModel,
  activeCategory,
  resultCount,
}: {
  categoriesByUsage: (DielineCategoryByUsage & DielineCount)[];
  categoriesByModel: (DielineCategoryByModel & DielineCount)[];
  activeCategory?: string;
  resultCount: number;
}) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const clearFilter = () => {
    updateQueryParam(searchParams, router, "category", undefined);
  };

  const fa = (value: number) =>
    value.toLocaleString("fa-IR", { useGrouping: false });

  return (
    <div className="flex items-center gap-2 lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="size-4" />
            فیلتر دسته‌بندی
            {activeCategory && (
              <span className="grid size-4 place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                ۱
              </span>
            )}
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full overflow-y-auto sm:max-w-sm"
        >
          <SheetHeader className="mb-5 space-y-1 text-right">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-sm font-bold">
                دسته‌بندی‌ها
              </SheetTitle>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="بستن"
                className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {fa(resultCount)} قالب در حال نمایش
            </p>
          </SheetHeader>

          <DielinesSidebar
            categoriesByUsage={categoriesByUsage}
            categoriesByModel={categoriesByModel}
            activeCategory={activeCategory}
            onSelect={() => setOpen(false)}
            className="pb-10"
          />

          {activeCategory && (
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => {
                clearFilter();
                setOpen(false);
              }}
            >
              حذف فیلتر
            </Button>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DielinesFilters;
