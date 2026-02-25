import { resolveDimension } from "@repo/dieline-core/utils/dimensionResolver";
import { resolveOffsets } from "@repo/dieline-core/utils/offsetResolver";
import { DimensionKey, Dimensions } from "@repo/store/data/types";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { useEffect, useState } from "react";
import { SetSetting } from "./Settings";

export function DimensionInput({
  label,
  min,
  dimKey,
  isRendering,
  setSetting,
  dimension,
}: {
  label: string;
  min: number;
  dimKey: DimensionKey;
  isRendering: boolean;
  dimension: Dimensions;
  setSetting: SetSetting;
}) {
  const value = dimension.raw[dimKey];

  const [localValue, setLocalValue] = useState<number | null>(null);
  const [blurredInput, setBlurredInput] = useState<DimensionKey | null>(null);

  useEffect(() => {
    if (!localValue) {
      setLocalValue(value);
    }
  }, [value]);

  const offsets = resolveOffsets();

  function clamp(value: number, min: number) {
    if (value < min) return min;
    return value;
  }

  const handleSubmit = () => {
    setBlurredInput(dimKey);
    const clamped = clamp(localValue ?? 0, min);
    setLocalValue(clamped);

    setSetting("dimension", {
      raw: {
        ...dimension.raw,
        [dimKey]: clamped,
      },
      resolved: {
        ...dimension.resolved,
        [dimKey]: resolveDimension(clamped, offsets[dimKey]),
      },
    });
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
