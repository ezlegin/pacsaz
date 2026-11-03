"use client";

import {
  EDGE_COMPONENTS,
  LINE_STYLES,
  LINE_TYPES,
  mapExprs,
  newId,
  updateNode,
  type ComponentDef,
  type DielineDocument,
  type EdgeFeature,
  type LineType,
  type PanelsNode,
} from "@repo/dieline-engine";
import { ArrowDown, ArrowUp, FlipHorizontal2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useEditor, useStore } from "../state/react";
import { useNodeField, useNodeSetter } from "../ui/bindings";
import { IconButton, LineTypeSelect, Pill, Row, Section, SelectField, TextInput } from "../ui/controls";
import { ExpressionInput } from "../ui/ExpressionInput";

const NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

function F({ id, path, label, placeholder, optional }: { id: string; path: string; label?: string; placeholder?: string; optional?: boolean }) {
  const binding = useNodeField(id, path, optional);
  return <ExpressionInput binding={binding} label={label} placeholder={placeholder} selfId={id} className="flex-1" />;
}

/** Components that can sit on an edge: the built-in library and the template's own. */
export function useEdgeComponents(): ComponentDef[] {
  const own = useEditor((s) => s.doc.components);
  return [...EDGE_COMPONENTS.filter((c) => !own.some((o) => o.id === c.id)), ...own.filter((c) => c.edge)];
}

/** Rewrites `@body.old.` to `@body.new.` everywhere after a panel is renamed. */
function renamePanelRefs(doc: DielineDocument, body: string, from: string, to: string): DielineDocument {
  const pattern = new RegExp(`@${body}\\.${from}(?=\\.)`, "g");
  const rewrite = (e: string) => e.replace(pattern, `@${body}.${to}`);
  return { ...doc, nodes: doc.nodes.map((n) => mapExprs(n, rewrite)), rulers: doc.rulers.map((r) => mapExprs(r, rewrite)) };
}

/** Panels, their widths, and what hangs off each edge. */
export function BodyInspector({ node }: { node: PanelsNode }) {
  const store = useStore();
  const set = useNodeSetter(node.id);
  const [problem, setProblem] = useState<string | null>(null);

  const panels = node.panels;
  const move = (i: number, d: -1 | 1) => {
    const next = [...panels];
    const [p] = next.splice(i, 1);
    next.splice(i + d, 0, p!);
    set("panels", next);
  };

  const rename = (i: number, from: string, to: string) => {
    if (!NAME.test(to)) return setProblem("Letters, digits and _ only");
    if (panels.some((p, k) => k !== i && p.name === to)) return setProblem(`"${to}" is taken`);
    setProblem(null);
    store.apply((d) =>
      updateNode(renamePanelRefs(d, node.name, from, to), node.id, (n) =>
        n.kind === "panels" ? { ...n, panels: n.panels.map((p, k) => (k === i ? { ...p, name: to } : p)) } : n,
      ),
    );
  };

  const addPanel = () => {
    const taken = new Set(panels.map((p) => p.name));
    let k = panels.length + 1;
    while (taken.has(`panel${k}`)) k++;
    set("panels", [...panels, { id: newId(), name: `panel${k}`, width: "width" }]);
  };

  return (
    <>
      <Section title="Body">
        <Row label="Height">
          <F id={node.id} path="height" />
        </Row>
        <Row label="Folds">
          <LineTypeSelect value={node.fold ?? "crease"} onChange={(v) => set("fold", v && v !== "crease" ? v : undefined)} />
        </Row>
      </Section>

      <Section
        title={`Panels (${panels.length})`}
        actions={
          <IconButton title="Add panel" onClick={addPanel}>
            <Plus />
          </IconButton>
        }
      >
        <p className="text-[11px] text-muted-foreground">Left to right. Reference a corner as @{node.name}.{panels[0]?.name ?? "panel"}.topLeft.x</p>
        {problem && <p className="text-[11px] text-red-600">{problem}</p>}
        {panels.map((p, i) => (
          <div key={p.id} className="space-y-1.5 rounded-md border p-1.5">
            <Row>
              <span className="w-5 text-center font-mono text-[10px] text-muted-foreground">{i + 1}</span>
              <TextInput value={p.name} className="font-mono" onCommit={(v) => rename(i, p.name, v)} />
              <IconButton title="Move left" disabled={i === 0} onClick={() => move(i, -1)}>
                <ArrowUp />
              </IconButton>
              <IconButton title="Move right" disabled={i === panels.length - 1} onClick={() => move(i, 1)}>
                <ArrowDown />
              </IconButton>
              <IconButton title="Remove panel" disabled={panels.length === 1} onClick={() => set("panels", panels.filter((_, k) => k !== i))}>
                <Trash2 />
              </IconButton>
            </Row>
            <Row label="Width">
              <F id={node.id} path={`panels.${i}.width`} />
            </Row>
            <FeatureEditor node={node} path={`panels.${i}.top`} label="Top" feature={p.top} />
            <FeatureEditor node={node} path={`panels.${i}.bottom`} label="Bottom" feature={p.bottom} />
          </div>
        ))}
      </Section>

      <Section title="Outer edges">
        <FeatureEditor node={node} path="left" label="Left" feature={node.left} />
        <FeatureEditor node={node} path="right" label="Right" feature={node.right} />
      </Section>
    </>
  );
}

