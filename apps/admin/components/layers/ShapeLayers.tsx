"use client";

import { useEffectDialogs } from "@/lib/layers/useEffectDialogs";
import { useLayerDrag } from "@/lib/layers/useLayerDrag";
import { FlatNode, flattenTree } from "@/lib/utils/tree";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useAppDispatch } from "@repo/store/hooks";
import {
  groupNodes,
  ungroupNode,
  updateNode,
} from "@repo/store/slices/nodesSlice";
import {
  clearSelection,
  setSelection,
} from "@repo/store/slices/selectionSlice";
import { ISpec } from "@repo/store/types";
import { nanoid } from "nanoid";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { HandleLayerActoin } from "../DielineEditor/DielineLayer";
import { ArrayDialog } from "./ArrayDialog";
import { RadiusDialog } from "./RadiusDialog";
import { RowContent } from "./RowContent";
import { SortableRow } from "./SortableRow";

interface Props {
  nodes: ISpec.Nodes;
  handleLayerAction: HandleLayerActoin;
}

export default function ShapeLayers({ handleLayerAction, nodes }: Props) {
  const dispatch = useAppDispatch();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [items, setItems] = useState<FlatNode[]>(() => flattenTree(nodes));
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const effects = useEffectDialogs(nodes);
  const { activeId, dndProps } = useLayerDrag({
    nodes,
    items,
    setItems,
    selectedIds,
  });

  useEffect(() => {
    setItems(flattenTree(nodes));
  }, [nodes]);

  /* ---- visible tree (collapsed groups hide descendants) ---- */
  const visibleItems = useMemo(() => {
    const out: FlatNode[] = [];
    let hideDepth: number | null = null;
    for (const item of items) {
      if (hideDepth !== null) {
        if (item.depth > hideDepth) continue;
        hideDepth = null;
      }
      out.push(item);
      if (item.node.type === "group" && collapsed.has(item.id)) {
        hideDepth = item.depth;
      }
    }
    return out;
  }, [items, collapsed]);

  const visibleIds = useMemo(
    () => visibleItems.map((i) => i.id),
    [visibleItems],
  );

  const activeItem = useMemo(
    () => items.find((i) => i.id === activeId),
    [items, activeId],
  );

  /* ---- collapse ---- */
  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /* ---- selection ---- */
  const handleSelect = (nodeId: string, e: MouseEvent) => {
    if (!nodeId) {
      setSelectedIds([]);
      dispatch(clearSelection());
      return;
    }
    const isMulti = e.metaKey || e.ctrlKey || e.shiftKey;

    if (isMulti) {
      setSelectedIds((prev) =>
        prev.includes(nodeId)
          ? prev.filter((id) => id !== nodeId)
          : [...prev, nodeId],
      );
      return;
    }

    if (selectedIds.length === 1 && selectedIds[0] === nodeId) {
      setSelectedIds([]);
      dispatch(clearSelection());
      return;
    }

    setSelectedIds([nodeId]);
    const found = items.find((i) => i.id === nodeId);
    if (found) dispatch(setSelection(found.node));
  };

  /* ---- group / ungroup ---- */
  const handleGroup = (ids: string[]) => {
    if (ids.length < 2) return;
    const group: ISpec.Group = {
      id: nanoid(),
      type: "group",
      key: `Group (${ids.length})`,
      hidden: false,
      origin: ["0", "0"],
      nodes: [],
      effects: [],
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

  /* ---- rename ---- */
  const handleRenameStart = (id: string) => setEditingId(id);

  const handleRenameCommit = (id: string, nextKey: string) => {
    const trimmed = nextKey.trim();
    const current = items.find((i) => i.id === id)?.node;

    if (trimmed && current && trimmed !== current.key) {
      dispatch(
        updateNode({ id, changes: { key: trimmed } as Partial<ISpec.Node> }),
      );
    }
    setEditingId(null);
  };

  const handleRenameCancel = () => setEditingId(null);

  return (
    <DndContext {...dndProps}>
      <SortableContext
        items={visibleIds}
        strategy={verticalListSortingStrategy}
      >
        <div className="w-full">
          {visibleItems.map((item) => (
            <SortableRow
              key={item.id}
              item={item}
              isActive={item.id === activeId}
              isSelected={selectedIds.includes(item.id)}
              isCollapsed={collapsed.has(item.id)}
              isEditing={editingId === item.id}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onToggleCollapse={toggleCollapse}
              onGroup={handleGroup}
              onUngroup={handleUngroup}
              onRenameStart={handleRenameStart}
              onRenameCommit={handleRenameCommit}
              onRenameCancel={handleRenameCancel}
              handleLayerAction={handleLayerAction}
              onAddRadius={effects.openRadius}
              onRemoveRadius={effects.removeRadius}
              onAddArray={effects.openArray}
              onRemoveArray={effects.removeArray}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={null}>
        {activeItem ? (
          <div className="pointer-events-none opacity-90">
            <RowContent
              item={activeItem}
              isSelected
              isCollapsed={collapsed.has(activeItem.id)}
            />
          </div>
        ) : null}
      </DragOverlay>

      <RadiusDialog
        open={effects.radiusDialog !== null}
        mode={effects.radiusDialog?.effectIndex === null ? "add" : "edit"}
        initialType={effects.radiusDialog?.initialType ?? "radius"}
        initialTargets={effects.radiusDialog?.initialTargets ?? []}
        initialValue={effects.radiusDialog?.initialValue ?? "5"}
        onOpenChange={(open) => !open && effects.closeRadius()}
        onSubmit={effects.submitRadius}
      />

      <ArrayDialog
        open={effects.arrayDialog !== null}
        mode={effects.arrayDialog?.effectIndex === null ? "add" : "edit"}
        initialMoveX={effects.arrayDialog?.initialMoveX ?? "0"}
        initialMoveY={effects.arrayDialog?.initialMoveY ?? "10"}
        initialRepeat={effects.arrayDialog?.initialRepeat ?? "3"}
        onOpenChange={(open) => !open && effects.closeArray()}
        onSubmit={effects.submitArray}
      />
    </DndContext>
  );
}
