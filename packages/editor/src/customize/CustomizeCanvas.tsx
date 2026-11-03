"use client";

import type { Bounds, Pt, RenderResult } from "@repo/dieline-engine";
import { Maximize, Minus, Plus } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { DielineLayer, HighlightLayer, HitLayer } from "../canvas/layers";
import { fitView, toScreen, toWorld, worldMatrix, zoomAt } from "../canvas/viewport";
import type { View } from "../state/store";

/** Something the customer can pick on the drawing: a window or a movable part. */
export type CanvasTarget = { id: string; draggable: boolean };

const DRAG_THRESHOLD = 3;

type Gesture =
  | { type: "pan"; start: Pt; view: View }
  | { type: "press"; id: string; start: Pt; world: Pt; dragging: boolean };

/**
 * The customer's view of the dieline: pan, zoom, pick a window or a movable part,
 * and drag it. It knows nothing about the overlay; the panel turns the world
 * delta of a drag into an edit.
 */
export function CustomizeCanvas({
  result,
  targets,
  selected,
  region,
  onSelect,
  onDrag,
  onDragEnd,
  fitLabel,
}: {
  result: RenderResult;
  targets: CanvasTarget[];
  selected: string | null;
  /** Where the selected window may go, drawn as a dashed box. */
  region: Bounds | null;
  onSelect: (id: string | null) => void;
  /** Called during a drag with the world delta since the drag began. */
  onDrag: (id: string, delta: Pt) => void;
  onDragEnd: () => void;
  fitLabel: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [view, setView] = useState<View>({ x: 0, y: 0, zoom: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const gesture = useRef<Gesture | null>(null);
  const fitted = useRef(false);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fit = useCallback(() => {
    if (result.bounds && size.width && size.height) setView(fitView(result.bounds, size.width, size.height, 40));
  }, [result.bounds, size]);

  // Fit once the drawing and the viewport are both known; later changes keep the view.
  useEffect(() => {
    if (fitted.current || !result.bounds || !size.width) return;
    fitted.current = true;
    fit();
  }, [fit, result.bounds, size.width]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const at: Pt = [e.clientX - rect.left, e.clientY - rect.top];
      // Pinch arrives as a wheel with ctrlKey; a trackpad scrolls in small pixel steps on both axes.
      const mouseWheel = e.deltaMode !== 0 || (Math.abs(e.deltaY) >= 40 && e.deltaX === 0 && Number.isInteger(e.deltaY));
      setView((v) =>
        e.ctrlKey || e.metaKey || mouseWheel
          ? zoomAt(v, at, Math.exp(-e.deltaY * (e.ctrlKey && !mouseWheel ? 0.01 : 0.0015)))
          : { ...v, x: v.x - e.deltaX, y: v.y - e.deltaY },
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  /** Target owning a leaf: the leaf itself or its nearest listed ancestor. */
  const ownerOf = useMemo(() => {
    const ids = new Set(targets.map((t) => t.id));
    return (leaf: string): string | null => {
      for (let id: string | null = leaf; id; id = result.nodes[id]?.parentId ?? null) {
        if (ids.has(id)) return id;
      }
      return null;
    };
  }, [targets, result.nodes]);

  const leavesOf = useCallback(
    (id: string | null) => {
      const set = new Set<string>();
      if (!id) return set;
      for (const leaf of Object.keys(result.nodes)) if (ownerOf(leaf) === id) set.add(leaf);
      return set;
    },
    [result.nodes, ownerOf],
  );

  const local = (e: PointerEvent): Pt => {
    const r = rootRef.current!.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.button !== 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const at = local(e);
    const leaf = (e.target as Element).closest?.("[data-node-id]")?.getAttribute("data-node-id");
    const id = leaf && e.button === 0 ? ownerOf(leaf) : null;
    gesture.current = id ? { type: "press", id, start: at, world: toWorld(at, view), dragging: false } : { type: "pan", start: at, view };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    const at = local(e);
    if (!g) {
      const leaf = (e.target as Element).closest?.("[data-node-id]")?.getAttribute("data-node-id");
      setHover(leaf ? ownerOf(leaf) : null);
      return;
    }
    if (g.type === "pan") {
      setView({ ...g.view, x: g.view.x + at[0] - g.start[0], y: g.view.y + at[1] - g.start[1] });
      return;
    }
    const target = targets.find((t) => t.id === g.id);
    if (!target?.draggable) return;
    if (!g.dragging && Math.hypot(at[0] - g.start[0], at[1] - g.start[1]) < DRAG_THRESHOLD) return;
    if (!g.dragging) {
      g.dragging = true;
      onSelect(g.id);
    }
    const w = toWorld(at, view);
    onDrag(g.id, [w[0] - g.world[0], w[1] - g.world[1]]);
  };

  const onPointerUp = () => {
    const g = gesture.current;
    gesture.current = null;
    if (!g) return;
    if (g.type === "press") {
      if (g.dragging) onDragEnd();
      else onSelect(g.id);
    } else if (Math.hypot(view.x - g.view.x, view.y - g.view.y) < DRAG_THRESHOLD) {
      onSelect(null);
    }
  };

  const regionBox = region && (() => {
    const a = toScreen([region.minX, region.maxY], view);
    const b = toScreen([region.maxX, region.minY], view);
    return { x: a[0], y: a[1], width: Math.max(0, b[0] - a[0]), height: Math.max(0, b[1] - a[1]) };
  })();

  const hoverLeaves = useMemo(() => leavesOf(hover), [leavesOf, hover]);
  const selectedLeaves = useMemo(() => leavesOf(selected), [leavesOf, selected]);

  // Windows and movable parts can be grabbed anywhere inside, not only on their
  // outline. Outlines are separate segments with no fill, so the box stands in.
  const grabbable = useMemo(
    () => Object.values(result.nodes).filter((n) => n.visible && n.bounds && ownerOf(n.id)),
    [result.nodes, ownerOf],
  );

  const zoomBy = (factor: number) => setView((v) => zoomAt(v, [size.width / 2, size.height / 2], factor));

  return (
    <div
      ref={rootRef}
      dir="ltr"
      className="relative h-full w-full touch-none select-none overflow-hidden"
      style={{ cursor: hover ? (targets.find((t) => t.id === hover)?.draggable ? "move" : "pointer") : "grab" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={() => setHover(null)}
    >
      <svg width={size.width} height={size.height} className="absolute inset-0">
        {regionBox && (
          <rect {...regionBox} fill="rgb(37 99 235 / 0.05)" stroke="rgb(37 99 235 / 0.6)" strokeDasharray="4 3" pointerEvents="none" />
        )}
        <g transform={worldMatrix(view)}>
          <DielineLayer result={result} showGuides={false} />
          <HighlightLayer result={result} leafIds={selectedLeaves} hoverLeafIds={hoverLeaves} />
          <HitLayer result={result} />
          <g fill="transparent" pointerEvents="all">
            {grabbable.map(({ id, bounds: b }) => (
              <rect key={id} data-node-id={id} x={b!.minX} y={b!.minY} width={b!.maxX - b!.minX} height={b!.maxY - b!.minY} />
            ))}
          </g>
        </g>
      </svg>

      <div className="absolute bottom-3 left-3 flex items-center gap-0.5 rounded-lg border bg-background/90 p-0.5 shadow-sm backdrop-blur">
        {[
          { Icon: Minus, label: "−", onClick: () => zoomBy(1 / 1.4) },
          { Icon: Maximize, label: fitLabel, onClick: fit },
          { Icon: Plus, label: "+", onClick: () => zoomBy(1.4) },
        ].map(({ Icon, label, onClick }) => (
          <button
            key={label}
            type="button"
            title={label}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onClick}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Icon className="size-3.5" />
          </button>
        ))}
      </div>
    </div>
  );
}
