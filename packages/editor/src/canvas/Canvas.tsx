"use client";

import {
  duplicateNodes,
  findNode,
  formatNumber,
  newId,
  refExpr,
  removeNodes,
  uniqueName,
  updateNode,
  type DielineDocument,
  type Pt,
  type RenderResult,
} from "@repo/dieline-engine";
import { cn } from "@repo/ui/lib/utils";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import {
  axisAligned,
  chainOffset,
  fullChain,
  lineage,
  pickable,
  selectionBounds,
  toWorld as localToWorld,
  worldToLocalVector,
} from "../model/frames";
import { handlesFor, type Handle } from "../model/handles";
import { moveNodes } from "../model/move";
import { groupNodes, ungroupNode } from "../model/ops";
import { niceStep, snapMoving, snappedDelta, snapTargets, wouldCycle, type SnapResult, type SnapTarget } from "../model/snap";
import { useEditor, useStore } from "../state/react";
import type { View } from "../state/store";
import { DielineLayer, Grid, HighlightLayer, HitLayer, RULER_SIZE, ScreenRulers } from "./layers";
import { MeasureOverlay, type MeasureState, type MeasurePoint } from "./MeasureOverlay";
import { StatusBar } from "./StatusBar";
import { fitView, toScreen, toWorld, worldMatrix, zoomAt } from "./viewport";

/** Pixels the pointer may travel before a press becomes a drag. */
const DRAG_THRESHOLD = 3;
/** Snap distance in screen pixels. */
const SNAP_PX = 7;

type Gesture =
  | { type: "pan"; start: Pt; view: View }
  | { type: "press"; start: Pt; startWorld: Pt; id: string; wasSelected: boolean }
  | {
      type: "move";
      startWorld: Pt;
      doc: DielineDocument;
      result: RenderResult;
      ids: string[];
      moving: Pt[];
      targets: SnapTarget[];
    }
  | {
      type: "handle";
      startWorld: Pt;
      point: Pt;
      doc: DielineDocument;
      result: RenderResult;
      nodeId: string;
      handle: Handle;
      targets: SnapTarget[];
    }
  | { type: "marquee"; start: Pt; additive: boolean };

const boxPoints = (b: { minX: number; minY: number; maxX: number; maxY: number }): Pt[] => {
  const cx = (b.minX + b.maxX) / 2;
  const cy = (b.minY + b.maxY) / 2;
  return [
    [b.minX, b.minY], [cx, b.minY], [b.maxX, b.minY],
    [b.minX, cy], [cx, cy], [b.maxX, cy],
    [b.minX, b.maxY], [cx, b.maxY], [b.maxX, b.maxY],
  ];
};

export type CanvasProps = {
  className?: string;
  /** Show construction guides (panel outlines). */
  showGuides?: boolean;
  showRulers?: boolean;
};

/**
 * The interactive dieline canvas. Everything it changes goes through the editor
 * store, so the panels around it (Phase 3) stay in sync for free.
 */
