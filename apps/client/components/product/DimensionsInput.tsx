import { resolveDimension } from "@repo/dieline-core/utils/dimensionResolver";
import { resolveOffsets } from "@repo/dieline-core/utils/offsetResolver";
import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import { setSetting } from "@repo/store/slices/dielineSettingsSlice";
import { DimensionKey } from "@repo/store/types";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { useEffect, useState } from "react";
import { clamp } from "@repo/lib/utils/clamp";

/**
 * Marks which size the visitor is pointing at or typing in, on the page root,
 * so every drawing on the page lights up the rulers that size changes
 * (`data-ruler-dim`, styled in globals.css). An attribute rather than React
 * state: the preview is server-built SVG markup, and CSS reaches into it freely.
 */
function markDimension(dimKey: DimensionKey | null) {
  const root = document.documentElement;
  if (dimKey) root.dataset.dimFocus = dimKey;
  else delete root.dataset.dimFocus;
}

export function DimensionInput({
  label,
  min,
  max,
  dimKey,
  isRendering,
}: {
  label: string;
  min: number;
  max?: number;
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
    const clamped = clamp(localValue ?? 0, min, max);
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
    <div
      className="space-y-1"
      onMouseEnter={() => markDimension(dimKey)}
      // Leaving keeps the mark while the field is still being typed in.
      onMouseLeave={(e) => markDimension(e.currentTarget.contains(document.activeElement) ? dimKey : null)}
      onFocus={() => markDimension(dimKey)}
      onBlur={() => markDimension(null)}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="relative">
        <Input
          disabled={isRendering && dimKey === blurredInput}
          dir="ltr"
          // Room for the "mm" suffix, so a narrow field never puts it over the number.
          className="pe-8"
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
