import type { Bounds, Pt } from "@repo/dieline-engine";
import type { View } from "../state/store";

export const MIN_ZOOM = 0.05;
export const MAX_ZOOM = 80;

export const toScreen = (p: Pt, v: View): Pt => [v.x + p[0] * v.zoom, v.y - p[1] * v.zoom];
export const toWorld = (p: Pt, v: View): Pt => [(p[0] - v.x) / v.zoom, (v.y - p[1]) / v.zoom];

/** SVG transform that draws world millimetres (Y up) into screen pixels. */
export const worldMatrix = (v: View) => `matrix(${v.zoom} 0 0 ${-v.zoom} ${v.x} ${v.y})`;

/** Zooms by `factor` keeping the world point under `screen` still. */
export function zoomAt(v: View, screen: Pt, factor: number): View {
  const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.zoom * factor));
  const world = toWorld(screen, v);
  return { zoom, x: screen[0] - world[0] * zoom, y: screen[1] + world[1] * zoom };
}

/** A view showing `bounds` centred in a `width` × `height` viewport. */
export function fitView(bounds: Bounds, width: number, height: number, padding = 48): View {
  const bw = Math.max(bounds.maxX - bounds.minX, 1);
  const bh = Math.max(bounds.maxY - bounds.minY, 1);
  const zoom = Math.min(
    MAX_ZOOM,
    Math.max(MIN_ZOOM, Math.min((width - padding * 2) / bw, (height - padding * 2) / bh)),
  );
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  return { zoom, x: width / 2 - cx * zoom, y: height / 2 + cy * zoom };
}

/**
 * Grid spacing for the current zoom: the smallest 1/2/5 × 10ⁿ mm step at least
 * `minPx` apart on screen, and the decade above it for major lines.
 */
export function gridSteps(zoom: number, minPx = 10): { minor: number; major: number } {
  const raw = minPx / zoom;
  const power = 10 ** Math.floor(Math.log10(raw));
  let minor = 10 * power;
  for (const m of [1, 2, 5]) {
    if (m * power >= raw) {
      minor = m * power;
      break;
    }
  }
  const major = 10 ** Math.ceil(Math.log10(minor * 1.0001));
  return { minor, major: major === minor ? minor * 10 : major };
}
