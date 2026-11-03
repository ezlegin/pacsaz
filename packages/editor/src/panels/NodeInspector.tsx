"use client";

import {
  allNodes,
  newId,
  renameNode,
  type LineType,
  type Modifier,
  type ModifierType,
  type Node,
  type PathNode,
  type Rule,
  type Segment,
} from "@repo/dieline-engine";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { SHAPE_LABELS } from "../model/create";
import { useEditor, useStore } from "../state/react";
import { findNodeCached, useNodeField, useNodeSetter } from "../ui/bindings";
import { IconButton, LineTypeSelect, NODE_ICONS, Pill, Row, Section, SelectField, TextInput } from "../ui/controls";
import { ExpressionInput } from "../ui/ExpressionInput";

const NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** One expression field bound to `path` on the node. */
function F({ id, path, label, optional, placeholder }: { id: string; path: string; label?: string; optional?: boolean; placeholder?: string }) {
  const binding = useNodeField(id, path, optional);
  return <ExpressionInput binding={binding} label={label} selfId={id} placeholder={placeholder} className="flex-1" />;
}

/** An x/y pair. */
function P({ id, path, label }: { id: string; path: string; label: string }) {
  return (
    <Row label={label}>
      <F id={id} path={`${path}.x`} label="X" />
      <F id={id} path={`${path}.y`} label="Y" />
    </Row>
  );
}

export function NodeInspector({ id }: { id: string }) {
  const node = useEditor((s) => findNodeCached(s.doc, id) as Node | undefined);
  const info = useEditor((s) => s.result.nodes[id]);
  const nodeError = useEditor((s) =>
    s.result.diagnostics.find((d) => d.severity === "error" && d.target.type === "node" && d.target.id === id && !d.target.field),
  );
  if (!node) return null;

  return (
    <div className="text-xs">
      <Header node={node} />
      {nodeError && <p className="mx-3 mt-2 rounded-md bg-red-50 px-2 py-1.5 text-red-700">{nodeError.message}</p>}
      {info?.failed && !nodeError && (
        <p className="mx-3 mt-2 rounded-md bg-red-50 px-2 py-1.5 text-red-700">This shape has an error in one of its fields.</p>
      )}
      <Geometry node={node} />
      <Placement node={node} />
      <Modifiers node={node} />
      <Rules node={node} />
    </div>
  );
}

//! Header -------------------------------------------------------------------------

function Header({ node }: { node: Node }) {
  const store = useStore();
  const set = useNodeSetter(node.id);
  const [problem, setProblem] = useState<string | null>(null);
  const Icon = NODE_ICONS[node.kind];

  const rename = (name: string) => {
    if (!NAME.test(name)) return setProblem("Letters, digits and _ only, not starting with a digit");
    if (allNodes(store.get().doc).some((n) => n.name === name && n.id !== node.id)) return setProblem(`"${name}" is taken`);
    setProblem(null);
    // Renaming rewrites every @reference to the node.
    store.apply((d) => renameNode(d, node.id, name));
  };

  return (
    <div className="border-b px-3 py-2.5">
      <div className="flex items-center gap-2">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <TextInput value={node.name} onCommit={rename} invalid={!!problem} title="Name used in references (@name)" className="font-mono" />
        <IconButton title={node.hidden ? "Show" : "Hide"} onClick={() => set("hidden", node.hidden ? undefined : true)}>
          {node.hidden ? <EyeOff /> : <Eye />}
        </IconButton>
      </div>
      {problem && <p className="mt-1 text-[11px] text-red-600">{problem}</p>}
      <p className="mt-1 text-[11px] text-muted-foreground">
        {node.kind === "group" ? "Group" : node.kind === "instance" ? "Component" : SHAPE_LABELS[node.kind]}
      </p>
    </div>
  );
}

//! Geometry ------------------------------------------------------------------------

