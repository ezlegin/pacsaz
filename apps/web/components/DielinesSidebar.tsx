import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";
import { ChevronLeft } from "lucide-react";

const DielinesSidebar = () => {
  return (
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
  );
};

export default DielinesSidebar;

const categories = [
  {
    groupLabel: "بر اساس استفاده",
    key: "usage",
    categories: [
      { label: "خوراک", slug: "food" },
      { label: "اسباب بازی", slug: "toys" },
      { label: "کافه", slug: "coffee" },
    ],
  },
  {
    groupLabel: "بر اساس قالب",
    key: "model",
    categories: [
      { label: "Tuck End", slug: "tuck-end" },
      { label: "FEFCO", slug: "fefco" },
      { label: "Folding", slug: "folding" },
      { label: "Window", slug: "window" },
    ],
  },
];
