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
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  mode: "add" | "edit";
  initialMoveX: string;
  initialMoveY: string;
  initialRepeat: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (moveX: string, moveY: string, repeat: string) => void;
}

export function ArrayDialog({
  open,
  mode,
  initialMoveX,
  initialMoveY,
  initialRepeat,
  onOpenChange,
  onSubmit,
}: Props) {
  const [moveX, setMoveX] = useState("0");
  const [moveY, setMoveY] = useState("10");
  const [repeat, setRepeat] = useState("3");

  useEffect(() => {
    if (!open) return;
    setMoveX(initialMoveX);
    setMoveY(initialMoveY);
    setRepeat(initialRepeat);
  }, [open, initialMoveX, initialMoveY, initialRepeat]);

  const canSubmit =
    moveX.trim().length > 0 &&
    moveY.trim().length > 0 &&
    repeat.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    onSubmit(moveX.trim(), moveY.trim(), repeat.trim());
  };

  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Array Effect" : "Add Array Effect"}
          </DialogTitle>
          <DialogDescription>
            Duplicate this shape in a row. Values may be math expressions (e.g.{" "}
            <code>width + 2</code>).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="array-move-x">Move X</Label>
              <Input
                id="array-move-x"
                placeholder="0"
                value={moveX}
                onChange={(e) => setMoveX(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="array-move-y">Move Y</Label>
              <Input
                id="array-move-y"
                placeholder="10"
                value={moveY}
                onChange={(e) => setMoveY(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="array-repeat">Repeat</Label>
            <Input
              id="array-repeat"
              placeholder="3"
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            <p className="text-xs text-muted-foreground">
              Total number of copies, including the original.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            {isEdit ? "Save" : "Add Effect"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
