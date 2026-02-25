import { useDielineSpecStore } from "@repo/store/dieline/dielineSpec.store";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { Separator } from "@repo/ui/components/separator";
import { Trash } from "lucide-react";

const DielineLayer = () => {
  const { dielineSpec, setDielineSpec } = useDielineSpecStore();

  const shapesArr = Object.entries(dielineSpec.shapes).map(([key, value]) => {
    const val = Object.entries(value).map(([key]) => ({ key }));
    return { key, value: val };
  });

  const handleDelete = (key: string) => {
    if (!dielineSpec.shapes.line) return;

    const filteredLines = Object.entries(dielineSpec.shapes.line)
      .filter(([itemKey]) => itemKey !== key)
      .reduce(
        (acc, [itemKey, itemValue]) => ({
          ...acc,
          [itemKey]: itemValue,
        }),
        {},
      );

    setDielineSpec("shapes", {
      line: filteredLines,
    });
  };

  return (
    <div className="space-y-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div>
          <input
            value={"Untitled"}
            className="text-lg w-full px-1 -translate-x-1 font-medium"
            placeholder="Title"
            onChange={() => console.log("first")}
          />
        </div>
        <div>
          <input
            value={"dev"}
            className="text-sm w-full px-1 text-muted-foreground -translate-x-1"
            placeholder="Slug"
            onChange={() => console.log("first")}
          />
        </div>
      </form>

      <Separator />

      <div>
        <span className="font-medium">Shapes</span>
        <Accordion type="multiple" className="pl-3">
          {shapesArr.map((item) => (
            <AccordionItem
              key={item.key}
              value={item.key}
              className="border-b-0"
            >
              <AccordionTrigger className="py-1.5">{item.key}</AccordionTrigger>
              <AccordionContent key={item.key} className="pb-0">
                {item.value.map((item) => (
                  <div
                    key={item.key}
                    className="flex justify-between items-center group text-muted-foreground hover:bg-gray-200/50 py-1 pl-3 rounded-sm"
                  >
                    <div>{item.key}</div>
                    <Trash
                      className="hidden group-hover:block cursor-pointer hover:text-destructive"
                      size={14}
                      onClick={() => handleDelete(item.key)}
                    />
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default DielineLayer;