export function Canvas({ className, showGuides = true, showRulers = true }: CanvasProps) {
  const store = useStore();
  const doc = useEditor((s) => s.doc);
  const result = useEditor((s) => s.result);
  const view = useEditor((s) => s.view);
  const selection = useEditor((s) => s.selection);
  const hover = useEditor((s) => s.hover);
  const scope = useEditor((s) => s.scope);
  const tool = useEditor((s) => s.tool);

  const rootRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const spaceDown = useRef(false);
  const fitted = useRef(false);

  const [size, setSize] = useState({ width: 0, height: 0 });
  const [cursor, setCursor] = useState<Pt | null>(null);
  const [guides, setGuides] = useState<SnapResult>({});
  const [marquee, setMarquee] = useState<[Pt, Pt] | null>(null);
  const [measure, setMeasure] = useState<MeasureState>({});
  const [dragging, setDragging] = useState<Gesture["type"] | null>(null);

  //! Size and initial fit -------------------------------------------------------

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fit = useCallback(
    (ids?: string[]) => {
      const { result: r } = store.get();
      const b = ids?.length ? selectionBounds(r, ids) : r.bounds;
      if (!b || !size.width || !size.height) return;
      store.setView(fitView(b, size.width, size.height, 48 + RULER_SIZE));
    },
    [store, size],
  );

  useEffect(() => {
    if (fitted.current || !size.width) return;
    fitted.current = true;
    fit();
  }, [size, fit]);

  //! Wheel: zoom with the wheel or a pinch, pan with a trackpad -------------------

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const at: Pt = [e.clientX - rect.left, e.clientY - rect.top];
      const v = store.get().view;

      // A mouse wheel moves in big line-sized steps; a trackpad in small pixel
      // deltas, often on both axes. Pinch arrives as a wheel with ctrlKey.
      const mouseWheel = e.deltaMode !== 0 || (Math.abs(e.deltaY) >= 40 && e.deltaX === 0 && Number.isInteger(e.deltaY));
      if (e.ctrlKey || e.metaKey || mouseWheel) {
        const factor = Math.exp(-e.deltaY * (e.ctrlKey && !mouseWheel ? 0.01 : 0.0015));
        store.setView(zoomAt(v, at, factor));
      } else {
        store.setView({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY });
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [store]);

  //! Derived drawing data -------------------------------------------------------

  /** Leaf ids whose geometry belongs to each selected (or hovered) node. */
  const lineages = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const p of result.paths) if (!map.has(p.nodeId)) map.set(p.nodeId, lineage(result, p.nodeId));
    return map;
  }, [result]);

  const leavesOf = useCallback(
    (ids: string[]) => {
      const set = new Set(ids);
      const out = new Set<string>();
      for (const [leaf, chain] of lineages) if (chain.some((id) => set.has(id))) out.add(leaf);
      return out;
    },
    [lineages],
  );

  const selectedLeaves = useMemo(() => leavesOf(selection), [leavesOf, selection]);
  const hoverLeaves = useMemo(() => leavesOf(hover ? [hover] : []), [leavesOf, hover]);

  const single = selection.length === 1 ? findNode(doc, selection[0]!)?.node ?? null : null;
  const handles = useMemo(() => (single ? handlesFor(single, result) : []), [single, result]);
  const handleChain = useMemo(() => (single ? fullChain(result, single.id) : []), [single, result]);

  const measureTargets = useMemo(() => (tool === "measure" ? snapTargets(result, []) : []), [tool, result]);

  //! Helpers --------------------------------------------------------------------

  const screenOf = (e: { clientX: number; clientY: number }): Pt => {
    const rect = rootRef.current!.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  };

  const leafAt = (target: EventTarget | null): string | null =>
    (target as Element | null)?.closest?.("[data-node-id]")?.getAttribute("data-node-id") ?? null;

  const handleAt = (target: EventTarget | null): string | null =>
    (target as Element | null)?.closest?.("[data-handle]")?.getAttribute("data-handle") ?? null;

  const tolerance = () => SNAP_PX / store.get().view.zoom;

  const measurePoint = (world: Pt, useSnap: boolean): MeasurePoint => {
    if (!useSnap) return { p: world };
    const snap = snapMoving([world], measureTargets, tolerance());
    const p: Pt = [snap.x?.value ?? world[0], snap.y?.value ?? world[1]];
    const target = snap.x && snap.y && snap.x.target === snap.y.target ? snap.x.target : undefined;
    return { p, target };
  };

  //! Pointer --------------------------------------------------------------------

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    rootRef.current?.focus();
    const s = screenOf(e);
    const state = store.get();
    const world = toWorld(s, state.view);

    if (e.button === 1 || (e.button === 0 && (spaceDown.current || state.tool === "hand"))) {
      e.currentTarget.setPointerCapture(e.pointerId);
      gesture.current = { type: "pan", start: s, view: state.view };
      setDragging("pan");
      return;
    }
    if (e.button !== 0) return;

    if (state.tool === "measure") {
      const point = measurePoint(world, state.snapping && !e.ctrlKey);
      setMeasure((m) => (!m.a || m.b ? { a: point } : { a: m.a, b: point }));
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);

    const handleKey = handleAt(e.target);
    const handle = handleKey ? handles.find((h) => h.key === handleKey) : undefined;
    if (handle && single) {
      store.begin();
      const point = localToWorld(handle.local, handleChain);
      gesture.current = {
        type: "handle",
        startWorld: world,
        point,
        doc: state.doc,
        result: state.result,
        nodeId: single.id,
        handle,
        targets: snapTargets(state.result, [single.id]),
      };
      setDragging("handle");
      return;
    }

    const leaf = leafAt(e.target);
    let id = leaf ? pickable(state.result, leaf, state.scope) : null;
    if (leaf && !id && state.scope) {
      // Clicked outside the entered group: leave it.
      store.setScope(null);
      id = pickable(state.result, leaf, null);
    }

    if (id) {
      const wasSelected = state.selection.includes(id);
      if (e.shiftKey) store.select([id], "toggle");
      else if (!wasSelected) store.select([id]);
      gesture.current = { type: "press", start: s, startWorld: world, id, wasSelected };
      return;
    }

    gesture.current = { type: "marquee", start: s, additive: e.shiftKey };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = screenOf(e);
    setCursor(s);
    const state = store.get();
    const world = toWorld(s, state.view);
    const g = gesture.current;

    if (!g) {
      if (state.tool === "measure") {
        const point = measurePoint(world, state.snapping && !e.ctrlKey);
        setMeasure((m) => ({ ...m, live: point }));
        return;
      }
      const leaf = leafAt(e.target);
      store.setHover(leaf ? pickable(state.result, leaf, state.scope) : null);
      return;
    }

    const snapOn = state.snapping && !e.ctrlKey;
    const step = niceStep(state.view.zoom);

    switch (g.type) {
      case "pan":
        store.setView({ ...g.view, x: g.view.x + s[0] - g.start[0], y: g.view.y + s[1] - g.start[1] });
        return;

      case "press": {
        if (Math.hypot(s[0] - g.start[0], s[1] - g.start[1]) < DRAG_THRESHOLD) return;
        const ids = store.get().selection;
        if (ids.length === 0) return;
        const bounds = selectionBounds(state.result, ids);
        if (!bounds) return;
        store.begin();
        // A single node also offers its anchors and its origin; the origin is
        // what turns into a reference when it lands on another node.
        const own =
          ids.length === 1
            ? [localToWorld([0, 0], fullChain(state.result, ids[0]!)), ...Object.values(state.result.nodes[ids[0]!]?.anchors ?? {})]
            : [];
        gesture.current = {
          type: "move",
          startWorld: g.startWorld,
          doc: state.doc,
          result: state.result,
          ids,
          moving: [...boxPoints(bounds), ...own],
          targets: snapTargets(state.result, ids),
        };
        setDragging("move");
        onPointerMove(e);
        return;
      }

      case "move": {
        const raw: Pt = [world[0] - g.startWorld[0], world[1] - g.startWorld[1]];
        const moved = g.moving.map((p): Pt => [p[0] + raw[0], p[1] + raw[1]]);
        const snap = snapOn ? snapMoving(moved, g.targets, tolerance()) : {};
        const delta = snappedDelta(raw, snap, step);
        store.preview(moveNodes(g.doc, g.result, g.ids, delta, { plain: e.altKey, snap }));
        setGuides(snap);
        return;
      }

      case "handle": {
        const raw: Pt = [world[0] - g.startWorld[0], world[1] - g.startWorld[1]];
        const at: Pt = [g.point[0] + raw[0], g.point[1] + raw[1]];
        const snap = snapOn ? snapMoving([at], g.targets, tolerance()) : {};
        const delta = snappedDelta(raw, snap, step);
        const chain = fullChain(g.result, g.nodeId);
        const local = worldToLocalVector(delta, chain);

        // A snapped absolute point becomes a reference when the node's frame is
        // the world frame and the link would not loop back.
        const refs: { x?: string; y?: string } = {};
        if (g.handle.absolute && !e.altKey && axisAligned(chain)) {
          const offset = chainOffset(chain);
          (["x", "y"] as const).forEach((axis, i) => {
            const sn = snap[axis];
            if (sn && offset[i] === 0 && !wouldCycle(g.doc, g.result, g.nodeId, sn.target.nodeId, "geometry")) {
              refs[axis] = refExpr(sn.target.nodeName, sn.target.anchor, axis);
            }
          });
        }

        store.preview(updateNode(g.doc, g.nodeId, (n) => g.handle.apply(n, local, { plain: e.altKey, refs })));
        setGuides(snap);
        return;
      }

      case "marquee":
        setMarquee([g.start, s]);
        return;
    }
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    gesture.current = null;
    setDragging(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (!g) return;

    const state = store.get();
    switch (g.type) {
      case "press":
        // A plain click on one of several selected nodes narrows to it.
        if (g.wasSelected && !e.shiftKey && state.selection.length > 1) store.select([g.id]);
        return;

      case "move":
      case "handle":
        store.end();
        setGuides({});
        return;

      case "marquee": {
        setMarquee(null);
        const end = screenOf(e);
        if (Math.hypot(end[0] - g.start[0], end[1] - g.start[1]) < DRAG_THRESHOLD) {
          if (!g.additive) store.select([]);
          return;
        }
        const a = toWorld(g.start, state.view);
        const b = toWorld(end, state.view);
        const box = { minX: Math.min(a[0], b[0]), maxX: Math.max(a[0], b[0]), minY: Math.min(a[1], b[1]), maxY: Math.max(a[1], b[1]) };
        const ids = Object.values(state.result.nodes)
          .filter((n) => n.visible && (n.parentId ?? null) === state.scope && n.bounds)
          .filter((n) => n.bounds!.minX <= box.maxX && n.bounds!.maxX >= box.minX && n.bounds!.minY <= box.maxY && n.bounds!.maxY >= box.minY)
          .map((n) => n.id);
        store.select(ids, g.additive ? "add" : "replace");
        return;
      }
    }
  };

  const onDoubleClick = (e: MouseEvent) => {
    const state = store.get();
    const leaf = leafAt(e.target);
    if (!leaf) return;
    const id = pickable(state.result, leaf, state.scope);
    if (id && state.result.nodes[id]?.kind === "group") {
      store.setScope(id);
      const child = pickable(state.result, leaf, id);
      store.select(child ? [child] : []);
    }
  };

  //! Keyboard -------------------------------------------------------------------

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const state = store.get();
    const mod = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();

    if (e.key === " ") {
      spaceDown.current = true;
      e.preventDefault();
      return;
    }

    if (mod && key === "z") {
      e.preventDefault();
      if (e.shiftKey) store.redo();
      else store.undo();
      return;
    }
    if (mod && key === "y") {
      e.preventDefault();
      store.redo();
      return;
    }
    if (mod && key === "a") {
      e.preventDefault();
      store.select(Object.values(state.result.nodes).filter((n) => (n.parentId ?? null) === state.scope).map((n) => n.id));
      return;
    }
    if (mod && key === "d") {
      e.preventDefault();
      if (!state.selection.length) return;
      const { doc: next, ids } = duplicateNodes(state.doc, state.selection);
      store.apply(() => next, ids);
      return;
    }
    if (mod && key === "g") {
      e.preventDefault();
      if (e.shiftKey) {
        const groups = state.selection.filter((id) => state.result.nodes[id]?.kind === "group");
        let next = state.doc;
        const ids: string[] = [];
        for (const id of groups) {
          const r = ungroupNode(next, id);
          if (r) {
            next = r.doc;
            ids.push(...r.ids);
          }
        }
        if (ids.length) store.apply(() => next, ids);
      } else {
        const r = groupNodes(state.doc, state.result, state.selection);
        if (r) store.apply(() => r.doc, [r.id]);
      }
      return;
    }
    if (mod) return;

    if (e.key === "Escape") {
      if (gesture.current && store.inTransaction) {
        store.cancel();
        gesture.current = null;
        setDragging(null);
        setGuides({});
      } else if (state.tool === "measure" && (measure.a || measure.b)) setMeasure({});
      else if (state.selection.length) store.select([]);
      else if (state.scope) store.setScope(state.result.nodes[state.scope]?.parentId ?? null);
      return;
    }

    if (e.key === "Delete" || e.key === "Backspace") {
      if (state.selection.length) store.apply((d) => removeNodes(d, state.selection), []);
      return;
    }

    if (e.key === "Enter" && state.selection.length === 1) {
      const id = state.selection[0]!;
      const node = findNode(state.doc, id)?.node;
      if (node?.kind === "group") {
        store.setScope(id);
        store.select(node.children.slice(0, 1).map((c) => c.id));
      }
      return;
    }

    const arrows: Record<string, Pt> = { arrowleft: [-1, 0], arrowright: [1, 0], arrowup: [0, 1], arrowdown: [0, -1] };
    const dir = arrows[key];
    if (dir) {
      e.preventDefault();
      if (!state.selection.length) return;
      const amount = e.shiftKey ? 10 : e.altKey ? 0.1 : 1;
      store.apply((d) => moveNodes(d, state.result, state.selection, [dir[0] * amount, dir[1] * amount]));
      return;
    }

    if (key === "v") store.setTool("select");
    else if (key === "m") store.setTool("measure");
    else if (key === "h") store.setTool("hand");
    else if (key === "f" || (e.shiftKey && e.key === "!")) fit();
    else if (e.shiftKey && e.key === "@") fit(state.selection);
    else if (key === "s") store.setSnapping(!state.snapping);
    else if (key === "=" || key === "+") store.setView(zoomAt(state.view, [size.width / 2, size.height / 2], 1.25));
    else if (key === "-") store.setView(zoomAt(state.view, [size.width / 2, size.height / 2], 0.8));
  };

  const onKeyUp = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === " ") spaceDown.current = false;
  };

  //! Measure → ruler ------------------------------------------------------------

  const addRuler = () => {
    const { a, b } = measure;
    if (!a || !b) return;
    const coord = (m: MeasurePoint, axis: "x" | "y", i: 0 | 1) =>
      m.target ? refExpr(m.target.nodeName, m.target.anchor, axis) : formatNumber(m.p[i]);
    store.apply((d) => ({
      ...d,
      rulers: [
        ...d.rulers,
        {
          id: newId(),
          name: uniqueName(d.rulers.map((r) => r.name), "ruler"),
          from: { x: coord(a, "x", 0), y: coord(a, "y", 1) },
          to: { x: coord(b, "x", 0), y: coord(b, "y", 1) },
          offset: "8",
        },
      ],
    }));
    setMeasure({});
  };

  //! Overlays -------------------------------------------------------------------

  const selBounds = selection.length ? selectionBounds(result, selection) : null;
  const scr = (p: Pt) => toScreen(p, view);

  const guideLines = (["x", "y"] as const).flatMap((axis) => {
    const g = guides[axis];
    if (!g) return [];
    const a = scr(axis === "x" ? [g.value, g.from[1]] : [g.from[0], g.value]);
    const b = scr(g.target.point);
    return [{ key: axis, a, b, target: b }];
  });

  const cursorClass =
    dragging === "pan" ? "cursor-grabbing"
    : tool === "hand" || spaceDown.current ? "cursor-grab"
    : tool === "measure" ? "cursor-crosshair"
    : dragging === "move" ? "cursor-move"
    : "cursor-default";

  const scopeName = scope ? result.nodes[scope]?.name : null;

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      className={cn("relative overflow-hidden select-none outline-none bg-background", cursorClass, className)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={() => {
        setCursor(null);
        if (!gesture.current) store.setHover(null);
      }}
      onDoubleClick={onDoubleClick}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      <svg width={size.width} height={size.height} className="absolute inset-0 block">
        <Grid view={view} width={size.width} height={size.height} />

        <g transform={worldMatrix(view)}>
          <HighlightLayer result={result} leafIds={selectedLeaves} hoverLeafIds={hoverLeaves} />
          <DielineLayer result={result} showGuides={showGuides} />
          {tool === "select" && <HitLayer result={result} />}
        </g>

        {/* Selection box and size */}
        {selBounds && dragging !== "marquee" && (() => {
          const a = scr([selBounds.minX, selBounds.maxY]);
          const b = scr([selBounds.maxX, selBounds.minY]);
          return (
            <g pointerEvents="none">
              <rect x={a[0] - 0.5} y={a[1] - 0.5} width={b[0] - a[0] + 1} height={b[1] - a[1] + 1} fill="none" stroke="rgb(37 99 235)" strokeDasharray="4 3" />
              <text x={(a[0] + b[0]) / 2} y={b[1] + 16} textAnchor="middle" fontSize={11} className="fill-blue-600">
                {formatNumber(selBounds.maxX - selBounds.minX, 1)} × {formatNumber(selBounds.maxY - selBounds.minY, 1)}
              </text>
            </g>
          );
        })()}

        {/* Anchors of the single selected node: what references can point at */}
        {single && !dragging && (
          <g pointerEvents="none">
            {Object.entries(result.nodes[single.id]?.anchors ?? {}).map(([name, p]) => {
              const s = scr(p);
              return <circle key={name} cx={s[0]} cy={s[1]} r={2} className="fill-muted-foreground/60" />;
            })}
          </g>
        )}

        {/* Shape handles */}
        {tool === "select" && single && handles.map((h) => {
          const s = scr(localToWorld(h.local, handleChain));
          return (
            <rect
              key={h.key}
              data-handle={h.key}
              x={s[0] - 4.5}
              y={s[1] - 4.5}
              width={9}
              height={9}
              rx={1.5}
              fill="white"
              stroke="rgb(37 99 235)"
              strokeWidth={1.5}
              style={{ cursor: h.cursor }}
            />
          );
        })}

        {/* Snap guides */}
        <g pointerEvents="none">
          {guideLines.map((l) => (
            <g key={l.key}>
              <line x1={l.a[0]} y1={l.a[1]} x2={l.b[0]} y2={l.b[1]} stroke="rgb(236 72 153)" strokeDasharray="3 3" />
              <path d={`M${l.target[0] - 4} ${l.target[1] - 4}l8 8m0 -8l-8 8`} stroke="rgb(236 72 153)" strokeWidth={1.5} />
            </g>
          ))}
          {(guides.x ?? guides.y) && cursor && (
            <text x={cursor[0] + 12} y={cursor[1] - 10} fontSize={11} className="fill-pink-600">
              {(guides.x ?? guides.y)!.target.nodeName}.{(guides.x ?? guides.y)!.target.anchor}
            </text>
          )}
        </g>

        {marquee && (
          <rect
            x={Math.min(marquee[0][0], marquee[1][0])}
            y={Math.min(marquee[0][1], marquee[1][1])}
            width={Math.abs(marquee[1][0] - marquee[0][0])}
            height={Math.abs(marquee[1][1] - marquee[0][1])}
            fill="rgb(59 130 246 / 0.08)"
            stroke="rgb(59 130 246)"
            pointerEvents="none"
          />
        )}

        {tool === "measure" && <MeasureOverlay measure={measure} view={view} />}

        {showRulers && <ScreenRulers view={view} width={size.width} height={size.height} cursor={cursor} />}
      </svg>

      {scopeName && (
        <div className="absolute top-7 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs text-white shadow">
          Inside <b>{scopeName}</b> · Esc to leave
        </div>
      )}

      {tool === "measure" && measure.a && measure.b && (
        <button
          type="button"
          className="absolute left-1/2 bottom-10 -translate-x-1/2 rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={addRuler}
        >
          Add as ruler
        </button>
      )}

      <StatusBar cursor={cursor ? toWorld(cursor, view) : null} />
    </div>
  );
}
