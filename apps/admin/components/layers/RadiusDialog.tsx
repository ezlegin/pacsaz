"use client";

import { RadiusKind } from "@/lib/layers/constants";
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
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  mode: "add" | "edit";
  initialType: RadiusKind;
  initialTargets: string[];
  initialValue: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (type: RadiusKind, targets: string[], value: string) => void;
}

export function RadiusDialog({
  open,
  mode,
  initialType,
  initialTargets,
  initialValue,
  onOpenChange,
  onSubmit,
}: Props) {
  const [effectType, setEffectType] = useState<RadiusKind>(initialType);
  const [targetsInput, setTargetsInput] = useState("");
  const [valueInput, setValueInput] = useState("5");

  useEffect(() => {
    if (!open) return;
    setEffectType(initialType);
    setTargetsInput(initialTargets.join(", "));
    setValueInput(initialValue);
  }, [open, initialType, initialTargets, initialValue]);

  const parsedTargets = targetsInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const canSubmit =
    valueInput.trim().length > 0 &&
    (effectType === "radius" || parsedTargets.length > 0);

  const submit = () => {
    if (!canSubmit) return;
    onSubmit(effectType, parsedTargets, valueInput.trim());
  };

  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Radius Effect" : "Add Radius Effect"}
          </DialogTitle>
          <DialogDescription>
            Round every corner, or only specific ones.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Type</Label>
            <ToggleGroup
              type="single"
              value={effectType}
              onValueChange={(v) => v && setEffectType(v as RadiusKind)}
              className="w-full"
            >
              <ToggleGroupItem value="radius" className="flex-1">
                Radius
              </ToggleGroupItem>
              <ToggleGroupItem value="radiusAt" className="flex-1">
                Radius At
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {effectType === "radiusAt" && (
            <div className="space-y-2">
              <Label htmlFor="radius-targets">Targets</Label>
              <Input
                id="radius-targets"
                placeholder="0, 1, 2"
                value={targetsInput}
                onChange={(e) => setTargetsInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Corner indices to fillet. Order does not matter.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="radius-value">Radius</Label>
            <Input
              id="radius-value"
              placeholder="5"
              value={valueInput}
              onChange={(e) => setValueInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
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
