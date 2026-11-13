"use client";

import { allNodes, LINE_STYLES, moveNode, renameNode, updateNode, type Node, type Ruler } from "@repo/dieline-engine";
import { cn } from "@repo/ui/lib/utils";
import { ChevronDown, ChevronRight, Eye, EyeOff, Ruler as RulerIcon, Trash2 } from "lucide-react";
import { useMemo, useState, type DragEvent, type MouseEvent } from "react";
import { useEditor, useStore } from "../state/react";
import { useDocField, useDocSetter } from "../ui/bindings";
import { IconButton, NODE_ICONS, Row, Section } from "../ui/controls";
import { ExpressionInput } from "../ui/ExpressionInput";

type FlatRow = { node: Node; depth: number; parentId: string | null; index: number };
type Drop = { id: string; where: "before" | "after" | "inside" };

const NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * The layer tree. Selecting here selects on the canvas (entering the right group
 * first), hovering highlights, and rows can be dragged into, out of and between
 * groups.
 */
export function Outline() {
  const store = useStore();
  const doc = useEditor((s) => s.doc);
  const result = useEditor((s) => s.result);
  const selection = useEditor((s) => s.selection);
  const hover = useEditor((s) => s.hover);

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [drop, setDrop] = useState<Drop | null>(null);

  const rows = useMemo(() => {
    const out: FlatRow[] = [];
    const walk = (nodes: Node[], depth: number, parentId: string | null) => {
      nodes.forEach((node, index) => {
        out.push({ node, depth, parentId, index });
        if (node.kind === "group" && !collapsed.has(node.id)) walk(node.children, depth + 1, node.id);
      });
    };
    walk(doc.nodes, 0, null);
    return out;
  }, [doc, collapsed]);

  const select = (row: FlatRow, e: MouseEvent) => {
    const multi = e.shiftKey || e.ctrlKey || e.metaKey;
    // The canvas picks within one group at a time; follow the row's parent.
    if (!multi || store.get().scope !== row.parentId) store.setScope(row.parentId);
    store.select([row.node.id], multi ? "toggle" : "replace");
  };

  const rename = (node: Node, name: string) => {
    setEditing(null);
    if (name === node.name || !NAME.test(name)) return;
    if (allNodes(store.get().doc).some((n) => n.name === name)) return;
    store.apply((d) => renameNode(d, node.id, name));
  };

  const onDragOver = (row: FlatRow, e: DragEvent<HTMLDivElement>) => {
    if (!dragging || dragging === row.node.id) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const f = (e.clientY - rect.top) / rect.height;
    const where = row.node.kind === "group" && f > 0.25 && f < 0.75 ? "inside" : f < 0.5 ? "before" : "after";
    setDrop({ id: row.node.id, where });
  };

  const onDrop = (row: FlatRow) => {
    if (!dragging || !drop) return;
    const id = dragging;
    setDragging(null);
    setDrop(null);
    store.apply((d) => {
      if (drop.where === "inside" && row.node.kind === "group") return moveNode(d, id, row.node.id, row.node.children.length);
      return moveNode(d, id, row.parentId, drop.where === "before" ? row.index : row.index + 1);
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto py-1 text-xs" onMouseLeave={() => store.setHover(null)}>
        {rows.length === 0 && <p className="px-3 py-4 text-center text-muted-foreground">Nothing yet. Pick a tool on the left and draw.</p>}
        {rows.map((row) => {
          const { node, depth } = row;
          const info = result.nodes[node.id];
          const Icon = NODE_ICONS[node.kind];
          const selected = selection.includes(node.id);
          const lineType = "lineType" in node ? node.lineType : null;
          const isDrop = drop?.id === node.id;

          return (
            <div
              key={node.id}
              draggable={editing !== node.id}
              onDragStart={(e) => {
                setDragging(node.id);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragEnd={() => {
                setDragging(null);
                setDrop(null);
              }}
              onDragOver={(e) => onDragOver(row, e)}
              onDrop={() => onDrop(row)}
              onClick={(e) => select(row, e)}
              onDoubleClick={() => setEditing(node.id)}
              onMouseEnter={() => store.setHover(node.id)}
              className={cn(
                "group/row relative flex h-7 cursor-default items-center gap-1 pr-1",
                selected ? "bg-blue-500/12 text-blue-900" : hover === node.id && "bg-accent/60",
                info && !info.visible && "text-muted-foreground",
                dragging === node.id && "opacity-40",
                isDrop && drop.where === "inside" && "ring-2 ring-inset ring-blue-500",
              )}
              style={{ paddingLeft: 6 + depth * 14 }}
            >
              {isDrop && drop.where !== "inside" && (
                <span className={cn("absolute inset-x-1 h-0.5 bg-blue-500", drop.where === "before" ? "top-0" : "bottom-0")} />
              )}
              {node.kind === "group" ? (
                <button
                  type="button"
                  className="flex size-4 items-center justify-center text-muted-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCollapsed((c) => {
                      const next = new Set(c);
                      if (next.has(node.id)) next.delete(node.id);
                      else next.add(node.id);
                      return next;
                    });
                  }}
                >
                  {collapsed.has(node.id) ? <ChevronRight className="size-3" /> : <ChevronDown className="size-3" />}
                </button>
              ) : (
                <span className="w-4" />
              )}
              <Icon className="size-3.5 shrink-0 text-muted-foreground" />
              {editing === node.id ? (
                <input
                  autoFocus
                  defaultValue={node.name}
                  className="h-5 min-w-0 flex-1 rounded border bg-background px-1 font-mono text-[11px] outline-none"
                  onClick={(e) => e.stopPropagation()}
                  onBlur={(e) => rename(node, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                    if (e.key === "Escape") setEditing(null);
                  }}
                />
              ) : (
                <span className="min-w-0 flex-1 truncate">{node.label ?? node.name}</span>
              )}
              {info?.failed && <span className="size-1.5 shrink-0 rounded-full bg-red-500" title="This shape has an error" />}
              {lineType && <span className="size-2 shrink-0 rounded-full" style={{ background: LINE_STYLES[lineType].color }} title={LINE_STYLES[lineType].label} />}
              <IconButton
                className={cn(!node.hidden && "invisible group-hover/row:visible")}
                title={node.hidden ? "Show" : "Hide"}
                onClick={(e) => {
                  e.stopPropagation();
                  store.apply((d) => updateNode(d, node.id, (n) => ({ ...n, hidden: n.hidden ? undefined : true })));
                }}
              >
                {node.hidden ? <EyeOff /> : <Eye />}
              </IconButton>
            </div>
          );
        })}
        {/* Dropping below the last row moves to the end of the root. */}
        <div
          className="h-8"
          onDragOver={(e) => {
            if (dragging) {
              e.preventDefault();
              setDrop(null);
            }
          }}
          onDrop={() => {
            if (!dragging) return;
            const id = dragging;
            setDragging(null);
            store.apply((d) => moveNode(d, id, null, d.nodes.length));
          }}
        />
      </div>
      <Rulers />
    </div>
  );
}

