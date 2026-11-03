"use client";

import { formatNumber, type Pt } from "@repo/dieline-engine";
import type { SnapTarget } from "../model/snap";
import type { View } from "../state/store";
import { toScreen } from "./viewport";

export type MeasurePoint = { p: Pt; target?: SnapTarget };
export type MeasureState = { a?: MeasurePoint; b?: MeasurePoint; live?: MeasurePoint };

/** The measuring line, its readout, and the snap marker under the cursor. */
export function MeasureOverlay({ measure, view }: { measure: MeasureState; view: View }) {
  const { a, b, live } = measure;
  const end = b ?? live;

  const marker = (m: MeasurePoint | undefined, key: string) => {
    if (!m) return null;
    const s = toScreen(m.p, view);
    return m.target ? (
      <rect key={key} x={s[0] - 4} y={s[1] - 4} width={8} height={8} fill="none" stroke="rgb(236 72 153)" strokeWidth={1.5} />
    ) : (
      <circle key={key} cx={s[0]} cy={s[1]} r={3} fill="rgb(236 72 153)" />
    );
  };

  if (!a || !end) {
    return <g pointerEvents="none">{marker(live, "live")}</g>;
  }

  const sa = toScreen(a.p, view);
  const sb = toScreen(end.p, view);
  const dx = end.p[0] - a.p[0];
  const dy = end.p[1] - a.p[1];
  const length = Math.hypot(dx, dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const mid: Pt = [(sa[0] + sb[0]) / 2, (sa[1] + sb[1]) / 2];
  const label = `${formatNumber(length, 2)} mm   Δx ${formatNumber(dx, 2)}   Δy ${formatNumber(dy, 2)}   ${formatNumber(angle, 1)}°`;

  return (
    <g pointerEvents="none">
      <line x1={sa[0]} y1={sa[1]} x2={sb[0]} y2={sb[1]} stroke="rgb(236 72 153)" strokeWidth={1.5} />
      <line x1={sa[0]} y1={sa[1]} x2={sb[0]} y2={sa[1]} stroke="rgb(236 72 153 / 0.4)" strokeDasharray="3 3" />
      <line x1={sb[0]} y1={sa[1]} x2={sb[0]} y2={sb[1]} stroke="rgb(236 72 153 / 0.4)" strokeDasharray="3 3" />
      {marker(a, "a")}
      {marker(end, "b")}
      <g transform={`translate(${mid[0]} ${mid[1] - 14})`}>
        <rect x={-label.length * 3.3} y={-12} width={label.length * 6.6} height={18} rx={4} fill="rgb(17 24 39 / 0.85)" />
        <text textAnchor="middle" fontSize={11} fill="white" style={{ whiteSpace: "pre" }}>
          {label}
        </text>
      </g>
    </g>
  );
}
