"use client";

import { Button } from "@repo/ui/components/button";
import { ContextMenuItem } from "@repo/ui/components/context-menu";
import { Check, Pencil, Plus, Trash } from "lucide-react";

export function EffectMenuItem({
  label,
  hasEffect,
  onOpen,
  onRemove,
}: {
  label: string;
  hasEffect: boolean;
  onOpen: () => void;
  onRemove: () => void;
}) {
  return (
    <ContextMenuItem
      onSelect={() => setTimeout(onOpen, 0)}
      className="flex items-center justify-between gap-3"
    >
      <span className="flex items-center">
        {hasEffect ? (
          <>
            <Pencil className="mr-2 h-4 w-4" />
            Edit {label}
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Add {label}
          </>
        )}
      </span>

      {hasEffect && (
        <Button
          variant="ghost"
          type="button"
          aria-label={`Remove ${label.toLowerCase()} effect`}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRemove();
          }}
          className="cursor-pointer text-muted-foreground hover:text-destructive z-10"
        >
          <Trash className="h-3.5 w-3.5" />
        </Button>
      )}
    </ContextMenuItem>
  );
}

export function ToggleEffectMenuItem({
  label,
  hasEffect,
  onAdd,
  onRemove,
}: {
  label: string;
  hasEffect: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <ContextMenuItem
      onSelect={() => {
        // Clicking the label toggles. Trash button is separate and stops
        // propagation so it never reaches here.
        setTimeout(() => {
          if (hasEffect) onRemove();
          else onAdd();
        }, 0);
      }}
      className="flex items-center justify-between gap-3"
    >
      <span className="flex items-center">
        {hasEffect ? (
          <>
            <Check className="mr-2 h-4 w-4 text-emerald-600" />
            {label} Enabled
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Add {label}
          </>
        )}
      </span>

      {hasEffect && (
        <Button
          variant="ghost"
          type="button"
          aria-label={`Remove ${label.toLowerCase()} effect`}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRemove();
          }}
          className="cursor-pointer text-muted-foreground hover:text-destructive z-10"
        >
          <Trash className="h-3.5 w-3.5" />
        </Button>
      )}
    </ContextMenuItem>
  );
}
