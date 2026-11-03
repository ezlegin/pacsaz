"use client";

import { LINE_STYLES, type RenderResult } from "@repo/dieline-engine";
import { memo, useMemo, type JSX } from "react";
import type { View } from "../state/store";
import { groupPaths, pathsByNode } from "./paths";
import { gridSteps } from "./viewport";

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