/** Pick what sits on one edge and set its options. */
function FeatureEditor({ node, path, label, feature }: { node: PanelsNode; path: string; label: string; feature?: EdgeFeature }) {
  const set = useNodeSetter(node.id);
  const components = useEdgeComponents();
  const def = feature ? components.find((c) => c.id === feature.component) : undefined;
  const error = useEditor((s) =>
    s.result.diagnostics.find((d) => d.target.type === "node" && d.target.id === node.id && d.target.field === `${path}.component`)?.message,
  );

  const options = [
    { value: "", label: "Plain cut edge" },
    ...components.map((c) => ({ value: c.id, label: c.category ? `${c.category} · ${c.name}` : c.name })),
    ...(feature && !def ? [{ value: feature.component, label: `Missing: ${feature.component}` }] : []),
  ];

  return (
    <div className="space-y-1">
      <Row label={label}>
        <SelectField
          value={feature?.component ?? ""}
          options={options}
          onChange={(v) => set(path, v ? { component: v, ...(feature?.flip ? { flip: true } : {}) } : undefined)}
        />
        {feature && (
          <IconButton title="Flip end to end" active={!!feature.flip} onClick={() => set(`${path}.flip`, feature.flip ? undefined : true)}>
            <FlipHorizontal2 />
          </IconButton>
        )}
      </Row>
      {error && <p className="pl-14 text-[11px] text-red-600">{error}</p>}
      {feature && def && (
        <div className="space-y-1 border-l-2 border-blue-200 pl-2 ml-14">
          {def.params.map((p) => (
            <Row key={p.name} label={p.label?.replace(/ \(0 = auto\)$/, "") ?? p.name}>
              <F id={node.id} path={`${path}.args.${p.name}`} optional placeholder={p.default === 0 ? "auto" : String(p.default)} />
            </Row>
          ))}
          <Row label="Hinge">
            <SelectField
              value={feature.hinge ?? ""}
              options={[
                { value: "", label: `Default (${def.edge?.hinge === "none" ? "none" : LINE_STYLES[(def.edge?.hinge ?? "crease") as LineType].label})` },
                { value: "none", label: "None" },
                ...LINE_TYPES.map((t) => ({ value: t, label: LINE_STYLES[t].label })),
              ]}
              onChange={(v) => set(`${path}.hinge`, v || undefined)}
            />
          </Row>
        </div>
      )}
      {feature && def && <EdgeAccess node={node} path={path} feature={feature} components={components} />}
      {feature && !def && <Pill on={false} onChange={() => set(path, undefined)}>Remove</Pill>}
    </div>
  );
}

/** Customize mode: the parts a customer may swap in on this edge, and the settings they may change. */
function EdgeAccess({ node, path, feature, components }: { node: PanelsNode; path: string; feature: EdgeFeature; components: ComponentDef[] }) {
  const set = useNodeSetter(node.id);
  const c = feature.customize ?? {};
  const choices = c.choices ?? [];
  const args = c.args ?? [];
  const params = [...new Set([feature.component, ...choices])]
    .flatMap((id) => components.find((x) => x.id === id)?.params ?? [])
    .filter((p, i, all) => all.findIndex((q) => q.name === p.name) === i);

  const write = (next: { choices?: string[]; args?: string[] }) => {
    const clean = { ...(next.choices?.length ? { choices: next.choices } : {}), ...(next.args?.length ? { args: next.args } : {}) };
    set(`${path}.customize`, Object.keys(clean).length ? clean : undefined);
  };
  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const count = choices.length + args.length;

  return (
    <details className="ml-14 rounded-md bg-muted/40 px-2 py-1 text-[11px]" open={count > 0}>
      <summary className="cursor-pointer text-muted-foreground">Customer can change{count ? ` (${count})` : ""}</summary>
      <div className="mt-1 space-y-1.5 pb-1">
        <div className="flex flex-wrap gap-1">
          {[{ id: "none", name: "Plain edge" }, ...components.filter((x) => x.id !== feature.component)].map((x) => (
            <Pill key={x.id} on={choices.includes(x.id)} onChange={() => write({ ...c, choices: toggle(choices, x.id) })} title="Customers may pick this part instead">
              {x.name}
            </Pill>
          ))}
        </div>
        {params.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {params.map((p) => (
              <Pill key={p.name} on={args.includes(p.name)} onChange={() => write({ ...c, args: toggle(args, p.name) })} title="Customers may set this, within the part's own range">
                {p.label?.replace(/ \(0 = auto\)$/, "") ?? p.name}
              </Pill>
            ))}
          </div>
        )}
      </div>
    </details>
  );
}
