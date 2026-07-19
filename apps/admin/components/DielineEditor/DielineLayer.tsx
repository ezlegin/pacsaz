import { Categories, DielineType } from "@/app/(PANEL)/dielines/DielinesList";
import { useSelectionStore } from "@repo/store/app/selection.store";
import { useDielineHistoryStore } from "@repo/store/editor/dielineHistory.store";
import {
  ISpec,
  useDielineSpecStore,
} from "@repo/store/editor/dielineSpec.store";
import { Button } from "@repo/ui/components/button";
import { ActButton } from "@repo/ui/components/custom/ActionButton";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { Separator } from "@repo/ui/components/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { Redo, Settings, Undo } from "lucide-react";
import { useEffect } from "react";
import DielineChangesSaver from "../forms/dielineChagesSaver";
import DielineSettingsForm from "../forms/DielineSettingsForm";
import ModelLayers from "./layers/ModelLayers";
import RulerLayers from "./layers/RulerLayers";
import ShapeLayers from "./layers/ShapeLayers";

export type ItemType = {
  ShapesSpec: ISpec.ShapesSpec;
  Ruler: ISpec.Ruler;
  ModelsSpec: ISpec.ModelsSpec;
};

export type HandleLayerActoin = (
  layerItemType: keyof ItemType,
  item: ItemType[keyof ItemType],
  type: "dup" | "delete" | "visibility",
) => void;

const DielineLayer = ({
  dieline,
  categories,
}: {
  dieline: DielineType;
  categories: Categories;
}) => {
  const {
    specs: { models, shapes, rulers },
    removeShape,
    removeRuler,
    setRulerVisibility,
    setRuler,
    setModelVisibility,
    setModel,
    removeModel,
    setShapeVisibility,
    setShape,
  } = useDielineSpecStore();
  const { setSelection, clearSelection } = useSelectionStore();
  const { setInitial, push, undo, redo } = useDielineHistoryStore();

  const flattedShapes = Object.values(shapes).flat();
  const flattenedModels = Object.values(models).flat();

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
    switch (layerItemType) {
      case "ShapesSpec":
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
        break;
      case "ModelsSpec":
        const model = item as ISpec.ModelsSpec;
        switch (type) {
          case "delete":
            removeModel(model.type, model.id);
            clearSelection();
            break;
          case "visibility":
            setModelVisibility(model.type, model.id);
            break;
          case "dup":
            setModel(model.type, { ...model, key: model.key + "-dup" });
            break;
        }
        break;
      case "Ruler":
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
        break;
    }
  }

  return (
    <div className="space-y-2">
      <DielineChangesSaver dieline={dieline} />
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button onClick={undo} variant={"outline"}>
            <Undo />
          </Button>
          <Button onClick={redo} variant={"outline"}>
            <Redo />
          </Button>
        </div>

        <Dialog>
          <DialogTrigger>
            <ActButton>
              <Settings size={18} />
            </ActButton>
          </DialogTrigger>
          <DialogContent
            showCloseButton={false}
            overlayClassname="backdrop-blur-xs bg-transparent"
            className="min-w-3xl"
          >
            <DialogTitle className="sr-only" />
            <DielineSettingsForm categories={categories} dieline={dieline} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="layers">
        <div className="space-y-1">
          <Separator />
          <TabsList className="w-full px-0">
            <TabsTrigger value="layers">Layers</TabsTrigger>
            <TabsTrigger value="rulers">Rulers</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
          </TabsList>
          <Separator />
        </div>

        <TabsContent value="layers">
          <ShapeLayers
            clearSelection={clearSelection}
            handleLayerAction={handleLayerAction}
            setSelection={setSelection}
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
          <ModelLayers
            clearSelection={clearSelection}
            handleLayerAction={handleLayerAction}
            setSelection={setSelection}
            models={flattenedModels}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DielineLayer;
