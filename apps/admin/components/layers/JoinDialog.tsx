"use client";

import { ISpec } from "@repo/store/types";
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

type Endpoint = "start" | "end";
type Connect = "nearest" | "custom";

function parseJoinMode(mode: ISpec.JoinMode): {
  connect: Connect;
  a: Endpoint;
  b: Endpoint;
} {
  if (mode === "nearest") {
    return { connect: "nearest", a: "start", b: "start" };
  }
  // "a-start-b-end" → ["a","start","b","end"]
  const parts = mode.split("-");
  return {
    connect: "custom",
    a: parts[1] as Endpoint,
    b: parts[3] as Endpoint,
  };
}

function buildJoinMode(
  connect: Connect,
  a: Endpoint,
  b: Endpoint,
): ISpec.JoinMode {
  if (connect === "nearest") return "nearest";
  return `a-${a}-b-${b}` as ISpec.JoinMode;
}

interface Props {
  open: boolean;
  mode: "add" | "edit";
  shapeA: string;
  shapeB: string;
  initialJoinMode: ISpec.JoinMode;
  onOpenChange: (open: boolean) => void;
  onSubmit: (mode: ISpec.JoinMode) => void;
}

export function JoinDialog({
  open,
  mode,
  shapeA,
  shapeB,
  initialJoinMode,
  onOpenChange,
  onSubmit,
}: Props) {
  const [connect, setConnect] = useState<Connect>("nearest");
  const [aPoint, setAPoint] = useState<Endpoint>("start");
  const [bPoint, setBPoint] = useState<Endpoint>("start");

  useEffect(() => {
    if (!open) return;
    const parsed = parseJoinMode(initialJoinMode);
    setConnect(parsed.connect);
    setAPoint(parsed.a);
    setBPoint(parsed.b);
  }, [open, initialJoinMode]);

  const submit = () => {
    onSubmit(buildJoinMode(connect, aPoint, bPoint));
  };

  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Join Effect" : "Add Join Effect"}
          </DialogTitle>
          <DialogDescription>
            Connect the endpoints of the two shapes in this group.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* ---- Connection mode ---- */}
          <div className="space-y-2">
            <Label>Connection</Label>
            <ToggleGroup
              type="single"
              value={connect}
              onValueChange={(v) => v && setConnect(v as Connect)}
              className="w-full"
            >
              <ToggleGroupItem value="nearest" className="flex-1">
                Nearest Points
              </ToggleGroupItem>
              <ToggleGroupItem value="custom" className="flex-1">
                Custom Points
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* ---- Per-shape endpoint pickers ---- */}
          {connect === "custom" && (
            <div className="space-y-3 rounded-md border p-3">
              <ShapeEndpointRow
                name={shapeA}
                value={aPoint}
                onChange={setAPoint}
              />
              <ShapeEndpointRow
                name={shapeB}
                value={bPoint}
                onChange={setBPoint}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>{isEdit ? "Save" : "Add Effect"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ShapeEndpointRow({
  name,
  value,
  onChange,
}: {
  name: string;
  value: Endpoint;
  onChange: (v: Endpoint) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="truncate text-sm font-medium" title={name}>
        {name}
      </span>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => v && onChange(v as Endpoint)}
        size="sm"
      >
        <ToggleGroupItem value="start">Start</ToggleGroupItem>
        <ToggleGroupItem value="end">End</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
