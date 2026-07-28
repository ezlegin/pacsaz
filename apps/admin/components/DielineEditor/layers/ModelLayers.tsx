import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { HandleLayerActoin } from "../DielineLayer";
import LayerActions from "./LayerAction";
import { ISpec } from "@repo/store/types";

export default function ModelLayers({
  handleLayerAction,
  clearSelection,
  setSelection,
  models,
}: {
  models: ISpec.ModelsSpec[];
  handleLayerAction: HandleLayerActoin;
  clearSelection: () => void;
  setSelection: (shape: ISpec.ModelsSpec) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      spacing={0.01}
      className="flex-col w-full"
      onValueChange={(val) => {
        if (val === "") clearSelection();

        const shape = models.find((i) => i.id === val);
        if (!shape) return;

        setSelection(shape);
      }}
    >
      {models.map((model) => (
        <ToggleGroupItem
          key={model.id}
          value={model.id}
          className="justify-between w-full data-[state=on]:bg-gray-200/50 data-[state=on]:border cursor-pointer group"
        >
          <div className={"flex items-center gap-2"}>{model.key}</div>

          <LayerActions
            layerItemType="ModelsSpec"
            handleLayerAction={handleLayerAction}
            item={model}
          >
            {model.dup && model.dup.length > 0 && (
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
