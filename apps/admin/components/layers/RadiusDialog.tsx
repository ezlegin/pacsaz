"use client";

import { CornerRadius, RadiusKind } from "@/lib/layers/constants";
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
import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";

export interface RadiusSubmit {
  type: RadiusKind;
  targets: string[];
  value: string;
  radii: CornerRadius[];
}

interface Props {
  open: boolean;
  mode: "add" | "edit";
  initialType: RadiusKind;
  initialTargets: string[];
  initialValue: string;
  initialRadii: CornerRadius[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: RadiusSubmit) => void;
}

const TYPES: { value: RadiusKind; label: string; hint: string }[] = [
  { value: "radius", label: "Radius", hint: "One radius for every corner." },
  {
    value: "radiusAt",
    label: "Radius At",
    hint: "One radius, applied only to the listed corner indices.",
  },
  {
    value: "customRadiusAt",
    label: "Custom",
    hint: "Give each corner its own radius.",
  },
  {
    value: "fullRadius",
    label: "Full",
    hint: "Round every corner as far as it will go — a small rectangle becomes a capsule.",
  },
];

export function RadiusDialog({
  open,
  mode,
  initialType,
  initialTargets,
  initialValue,
  initialRadii,
  onOpenChange,
  onSubmit,
}: Props) {
  const [effectType, setEffectType] = useState<RadiusKind>(initialType);
  const [targetsInput, setTargetsInput] = useState("");
  const [valueInput, setValueInput] = useState("5");
  const [radii, setRadii] = useState<CornerRadius[]>([]);

  useEffect(() => {
    if (!open) return;
    setEffectType(initialType);
    setTargetsInput(initialTargets.join(", "));
    setValueInput(initialValue);
    setRadii(
      initialRadii.length > 0
        ? initialRadii
        : [{ index: "0", radius: "5" }],
    );
  }, [open, initialType, initialTargets, initialValue, initialRadii]);

  const parsedTargets = targetsInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const usableRadii = radii.filter(
    (entry) => entry.index.trim() !== "" && entry.radius.trim() !== "",
  );

  const canSubmit =
    effectType === "fullRadius"
      ? true
      : effectType === "customRadiusAt"
        ? usableRadii.length > 0
        : valueInput.trim().length > 0 &&
          (effectType === "radius" || parsedTargets.length > 0);

  const submit = () => {
    if (!canSubmit) return;
    onSubmit({
      type: effectType,
      targets: parsedTargets,
      value: valueInput.trim(),
      radii: usableRadii.map((entry) => ({
        index: entry.index.trim(),
        radius: entry.radius.trim(),
      })),
    });
  };

  const updateRadius = (index: number, changes: Partial<CornerRadius>) => {
    setRadii((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, ...changes } : entry)),
    );
  };

  const isEdit = mode === "edit";
  const hint = TYPES.find((t) => t.value === effectType)?.hint;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Radius Effect" : "Add Radius Effect"}
          </DialogTitle>
          <DialogDescription>
            Round every corner, only specific ones, or each by a different amount.
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
              {TYPES.map((type) => (
                <ToggleGroupItem
                  key={type.value}
                  value={type.value}
                  className="flex-1 px-2 text-xs"
                >
                  {type.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            {hint && (
              <p className="text-xs text-muted-foreground">{hint}</p>
            )}
          </div>

          {effectType === "radiusAt" && (
            <div className="space-y-2">
              <Label htmlFor="radius-targets">Corner Indices</Label>
              <Input
                id="radius-targets"
                placeholder="0, 1, 2"
                value={targetsInput}
                onChange={(e) => setTargetsInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Order does not matter.
              </p>
            </div>
          )}

          {effectType === "customRadiusAt" && (
            <div className="space-y-2">
              <Label>Per-corner Radius</Label>

              {radii.map((entry, index) => (
                <div key={index} className="flex items-end gap-2">
                  <div className="w-20 space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Index
                    </Label>
                    <Input
                      value={entry.index}
                      placeholder="0"
                      className="h-9"
                      onChange={(e) =>
                        updateRadius(index, { index: e.target.value })
                      }
                      autoFocus={index === 0}
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Radius
                    </Label>
                    <Input
                      value={entry.radius}
                      placeholder="5"
                      className="h-9"
                      onChange={(e) =>
                        updateRadius(index, { radius: e.target.value })
                      }
                      onKeyDown={(e) => e.key === "Enter" && submit()}
                    />
                  </div>

                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      setRadii((prev) => prev.filter((_, i) => i !== index))
                    }
                    title="Remove corner"
                  >
                    <Minus />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setRadii((prev) => [...prev, { index: "", radius: "5" }])
                }
              >
                <Plus />
                Add Corner
              </Button>
            </div>
          )}

          {(effectType === "radius" || effectType === "radiusAt") && (
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
          )}

          {effectType === "fullRadius" && (
            <p className="rounded-md border border-dashed px-3 py-3 text-xs text-muted-foreground">
              No amount needed — each corner is rounded by the largest radius it
              can take without running into its neighbours.
            </p>
          )}
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
