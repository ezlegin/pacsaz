"use client";

import { BUILTINS, formatNumber, renameSymbol, type Param, type RenderInputs, type Variable } from "@repo/dieline-engine";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useEditor, useStore } from "../state/react";
import { useDocField, useDocSetter } from "../ui/bindings";
import { IconButton, Pill, Row, Section, SelectField, TextInput } from "../ui/controls";
import { ExpressionInput } from "../ui/ExpressionInput";

const NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** Everything about the template that is not a shape: size, params, variables. */
export function DocumentPanel() {
  return (
    <div className="text-xs">
      <Params />
      <Variables />
      <CustomerCutouts />
    </div>
  );
}

//! Customize mode ----------------------------------------------------------------------

/** Whether customers may add windows and holes to the box's panels. */
function CustomerCutouts() {
  const store = useStore();
  const rules = useEditor((s) => s.doc.customize?.cutouts);
  const write = (next: typeof rules) =>
    store.apply((d) => {
      const customize = { ...d.customize, cutouts: next };
      if (!next) delete customize.cutouts;
      return { ...d, customize: Object.keys(customize).length ? customize : undefined };
    });
  const shapes = rules?.shapes ?? [];
  const toggle = (s: "rect" | "ellipse") => {
    const next = shapes.includes(s) ? shapes.filter((x) => x !== s) : [...shapes, s];
    write(next.length ? { ...rules!, shapes: next } : undefined);
  };

  return (
    <Section title="Customer windows and holes" defaultOpen={!!rules}>
      <p className="text-[11px] text-muted-foreground">Customers place them inside box panels, clear of folds and edges.</p>
      <Row label="Allow">
        <Pill on={!!rules} onChange={(on) => write(on ? { shapes: ["rect", "ellipse"], max: 2 } : undefined)}>
          {rules ? "Allowed" : "Not allowed"}
        </Pill>
      </Row>
      {rules && (
        <>
          <Row label="Shapes">
            <Pill on={shapes.includes("rect")} onChange={() => toggle("rect")}>Rectangle</Pill>
            <Pill on={shapes.includes("ellipse")} onChange={() => toggle("ellipse")}>Circle / oval</Pill>
          </Row>
          <Row label="At most">
            <NumberField value={rules.max} min={1} onChange={(v) => write({ ...rules, max: Math.max(1, Math.min(50, Math.round(v))) })} />
          </Row>
          <Row label="Clearance">
            <NumberField value={rules.margin ?? 0} min={0} step={0.5} onChange={(v) => write({ ...rules, margin: v > 0 ? v : undefined })} />
          </Row>
          <p className="pl-14 text-[11px] text-muted-foreground">0 means max(3 mm, 2 × thickness).</p>
        </>
      )}
    </Section>
  );
}

//! Preview size ---------------------------------------------------------------------

const SIZE_FIELDS: { key: keyof RenderInputs & string; label: string; step: number }[] = [
  { key: "width", label: "Width", step: 1 },
  { key: "length", label: "Length", step: 1 },
  { key: "height", label: "Height", step: 1 },
  { key: "thickness", label: "Thickness", step: 0.1 },
  { key: "bleed", label: "Bleed", step: 0.5 },
];

function NumberField({ value, onChange, step = 1, min }: { value: number; onChange: (v: number) => void; step?: number; min?: number }) {
  return (
    <input
      type="number"
      value={value}
      step={step}
      min={min}
      onChange={(e) => {
        const v = Number(e.target.value);
        if (Number.isFinite(v)) onChange(v);
      }}
      className="h-7 w-full min-w-0 rounded-md border bg-background px-2 font-mono text-[11.5px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
    />
  );
}

