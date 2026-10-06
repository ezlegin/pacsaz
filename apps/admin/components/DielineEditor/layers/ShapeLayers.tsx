"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@repo/ui/components/context-menu";
import { cn } from "@repo/ui/lib/utils";
import {
  ChevronUp,
  Circle,
  Folder,
  FolderMinus,
  FolderPlus,
  Hexagon,
  Minus,
  Parentheses,
  Square,
} from "lucide-react";
import { useState, type MouseEvent } from "react";
import { nanoid } from "nanoid";
import { useAppDispatch } from "@repo/store/hooks";
import { groupNodes, ungroupNode } from "@repo/store/slices/nodesSlice";
import {
  clearSelection,
  setSelection,
} from "@repo/store/slices/selectionSlice";
import { ISpec } from "@repo/store/types";
import { HandleLayerActoin } from "../DielineLayer";
import LayerActions from "./LayerAction";

interface ShapeLayersProps {
  nodes: ISpec.Nodes;
  handleLayerAction: HandleLayerActoin;
}

export default function ShapeLayers({
  handleLayerAction,
  nodes,
}: ShapeLayersProps) {
  const dispatch = useAppDispatch();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelect = (nodeId: string, event: MouseEvent) => {
    if (!nodeId) {
      setSelectedIds([]);
      dispatch(clearSelection());
      return;
    }

    const isMulti = event.metaKey || event.ctrlKey || event.shiftKey;

    if (isMulti) {
      setSelectedIds((prev) =>
        prev.includes(nodeId)
          ? prev.filter((id) => id !== nodeId)
          : [...prev, nodeId],
      );
      return;
    }

    setSelectedIds([nodeId]);
    const node = findNode(nodes, nodeId);
    if (node) dispatch(setSelection(node));
  };

  const handleGroup = (ids: string[]) => {
    if (ids.length < 2) return;

    const group: ISpec.Group = {
      id: nanoid(),
      type: "group",
      name: `Group (${ids.length})`,
      hidden: false,
      origin: ["0", "0"],
      nodes: [],
    };

    dispatch(groupNodes({ ids, group }));
    setSelectedIds([]);
    dispatch(clearSelection());
  };

  const handleUngroup = (id: string) => {
    dispatch(ungroupNode(id));
    setSelectedIds([]);
    dispatch(clearSelection());
  };

  return (
    <div className="w-full">
      {nodes.map((node) => (
        <NodeItem
          key={node.id}
          node={node}
          handleLayerAction={handleLayerAction}
          depth={0}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onGroup={handleGroup}
          onUngroup={handleUngroup}
        />
      ))}
    </div>
  );
}

interface NodeItemProps {
  node: ISpec.Node;
  handleLayerAction: HandleLayerActoin;
  depth: number;
  selectedIds: string[];
  onSelect: (id: string, event: MouseEvent) => void;
  onGroup: (ids: string[]) => void;
  onUngroup: (id: string) => void;
}

function NodeItem({
  node,
  handleLayerAction,
  depth,
  selectedIds,
  onSelect,
  onGroup,
  onUngroup,
}: NodeItemProps) {
  /* ---------- GROUP ---------- */
  if (node.type === "group") {
    const isSelected = selectedIds.includes(node.id);

    return (
      <Accordion type="multiple" className="w-full">
        <AccordionItem value={node.id} className="border-b-0">
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <AccordionTrigger
                className={cn(
                  "rounded-md px-2 py-2 hover:no-underline hover:bg-gray-100",
                  isSelected && "bg-gray-200/50",
                )}
                style={{ paddingLeft: `${8 + depth * 16}px` }}
                onClick={(e) => onSelect(node.id, e)}
              >
                <div className="flex flex-1 items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Folder className="scale-[0.55]" />
                    <span className="text-xs text-muted-foreground">
                      {node.name}
                    </span>
                  </div>

                  <LayerActions
                    layerItemType="nodes"
                    handleLayerAction={handleLayerAction}
                    item={node}
                  />
                </div>
              </AccordionTrigger>
            </ContextMenuTrigger>

            <ContextMenuContent>
              <ContextMenuItem onSelect={() => onUngroup(node.id)}>
                <FolderMinus className="mr-2 h-4 w-4" />
                Ungroup
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>

          <AccordionContent className="pb-0">
            {node.nodes.map((child) => (
              <NodeItem
                key={child.id}
                node={child}
                handleLayerAction={handleLayerAction}
                depth={depth + 1}
                selectedIds={selectedIds}
                onSelect={onSelect}
                onGroup={onGroup}
                onUngroup={onUngroup}
              />
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  /* ---------- SHAPE ---------- */
  const isSelected = selectedIds.includes(node.id);
  const canGroup = selectedIds.length >= 2 && isSelected;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            "group flex cursor-pointer select-none items-center justify-between gap-2 rounded-md px-2 py-2 hover:bg-gray-100",
            isSelected && "border bg-gray-200/50",
          )}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={(e) => onSelect(node.id, e)}
        >
          <div
            className={cn(
              node.layer === "trim"
                ? "text-blue-500"
                : node.layer === "fold"
                  ? "text-red-500"
                  : "text-fuchsia-500",
              "flex items-center gap-1 text-sm",
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
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent>
        {canGroup ? (
          <ContextMenuItem onSelect={() => onGroup(selectedIds)}>
            <FolderPlus className="mr-2 h-4 w-4" />
            Group {selectedIds.length} items
          </ContextMenuItem>
        ) : (
          <ContextMenuItem disabled>
            <FolderPlus className="mr-2 h-4 w-4" />
            Select 2+ items to group
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

/* ---------- helpers ---------- */

function findNode(nodes: ISpec.Nodes, id: string): ISpec.Node | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.type === "group") {
      const found = findNode(node.nodes, id);
      if (found) return found;
    }
  }
  return undefined;
}

function LayerIcon({ data }: { data: ISpec.ShapesKey }) {
  const className = "scale-[0.7]";
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
