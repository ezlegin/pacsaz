import { Categories, DielineType } from "@/app/(PANEL)/dielines/DielinesList";
import { getNodes } from "@repo/store/getters";
import { useAppDispatch, useAppSelector, useUndoRedo } from "@repo/store/hooks";
import {
  addRuler,
  removeRuler,
  rulersSelectors,
  setRulerVisibility,
} from "@repo/store/slices/rulersSlice";
import { clearSelection } from "@repo/store/slices/selectionSlice";
import { removeNode, setNodeVisibility } from "@repo/store/slices/nodesSlice";
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
import DielineChangesSaver from "../forms/dielineChangesSaver";
import DielineSettingsForm from "../forms/DielineSettingsForm";
import RulerLayers from "./layers/RulerLayers";
import ShapeLayers from "./layers/ShapeLayers";

export type ItemType = {
  nodes: ISpec.Node;
  Ruler: ISpec.Ruler;
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
  const nodes = getNodes();
  const rulers = useAppSelector(rulersSelectors.selectAll);

  function handleLayerAction(
    layerItemType: keyof ItemType,
    item: ItemType[keyof ItemType],
    type: "dup" | "delete" | "visibility",
  ) {
    switch (layerItemType) {
      case "nodes":
        const node = item as ISpec.Node;
        switch (type) {
          case "delete":
            dispatch(removeNode(node.id));
            dispatch(clearSelection());
            break;
          case "visibility":
            dispatch(setNodeVisibility(node.id));
            break;
          case "dup":
            // dispatch(
            //   addNode({ ...shape, key: shape.key + "-dup", id: nanoid() }),
            //   addNode({type: 'group', }),
            // );
            break;
        }
        break;
      case "Ruler":
        const ruler = item as ISpec.Ruler;
        switch (type) {
          case "delete":
            dispatch(removeRuler(ruler.id));
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
          </TabsList>
          <Separator />
        </div>

        <TabsContent value="layers">
          <ShapeLayers handleLayerAction={handleLayerAction} nodes={nodes} />
        </TabsContent>
        <TabsContent value="rulers">
          <RulerLayers handleLayerAction={handleLayerAction} rulers={rulers} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DielineLayer;
