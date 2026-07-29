import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { Ruler } from "lucide-react";
import { HandleLayerActoin } from "../DielineLayer";
import LayerActions from "./LayerAction";
import { ISpec } from "@repo/store/types";
import { useAppDispatch } from "@repo/store/hooks";
import {
  clearSelection,
  setSelection,
} from "@repo/store/slices/selectionSlice";

export default function RulerLayers({
  handleLayerAction,
  rulers,
}: {
  rulers: ISpec.Rulers;
  handleLayerAction: HandleLayerActoin;
}) {
  const dispatch = useAppDispatch();
  return (
    <ToggleGroup
      type="single"
      spacing={0.01}
      className="flex-col w-full"
      onValueChange={(val) => {
        if (val === "") dispatch(clearSelection());

        const ruler = rulers.find((i) => i.id === val);
        if (!ruler) return;

        dispatch(setSelection(ruler));
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
