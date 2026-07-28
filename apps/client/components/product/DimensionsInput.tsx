import { clamp } from "@/utils/clamp";
import { resolveDimension } from "@repo/dieline-core/utils/dimensionResolver";
import { resolveOffsets } from "@repo/dieline-core/utils/offsetResolver";
import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import { setSetting } from "@repo/store/slices/dielineSettingsSlice";
import { DimensionKey } from "@repo/store/types";
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
  const settings = useAppSelector((s) => s.dielineSettings);
  const dispatch = useAppDispatch();
  const value = settings.dimension.raw[dimKey];
  const [localValue, setLocalValue] = useState<number | null>(null);
  const [blurredInput, setBlurredInput] = useState<DimensionKey | null>(null);

  useEffect(() => {
    if (!localValue) {
      setLocalValue(value);
    }
  }, [value]);

  const offsets = resolveOffsets();

  const handleSubmit = () => {
    setBlurredInput(dimKey);
    const clamped = clamp(localValue ?? 0, min);
    setLocalValue(clamped);

    dispatch(
      setSetting({
        key: "dimension",
        value: {
          raw: {
            ...settings.dimension.raw,
            [dimKey]: clamped,
          },
          resolved: {
            ...settings.dimension.resolved,
            [dimKey]: resolveDimension(clamped, offsets[dimKey]),
          },
        },
      }),
    );
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
