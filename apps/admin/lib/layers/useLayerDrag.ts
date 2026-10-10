"use client";

import {
  arrayMove,
  buildTree,
  expandWithDescendants,
  FlatNode,
  flattenTree,
} from "@/lib/utils/tree";
import {
  closestCenter,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
  MeasuringStrategy,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useAppDispatch } from "@repo/store/hooks";
import { setNodes } from "@repo/store/slices/nodesSlice";
import { ISpec } from "@repo/store/types";
import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import { INDENT } from "./constants";

interface Args {
  nodes: ISpec.Nodes;
  items: FlatNode[];
  setItems: Dispatch<SetStateAction<FlatNode[]>>;
  selectedIds: string[];
}

export function useLayerDrag({ nodes, items, setItems, selectedIds }: Args) {
  const dispatch = useAppDispatch();
  const [activeId, setActiveId] = useState<string | null>(null);

  const offsetLeftRef = useRef(0);
  const dragRootsRef = useRef<string[]>([]);
  const dragSetRef = useRef<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

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

    const collapsedItems = items.filter(
      (i) => !moving.has(i.id) || i.id === aId,
    );
    const cActiveIdx = collapsedItems.findIndex((i) => i.id === aId);
    const cOverIdx = collapsedItems.findIndex((i) => i.id === oId);
    if (cOverIdx === -1) return;

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

    const insertAt =
      aIdxFull < oIdxFull ? overIdxInRemaining + 1 : overIdxInRemaining;

    const adjusted = movingItems.map((m) => {
      const root = findRootAncestor(m.id);
      if (!root) return m;
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
    dispatch(setNodes(buildTree(items)));
  };

  const handleDragCancel = () => {
    setActiveId(null);
    offsetLeftRef.current = 0;
    dragRootsRef.current = [];
    dragSetRef.current = new Set();
    setItems(flattenTree(nodes));
  };

  return {
    activeId,
    dndProps: {
      sensors,
      collisionDetection: closestCenter,
      measuring: { droppable: { strategy: MeasuringStrategy.Always } },
      onDragStart: handleDragStart,
      onDragMove: handleDragMove,
      onDragOver: handleDragOver,
      onDragEnd: handleDragEnd,
      onDragCancel: handleDragCancel,
    },
  } as const;
}
