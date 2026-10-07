"use client";

import {
  arrayMove,
  buildTree,
  expandWithDescendants,
  FlatNode,
  flattenTree,
  getProjection,
} from "@/lib/utils/tree";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  MeasuringStrategy,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAppDispatch } from "@repo/store/hooks";
import {
  groupNodes,
  setNodes,
  ungroupNode,
} from "@repo/store/slices/nodesSlice";
import {
  clearSelection,
  setSelection,
} from "@repo/store/slices/selectionSlice";
import { ISpec } from "@repo/store/types";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@repo/ui/components/context-menu";
import { cn } from "@repo/ui/lib/utils";
import {
  ChevronRight,
  Circle,
  Folder,
  FolderMinus,
  FolderPlus,
  Hexagon,
  Minus,
  Parentheses,
  Square,
  Trash,
} from "lucide-react";
import { nanoid } from "nanoid";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { HandleLayerActoin } from "../DielineLayer";
import LayerActions from "./LayerAction";

const INDENT = 16;

interface ShapeLayersProps {
  nodes: ISpec.Nodes;
  handleLayerAction: HandleLayerActoin;
}

export default function ShapeLayers({
  handleLayerAction,
  nodes,
}: ShapeLayersProps) {
  const dispatch = useAppDispatch();

  const [items, setItems] = useState<FlatNode[]>(() => flattenTree(nodes));
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const offsetLeftRef = useRef(0);

  useEffect(() => {
    setItems(flattenTree(nodes));
  }, [nodes]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  /* hide descendants of collapsed groups */
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

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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

    // Non-multi click on the only-selected node → deselect it.
    if (selectedIds.length === 1 && selectedIds[0] === nodeId) {
      setSelectedIds([]);
      dispatch(clearSelection());
      return;
    }

    setSelectedIds([nodeId]);
    const found = items.find((i) => i.id === nodeId);
    if (found) dispatch(setSelection(found.node));
  };

  const handleGroup = (ids: string[]) => {
    if (ids.length < 2) return;
    const group: ISpec.Group = {
      id: nanoid(),
      type: "group",
      key: `Group (${ids.length})`,
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

  /* ---------------- drag ---------------- */

  const dragRootsRef = useRef<string[]>([]); // explicitly-dragged ids (no auto-added children)
  const dragSetRef = useRef<Set<string>>(new Set()); // roots + all their descendants

  const handleDragStart = (e: DragStartEvent) => {
    const aId = String(e.active.id);
    setActiveId(aId);
    offsetLeftRef.current = 0;

    const original = flattenTree(nodes);
    const isMulti = selectedIds.includes(aId) && selectedIds.length > 1;
    const roots = isMulti ? selectedIds : [aId];

    const moving = new Set<string>();
    for (const id of roots) {
      moving.add(id);
      for (const d of expandWithDescendants(original, [id])) moving.add(d);
    }

    dragRootsRef.current = roots;
    dragSetRef.current = moving;
  };

  const handleDragMove = (e: DragMoveEvent) => {
    offsetLeftRef.current = e.delta.x;
  };

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;
    const aId = String(active.id);
    const oId = String(over.id);
    if (aId === oId) return;

    const moving = dragSetRef.current;
    const activeItem = items.find((i) => i.id === aId);
    if (!activeItem) return;

    // 1. "Collapsed" view: strip out descendants of active (keep active itself).
    //    This is what the user actually sees — the block behaves like one row.
    const collapsedItems = items.filter(
      (i) => !moving.has(i.id) || i.id === aId,
    );
    const cActiveIdx = collapsedItems.findIndex((i) => i.id === aId);
    const cOverIdx = collapsedItems.findIndex((i) => i.id === oId);
    if (cOverIdx === -1) return; // over is inside the moving block — ignore

    // 2. Project depth/parent from the collapsed view (same maths as before).
    const reordered = arrayMove(collapsedItems, cActiveIdx, cOverIdx);
    const previous = reordered[cOverIdx - 1];
    const next = reordered[cOverIdx + 1];

    const dragDepth = Math.round(offsetLeftRef.current / INDENT);
    const projectedDepth = activeItem.depth + dragDepth;
    const maxDepth = previous ? previous.depth + 1 : 0;
    const minDepth = next ? next.depth : 0;

    let depth = projectedDepth;
    if (depth >= maxDepth) depth = maxDepth;
    else if (depth < minDepth) depth = minDepth;

    const parentId: string | null = (() => {
      if (depth === 0 || !previous) return null;
      if (depth === previous.depth) return previous.parentId;
      if (depth > previous.depth) return previous.id;
      return (
        reordered
          .slice(0, cOverIdx)
          .reverse()
          .find((item) => item.depth === depth)?.parentId ?? null
      );
    })();

    // 3. Move the WHOLE block (group + descendants) as one contiguous chunk.
    const original = flattenTree(nodes);
    const rootSet = new Set(dragRootsRef.current);

    const findRootAncestor = (id: string): FlatNode | null => {
      let cur: FlatNode | null = original.find((i) => i.id === id) ?? null;
      while (cur) {
        if (rootSet.has(cur.id)) return cur;
        if (!cur.parentId) return cur;
        cur = original.find((i) => i.id === cur!.parentId) ?? null;
      }
      return null;
    };

    const movingItems = items.filter((i) => moving.has(i.id));
    const remaining = items.filter((i) => !moving.has(i.id));

    const aIdxFull = items.findIndex((i) => i.id === aId);
    const oIdxFull = items.findIndex((i) => i.id === oId);
    const overIdxInRemaining = remaining.findIndex((i) => i.id === oId);
    if (overIdxInRemaining === -1) return;

    // Match arrayMove semantics: dragged-down → insert after `over`; dragged-up → before.
    const insertAt =
      aIdxFull < oIdxFull ? overIdxInRemaining + 1 : overIdxInRemaining;

    const adjusted = movingItems.map((m) => {
      const root = findRootAncestor(m.id);
      if (!root) return m;

      // Each root's subtree shifts by (new depth − root's original depth).
      const delta = depth - root.depth;
      const isRoot = rootSet.has(m.id);

      return {
        ...m,
        depth: m.depth + delta,
        ...(isRoot ? { parentId } : {}),
      };
    });

    setItems([
      ...remaining.slice(0, insertAt),
      ...adjusted,
      ...remaining.slice(insertAt),
    ]);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { over } = e;
    setActiveId(null);
    offsetLeftRef.current = 0;
    dragRootsRef.current = [];
    dragSetRef.current = new Set();

    if (!over) {
      setItems(flattenTree(nodes));
      return;
    }

    // items already reflects the final, block-aware layout — just commit it.
    dispatch(setNodes(buildTree(items)));
  };

  const activeItem = useMemo(
    () => items.find((i) => i.id === activeId),
    [items, activeId],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveId(null);
        offsetLeftRef.current = 0;
        dragRootsRef.current = [];
        dragSetRef.current = new Set();
        setItems(flattenTree(nodes));
      }}
    >
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
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onToggleCollapse={toggleCollapse}
              onGroup={handleGroup}
              onUngroup={handleUngroup}
              handleLayerAction={handleLayerAction}
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
    </DndContext>
  );
}

