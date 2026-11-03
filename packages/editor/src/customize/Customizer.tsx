"use client";

import {
  componentById,
  customizeOptions,
  edgeArgParams,
  render,
  verifyCustomization,
  type Bounds,
  type Customization,
  type CustomizeOptions,
  type DielineDocument,
  type Param,
  type Pt,
  type RenderInputs,
  type RenderResult,
  type VerifyResult,
} from "@repo/dieline-engine";
import { cn } from "@repo/ui/lib/utils";
import { CircleAlert, CircleCheck, Circle, RectangleHorizontal, RotateCcw, Trash2 } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  addCutout,
  changeCount,
  removeCutout,
  setEdgeArg,
  setEdgePart,
  setParam,
  setPartOffset,
  setPartShown,
  updateCutout,
} from "../model/customize";
import { CustomizeCanvas, type CanvasTarget } from "./CustomizeCanvas";
import { EN_STRINGS, type CustomizeStrings } from "./strings";

export type CustomizerProps = {
  template: DielineDocument;
  inputs: RenderInputs;
  value: Customization;
  onChange: (value: Customization) => void;
  strings?: Partial<CustomizeStrings>;
  /** Top of the side panel: the host's size and material controls. */
  header?: ReactNode;
  /** Bottom of the side panel: save and download buttons. */
  footer?: ReactNode;
  /** Every new verification, for hosts that disable "download" while there are problems. */
  onVerified?: (result: VerifyResult) => void;
  /** Extra content over the drawing, e.g. a 3D preview. Receives the customer's render. */
  overlay?: (result: RenderResult) => ReactNode;
  className?: string;
};

/**
 * Customize mode: the customer's editor. Only what the designer exposed can be
 * changed, everything is an edit of a `Customization` overlay, and the result is
 * verified with the same `verifyCustomization` the server runs.
 */
