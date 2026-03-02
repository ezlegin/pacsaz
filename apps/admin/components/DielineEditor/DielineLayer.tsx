import { useSelectShapeStore } from "@repo/store/app/selectedShape.store";
import {
  ISpec,
  useDielineSpecStore,
} from "@repo/store/editor/dielineSpec.store";
import { Separator } from "@repo/ui/components/separator";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { cn } from "@repo/ui/lib/utils";
import {
  ChevronUp,
  Circle,
  CircleDashed,
  Eye,
  EyeClosed,
  Minus,
  Square,
  SquareDashed,
  Trash,
} from "lucide-react";
import { useState } from "react";
import DielineMetadataForm from "../forms/DielineMetadataForm";

const DielineLayer = () => {
  const { shapes, removeShape, setShapeVisibility } = useDielineSpecStore();
  const { setSelectedShape, clearSelection } = useSelectShapeStore();
  const [shapeRef, setShapeRef] = useState<keyof ShapeRefData>("type");

  const allShapes = Object.values(shapes).flat();

  return (
    <div className="space-y-2">
      <DielineMetadataForm />

      <div className="space-y-0.5">
        <Separator />
        <div className="flex justify-between items-center">
          <div className="font-medium text-sm">Layers</div>
          <ToggleGroup
            value={shapeRef}
            onValueChange={(val: keyof ShapeRefData | "") => {
              if (val === "") return;
              setShapeRef(val);
            }}
            size={"sm"}
            type="single"
          >
            <ToggleGroupItem
              value="type"
              className="text-xs text-muted-foreground"
            >
              Shape
            </ToggleGroupItem>
            <ToggleGroupItem
              value="layer"
              className="text-xs text-muted-foreground"
            >
              Layer
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <Separator />
      </div>

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
              <LayerIcon
                shapeRef={shapeRef}
                data={shapeRef === "type" ? shape.type : shape.layer}
              />
              {shape.key}
            </div>

            <div className="flex gap-2">
              <div
                className="hidden group-hover:block cursor-pointer hover:text-blue-500"
                onClick={(e) => {
                  e.stopPropagation();
                  setShapeVisibility(shape.type, shape.id);
                }}
              >
                <VisibilityIcon hidden={shape.hidden} />
              </div>

              <div
                className="hidden group-hover:block cursor-pointer hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  removeShape(shape.type, shape.id);
                  clearSelection();
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

interface ShapeRefData {
  type: ISpec.ShapesKey;
  layer: ISpec.Layer;
}

function LayerIcon<T extends keyof ShapeRefData>({
  shapeRef,
  data,
}: {
  shapeRef: T;
  data: ShapeRefData[T];
}) {
  if (shapeRef === "type") {
    switch (data as ShapeRefData["type"]) {
      case "line":
        return <Minus className="scale-[0.9]" />;
      case "circle":
        return <Circle className="scale-[0.9]" />;
      case "rectangle":
        return <Square className="scale-[0.9]" />;
      case "lines":
        return <ChevronUp className="scale-[0.9]" />;
    }
  } else {
    switch (data as ShapeRefData["layer"]) {
      case "trim":
        return <Square className="scale-[0.9]" />;
      case "fold":
        return <SquareDashed className="scale-[0.9]" />;
      case "perf":
        return <CircleDashed className="scale-[0.9]" />;
    }
  }
}