//! Rulers ----------------------------------------------------------------------------

function Rulers() {
  const rulers = useEditor((s) => s.doc.rulers);
  const measured = useEditor((s) => s.result.rulers);
  const set = useDocSetter();
  const [open, setOpen] = useState<string | null>(null);

  if (rulers.length === 0) return null;

  return (
    <div className="max-h-[45%] overflow-y-auto border-t">
      <Section title={`Rulers (${rulers.length})`}>
        {rulers.map((r: Ruler, i) => {
          const value = measured.find((m) => m.id === r.id)?.value;
          return (
            <div key={r.id} className="rounded-md border">
              <div className="flex h-7 items-center gap-1.5 px-1.5">
                <RulerIcon className="size-3.5 text-sky-500" />
                <button type="button" className="flex-1 truncate text-left font-mono text-[11px]" onClick={() => setOpen(open === r.id ? null : r.id)}>
                  {r.name}
                </button>
                <span className="font-mono text-[11px] text-muted-foreground">{value !== undefined ? value.toFixed(1) : "—"}</span>
                <IconButton title={r.hidden ? "Show" : "Hide"} onClick={() => set(`rulers.${i}.hidden`, r.hidden ? undefined : true)}>
                  {r.hidden ? <EyeOff /> : <Eye />}
                </IconButton>
                <IconButton title="Remove" onClick={() => set("rulers", rulers.filter((_, k) => k !== i))}>
                  <Trash2 />
                </IconButton>
              </div>
              {open === r.id && (
                <div className="space-y-1 border-t p-1.5">
                  <RulerPoint index={i} id={r.id} which="from" />
                  <RulerPoint index={i} id={r.id} which="to" />
                  <Row label="Offset">
                    <RulerField index={i} id={r.id} path="offset" />
                  </Row>
                </div>
              )}
            </div>
          );
        })}
      </Section>
    </div>
  );
}

function RulerField({ index, id, path, label }: { index: number; id: string; path: string; label?: string }) {
  const binding = useDocField(`rulers.${index}.${path}`, (t) => t.type === "ruler" && t.id === id && t.field === path);
  return <ExpressionInput binding={binding} label={label} className="flex-1" />;
}

function RulerPoint({ index, id, which }: { index: number; id: string; which: "from" | "to" }) {
  return (
    // No row label: the sidebar is narrow and the expressions need the room. The
    // first pair is the start, the second the end; the tooltip says which.
    <div className="flex gap-1" title={which === "from" ? "Start point" : "End point"}>
      <RulerField index={index} id={id} path={`${which}.x`} label="X" />
      <RulerField index={index} id={id} path={`${which}.y`} label="Y" />
    </div>
  );
}
