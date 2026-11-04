"use client";

import type { BoxSize } from "@/lib/dieline/homeBox";
import { cn } from "@repo/ui/lib/utils";
import { fa } from "./format";
import { useHomeBox } from "./HomeBoxProvider";

const FIELDS: { key: keyof BoxSize; label: string }[] = [
  { key: "width", label: "عرض" },
  { key: "length", label: "طول" },
  { key: "height", label: "ارتفاع" },
];

/** The box's controls. Native inputs: keyboard and touch work as they are. */
const BoxDock = () => {
  const { size, range, materials, material, drawing, setDimension, setMaterial, warmUp } = useHomeBox();

  return (
    <form aria-label="ابعاد جعبه" onSubmit={(event) => event.preventDefault()} onPointerEnter={warmUp} onFocus={warmUp} className="glass p-4 md:p-5">
      <div className="grid gap-x-5 gap-y-1 grid-cols-3">
        {FIELDS.map(({ key, label }) => (
          <label key={key} className="block min-w-0 text-xs text-muted-foreground">
            <span className="flex items-baseline justify-between gap-1">
              {label}
              <output dir="ltr" className="text-sm font-bold text-[var(--ink)] tabular-nums">
                {fa(size[key])}
              </output>
            </span>
            <input
              dir="ltr"
              type="range"
              min={range[key].min}
              max={range[key].max}
              step={1}
              value={size[key]}
              onChange={(event) => setDimension(key, Number(event.target.value))}
              className="size-range"
              style={{ "--fill": `${((size[key] - range[key].min) / (range[key].max - range[key].min)) * 100}%` } as React.CSSProperties}
            />
          </label>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <fieldset className="flex gap-1 rounded-xl bg-violet-100/60 p-1">
          <legend className="sr-only">جنس مقوا</legend>
          {materials.map((option) => (
            <label
              key={option.value}
              className={cn(
                "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors has-focus-visible:outline-2",
                option.value === material.value ? "bg-white text-violet-700 shadow-sm" : "text-muted-foreground hover:text-[var(--ink)]",
              )}
            >
              <input type="radio" name="material" className="sr-only" checked={option.value === material.value} onChange={() => setMaterial(option)} />
              {option.label}
            </label>
          ))}
        </fieldset>

        <p className="text-xs text-muted-foreground">
          طول تیغ{" "}
          <span dir="ltr" className="font-bold text-[var(--ink)] tabular-nums">
            {fa(drawing.knife / 1000, 2)} m
          </span>
          <span className={cn("ms-3 font-bold", drawing.issues === 0 ? "text-primary" : "text-destructive")}>
            {drawing.issues === 0 ? "بدون خطای فنی" : `${fa(drawing.issues)} هشدار`}
          </span>
        </p>
      </div>
    </form>
  );
};

export default BoxDock;
