import { useSelectionStore } from "@repo/store/app/selection.store";
import { useDielineHistoryStore } from "@repo/store/editor/dielineHistory.store";
import {
  ISpec,
  useDielineSpecStore,
} from "@repo/store/editor/dielineSpec.store";
import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
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
  Ruler,
  Square,
  Trash,
  Undo,
} from "lucide-react";
import { ReactNode, useEffect } from "react";
import DielineMetadataForm from "../forms/DielineMetadataForm";

type ItemType = {
  ShapesSpec: ISpec.ShapesSpec;
  Ruler: ISpec.Ruler;
};

const DielineLayer = () => {
  const {
    shapes,
    removeShape,
    setShapes,
    removeRuler,
    setRulerVisibility,
    setRuler,
    rulers,
    setShapeVisibility,
    setShape,
  } = useDielineSpecStore();
  const { setSelection, clearSelection } = useSelectionStore();
  const { setInitial, push, undo, redo, present, future, past } =
    useDielineHistoryStore();

  const flattedShapes = Object.values(shapes).flat();

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

  function handleLayerAction(
    layerItemType: keyof ItemType,
    item: ItemType[keyof ItemType],
    type: "dup" | "delete" | "visibility",
  ) {
    if (layerItemType === "ShapesSpec") {
      const shape = item as ISpec.ShapesSpec;
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
    } else {
      const ruler = item as ISpec.Ruler;
      switch (type) {
        case "delete":
          removeRuler(ruler.id);
          clearSelection();
          break;
        case "visibility":
          setRulerVisibility(ruler.id);
          break;
        case "dup":
          setRuler({ ...ruler, key: ruler.key + "-dup" });
          break;
      }
    }
  }

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

      <Tabs defaultValue="layers">
        <div className="space-y-1">
          <Separator />
          <TabsList className="w-full px-0">
            <TabsTrigger className="cursor-pointer" value="layers">
              Layers
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="rulers">
              Rulers
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="models">
              Models
            </TabsTrigger>
          </TabsList>
          <Separator />
        </div>

        <TabsContent value="layers" className="space-y-3">
          <ShapeLayers
            clearSelection={clearSelection}
            handleLayerAction={handleLayerAction}
            setSelectedShape={setSelection}
            shapes={flattedShapes}
          />
        </TabsContent>
        <TabsContent value="rulers">
          <RulerLayers
            clearSelection={clearSelection}
            handleLayerAction={handleLayerAction}
            setSelection={setSelection}
            rulers={rulers}
          />
        </TabsContent>
        <TabsContent value="models">
          <div>hi</div>
        </TabsContent>
      </Tabs>
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

type HandleLayerActoin = (
  layerItemType: keyof ItemType,
  item: ItemType[keyof ItemType],
  type: "dup" | "delete" | "visibility",
) => void;

function ShapeLayers({
  handleLayerAction,
  clearSelection,
  setSelectedShape,
  shapes,
}: {
  shapes: ISpec.ShapesSpec[];
  handleLayerAction: HandleLayerActoin;
  clearSelection: () => void;
  setSelectedShape: (shape: ISpec.ShapesSpec) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      spacing={0.01}
      className="flex-col w-full"
      onValueChange={(val) => {
        if (val === "") clearSelection();

        const shape = shapes.find((i) => i.id === val);
        if (!shape) return;

        setSelectedShape(shape);
      }}
    >
      {shapes.map((shape) => (
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

function RulerLayers({
  handleLayerAction,
  clearSelection,
  setSelection,
  rulers,
}: {
  rulers: ISpec.Rulers;
  handleLayerAction: HandleLayerActoin;
  clearSelection: () => void;
  setSelection: (ruler: ISpec.Ruler) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      spacing={0.01}
      className="flex-col w-full"
      onValueChange={(val) => {
        if (val === "") clearSelection();

        const ruler = rulers.find((i) => i.id === val);
        if (!ruler) return;

        setSelection(ruler);
      }}
    >
      {rulers.map((ruler) => (
        <ToggleGroupItem
          key={ruler.id}
          value={ruler.id}
          className="justify-between w-full data-[state=on]:bg-gray-200/50 data-[state=on]:border cursor-pointer group"
        >
          <div className={"flex items-center gap-2"}>
            <Ruler className="scale-[0.9] text-muted-foreground" />
            {ruler.key}
          </div>
          <LayerActions
            layerItemType="Ruler"
            handleLayerAction={handleLayerAction}
            item={ruler}
          />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

function LayerActions<T extends ISpec.ShapesSpec | ISpec.Ruler>({
  item,
  handleLayerAction,
  children,
  layerItemType,
}: {
  item: T;
  children?: ReactNode;
  layerItemType: keyof ItemType;
  handleLayerAction: HandleLayerActoin;
}) {
  return (
    <div className="flex gap-2">
      {children}

      <div
        className="hidden group-hover:block cursor-pointer hover:text-blue-500"
        onClick={(e) => {
          e.stopPropagation();
          handleLayerAction(layerItemType, item, "dup");
        }}
      >
        <Copy className="scale-[0.85]" />
      </div>

      <div
        className="hidden group-hover:block cursor-pointer hover:text-blue-500"
        onClick={(e) => {
          e.stopPropagation();
          handleLayerAction(layerItemType, item, "visibility");
        }}
      >
        <VisibilityIcon hidden={item.hidden} />
      </div>

      <div
        className="hidden group-hover:block cursor-pointer hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          handleLayerAction(layerItemType, item, "delete");
        }}
      >
        <Trash className="scale-[0.85]" />
      </div>
    </div>
  );
}