function Geometry({ node }: { node: Node }) {
  const set = useNodeSetter(node.id);
  const id = node.id;
  let body: ReactNode = null;

  switch (node.kind) {
    case "rect": {
      const perCorner = Array.isArray(node.radius);
      body = (
        <>
          <Row label="Size">
            <F id={id} path="width" label="W" />
            <F id={id} path="height" label="H" />
          </Row>
          <Row label="Radius">
            {perCorner ? (
              <div className="grid flex-1 grid-cols-2 gap-1">
                {["BL", "BR", "TR", "TL"].map((l, i) => (
                  <F key={l} id={id} path={`radius.${i}`} label={l} />
                ))}
              </div>
            ) : (
              <F id={id} path="radius" optional placeholder="0" />
            )}
            <Pill
              on={perCorner}
              title="A radius per corner"
              onChange={(on) => {
                const r = typeof node.radius === "string" ? node.radius : "0";
                set("radius", on ? [r, r, r, r] : (node.radius as string[] | undefined)?.[0] ?? undefined);
              }}
            >
              4
            </Pill>
          </Row>
          <Row label="Open side">
            <SelectField
              value={node.openSide ?? ""}
              options={[
                { value: "", label: "None (closed)" },
                { value: "top", label: "Top" },
                { value: "right", label: "Right" },
                { value: "bottom", label: "Bottom" },
                { value: "left", label: "Left" },
              ]}
              onChange={(v) => set("openSide", v || undefined)}
            />
          </Row>
        </>
      );
      break;
    }
    case "line":
      body = (
        <>
          <P id={id} path="from" label="From" />
          <P id={id} path="to" label="To" />
        </>
      );
      break;
    case "path":
      body = <PathSegments node={node} />;
      break;
    case "ellipse":
      body = (
        <Row label="Radius">
          <F id={id} path="rx" label="X" />
          <F id={id} path="ry" label="Y" />
        </Row>
      );
      break;
    case "arc":
      body = (
        <>
          <Row label="Radius">
            <F id={id} path="radius" />
          </Row>
          <Row label="Angles">
            <F id={id} path="start" label="From" />
            <F id={id} path="end" label="To" />
          </Row>
        </>
      );
      break;
    case "polygon":
      body = (
        <>
          <Row label="Sides">
            <F id={id} path="sides" />
          </Row>
          <Row label="Radius">
            <F id={id} path="radius" />
          </Row>
          <Row label="Angle">
            <F id={id} path="angle" optional placeholder="90" />
          </Row>
        </>
      );
      break;
    case "star":
      body = (
        <>
          <Row label="Points">
            <F id={id} path="points" />
          </Row>
          <Row label="Radius">
            <F id={id} path="radius" label="Out" />
            <F id={id} path="innerRadius" label="In" optional placeholder="auto" />
          </Row>
          <Row label="Angle">
            <F id={id} path="angle" optional placeholder="90" />
          </Row>
        </>
      );
      break;
    case "belt":
      body = (
        <>
          <Row label="Radii">
            <F id={id} path="radius1" label="1" />
            <F id={id} path="radius2" label="2" />
          </Row>
          <Row label="Distance">
            <F id={id} path="distance" />
          </Row>
        </>
      );
      break;
    case "group":
      body = (
        <Row label="Combine">
          <SelectField
            value={node.combine?.op ?? ""}
            options={[
              { value: "", label: "Keep children as they are" },
              { value: "union", label: "Union" },
              { value: "subtract", label: "Subtract (first minus rest)" },
              { value: "intersect", label: "Intersect" },
              { value: "join", label: "Join two open ends" },
            ]}
            onChange={(v) => set("combine", v ? { op: v } : undefined)}
          />
        </Row>
      );
      break;
    case "instance":
      body = <InstanceArgs node={node} />;
      break;
  }

  const lineType = "lineType" in node ? node.lineType : null;

  return (
    <Section title="Geometry">
      {lineType && (
        <Row label="Line">
          <LineTypeSelect value={lineType} onChange={(v) => v && set("lineType", v)} />
        </Row>
      )}
      {body}
    </Section>
  );
}

function InstanceArgs({ node }: { node: Extract<Node, { kind: "instance" }> }) {
  const def = useEditor((s) => s.doc.components.find((c) => c.id === node.component));
  if (!def) return <p className="text-red-600">Component “{node.component}” is missing.</p>;
  return (
    <>
      <p className="text-[11px] text-muted-foreground">{def.name}</p>
      {def.params.map((p) => (
        <Row key={p.name} label={p.label ?? p.name}>
          <F id={node.id} path={`args.${p.name}`} optional placeholder={String(p.default)} />
        </Row>
      ))}
    </>
  );
}

