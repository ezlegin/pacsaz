import {
  ShapesKey,
  useDielineSpecStore,
} from "@repo/store/dieline/dielineSpec.store";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { Separator } from "@repo/ui/components/separator";
import { Eye, EyeClosed, Trash } from "lucide-react";
import DielineMetadataForm from "../forms/DielineMetadataForm";
import { cn } from "@repo/ui/lib/utils";

const DielineLayer = () => {
  const { dielineSpec, removeShape, setShapeVisibility } =
    useDielineSpecStore();

  const shapesArr = Object.entries(dielineSpec.shapes).map(([key, val]) => {
    const value = Object.entries(val).map(([key, val]) => ({
      key,
      hidden: val.hidden,
      layer: val.layer,
    }));
    return { key, value };
  });

  const handleDelete = (type: ShapesKey, key: string) => {
    removeShape(type, key);
  };

  const handleVisibility = (
    type: ShapesKey,
    key: string,
    currentHidden: boolean,
  ) => {
    setShapeVisibility(type, key, currentHidden);
  };

  const VisibilityIcon = ({ hidden }: { hidden: boolean }) => {
    return hidden ? <EyeClosed size={14} /> : <Eye size={14} />;
  };

  return (
    <div className="space-y-3">
      <DielineMetadataForm />

      <Separator />

      <div>
        <span className="font-medium">Shapes</span>
        <Accordion type="multiple" className="pl-3">
          {shapesArr.map(
            (parent) =>
              parent.value.length > 0 && (
                <AccordionItem
                  key={parent.key}
                  value={parent.key}
                  className="border-b-0"
                >
                  <AccordionTrigger className="py-1.5">
                    {parent.key}
                  </AccordionTrigger>
                  <AccordionContent key={parent.key} className="pb-0">
                    {parent.value.map((child) => (
                      <div
                        key={child.key}
                        className={`flex justify-between items-center group text-muted-foreground hover:bg-gray-200/50 py-1 px-3 rounded-sm ${
                          child.hidden ? "opacity-50" : ""
                        }`}
                      >
                        <div
                          className={cn(
                            child.layer === "trim"
                              ? "text-blue-500"
                              : child.layer === "fold"
                                ? "text-red-500"
                                : "text-fuchsia-500",
                          )}
                        >
                          {child.key}
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="hidden group-hover:block cursor-pointer hover:text-primary-background"
                            onClick={() =>
                              handleVisibility(
                                parent.key as ShapesKey,
                                child.key,
                                child.hidden,
                              )
                            }
                          >
                            <VisibilityIcon hidden={child.hidden} />
                          </button>
                          <button
                            className="hidden group-hover:block cursor-pointer hover:text-destructive"
                            onClick={() =>
                              handleDelete(parent.key as ShapesKey, child.key)
                            }
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ),
          )}
        </Accordion>
      </div>
    </div>
  );
};

export default DielineLayer;