/* ---------------- sortable row ---------------- */

function SortableRow({
  item,
  isActive,
  isSelected,
  isCollapsed,
  selectedIds,
  onSelect,
  onToggleCollapse,
  onGroup,
  onUngroup,
  handleLayerAction,
}: {
  item: FlatNode;
  isActive: boolean;
  isSelected: boolean;
  isCollapsed: boolean;
  selectedIds: string[];
  onSelect: (id: string, e: MouseEvent) => void;
  onToggleCollapse: (id: string) => void;
  onGroup: (ids: string[]) => void;
  onUngroup: (id: string) => void;
  handleLayerAction: HandleLayerActoin;
}) {
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

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
          <RowContent
            item={item}
            isSelected={isSelected}
            isCollapsed={isCollapsed}
            isActive={isActive}
            onSelect={onSelect}
            onToggleCollapse={onToggleCollapse}
            handleLayerAction={handleLayerAction}
          />
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent>
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

/* ---------------- row content ---------------- */

function RowContent({
  item,
  isSelected,
  isCollapsed,
  isActive,
  onSelect,
  onToggleCollapse,
  handleLayerAction,
}: {
  item: FlatNode;
  isSelected: boolean;
  isCollapsed: boolean;
  isActive?: boolean;
  onSelect?: (id: string, e: MouseEvent) => void;
  onToggleCollapse?: (id: string) => void;
  handleLayerAction?: HandleLayerActoin;
}) {
  const node = item.node;
  const isGroup = node.type === "group";

  return (
    <div
      className={cn(
        "group flex h-8 cursor-pointer select-none items-center justify-between gap-2 rounded-md px-2 ",
        isSelected && "border bg-gray-200/50",
      )}
      style={{ paddingLeft: `${8 + item.depth * INDENT}px` }}
      onClick={(e) => onSelect?.(node.id, e)}
    >
      <div className="flex min-w-0 items-center gap-1">
        {isGroup ? (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse?.(node.id);
            }}
            className="flex h-4 w-4 items-center justify-center"
          >
            <ChevronRight
              className={cn(
                "h-3 w-3 transition-transform",
                !isCollapsed && "rotate-90",
              )}
            />
          </button>
        ) : (
          <span className="h-4 w-4" />
        )}

        <span
          className={cn(
            "truncate flex items-center text-xs font-medium",
            !isGroup &&
              (node.layer === "trim"
                ? "text-blue-500"
                : node.layer === "fold"
                  ? "text-red-500"
                  : "text-fuchsia-500"),
          )}
        >
          {isGroup ? (
            <Folder className="scale-[0.6] shrink-0" />
          ) : (
            <LayerIcon data={node.type} />
          )}
          {node.key}
        </span>
      </div>

      {!isActive && handleLayerAction && (
        <div onPointerDown={(e) => e.stopPropagation()}>
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
      )}
    </div>
  );
}

/* ---------------- icons ---------------- */

function LayerIcon({ data }: { data: ISpec.ShapesKey }) {
  const cls = "scale-[0.6]";
  switch (data) {
    case "line":
      return <Minus className={cls} />;
    case "circle":
      return <Circle className={cls} />;
    case "rectangle":
      return <Square className={cls} />;
    case "lines":
      return <ChevronRight className={cls} />;
    case "polygon":
      return <Hexagon className={cls} />;
    case "arc":
      return <Parentheses className={cls} />;
  }
}
