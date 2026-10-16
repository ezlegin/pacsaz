"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { cn } from "@repo/ui/lib/utils";
import { HelpCircle } from "lucide-react";
import type { FaqItem } from "@/data/faq";

/**
 * Shared FAQ list. Presentational and data-driven so the home page and the
 * standalone FAQ page stay in sync from `data/faq.ts`.
 *
 * Each row is its own bordered card with a numbered marker, which makes the
 * list scannable and gives the open row a clear visual anchor.
 */
const FaqAccordion = ({
  items,
  defaultOpenId,
  className,
}: {
  items: FaqItem[];
  /** Id of the row to open on first render. */
  defaultOpenId?: string;
  className?: string;
}) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed px-6 py-16 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <HelpCircle className="size-5" strokeWidth={1.8} />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-bold">پاسخی برای این جستجو پیدا نشد</p>
          <p className="text-xs text-muted-foreground">
            عبارت دیگری را امتحان کن یا از طریق تماس با ما سوالت را بپرس.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpenId}
      className={cn("space-y-2.5", className)}
    >
      {items.map((item, index) => (
        <AccordionItem
          key={item.id}
          value={item.id}
          className={cn(
            "group rounded-2xl border bg-background px-4 transition-colors duration-200",
            "hover:border-primary/25",
            "data-[state=open]:border-primary/30 data-[state=open]:bg-primary/[0.03]",
          )}
        >
          <AccordionTrigger className="items-center gap-3 py-4 text-right hover:no-underline">
            <span className="flex min-w-0 flex-1 items-center gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-muted text-[10px] font-bold tabular-nums text-muted-foreground transition-colors duration-200 group-hover:bg-primary/10 group-hover:text-primary group-data-[state=open]:bg-primary group-data-[state=open]:text-primary-foreground">
                {(index + 1).toLocaleString("fa-IR", { useGrouping: false })}
              </span>

              <span className="text-[13px] font-bold leading-6">
                {item.question}
              </span>
            </span>
          </AccordionTrigger>

          <AccordionContent className="text-[13px] leading-7 text-muted-foreground">
            <div className="pr-9">{item.answer}</div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default FaqAccordion;
