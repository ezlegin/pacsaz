"use client";

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
import Link from "next/link";
import { useState } from "react";
import DielinesSidebar from "./DielinesSidebar";

type DielineCount = { _count: { dieline: number } };

/**
 * Mobile filter drawer. Lives in its own client component so the sidebar can
 * close the sheet after a category is chosen — the Sheet primitive is controlled
 * here, not inside DielinesSidebar.
 *
 * It takes no `searchParams`: the rail navigates to real category URLs, so the
 * trigger only has to open and close.
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
              <SheetTitle className="text-sm font-bold">دسته‌بندی‌ها</SheetTitle>
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
            <Link
              href="/dielines"
              onClick={() => setOpen(false)}
              className="mt-4 flex w-full items-center justify-center rounded-xl border bg-background px-4 py-2.5 text-xs font-medium transition-colors hover:border-primary/30 hover:text-primary"
            >
              حذف فیلتر
            </Link>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DielinesFilters;
