import { Copy, Eye, EyeClosed, Trash } from "lucide-react";
import { ReactNode } from "react";
import { HandleLayerActoin, ItemType } from "../DielineLayer";
import { ISpec } from "@repo/store/types";

export default function LayerActions<
  T extends ISpec.ShapesSpec | ISpec.ModelsSpec | ISpec.Ruler,
>({
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

const VisibilityIcon = ({ hidden }: { hidden: boolean }) => {
  return hidden ? (
    <EyeClosed className="scale-[0.85]" />
  ) : (
    <Eye className="scale-[0.85]" />
  );
};
