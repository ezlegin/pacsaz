import { useSelectShapeStore } from "@repo/store/app/selectedShape.store";
import { useDielineHistoryStore } from "@repo/store/editor/dielineHistory.store";
import {
  ISpec,
  useDielineSpecStore,
} from "@repo/store/editor/dielineSpec.store";
import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { cn } from "@repo/ui/lib/utils";
import {
  ChevronUp,
  Circle,
  Copy,
  Eye,
  EyeClosed,
  Hexagon,
  Minus,
  Parentheses,
  Redo,
  Square,
  Trash,
  Undo,
} from "lucide-react";
import { useEffect } from "react";
import DielineMetadataForm from "../forms/DielineMetadataForm";

const DielineLayer = () => {
  const { shapes, removeShape, setShapes, setShapeVisibility, setShape } =
    useDielineSpecStore();
  const { setSelectedShape, clearSelection } = useSelectShapeStore();
  const { setInitial, push, undo, redo, present, future, past } =
    useDielineHistoryStore();

  const allShapes = Object.values(shapes).flat();

  useEffect(() => {
    setInitial(shapes);
  }, []);

  useEffect(() => {
    push(shapes);
  }, [shapes]);

  //todo:
  // useEffect(() => {
  // if (present) {
  //     setShapes(present);
  //   }
  // }, [present]);

  const handleLayerAction = (
    type: "dup" | "delete" | "visibility",
    shape: ISpec.ShapesSpec,
  ) => {
    switch (type) {
      case "delete":
        removeShape(shape.type, shape.id);
        clearSelection();
        break;
      case "visibility":
        setShapeVisibility(shape.type, shape.id);
        break;
      case "dup":
        setShape(shape.type, { ...shape, key: shape.key + "-dup" });
        break;
    }
  };

  return (
    <div className="space-y-2">
      <DielineMetadataForm />
      <div className="flex gap-2">
        <Button onClick={undo} variant={"outline"}>
          <Undo />
        </Button>
        <Button onClick={redo} variant={"outline"}>
          <Redo />
        </Button>
      </div>

      <Separator />
      <div className="font-medium text-sm">Layers</div>
      <Separator />
      <ToggleGroup
        type="single"
        spacing={0.01}
        className="flex-col w-full"
        onValueChange={(val) => {
          if (val === "") clearSelection();

          const shape = allShapes.find((i) => i.id === val);
          if (!shape) return;

          setSelectedShape(shape);
        }}
      >
        {allShapes.map((shape) => (
          <ToggleGroupItem
            key={shape.id}
            value={shape.id}
            className="justify-between w-full data-[state=on]:bg-gray-200/50 data-[state=on]:border cursor-pointer group"
          >
            <div
              className={cn(
                shape.layer === "trim"
                  ? "text-blue-500"
                  : shape.layer === "fold"
                    ? "text-red-500"
                    : "text-fuchsia-500",
                "flex items-center gap-2",
              )}
            >
              <LayerIcon data={shape.type} />
              {shape.key}
            </div>

            <div className="flex gap-2">
              {shape.dup && shape.dup.length > 0 && (
                <div className="scale-[0.70] text-muted-foreground group-hover:hidden">
                  dup
                </div>
              )}

              <div
                className="hidden group-hover:block cursor-pointer hover:text-blue-500"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLayerAction("dup", shape);
                }}
              >
                <Copy className="scale-[0.85]" />
              </div>

              <div
                className="hidden group-hover:block cursor-pointer hover:text-blue-500"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLayerAction("visibility", shape);
                }}
              >
                <VisibilityIcon hidden={shape.hidden} />
              </div>

              <div
                className="hidden group-hover:block cursor-pointer hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLayerAction("delete", shape);
                }}
              >
                <Trash className="scale-[0.85]" />
              </div>
            </div>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};

export default DielineLayer;

const VisibilityIcon = ({ hidden }: { hidden: boolean }) => {
  return hidden ? (
    <EyeClosed className="scale-[0.85]" />
  ) : (
    <Eye className="scale-[0.85]" />
  );
};

function LayerIcon({ data }: { data: ISpec.ShapesKey }) {
  const className = "scale-[0.9]";

  switch (data) {
    case "line":
      return <Minus className={className} />;
    case "circle":
      return <Circle className={className} />;
    case "rectangle":
      return <Square className={className} />;
    case "lines":
      return <ChevronUp className={className} />;
    case "polygon":
      return <Hexagon className={className} />;
    case "arc":
      return <Parentheses className={className} />;
  }
}
