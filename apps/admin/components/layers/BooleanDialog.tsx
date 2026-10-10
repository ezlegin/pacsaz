"use client";

import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Label } from "@repo/ui/components/label";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { useEffect, useState } from "react";

export type BooleanMode = "union" | "subtract" | "intersect";

interface Props {
  open: boolean;
  mode: "add" | "edit";
  initialMode: BooleanMode;
  onOpenChange: (open: boolean) => void;
  onSubmit: (mode: BooleanMode) => void;
}

export function BooleanDialog({
  open,
  mode,
  initialMode,
  onOpenChange,
  onSubmit,
}: Props) {
  const [boolMode, setBoolMode] = useState<BooleanMode>(initialMode);

  useEffect(() => {
    if (open) setBoolMode(initialMode);
  }, [open, initialMode]);

  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Boolean Effect" : "Add Boolean Effect"}
          </DialogTitle>
          <DialogDescription>
            Combine all children of this group with a boolean operation, in
            order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label>Operation</Label>
          <ToggleGroup
            type="single"
            value={boolMode}
            onValueChange={(v) => v && setBoolMode(v as BooleanMode)}
            className="w-full"
          >
            <ToggleGroupItem value="union" className="flex-1">
              Union
            </ToggleGroupItem>
            <ToggleGroupItem value="subtract" className="flex-1">
              Subtract
            </ToggleGroupItem>
            <ToggleGroupItem value="intersect" className="flex-1">
              Intersect
            </ToggleGroupItem>
          </ToggleGroup>
          <p className="text-xs text-muted-foreground">
            Subtract removes each subsequent child from the first. Intersect
            keeps only overlapping regions.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit(boolMode)}>
            {isEdit ? "Save" : "Add Effect"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
