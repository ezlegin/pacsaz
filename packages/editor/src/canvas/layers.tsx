"use client";

import { closedLoops, formatNumber, LINE_STYLES, rulerPrims, type RenderResult } from "@repo/dieline-engine";
import { memo, useMemo, type JSX } from "react";
import type { View } from "../state/store";
import { groupPaths, pathsByNode } from "./paths";
import { primD, pt } from "./paths";
import { gridSteps, toScreen } from "./viewport";

/** On screen, dashes are drawn in pixels so they read the same at every zoom. */
const DASH_PX = 3;

/** The dieline itself, in world coordinates. Re-renders only when the result changes. */
export const DielineLayer = memo(function DielineLayer({
  result,
  showGuides,
}: {
  result: RenderResult;
  showGuides: boolean;
}) {
  const groups = useMemo(() => groupPaths(result.paths), [result]);

  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {groups.map((g) => {
        if (g.lineType === "guide" && !showGuides) return null;
        const style = LINE_STYLES[g.lineType];
        return (
          <path
            key={g.key}
            d={g.d}
            stroke={style.color}
            strokeWidth={1.25 * style.weight}
            strokeDasharray={style.dash.length ? style.dash.map((v) => v * DASH_PX).join(" ") : undefined}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </g>
  );
});

/**
 * The template at another size, drawn faintly behind the real one. Only tooling
 * lines are shown; guides and glue areas would just add noise.
 */
export const GhostLayer = memo(function GhostLayer({ result, color }: { result: RenderResult; color: string }) {
  const d = useMemo(
    () =>
      groupPaths(result.paths.filter((p) => p.lineType !== "guide" && p.lineType !== "glue"))
        .map((g) => g.d)
        .join(""),
    [result],
  );
  return <path d={d} fill="none" stroke={color} strokeOpacity={0.55} strokeWidth={1} strokeDasharray="5 3" vectorEffect="non-scaling-stroke" pointerEvents="none" />;
});

const DIMENSION_COLOR = "#0ea5e9";
const BLEED_COLOR = "#22c55e";

/** The bleed outline, in world coordinates. */
/**
 * The printed sheet: white inside the bleed, so the grid stops where the paper
 * would. Canvas only; exports never draw it.
 */
export const BleedSheet = memo(function BleedSheet({ result }: { result: RenderResult }) {
  const d = useMemo(
    () => closedLoops(result.bleed).filter((l) => l.length >= 3).map((l) => `M${l.map((p) => pt(p[0], p[1])).join("L")}Z`).join(""),
    [result],
  );
  if (!d) return null;
  return <path d={d} fill="#ffffff" stroke="none" pointerEvents="none" />;
});

export const BleedLayer = memo(function BleedLayer({ result }: { result: RenderResult }) {
  const d = useMemo(() => result.bleed.map(primD).join(""), [result]);
  if (!d) return null;
  return <path d={d} fill="none" stroke={BLEED_COLOR} strokeWidth={1} vectorEffect="non-scaling-stroke" pointerEvents="none" />;
});

/** The template's dimension rulers: lines in world space (inside the world group). */
export const DimensionLines = memo(function DimensionLines({ result }: { result: RenderResult }) {
  const d = useMemo(() => result.rulers.flatMap(rulerPrims).map(primD).join(""), [result]);
  if (!d) return null;
  return <path d={d} fill="none" stroke={DIMENSION_COLOR} strokeWidth={1} vectorEffect="non-scaling-stroke" pointerEvents="none" />;
});

/** Their values, in screen space so the text stays upright and readable at any zoom. */
export function DimensionLabels({ result, view }: { result: RenderResult; view: View }) {
  return (
    <g pointerEvents="none" fontSize={11} fontFamily="ui-sans-serif, system-ui" textAnchor="middle" fill={DIMENSION_COLOR}>
      {result.rulers.map((r) => {
        const dx = r.to[0] - r.from[0];
        const dy = r.to[1] - r.from[1];
        const len = Math.hypot(dx, dy) || 1;
        const normal: [number, number] = [-dy / len, dx / len];
        const mid: [number, number] = [(r.from[0] + r.to[0]) / 2 + normal[0] * r.offset, (r.from[1] + r.to[1]) / 2 + normal[1] * r.offset];
        const s = toScreen(mid, view);
        // Screen angle of the line (Y flips), turned so the text never reads upside down.
        let angle = (-Math.atan2(dy, dx) * 180) / Math.PI;
        if (angle > 90 || angle <= -90) angle += 180;
        const ox = Math.sin((angle * Math.PI) / 180) * 5;
        const oy = -Math.cos((angle * Math.PI) / 180) * 5;
        return (
          <text key={r.id} x={s[0] + ox} y={s[1] + oy} transform={`rotate(${angle} ${s[0] + ox} ${s[1] + oy})`} className="font-medium">
            {formatNumber(Math.round(r.value * 10) / 10)}
          </text>
        );
      })}
    </g>
  );
}

/**
 * Invisible wide strokes that receive pointer events, tagged with the leaf node
 * id. Separate from the visible layer so hit areas stay generous at any zoom.
 */
export const HitLayer = memo(function HitLayer({ result }: { result: RenderResult }) {
  const byNode = useMemo(() => pathsByNode(result), [result]);

  return (
    <g fill="none" stroke="transparent" pointerEvents="stroke">
      {[...byNode.entries()].map(([id, d]) => (
        <path key={id} data-node-id={id} d={d} strokeWidth={12} vectorEffect="non-scaling-stroke" />
      ))}
    </g>
  );
});

/** Soft glow under hovered and selected geometry. */
export function HighlightLayer({
  result,
  leafIds,
  hoverLeafIds,
}: {
  result: RenderResult;
  leafIds: Set<string>;
  hoverLeafIds: Set<string>;
}) {
  const byNode = useMemo(() => pathsByNode(result), [result]);

  return (
    <g fill="none" pointerEvents="none" strokeLinecap="round" strokeLinejoin="round">
      {[...hoverLeafIds].map((id) =>
        leafIds.has(id) ? null : (
          <path key={`h${id}`} d={byNode.get(id)} stroke="rgb(59 130 246 / 0.28)" strokeWidth={6} vectorEffect="non-scaling-stroke" />
        ),
      )}
      {[...leafIds].map((id) => (
        <path key={`s${id}`} d={byNode.get(id)} stroke="rgb(37 99 235 / 0.35)" strokeWidth={6} vectorEffect="non-scaling-stroke" />
      ))}
    </g>
  );
}

/** Millimetre grid with major lines every decade. Drawn in screen space. */
export function Grid({ view, width, height }: { view: View; width: number; height: number }) {
  const { minor, major } = gridSteps(view.zoom);
  const lines: { key: string; d: string; major: boolean }[] = [];

  const x0 = Math.floor(-view.x / view.zoom / minor) * minor;
  for (let wx = x0; view.x + wx * view.zoom <= width; wx += minor) {
    const sx = Math.round(view.x + wx * view.zoom) + 0.5;
    const isMajor = Math.abs(wx / major - Math.round(wx / major)) < 1e-6;
    lines.push({ key: `x${wx.toFixed(4)}`, d: `M${sx} 0V${height}`, major: isMajor });
  }

  const y0 = Math.floor((view.y - height) / view.zoom / minor) * minor;
  for (let wy = y0; view.y - wy * view.zoom >= 0; wy += minor) {
    const sy = Math.round(view.y - wy * view.zoom) + 0.5;
    const isMajor = Math.abs(wy / major - Math.round(wy / major)) < 1e-6;
    lines.push({ key: `y${wy.toFixed(4)}`, d: `M0 ${sy}H${width}`, major: isMajor });
  }

  return (
    <g pointerEvents="none">
      <path d={lines.filter((l) => !l.major).map((l) => l.d).join("")} stroke="var(--editor-grid-minor, rgb(0 0 0 / 0.045))" />
      <path d={lines.filter((l) => l.major).map((l) => l.d).join("")} stroke="var(--editor-grid-major, rgb(0 0 0 / 0.1))" />
      {/* World axes */}
      <path d={`M${view.x + 0.5} 0V${height}M0 ${view.y + 0.5}H${width}`} stroke="rgb(239 68 68 / 0.25)" />
    </g>
  );
}

const RULER = 20;

/** Rulers along the top and left edges, labelled in millimetres from world 0. */
export function ScreenRulers({
  view,
  width,
  height,
  cursor,
}: {
  view: View;
  width: number;
  height: number;
  cursor: [number, number] | null;
}) {
  // Labels at least ~60 px apart, ticks at least ~6 px apart.
  const major = gridSteps(view.zoom, 60).minor;
  const minor = gridSteps(view.zoom, 6).minor;
  const ticks: JSX.Element[] = [];

  const label = (v: number) => String(Math.round(v * 1000) / 1000);

  for (let wx = Math.floor(-view.x / view.zoom / minor) * minor; view.x + wx * view.zoom <= width; wx += minor) {
    const sx = Math.round(view.x + wx * view.zoom) + 0.5;
    if (sx < RULER) continue;
    const isMajor = Math.abs(wx / major - Math.round(wx / major)) < 1e-6;
    ticks.push(<path key={`tx${wx.toFixed(4)}`} d={`M${sx} ${isMajor ? 4 : 14}V${RULER}`} />);
    if (isMajor) ticks.push(<text key={`lx${wx.toFixed(4)}`} x={sx + 3} y={10} className="fill-current">{label(wx)}</text>);
  }

  for (let wy = Math.floor((view.y - height) / view.zoom / minor) * minor; view.y - wy * view.zoom >= 0; wy += minor) {
    const sy = Math.round(view.y - wy * view.zoom) + 0.5;
    if (sy < RULER) continue;
    const isMajor = Math.abs(wy / major - Math.round(wy / major)) < 1e-6;
    ticks.push(<path key={`ty${wy.toFixed(4)}`} d={`M${isMajor ? 4 : 14} ${sy}H${RULER}`} />);
    if (isMajor) {
      ticks.push(
        <text key={`ly${wy.toFixed(4)}`} x={10} y={sy - 3} transform={`rotate(-90 10 ${sy - 3})`} className="fill-current">
          {label(wy)}
        </text>,
      );
    }
  }

  return (
    <g pointerEvents="none" className="text-muted-foreground" fontSize={9} fontFamily="ui-sans-serif, system-ui">
      <rect x={0} y={0} width={width} height={RULER} className="fill-muted" />
      <rect x={0} y={0} width={RULER} height={height} className="fill-muted" />
      <g stroke="currentColor" strokeOpacity={0.5}>{ticks.filter((t) => t.type === "path")}</g>
      {ticks.filter((t) => t.type === "text")}
      {cursor && (
        <g stroke="rgb(37 99 235)">
          <path d={`M${cursor[0] + 0.5} 0V${RULER}`} />
          <path d={`M0 ${cursor[1] + 0.5}H${RULER}`} />
        </g>
      )}
      <rect x={0} y={0} width={RULER} height={RULER} className="fill-muted" />
      <path d={`M0 ${RULER - 0.5}H${width}M${RULER - 0.5} 0V${height}`} stroke="currentColor" strokeOpacity={0.2} />
    </g>
  );
}

export const RULER_SIZE = RULER;
