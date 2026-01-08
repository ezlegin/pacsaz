import { useState } from "react";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { DimensionKey } from "@repo/dieline-core/types";
import { clamp } from "@repo/dieline-core/hooks/useSize";

export function DimensionInput({
  label,
  value,
  min,
  onChange,
  dimKey,
  isRendering,
}: {
  label: string;
  value: number;
  min: number;
  dimKey: DimensionKey;
  onChange: (value: number) => void;
  isRendering: boolean;
}) {
  const [localValue, setLocalValue] = useState(value);
  const [blurredInput, setBlurredInput] = useState<DimensionKey | null>(null);

  if (value === 0) return null;

  const handleSubmit = () => {
    setBlurredInput(dimKey);
    const clamped = clamp(localValue, min);
    setLocalValue(clamped);
    onChange(clamped);
  };

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="relative">
        <Input
          disabled={isRendering && dimKey === blurredInput}
          dir="ltr"
          value={localValue}
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
