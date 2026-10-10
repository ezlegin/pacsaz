"use client";

import type { FlatNode } from "@/lib/utils/tree";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@repo/ui/components/context-menu";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FolderMinus, FolderPlus, Pencil, Trash } from "lucide-react";
import type { CSSProperties, MouseEvent } from "react";
import { EffectMenuItem, ToggleEffectMenuItem } from "./EffectMenuItem";
import { RowContent } from "./RowContent";
import { HandleLayerActoin } from "../DielineEditor/DielineLayer";

interface Props {
  item: FlatNode;
  isActive: boolean;
  isSelected: boolean;
  isCollapsed: boolean;
  isEditing: boolean;
  selectedIds: string[];
  onSelect: (id: string, e: MouseEvent) => void;
  onToggleCollapse: (id: string) => void;
  onGroup: (ids: string[]) => void;
  onUngroup: (id: string) => void;
  onRenameStart: (id: string) => void;
  onRenameCommit: (id: string, key: string) => void;
  onRenameCancel: () => void;
  handleLayerAction: HandleLayerActoin;
  onAddRadius: (nodeId: string) => void;
  onRemoveRadius: (nodeId: string) => void;
  onAddArray: (nodeId: string) => void;
  onRemoveArray: (nodeId: string) => void;
  onAddBoolean: (nodeId: string) => void;
  onRemoveBoolean: (nodeId: string) => void;
  onAddJoin: (nodeId: string) => void;
  onRemoveJoin: (nodeId: string) => void;
}

export function SortableRow({
  item,
  isActive,
  isSelected,
  isCollapsed,
  isEditing,
  selectedIds,
  onSelect,
  onToggleCollapse,
  onGroup,
  onUngroup,
  onRenameStart,
  onRenameCommit,
  onRenameCancel,
  handleLayerAction,
  onAddRadius,
  onRemoveRadius,
  onAddArray,
  onRemoveArray,
  onAddBoolean,
  onAddJoin,
  onRemoveBoolean,
  onRemoveJoin,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const isGroup = item.node.type === "group";
  const canGroup = selectedIds.length >= 2 && isSelected;

  const effects = item.node.type === "group" ? [] : (item.node.effects ?? []);
  const hasRadius = effects.some(
    (e) => e.type === "radius" || e.type === "radiusAt",
  );
  const hasArray = effects.some((e) => e.type === "array");
  const nodeEffects = item.node.effects ?? [];
  const hasBoolean = nodeEffects.some((e) => e.type === "boolean");
  const hasJoin = nodeEffects.some((e) => e.type === "join");

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
          <RowContent
            item={item}
            isSelected={isSelected}
            isCollapsed={isCollapsed}
            isActive={isActive}
            isEditing={isEditing}
            onSelect={onSelect}
            onToggleCollapse={onToggleCollapse}
            onRenameCommit={onRenameCommit}
            onRenameCancel={onRenameCancel}
            handleLayerAction={handleLayerAction}
          />
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuLabel>Effects</ContextMenuLabel>

        {isGroup ? (
          <>
            <EffectMenuItem
              label="Boolean"
              hasEffect={hasBoolean}
              onOpen={() => onAddBoolean(item.id)}
              onRemove={() => onRemoveBoolean(item.id)}
            />
            <ToggleEffectMenuItem
              label="Join"
              hasEffect={hasJoin}
              onAdd={() => onAddJoin(item.id)}
              onRemove={() => onRemoveJoin(item.id)}
            />
          </>
        ) : (
          <>
            <EffectMenuItem
              label="Radius"
              hasEffect={hasRadius}
              onOpen={() => onAddRadius(item.id)}
              onRemove={() => onRemoveRadius(item.id)}
            />
            <EffectMenuItem
              label="Array"
              hasEffect={hasArray}
              onOpen={() => onAddArray(item.id)}
              onRemove={() => onRemoveArray(item.id)}
            />
          </>
        )}

        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => onRenameStart(item.id)}>
          <Pencil className="mr-2 h-4 w-4" />
          Rename
        </ContextMenuItem>
        <ContextMenuSeparator />

        {isGroup ? (
          <>
            <ContextMenuItem onSelect={() => onUngroup(item.id)}>
              <FolderMinus className="mr-2 h-4 w-4" />
              Ungroup
            </ContextMenuItem>
            <ContextMenuItem
              onSelect={() => handleLayerAction("nodes", item.node, "delete")}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Group
            </ContextMenuItem>
          </>
        ) : canGroup ? (
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
