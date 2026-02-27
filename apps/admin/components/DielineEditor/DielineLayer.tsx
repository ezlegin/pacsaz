import { useSelectShapeStore } from "@repo/store/app/selectedShape.store";
import {
  ISpec,
  useDielineSpecStore,
} from "@repo/store/dieline/dielineSpec.store";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { Separator } from "@repo/ui/components/separator";
import { cn } from "@repo/ui/lib/utils";
import { Eye, EyeClosed, Trash } from "lucide-react";
import DielineMetadataForm from "../forms/DielineMetadataForm";

const DielineLayer = () => {
  const { shapes, removeShape, setShapeVisibility } = useDielineSpecStore();
  const { selectedShape, setSelectedShape, clearSelection } =
    useSelectShapeStore();

  const shapesArr = Object.entries(shapes).map(([key, val]) => ({ key, val }));

  const handleDelete = (type: ISpec.ShapesKey, id: string) => {
    removeShape(type, id);
    clearSelection();
  };

  const handleVisibility = (type: ISpec.ShapesKey, id: string) => {
    setShapeVisibility(type, id);
  };

  const handleSelection = (shape: ISpec.ShapesSpec) => {
    if (selectedShape) {
      clearSelection();
      return;
    } else {
      setSelectedShape(shape);
    }
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
              parent.val.length > 0 && (
                <AccordionItem
                  key={parent.key}
                  value={parent.key}
                  className="border-b-0"
                >
                  <AccordionTrigger className="py-1.5">
                    {parent.key}
                  </AccordionTrigger>
                  <AccordionContent key={parent.key} className="pb-0">
                    {parent.val.map((child) => (
                      <div
                        key={child.id}
                        className={cn(
                          selectedShape &&
                            selectedShape.id === child.id &&
                            "bg-gray-200/50",
                          child.hidden ? "opacity-50" : "",
                          `flex justify-between items-center group text-muted-foreground hover:bg-gray-200/50 py-1 px-3 rounded-sm cursor-pointer`,
                        )}
                        onClick={() => handleSelection(child)}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVisibility(
                                parent.key as ISpec.ShapesKey,
                                child.id,
                              );
                            }}
                          >
                            <VisibilityIcon hidden={child.hidden} />
                          </button>
                          <button
                            className="hidden group-hover:block cursor-pointer hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(
                                parent.key as ISpec.ShapesKey,
                                child.id,
                              );
                            }}
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

const VisibilityIcon = ({ hidden }: { hidden: boolean }) => {
  return hidden ? <EyeClosed size={14} /> : <Eye size={14} />;
};
