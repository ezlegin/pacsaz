import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { cn } from "@repo/ui/lib/utils";
import {
  ChevronUp,
  Circle,
  Folder,
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
  nodes,
}: {
  nodes: ISpec.Nodes;
  handleLayerAction: HandleLayerActoin;
}) {
  const dispatch = useAppDispatch();

  const handleSelect = (nodeId: string) => {
    if (!nodeId) {
      dispatch(clearSelection());
      return;
    }

    const node = findNode(nodes, nodeId);

    if (!node) return;

    dispatch(setSelection(node));
  };

  return (
    <ToggleGroup
      type="single"
      spacing={0.01}
      className="flex-col w-full"
      onValueChange={handleSelect}
    >
      {nodes.map((node) => (
        <NodeItem
          key={node.id}
          node={node}
          handleLayerAction={handleLayerAction}
          depth={0}
        />
      ))}
    </ToggleGroup>
  );
}

function NodeItem({
  node,
  handleLayerAction,
  depth,
}: {
  node: ISpec.Node;
  handleLayerAction: HandleLayerActoin;
  depth: number;
}) {
  if (node.type === "group") {
    return (
      <>
        <ToggleGroupItem
          value={node.id}
          className="justify-between w-full cursor-pointer group"
          style={{
            paddingLeft: `${8 + depth * 16}px`,
          }}
        >
          <div className="flex items-center gap-2">
            <Folder className="scale-[0.9]" />
            <span>{node.name}</span>
          </div>

          <LayerActions
            layerItemType="nodes"
            handleLayerAction={handleLayerAction}
            item={node}
          />
        </ToggleGroupItem>

        <div>
          {node.nodes.map((child) => (
            <NodeItem
              key={child.id}
              node={child}
              handleLayerAction={handleLayerAction}
              depth={depth + 1}
            />
          ))}
        </div>
      </>
    );
  }

  return (
    <ToggleGroupItem
      value={node.id}
      className="justify-between w-full data-[state=on]:bg-gray-200/50 data-[state=on]:border cursor-pointer group"
      style={{
        paddingLeft: `${8 + depth * 16}px`,
      }}
    >
      <div
        className={cn(
          node.layer === "trim"
            ? "text-blue-500"
            : node.layer === "fold"
              ? "text-red-500"
              : "text-fuchsia-500",
          "flex items-center gap-2",
        )}
      >
        <LayerIcon data={node.type} />
        {node.key}
      </div>

      <LayerActions
        layerItemType="nodes"
        handleLayerAction={handleLayerAction}
        item={node}
      >
        {node.dup && node.dup.length > 0 && (
          <div className="scale-[0.70] text-muted-foreground group-hover:hidden">
            dup
          </div>
        )}
      </LayerActions>
    </ToggleGroupItem>
  );
}

function findNode(nodes: ISpec.Nodes, id: string): ISpec.Node | undefined {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }

    if (node.type === "group") {
      const found = findNode(node.nodes, id);

      if (found) {
        return found;
      }
    }
  }

  return undefined;
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