export function Customizer({ template, inputs, value, onChange, strings: partial, header, footer, onVerified, overlay, className }: CustomizerProps) {
  const t = useMemo(() => ({ ...EN_STRINGS, ...partial }), [partial]);
  const options = useMemo(() => customizeOptions(template), [template]);
  const templateResult = useMemo(() => render(template, inputs), [template, inputs]);

  // Verification renders twice and runs the checks; deferring keeps typing and dragging smooth.
  const deferred = useDeferredValue(value);
  const verified = useMemo(() => verifyCustomization(template, deferred, inputs, templateResult), [template, deferred, inputs, templateResult]);

  const onVerifiedRef = useRef(onVerified);
  onVerifiedRef.current = onVerified;
  useEffect(() => onVerifiedRef.current?.(verified), [verified]);

  const [selected, setSelected] = useState<string | null>(null);
  const dragBase = useRef<Customization | null>(null);

  const targets = useMemo<CanvasTarget[]>(
    () => [
      ...(value.cutouts ?? []).map((c) => ({ id: c.id, draggable: true })),
      ...options.nodes.map((n) => ({ id: n.id, draggable: n.move > 0 })),
    ],
    [value.cutouts, options.nodes],
  );

  const onDrag = (id: string, [dx, dy]: Pt) => {
    const base = (dragBase.current ??= value);
    const cut = base.cutouts?.find((c) => c.id === id);
    if (cut) return onChange(updateCutout(base, id, { cx: cut.cx + dx, cy: cut.cy + dy }));
    const part = options.nodes.find((n) => n.id === id);
    if (part && part.move > 0) {
      const now = base.nodes?.[id];
      onChange(setPartOffset(base, id, (now?.dx ?? 0) + dx, (now?.dy ?? 0) + dy, part.move));
    }
  };

  const selectedCut = value.cutouts?.find((c) => c.id === selected);
  const region = selectedCut ? cutoutRegion(verified.result, selectedCut.panel, options.cutouts?.margin ?? Math.max(3, 2 * inputs.thickness)) : null;

  const problemsFor = (prefix: string) => verified.problems.filter((p) => p.path === prefix || p.path.startsWith(`${prefix}.`));

  return (
    <div dir={t.dir} className={cn("flex h-full min-h-0 bg-muted/30", className)}>
      <aside className="flex w-80 shrink-0 flex-col border-e bg-background">
        {header && <div className="shrink-0 border-b">{header}</div>}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {!options.any && <p className="p-4 text-xs leading-6 text-muted-foreground">{t.nothingToCustomize}</p>}

          {options.params.length > 0 && (
            <Group title={t.options}>
              {options.params.map((p) => (
                <NumberRow
                  key={p.name}
                  label={p.label || p.name}
                  param={p}
                  value={value.params?.[p.name]}
                  t={t}
                  problems={problemsFor(`params.${p.name}`).map(t.problem)}
                  onChange={(v) => onChange(setParam(value, p.name, v))}
                />
              ))}
            </Group>
          )}

          {options.nodes.length > 0 && (
            <Group title={t.parts}>
              {options.nodes.map((n) => {
                const change = value.nodes?.[n.id];
                const on = change?.hidden !== undefined ? !change.hidden : !n.hiddenByDefault;
                return (
                  <div
                    key={n.id}
                    className={cn("space-y-1.5 rounded-lg border p-2", selected === n.id && "border-blue-500")}
                    onClick={() => setSelected(n.id)}
                  >
                    <label className="flex items-center gap-2 text-xs font-medium">
                      {n.optional && <input type="checkbox" checked={on} onChange={(e) => onChange(setPartShown(value, n.id, e.target.checked, n.hiddenByDefault))} />}
                      <span className="flex-1">{n.label}</span>
                    </label>
                    {n.move > 0 && on && (
                      <div className="grid grid-cols-2 gap-1.5">
                        {(["dx", "dy"] as const).map((axis) => (
                          <NumberInput
                            key={axis}
                            label={axis === "dx" ? t.moveX : t.moveY}
                            value={change?.[axis]}
                            placeholder="0"
                            min={-n.move}
                            max={n.move}
                            onCommit={(v) => onChange(setPartOffset(value, n.id, axis === "dx" ? (v ?? 0) : (change?.dx ?? 0), axis === "dy" ? (v ?? 0) : (change?.dy ?? 0), n.move))}
                          />
                        ))}
                      </div>
                    )}
                    <Problems list={problemsFor(`nodes.${n.id}`).map(t.problem)} />
                  </div>
                );
              })}
            </Group>
          )}

          {options.edges.length > 0 && (
            <Group title={t.edges}>
              {options.edges.map((e) => {
                const change = value.edges?.[e.key];
                const component = change?.component ?? e.component;
                const params = component === "none" ? [] : edgeArgParams(template, component, e.args);
                const name = (id: string) => (id === "none" ? t.none : t.component(id, componentById(template, id)?.name ?? id));
                return (
                  <div key={e.key} className="space-y-1.5 rounded-lg border p-2">
                    <div className="text-[11px] text-muted-foreground">
                      {e.panelName ? `${t.panelName(e.panelName)} · ${t.sides[e.side]}` : t.sides[e.side]}
                    </div>
                    {e.choices.length > 1 && (
                      <select
                        value={component}
                        onChange={(ev) => onChange(setEdgePart(value, e.key, ev.target.value, e.component))}
                        className="h-8 w-full rounded-md border bg-background px-2 text-xs"
                      >
                        {e.choices.map((c) => (
                          <option key={c} value={c}>
                            {name(c)}
                          </option>
                        ))}
                      </select>
                    )}
                    {e.choices.length <= 1 && <div className="text-xs font-medium">{name(component)}</div>}
                    {params.map((p) => (
                      <NumberRow
                        key={p.name}
                        label={t.param(p.name, (p.label || p.name).replace(/ \(0 = auto\)$/, ""))}
                        param={p}
                        value={change?.args?.[p.name]}
                        t={t}
                        onChange={(v) => onChange(setEdgeArg(value, e.key, p.name, v))}
                      />
                    ))}
                    <Problems list={problemsFor(`edges.${e.key}`).map(t.problem)} />
                  </div>
                );
              })}
            </Group>
          )}

          {options.cutouts && (
            <CutoutsGroup
              options={options}
              value={value}
              onChange={onChange}
              selected={selected}
              onSelect={setSelected}
              t={t}
              problemsFor={(id) => problemsFor(`cutouts.${id}`).map(t.problem)}
            />
          )}

          <Group title={t.problems}>
            {verified.problems.length === 0 ? (
              <p className="flex items-center gap-1.5 text-xs text-emerald-600">
                <CircleCheck className="size-3.5" /> {t.allGood}
              </p>
            ) : (
              <Problems list={verified.problems.map(t.problem)} />
            )}
            {changeCount(value) > 0 && (
              <button type="button" onClick={() => onChange({})} className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground">
                <RotateCcw className="size-3" /> {t.resetAll}
              </button>
            )}
          </Group>
        </div>
        {footer && <div className="shrink-0 border-t p-3">{footer}</div>}
      </aside>

      <div className="relative min-w-0 flex-1">
        <CustomizeCanvas
          result={verified.result}
          targets={targets}
          selected={selected}
          region={region}
          onSelect={setSelected}
          onDrag={onDrag}
          onDragEnd={() => (dragBase.current = null)}
          fitLabel={t.fit}
        />
        {targets.some((x) => x.draggable) && (
          <p className="pointer-events-none absolute end-3 top-3 rounded-md bg-background/80 px-2 py-1 text-[11px] text-muted-foreground backdrop-blur">{t.dragHint}</p>
        )}
        {overlay?.(verified.result)}
      </div>
    </div>
  );
}

