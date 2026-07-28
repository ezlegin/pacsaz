import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { cn } from "@repo/ui/lib/utils";
import {
  ChevronUp,
  Circle,
  Hexagon,
  Minus,
  Parentheses,
  Square,
} from "lucide-react";
import { HandleLayerActoin } from "../DielineLayer";
import LayerActions from "./LayerAction";
import { ISpec } from "@repo/store/types";
import { useAppDispatch } from "@repo/store/hooks";
import {
  clearSelection,
  setSelection,
} from "@repo/store/slices/selectionSlice";

export default function ShapeLayers({
  handleLayerAction,
  shapes,
}: {
  shapes: ISpec.ShapesSpec[];
  handleLayerAction: HandleLayerActoin;
}) {
  const dispatch = useAppDispatch();

  return (
    <ToggleGroup
      type="single"
      spacing={0.01}
      className="flex-col w-full"
      onValueChange={(shapeId) => {
        if (shapeId === "") dispatch(clearSelection());

        const shape = shapes.find((i) => i.id === shapeId);
        if (!shape) return;

        dispatch(setSelection(shape));
      }}
    >
      {shapes.map((shape, idx) => (
        <ToggleGroupItem
          key={idx}
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

          <LayerActions
            layerItemType="ShapesSpec"
            handleLayerAction={handleLayerAction}
            item={shape}
          >
            {shape.dup && shape.dup.length > 0 && (
              <div className="scale-[0.70] text-muted-foreground group-hover:hidden">
                dup
              </div>
            )}
          </LayerActions>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

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
