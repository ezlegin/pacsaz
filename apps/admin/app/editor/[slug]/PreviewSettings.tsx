"use client";

import type { DielineType } from "@/app/(PANEL)/dielines/DielinesList";
import { bleeds, materials } from "@repo/dieline-core/data/materials";
import { resolveDimensions } from "@repo/dieline-engine";
import { useEditor, useStore } from "@repo/editor";
import { cn } from "@repo/ui/lib/utils";
import { useEffect, useState } from "react";

type DimensionType = "manufacture" | "inner" | "outer";

const TYPE_LABELS: Record<DimensionType, string> = {
  manufacture: "Manufacture",
  inner: "Inner",
  outer: "Outer",
};

/**
 * The Studio's Settings tab: the template previewed the way a customer sets it
 * up on the site (size, material, dimension type, bleed, thickness), limited to
 * what this dieline offers. Nothing here is saved into the template.
 *
 * Size fields hold what the customer would type; the editor draws the
 * crease-to-crease size, which differs by a constant per axis for inner and
 * outer sizes (`resolveDimensions`, as on the site). A new dimension type keeps
 * the typed numbers and resizes the drawing; rulers go on showing the typed
 * number. Keeping only that offset, not the typed size, keeps this panel in step
 * with the size fields in the top bar.
 */
export default function PreviewSettings({ dieline }: { dieline: DielineType }) {
  const store = useStore();
  const inputs = useEditor((s) => s.inputs);

  const offered = dieline.materials
    .split(",")
    .map((v) => materials.find((m) => m.value === v))
    .filter((m) => m !== undefined);
  const types = dieline.dimensionTypes.split(",").filter((t): t is DimensionType => t in TYPE_LABELS);

  const [materialKey, setMaterialKey] = useState(dieline.settings.material || dieline.defaultMaterial);
  const [type, setType] = useState<DimensionType>((dieline.settings.dimensionType as DimensionType) ?? types[0] ?? "manufacture");

  const material = materials.find((m) => m.value === materialKey) ?? offered[0] ?? materials[0]!;
  const offsetFor = (t: DimensionType, thickness: number) => resolveDimensions({ width: 0, length: 0, height: 0 }, t, thickness);

  const offset = offsetFor(type, inputs.thickness);
  const typed = (key: "width" | "length" | "height") => Math.round((inputs[key] - offset[key]) * 100) / 100;

  // The 3D dock shows the chosen board, as the site does: kraft with flutes for flute materials.
  useEffect(() => {
    store.setDisplay({ material: material.value });
  }, [store, material.value]);

  useEffect(() => {
    store.setDisplay({ sizeDelta: offset });
    // The object is new each render; its numbers are what matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, offset.width, offset.height]);

  // Re-applies the typed size under a new type or thickness.
  const reapply = (next: { type?: DimensionType; thickness?: number }) => {
    const thickness = next.thickness ?? inputs.thickness;
    const d = offsetFor(next.type ?? type, thickness);
    store.setInputs({
      thickness,
      width: inputs.width + d.width - offset.width,
      length: inputs.length + d.length - offset.length,
      height: inputs.height + d.height - offset.height,
    });
  };

  return (
    <div className="space-y-4 p-3 text-xs">
      <p className="text-[11px] text-muted-foreground">How the template is previewed while you edit, set up as a customer would. Not saved into the template.</p>

      <Group title="Dimensions">
        <div className="grid grid-cols-3 gap-1.5">
          {(["length", "width", "height"] as const).map((key) => (
            <label key={key} className="space-y-0.5">
              <span className="text-[11px] capitalize text-muted-foreground">{key}</span>
              <Num value={typed(key)} min={1} onChange={(v) => store.setInputs({ [key]: v + offset[key] })} />
            </label>
          ))}
        </div>
      </Group>

      <Group title="Material">
        <select
          value={material.value}
          onChange={(e) => {
            const m = materials.find((x) => x.value === e.target.value);
            if (!m) return;
            setMaterialKey(m.value);
            // A new material brings its own thickness, as on the site.
            store.setInputs({ thickness: m.thickness });
          }}
          className="h-7 w-full rounded-md border bg-background px-2"
        >
          {(offered.length ? offered : materials).map((m) => (
            <option key={m.value} value={m.value}>
              {m.label} ({m.thickness} mm)
            </option>
          ))}
        </select>
      </Group>

      <Group title="Dimension type">
        <div className="flex gap-1">
          {(types.length ? types : (["manufacture"] as DimensionType[])).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                reapply({ type: t });
              }}
              className={cn(
                "flex-1 rounded-md border px-2 py-1",
                t === type ? "border-blue-500 bg-blue-500/10 text-blue-700" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Bleed">
        <div className="flex gap-1">
          {[0, ...Object.values(bleeds)].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => store.setInputs({ bleed: b })}
              className={cn(
                "flex-1 rounded-md border px-1 py-1 font-mono",
                inputs.bleed === b ? "border-blue-500 bg-blue-500/10 text-blue-700" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {b ? `${b} mm` : "None"}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Thickness">
        <Num value={inputs.thickness} min={0.1} step={0.1} onChange={(v) => reapply({ thickness: v })} />
      </Group>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-1.5">
      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

function Num({ value, onChange, min, step = 1 }: { value: number; onChange: (v: number) => void; min?: number; step?: number }) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      step={step}
      onChange={(e) => {
        const v = Number(e.target.value);
        if (Number.isFinite(v) && v > 0) onChange(v);
      }}
      className="h-7 w-full min-w-0 rounded-md border bg-background px-2 font-mono outline-none focus:border-blue-500"
    />
  );
}
