import { Categories, DielineType } from "@/app/(PANEL)/dielines/DielinesList";
import { useAppDispatch, useAppSelector, useUndoRedo } from "@repo/store/hooks";
import {
  addModel,
  modelsSelectors,
  removeModel,
  setModelVisibility,
} from "@repo/store/slices/modelsSlice";
import {
  addRuler,
  removeRuler,
  rulersSelectors,
  setRulerVisibility,
} from "@repo/store/slices/rulersSlice";
import {
  clearSelection,
  setSelection,
} from "@repo/store/slices/selectionSlice";
import {
  addShape,
  removeShape,
  setShapeVisibility,
  shapesSelectors,
} from "@repo/store/slices/shapesSlice";
import { ISpec } from "@repo/store/types";
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
  const dispatch = useAppDispatch();
  const shapes = useAppSelector(shapesSelectors.selectAll);
  const models = useAppSelector(modelsSelectors.selectAll);
  const rulers = useAppSelector(rulersSelectors.selectAll);

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
            dispatch(removeShape(shape.id));
            dispatch(clearSelection());
            break;
          case "visibility":
            dispatch(setShapeVisibility(shape.id));
            break;
          case "dup":
            dispatch(addShape({ ...shape, key: shape.key + "-dup" })); //todo: it needs unique/new id
            break;
        }
        break;
      case "ModelsSpec":
        const model = item as ISpec.ModelsSpec;
        switch (type) {
          case "delete":
            dispatch(removeModel(model.id));
            dispatch(clearSelection());
            break;
          case "visibility":
            dispatch(setModelVisibility(model.id));
            break;
          case "dup":
            dispatch(addModel({ ...model, key: model.key + "-dup" }));
            break;
        }
        break;
      case "Ruler":
        const ruler = item as ISpec.Ruler;
        switch (type) {
          case "delete":
            removeRuler(ruler.id);
            dispatch(clearSelection());
            break;
          case "visibility":
            dispatch(setRulerVisibility(ruler.id));
            break;
          case "dup":
            dispatch(addRuler({ ...ruler, key: ruler.key + "-dup" }));
            break;
        }
        break;
    }
  }

  const { canRedo, canUndo, redo, undo } = useUndoRedo();

  return (
    <div className="space-y-2">
      <DielineChangesSaver dieline={dieline} />
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            onClick={() => undo()}
            disabled={!canUndo}
            variant={"outline"}
          >
            undo
            <Undo />
          </Button>
          <Button
            onClick={() => redo()}
            disabled={!canRedo}
            variant={"outline"}
          >
            redo
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
          <ShapeLayers handleLayerAction={handleLayerAction} shapes={shapes} />
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
            models={models}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DielineLayer;
