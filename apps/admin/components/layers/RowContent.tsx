"use client";

import { cn } from "@repo/ui/lib/utils";
import { ChevronRight, Folder } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { FlatNode } from "@/lib/utils/tree";
import { LayerIcon } from "./LayerIcon";
import { HandleLayerActoin } from "../DielineEditor/DielineLayer";
import LayerActions from "../DielineEditor/layers/LayerAction";
import { INDENT } from "@/lib/layers/constants";

interface Props {
  item: FlatNode;
  isSelected: boolean;
  isCollapsed: boolean;
  isActive?: boolean;
  isEditing?: boolean;
  onSelect?: (id: string, e: MouseEvent) => void;
  onToggleCollapse?: (id: string) => void;
  onRenameCommit?: (id: string, key: string) => void;
  onRenameCancel?: () => void;
  handleLayerAction?: HandleLayerActoin;
}

export function RowContent({
  item,
  isSelected,
  isCollapsed,
  isActive,
  isEditing,
  onSelect,
  onToggleCollapse,
  onRenameCommit,
  onRenameCancel,
  handleLayerAction,
}: Props) {
  const node = item.node;
  const isGroup = node.type === "group";
  const [draft, setDraft] = useState(node.key);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) setDraft(node.key);
  }, [isEditing, node.key]);

  return (
    <div
      className={cn(
        "group flex h-8 cursor-pointer select-none items-center justify-between gap-2 rounded-md px-2",
        isSelected && "border bg-gray-200/50",
      )}
      style={{ paddingLeft: `${8 + item.depth * INDENT}px` }}
      onClick={(e) => {
        if (isEditing) return;
        onSelect?.(node.id, e);
      }}
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
            "flex items-center text-xs font-medium",
            !isEditing && "truncate",
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

          {isEditing ? (
            <input
              ref={inputRef}
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onFocus={(e) => e.currentTarget.select()}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onRenameCommit?.(node.id, draft);
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  onRenameCancel?.();
                }
              }}
              onBlur={() => onRenameCommit?.(node.id, draft)}
              className="ml-1 h-5 w-full min-w-0 rounded border border-input bg-background px-1 text-xs outline-none focus:ring-1 focus:ring-ring"
            />
          ) : (
            <span className="ml-1">{node.key}</span>
          )}
        </span>
      </div>

      {!isActive && !isEditing && (
        <div
          className="flex items-center gap-1"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {node.type !== "group" && node.effects && node.effects.length > 0 && (
            <span
              title={`${node.effects.length} effect${node.effects.length > 1 ? "s" : ""}`}
              className="shrink-0 rounded bg-amber-100 px-1 py-px text-[10px] font-semibold leading-none text-amber-700 group-hover:hidden"
            >
              FX
            </span>
          )}

          {handleLayerAction && (
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
          )}
        </div>
      )}
    </div>
  );
}
