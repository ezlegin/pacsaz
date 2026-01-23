import { DimensionKey } from "@repo/dieline-core/data/types";
import { clamp } from "@repo/dieline-core/hooks/useSize";
import { useDimensionStore } from "@repo/store/dimension.store";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { useEffect, useState } from "react";

export function DimensionInput({
  label,
  min,
  dimKey,
  isRendering,
}: {
  label: string;
  min: number;
  dimKey: DimensionKey;
  isRendering: boolean;
}) {
  const { dimension, setDimension } = useDimensionStore();
  const value = dimension[dimKey];
  const [localValue, setLocalValue] = useState<number | null>(null);
  const [blurredInput, setBlurredInput] = useState<DimensionKey | null>(null);

  useEffect(() => {
    if (!localValue) {
      setLocalValue(value);
    }
  }, [value]);

  const handleSubmit = () => {
    setBlurredInput(dimKey);
    const clamped = clamp(localValue ?? 0, min);
    setLocalValue(clamped);
    setDimension(dimKey, clamped);
  };

  if (value === 0) return null;

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="relative">
        <Input
          disabled={isRendering && dimKey === blurredInput}
          dir="ltr"
          value={localValue ?? 0}
          onFocus={(e) => e.target.select()}
          onChange={(e) => setLocalValue(Number(e.target.value))}
          onBlur={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
        />
        <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {isRendering && dimKey === blurredInput ? (
            <Spinner className="text-primary" />
          ) : (
            "mm"
          )}
        </span>
      </div>
    </div>
  );
}