/** The size the template is drawn at: the Settings tab when the app brings none of its own. */
export function PreviewSize() {
  const store = useStore();
  const inputs = useEditor((s) => s.inputs);
  return (
    <Section title="Preview size">
      <p className="text-[11px] text-muted-foreground">The size the template is drawn at while you edit. It is not saved into the template.</p>
      <div className="grid grid-cols-2 gap-1.5">
        {SIZE_FIELDS.map((f) => (
          <label key={f.key} className="space-y-0.5">
            <span className="text-[11px] text-muted-foreground">{f.label}</span>
            <NumberField
              value={(inputs[f.key] as number | undefined) ?? 0}
              step={f.step}
              min={0}
              onChange={(v) => store.setInputs({ [f.key]: v })}
            />
          </label>
        ))}
      </div>
    </Section>
  );
}

//! Params ----------------------------------------------------------------------------

function useNameCheck() {
  const store = useStore();
  return (name: string, current?: string): string | null => {
    if (!NAME.test(name)) return "Letters, digits and _ only";
    if (name === current) return null;
    const { doc } = store.get();
    const taken = new Set<string>([...BUILTINS, ...doc.params.map((p) => p.name), ...doc.variables.map((v) => v.name)]);
    return taken.has(name) ? `"${name}" is already used` : null;
  };
}

function Params() {
  const store = useStore();
  const params = useEditor((s) => s.doc.params);
  const scope = useEditor((s) => s.result.scope);
  const check = useNameCheck();
  const set = useDocSetter();
  const [problem, setProblem] = useState<string | null>(null);

  const add = () => {
    const taken = new Set(Object.keys(store.get().result.scope));
    let i = 1;
    while (taken.has(`param${i}`)) i++;
    store.apply((d) => ({ ...d, params: [...d.params, { name: `param${i}`, default: 10, unit: "mm" }] }));
  };

  const rename = (index: number, from: string, to: string) => {
    const err = check(to, from);
    setProblem(err);
    if (err) return;
    store.apply((d) => renameSymbol({ ...d, params: d.params.map((p, k) => (k === index ? { ...p, name: to } : p)) }, from, to));
  };

  return (
    <Section
      title="Parameters"
      actions={
        <IconButton title="Add parameter" onClick={add}>
          <Plus />
        </IconButton>
      }
    >
      <p className="text-[11px] text-muted-foreground">Inputs with a default. Exposed ones are what customers can change, within min–max.</p>
      {problem && <p className="text-[11px] text-red-600">{problem}</p>}
      {params.map((p: Param, i) => (
        <div key={i} className="space-y-1 rounded-md border p-1.5">
          <Row>
            <TextInput value={p.name} className="font-mono" onCommit={(v) => rename(i, p.name, v)} />
            <span className="w-14 shrink-0 text-right font-mono text-[11px] text-muted-foreground">
              {scope[p.name] !== undefined ? formatNumber(scope[p.name]!, 2) : "—"}
            </span>
            <IconButton title="Remove" onClick={() => set("params", params.filter((_, k) => k !== i))}>
              <Trash2 />
            </IconButton>
          </Row>
          <div className="grid grid-cols-3 gap-1">
            {(["default", "min", "max"] as const).map((key) => (
              <label key={key} className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground">{key}</span>
                <input
                  type="number"
                  value={p[key] ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (key !== "default" && raw === "") return set(`params.${i}.${key}`, undefined);
                    const v = Number(raw);
                    if (Number.isFinite(v)) set(`params.${i}.${key}`, v);
                  }}
                  className="h-7 w-full rounded-md border bg-background px-1.5 font-mono text-[11px] outline-none focus:border-blue-500"
                />
              </label>
            ))}
          </div>
          <Row>
            <SelectField
              value={p.unit ?? "mm"}
              options={[
                { value: "mm", label: "mm" },
                { value: "deg", label: "degrees" },
                { value: "count", label: "count" },
              ]}
              onChange={(v) => set(`params.${i}.unit`, v)}
            />
            <TextInput value={p.label ?? ""} placeholder="Label for customers" onCommit={(v) => set(`params.${i}.label`, v || undefined)} />
            <Pill on={!!p.exposed} onChange={(on) => set(`params.${i}.exposed`, on || undefined)} title="Customers can change it">
              Exposed
            </Pill>
          </Row>
        </div>
      ))}
    </Section>
  );
}

