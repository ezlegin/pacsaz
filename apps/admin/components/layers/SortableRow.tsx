"use client";

import type { FlatNode } from "@/lib/utils/tree";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@repo/ui/components/context-menu";
import { FolderMinus, FolderPlus, Pencil, ShieldCheck, Trash } from "lucide-react";
import type { CSSProperties, MouseEvent } from "react";
import { HandleLayerActoin } from "../DielineEditor/DielineLayer";
import { EffectMenuItem } from "./EffectMenuItem";
import { RowContent } from "./RowContent";

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
  onOpenRules: (nodeId: string) => void;
  onClearRules: (nodeId: string) => void;
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
  onOpenRules,
  onClearRules,
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
  const isModel = item.node.type === "model";
  // Effects target exactly one node, so a multi-selection only offers
  // group / ungroup and delete.
  const isMultiSelection = selectedIds.length > 1;
  const canGroup = selectedIds.length >= 2 && isSelected;
  const nodeEffects = item.node.effects ?? [];
  const hasRadius = nodeEffects.some(
    (e) => e.type === "radius" || e.type === "radiusAt",
  );
  const hasArray = nodeEffects.some((e) => e.type === "array");
  const hasBoolean = nodeEffects.some((e) => e.type === "boolean");
  const hasJoin = nodeEffects.some((e) => e.type === "join");
  const hasRules = (item.node.rules ?? []).length > 0;

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
        {!isMultiSelection && (
          <>
            <ContextMenuLabel>Effects</ContextMenuLabel>

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

            {isGroup && (
              <>
                <ContextMenuSeparator />
                <EffectMenuItem
                  label="Boolean"
                  hasEffect={hasBoolean}
                  onOpen={() => onAddBoolean(item.id)}
                  onRemove={() => onRemoveBoolean(item.id)}
                />
                <EffectMenuItem
                  label="Join"
                  hasEffect={hasJoin}
                  onOpen={() => onAddJoin(item.id)}
                  onRemove={() => onRemoveJoin(item.id)}
                />
              </>
            )}

            <ContextMenuSeparator />
          </>
        )}

        {!isMultiSelection && (
          <>
            <ContextMenuLabel>Rules</ContextMenuLabel>

            <ContextMenuItem onSelect={() => onOpenRules(item.id)}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              {hasRules ? "Edit Rules" : "Add Rules"}
            </ContextMenuItem>

            {hasRules && (
              <ContextMenuItem onSelect={() => onClearRules(item.id)}>
                <Trash className="mr-2 h-4 w-4" />
                Clear Rules
              </ContextMenuItem>
            )}

            <ContextMenuSeparator />
          </>
        )}

        {!isMultiSelection && (
          <>
            <ContextMenuItem onSelect={() => onRenameStart(item.id)}>
              <Pencil className="mr-2 h-4 w-4" />
              Rename
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}

        {isGroup && (
          <>
            <ContextMenuItem onSelect={() => onUngroup(item.id)}>
              <FolderMinus className="mr-2 h-4 w-4" />
              Ungroup
            </ContextMenuItem>
            {!isMultiSelection && (
              <ContextMenuItem
                onSelect={() => handleLayerAction("nodes", item.node, "delete")}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Group
              </ContextMenuItem>
            )}
          </>
        )}

        {!isGroup &&
          (canGroup ? (
            <ContextMenuItem onSelect={() => onGroup(selectedIds)}>
              <FolderPlus className="mr-2 h-4 w-4" />
              Group {selectedIds.length} items
            </ContextMenuItem>
          ) : (
            <ContextMenuItem disabled>
              <FolderPlus className="mr-2 h-4 w-4" />
              Select 2+ items to group
            </ContextMenuItem>
          ))}

        {isModel && !isMultiSelection && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              onSelect={() => handleLayerAction("nodes", item.node, "delete")}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Model
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