//! Path segments -----------------------------------------------------------------

const SEGMENT_TYPES = [
  { value: "to", label: "To point" },
  { value: "by", label: "By offset" },
  { value: "polar", label: "Length @ angle" },
  { value: "arc", label: "Arc" },
] as const;

function convertSegment(seg: Segment, type: Segment["type"]): Segment {
  const extras = { ...(seg.lineType ? { lineType: seg.lineType } : {}), ...(seg.round ? { round: seg.round } : {}) };
  switch (type) {
    case "to":
      return { type, x: "0", y: "0", ...extras };
    case "by":
      return { type, dx: "0", dy: "0", ...extras };
    case "polar":
      return { type, length: "10", angle: "0", ...extras };
    case "arc":
      return { type, x: "10", y: "0", relative: true, radius: "10", ...extras };
  }
}

function PathSegments({ node }: { node: PathNode }) {
  const set = useNodeSetter(node.id);
  const id = node.id;
  const segments = node.segments;

  const move = (i: number, d: -1 | 1) => {
    const next = [...segments];
    const [s] = next.splice(i, 1);
    next.splice(i + d, 0, s!);
    set("segments", next);
  };

  return (
    <>
      <P id={id} path="start" label="Start" />
      <div className="space-y-1.5">
        {segments.map((seg, i) => (
          <div key={i} className="rounded-md border bg-muted/30 p-1.5">
            <div className="mb-1.5 flex items-center gap-1">
              <span className="w-5 text-center font-mono text-[10px] text-muted-foreground">{i + 1}</span>
              <SelectField
                value={seg.type}
                options={SEGMENT_TYPES}
                onChange={(t) => set(`segments.${i}`, convertSegment(seg, t))}
              />
              <IconButton title="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                <ArrowUp />
              </IconButton>
              <IconButton title="Move down" disabled={i === segments.length - 1} onClick={() => move(i, 1)}>
                <ArrowDown />
              </IconButton>
              <IconButton title="Remove" onClick={() => set("segments", segments.filter((_, k) => k !== i))}>
                <Trash2 />
              </IconButton>
            </div>
            <div className="space-y-1">
              {seg.type === "to" && (
                <Row>
                  <F id={id} path={`segments.${i}.x`} label="X" />
                  <F id={id} path={`segments.${i}.y`} label="Y" />
                </Row>
              )}
              {seg.type === "by" && (
                <Row>
                  <F id={id} path={`segments.${i}.dx`} label="ΔX" />
                  <F id={id} path={`segments.${i}.dy`} label="ΔY" />
                </Row>
              )}
              {seg.type === "polar" && (
                <Row>
                  <F id={id} path={`segments.${i}.length`} label="L" />
                  <F id={id} path={`segments.${i}.angle`} label="∠" />
                </Row>
              )}
              {seg.type === "arc" && (
                <>
                  <Row>
                    <F id={id} path={`segments.${i}.x`} label={seg.relative ? "ΔX" : "X"} />
                    <F id={id} path={`segments.${i}.y`} label={seg.relative ? "ΔY" : "Y"} />
                  </Row>
                  <Row>
                    <F id={id} path={`segments.${i}.radius`} label="R" />
                    <Pill on={!!seg.relative} onChange={(on) => set(`segments.${i}.relative`, on || undefined)}>
                      Rel
                    </Pill>
                    <Pill on={!!seg.clockwise} onChange={(on) => set(`segments.${i}.clockwise`, on || undefined)} title="Clockwise">
                      CW
                    </Pill>
                    <Pill on={!!seg.large} onChange={(on) => set(`segments.${i}.large`, on || undefined)} title="Long way round">
                      Large
                    </Pill>
                  </Row>
                </>
              )}
              <Row>
                <F id={id} path={`segments.${i}.round`} label="⌒" optional placeholder="corner radius" />
                <LineTypeSelect
                  allowInherit
                  value={seg.lineType ?? ""}
                  onChange={(v) => set(`segments.${i}.lineType`, (v || undefined) as LineType | undefined)}
                />
              </Row>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-1.5">
        <button
          type="button"
          className="flex h-7 flex-1 items-center justify-center gap-1 rounded-md border border-dashed text-[11px] text-muted-foreground hover:text-foreground"
          onClick={() => set("segments", [...segments, { type: "by", dx: "10", dy: "0" }])}
        >
          <Plus className="size-3" /> Segment
        </button>
        <Pill on={node.closed} onChange={(on) => set("closed", on)}>
          Closed
        </Pill>
      </div>
    </>
  );
}

//! Placement ------------------------------------------------------------------------

function Placement({ node }: { node: Node }) {
  const set = useNodeSetter(node.id);
  const t = node.transform ?? {};
  return (
    <Section title="Placement">
      <Row label="Position">
        <F id={node.id} path="transform.x" label="X" optional placeholder="0" />
        <F id={node.id} path="transform.y" label="Y" optional placeholder="0" />
      </Row>
      <Row label="Rotate">
        <F id={node.id} path="transform.rotate" label="°" optional placeholder="0" />
        <Pill on={!!t.mirrorX} onChange={(on) => set("transform.mirrorX", on || undefined)} title="Mirror left–right">
          ⇋ X
        </Pill>
        <Pill on={!!t.mirrorY} onChange={(on) => set("transform.mirrorY", on || undefined)} title="Mirror top–bottom">
          ⇵ Y
        </Pill>
      </Row>
    </Section>
  );
}

//! Modifiers -------------------------------------------------------------------------

const MODIFIER_LABELS: Record<ModifierType, string> = {
  round: "Round corners",
  roundFull: "Full round",
  array: "Repeat",
  mirrorCopy: "Mirror copy",
  copy: "Copy",
  offset: "Offset",
};

const NEW_MODIFIER: Record<ModifierType, Modifier> = {
  round: { type: "round", radius: "3" },
  roundFull: { type: "roundFull" },
  array: { type: "array", count: "3", dx: "10", dy: "0" },
  mirrorCopy: { type: "mirrorCopy", axis: "x", at: "0" },
  copy: { type: "copy", dx: "10", dy: "0" },
  offset: { type: "offset", distance: "2" },
};

function Modifiers({ node }: { node: Node }) {
  const set = useNodeSetter(node.id);
  const list = node.modifiers ?? [];
  const id = node.id;

  const write = (next: Modifier[]) => set("modifiers", next.length ? next : undefined);
  const move = (i: number, d: -1 | 1) => {
    const next = [...list];
    const [m] = next.splice(i, 1);
    next.splice(i + d, 0, m!);
    write(next);
  };

  return (
    <Section
      title="Effects"
      actions={
        <select
          title="Add an effect"
          value=""
          onChange={(e) => e.target.value && write([...list, NEW_MODIFIER[e.target.value as ModifierType]])}
          className="h-6 w-6 cursor-pointer appearance-none rounded bg-transparent text-center text-muted-foreground hover:bg-accent"
          style={{ backgroundImage: "none" }}
        >
          <option value="">+</option>
          {Object.entries(MODIFIER_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      }
    >
      {list.length === 0 && <p className="text-[11px] text-muted-foreground">Round corners, repeat, mirror, offset… applied in order.</p>}
      {list.map((m, i) => {
        const p = `modifiers.${i}`;
        return (
          <div key={i} className={`rounded-md border p-1.5 ${m.disabled ? "opacity-50" : ""}`}>
            <div className="mb-1 flex items-center gap-1">
              <span className="flex-1 text-[11px] font-medium">{MODIFIER_LABELS[m.type]}</span>
              <IconButton title={m.disabled ? "Turn on" : "Turn off"} onClick={() => set(`${p}.disabled`, m.disabled ? undefined : true)}>
                {m.disabled ? <EyeOff /> : <Eye />}
              </IconButton>
              <IconButton title="Earlier" disabled={i === 0} onClick={() => move(i, -1)}>
                <ArrowUp />
              </IconButton>
              <IconButton title="Later" disabled={i === list.length - 1} onClick={() => move(i, 1)}>
                <ArrowDown />
              </IconButton>
              <IconButton title="Remove" onClick={() => write(list.filter((_, k) => k !== i))}>
                <Trash2 />
              </IconButton>
            </div>
            <div className="space-y-1">
              {m.type === "round" && (
                <Row>
                  <F id={id} path={`${p}.radius`} label="R" />
                  <TextInput
                    value={m.corners?.join(", ") ?? ""}
                    placeholder="all corners"
                    title="Corner numbers, e.g. 0, 2"
                    onCommit={(v) => {
                      const corners = v.split(/[\s,]+/).filter(Boolean).map(Number).filter((n) => Number.isInteger(n) && n >= 0);
                      set(`${p}.corners`, corners.length ? corners : undefined);
                    }}
                  />
                </Row>
              )}
              {m.type === "array" && (
                <Row>
                  <F id={id} path={`${p}.count`} label="×" />
                  <F id={id} path={`${p}.dx`} label="ΔX" />
                  <F id={id} path={`${p}.dy`} label="ΔY" />
                </Row>
              )}
              {m.type === "mirrorCopy" && (
                <Row>
                  <SelectField
                    className="max-w-28"
                    value={m.axis}
                    options={[
                      { value: "x", label: "across x =" },
                      { value: "y", label: "across y =" },
                    ]}
                    onChange={(v) => set(`${p}.axis`, v)}
                  />
                  <F id={id} path={`${p}.at`} />
                </Row>
              )}
              {m.type === "copy" && (
                <>
                  <Row>
                    <F id={id} path={`${p}.dx`} label="ΔX" />
                    <F id={id} path={`${p}.dy`} label="ΔY" />
                  </Row>
                  <Row>
                    <F id={id} path={`${p}.rotate`} label="°" optional placeholder="0" />
                    <Pill on={!!m.mirrorX} onChange={(on) => set(`${p}.mirrorX`, on || undefined)}>⇋ X</Pill>
                    <Pill on={!!m.mirrorY} onChange={(on) => set(`${p}.mirrorY`, on || undefined)}>⇵ Y</Pill>
                  </Row>
                </>
              )}
              {m.type === "offset" && (
                <Row>
                  <F id={id} path={`${p}.distance`} label="D" />
                </Row>
              )}
            </div>
          </div>
        );
      })}
    </Section>
  );
}

//! Rules -----------------------------------------------------------------------------

function Rules({ node }: { node: Node }) {
  const set = useNodeSetter(node.id);
  const rules = node.rules ?? [];
  const write = (next: Rule[]) => set("rules", next.length ? next : undefined);

  return (
    <Section
      title="Visibility rules"
      defaultOpen={rules.length > 0}
      actions={
        <IconButton title="Add rule" onClick={() => write([...rules, { id: newId(), when: "width > 100", action: "hide" }])}>
          <Plus />
        </IconButton>
      }
    >
      {rules.length === 0 && <p className="text-[11px] text-muted-foreground">Show or hide this shape depending on the size. The last matching rule wins.</p>}
      {rules.map((r, i) => (
        <Row key={r.id}>
          <SelectField
            className="max-w-16"
            value={r.action}
            options={[
              { value: "hide", label: "Hide" },
              { value: "show", label: "Show" },
            ]}
            onChange={(v) => set(`rules.${i}.action`, v)}
          />
          <span className="text-[11px] text-muted-foreground">if</span>
          <RuleCondition id={node.id} index={i} />
          <IconButton title="Remove" onClick={() => write(rules.filter((_, k) => k !== i))}>
            <Trash2 />
          </IconButton>
        </Row>
      ))}
    </Section>
  );
}

function RuleCondition({ id, index }: { id: string; index: number }) {
  const binding = useNodeField(id, `rules.${index}.when`);
  // Broken rules are reported as warnings; show them like errors on the field.
  const warning = useEditor(
    (s) =>
      s.result.diagnostics.find((d) => d.target.type === "node" && d.target.id === id && d.target.field === `rules.${index}.when`)?.message,
  );
  return <ExpressionInput binding={{ ...binding, error: binding.error ?? warning }} selfId={id} showValue={false} className="flex-1" />;
}