//! Variables -------------------------------------------------------------------------

function VariableExpr({ index, name, path }: { index: number; name: string; path: string }) {
  const field = path.split(".").slice(2).join(".");
  const binding = useDocField(`variables.${index}.${field}`, (t) => t.type === "variable" && t.name === name && (t.field ?? "expr") === field);
  return <ExpressionInput binding={binding} className="flex-1" showValue={!field.endsWith("when")} />;
}

function Variables() {
  const store = useStore();
  const variables = useEditor((s) => s.doc.variables);
  const scope = useEditor((s) => s.result.scope);
  const errors = useEditor((s) => s.result.diagnostics);
  const check = useNameCheck();
  const set = useDocSetter();
  const [problem, setProblem] = useState<string | null>(null);

  const add = () => {
    const taken = new Set(Object.keys(store.get().result.scope));
    let i = 1;
    while (taken.has(`var${i}`)) i++;
    store.apply((d) => ({ ...d, variables: [...d.variables, { name: `var${i}`, expr: "width / 2" }] }));
  };

  const rename = (index: number, from: string, to: string) => {
    const err = check(to, from);
    setProblem(err);
    if (err) return;
    store.apply((d) => renameSymbol({ ...d, variables: d.variables.map((v, k) => (k === index ? { ...v, name: to } : v)) }, from, to));
  };

  return (
    <Section
      title="Variables"
      actions={
        <IconButton title="Add variable" onClick={add}>
          <Plus />
        </IconButton>
      }
    >
      <p className="text-[11px] text-muted-foreground">Derived values. They may use each other in any order; cases are tried top to bottom.</p>
      {problem && <p className="text-[11px] text-red-600">{problem}</p>}
      {variables.map((v: Variable, i) => {
        const failed = errors.some((d) => d.target.type === "variable" && d.target.name === v.name && !d.target.field);
        return (
          <div key={i} className="space-y-1 rounded-md border p-1.5">
            <Row>
              <TextInput value={v.name} className="max-w-32 font-mono" invalid={failed} onCommit={(n) => rename(i, v.name, n)} />
              <span className="flex-1 truncate text-right font-mono text-[11px] text-muted-foreground">
                {scope[v.name] !== undefined ? `= ${formatNumber(scope[v.name]!, 2)}` : "error"}
              </span>
              <IconButton
                title="Add case"
                onClick={() => set(`variables.${i}.cases`, [...(v.cases ?? []), { when: "width > 100", expr: v.expr }])}
              >
                <Plus />
              </IconButton>
              <IconButton title="Remove" onClick={() => set("variables", variables.filter((_, k) => k !== i))}>
                <Trash2 />
              </IconButton>
            </Row>
            {v.cases?.map((_, c) => (
              <div key={c} className="space-y-1 border-l-2 border-violet-300 pl-1.5">
                <Row>
                  <span className="w-6 text-[11px] text-muted-foreground">if</span>
                  <VariableExpr index={i} name={v.name} path={`variables.${i}.cases.${c}.when`} />
                  <IconButton title="Remove case" onClick={() => set(`variables.${i}.cases`, v.cases!.filter((__, k) => k !== c).length ? v.cases!.filter((__, k) => k !== c) : undefined)}>
                    <Trash2 />
                  </IconButton>
                </Row>
                <Row>
                  <span className="w-6 text-[11px] text-muted-foreground">then</span>
                  <VariableExpr index={i} name={v.name} path={`variables.${i}.cases.${c}.expr`} />
                </Row>
              </div>
            ))}
            <Row>
              {v.cases?.length ? <span className="w-6 text-[11px] text-muted-foreground">else</span> : null}
              <VariableExpr index={i} name={v.name} path={`variables.${i}.expr`} />
            </Row>
          </div>
        );
      })}
    </Section>
  );
}