/** Where a window may sit in a panel: the panel shrunk by the margin. */
function cutoutRegion(result: RenderResult, panel: string, margin: number): Bounds | null {
  const [body, name] = panel.split(".");
  const info = Object.values(result.nodes).find((n) => n.kind === "panels" && n.name === body);
  const lo = info?.anchors[`${name}.bottomLeft`];
  const hi = info?.anchors[`${name}.topRight`];
  if (!lo || !hi) return null;
  return {
    minX: Math.min(lo[0], hi[0]) + margin,
    minY: Math.min(lo[1], hi[1]) + margin,
    maxX: Math.max(lo[0], hi[0]) - margin,
    maxY: Math.max(lo[1], hi[1]) - margin,
  };
}

function CutoutsGroup({
  options,
  value,
  onChange,
  selected,
  onSelect,
  t,
  problemsFor,
}: {
  options: CustomizeOptions;
  value: Customization;
  onChange: (c: Customization) => void;
  selected: string | null;
  onSelect: (id: string | null) => void;
  t: CustomizeStrings;
  problemsFor: (id: string) => string[];
}) {
  const rules = options.cutouts!;
  const cutouts = value.cutouts ?? [];
  const [panel, setPanel] = useState(options.panels[0]!);
  const panelLabel = (p: string) => t.panelName(p.split(".")[1] ?? p);

  const add = (shape: "rect" | "ellipse") => {
    const { customization, id } = addCutout(value, shape, panel, Math.max(rules.minSize ?? 5, 30));
    onChange(customization);
    onSelect(id);
  };

  return (
    <Group title={t.cutouts} aside={t.maxCutouts(cutouts.length, rules.max)}>
      {cutouts.length < rules.max && (
        <div className="flex items-center gap-1.5">
          <select value={panel} onChange={(e) => setPanel(e.target.value)} className="h-8 min-w-0 flex-1 rounded-md border bg-background px-2 text-xs" title={t.panel}>
            {options.panels.map((p) => (
              <option key={p} value={p}>
                {panelLabel(p)}
              </option>
            ))}
          </select>
          {rules.shapes.includes("rect") && (
            <button type="button" title={t.addRect} onClick={() => add("rect")} className="flex h-8 items-center gap-1 rounded-md border px-2 text-xs hover:bg-accent">
              <RectangleHorizontal className="size-3.5" />+
            </button>
          )}
          {rules.shapes.includes("ellipse") && (
            <button type="button" title={t.addEllipse} onClick={() => add("ellipse")} className="flex h-8 items-center gap-1 rounded-md border px-2 text-xs hover:bg-accent">
              <Circle className="size-3.5" />+
            </button>
          )}
        </div>
      )}

      {cutouts.map((c) => {
        const problems = problemsFor(c.id);
        const set = (patch: Parameters<typeof updateCutout>[2]) => onChange(updateCutout(value, c.id, patch));
        return (
          <div
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={cn("space-y-1.5 rounded-lg border p-2", selected === c.id && "border-blue-500", problems.length > 0 && "border-red-400")}
          >
            <div className="flex items-center gap-1.5 text-xs font-medium">
              {c.shape === "rect" ? <RectangleHorizontal className="size-3.5" /> : <Circle className="size-3.5" />}
              <span className="flex-1">{c.shape === "rect" ? t.rect : t.ellipse}</span>
              <button type="button" title={t.remove} onClick={() => onChange(removeCutout(value, c.id))} className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-red-600">
                <Trash2 className="size-3.5" />
              </button>
            </div>
            {selected === c.id && (
              <>
                <select value={c.panel} onChange={(e) => set({ panel: e.target.value, cx: 0, cy: 0 })} className="h-8 w-full rounded-md border bg-background px-2 text-xs" title={t.panel}>
                  {options.panels.map((p) => (
                    <option key={p} value={p}>
                      {panelLabel(p)}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-1.5">
                  <NumberInput label={t.width} value={c.width} min={rules.minSize ?? 5} onCommit={(v) => v !== undefined && set({ width: v })} />
                  <NumberInput label={t.height} value={c.height} min={rules.minSize ?? 5} onCommit={(v) => v !== undefined && set({ height: v })} />
                  <NumberInput label={t.offsetX} value={c.cx} onCommit={(v) => set({ cx: v ?? 0 })} />
                  <NumberInput label={t.offsetY} value={c.cy} onCommit={(v) => set({ cy: v ?? 0 })} />
                  {c.shape === "rect" && (
                    <NumberInput label={t.radius} value={c.radius} placeholder="0" min={0} onCommit={(v) => set({ radius: v ?? 0 })} />
                  )}
                </div>
              </>
            )}
            <Problems list={problems} />
          </div>
        );
      })}
    </Group>
  );
}

//! Small pieces -------------------------------------------------------------------------

function Group({ title, aside, children }: { title: string; aside?: string; children: ReactNode }) {
  return (
    <section className="space-y-2 border-b p-4">
      <h3 className="flex items-center justify-between text-xs font-bold">
        {title}
        {aside && <span className="text-[11px] font-normal text-muted-foreground">{aside}</span>}
      </h3>
      {children}
    </section>
  );
}

function Problems({ list }: { list: string[] }) {
  if (!list.length) return null;
  return (
    <ul className="space-y-1">
      {list.map((m, i) => (
        <li key={i} className="flex items-start gap-1.5 text-[11px] leading-5 text-red-600">
          <CircleAlert className="mt-0.5 size-3.5 shrink-0" />
          {m}
        </li>
      ))}
    </ul>
  );
}

/** A param with its range: a slider when both ends are known, and the exact number. */
function NumberRow({
  label,
  param,
  value,
  onChange,
  t,
  problems = [],
}: {
  label: string;
  param: Param;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  t: CustomizeStrings;
  problems?: string[];
}) {
  // Library size params use 0 for "work it out from the box size".
  const auto = param.default === 0 && (param.min ?? 0) <= 0;
  const shown = value ?? param.default;
  const unit = param.unit === "deg" ? "°" : param.unit === "count" ? "" : "mm";
  const slider = param.min !== undefined && param.max !== undefined && param.max > param.min;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-xs">
        <span className="flex-1">{label}</span>
        {value !== undefined && (
          <button type="button" title={t.reset} onClick={() => onChange(undefined)} className="text-muted-foreground hover:text-foreground">
            <RotateCcw className="size-3" />
          </button>
        )}
        <NumberInput
          value={auto && shown === 0 ? undefined : shown}
          placeholder={auto ? t.auto : String(param.default)}
          min={param.min}
          max={param.max}
          unit={unit}
          className="w-24"
          onCommit={onChange}
        />
      </div>
      {slider && (
        <input
          type="range"
          dir="ltr"
          min={param.min}
          max={param.max}
          step={param.step ?? (param.unit === "count" ? 1 : 0.5)}
          value={shown}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
      )}
      <Problems list={problems} />
    </div>
  );
}

/** Commits on blur or Enter; an empty field means "back to the default". */
function NumberInput({
  label,
  value,
  placeholder,
  min,
  max,
  unit = "mm",
  className,
  onCommit,
}: {
  label?: string;
  value: number | undefined;
  placeholder?: string;
  min?: number;
  max?: number;
  unit?: string;
  className?: string;
  onCommit: (v: number | undefined) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => {
    if (draft === null) return;
    setDraft(null);
    const trimmed = draft.trim();
    if (trimmed === "") return onCommit(undefined);
    let v = Number(trimmed);
    if (!Number.isFinite(v)) return;
    if (min !== undefined) v = Math.max(min, v);
    if (max !== undefined) v = Math.min(max, v);
    onCommit(v);
  };

  return (
    <label className={cn("block space-y-0.5", className)}>
      {label && <span className="block text-[10px] text-muted-foreground">{label}</span>}
      <span dir="ltr" className="flex h-8 items-center rounded-md border bg-background focus-within:border-blue-500">
        <input
          inputMode="decimal"
          value={draft ?? (value === undefined ? "" : String(Math.round(value * 100) / 100))}
          placeholder={placeholder}
          onFocus={(e) => e.target.select()}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setDraft(null);
          }}
          className="h-full min-w-0 flex-1 bg-transparent px-2 font-mono text-xs outline-none"
        />
        {unit && <span className="pe-2 text-[10px] text-muted-foreground">{unit}</span>}
      </span>
    </label>
  );
}
