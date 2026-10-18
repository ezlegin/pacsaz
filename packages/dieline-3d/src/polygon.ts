import type { Pt } from "./types";

/**
 * Even-odd point-in-polygon test, in flat dieline coordinates.
 *
 * Used for two things: deciding which panel owns a perforation, and detecting
 * windows (a trim loop enclosed by another panel).
 */
export const pointInPolygon = (point: Pt, polygon: Pt[]): boolean => {
  const [px, py] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]!;
    const [xj, yj] = polygon[j]!;

    const crosses = yi > py !== yj > py;
    if (!crosses) continue;

    if (px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }

  return inside;
};

/** Shoelace signed area: positive is counter-clockwise. */
export const signedArea = (points: Pt[]): number => {
  let total = 0;

  for (let i = 0; i < points.length; i++) {
    const a = points[i]!;
    const b = points[(i + 1) % points.length]!;
    total += a[0] * b[1] - b[0] * a[1];
  }

  return total / 2;
};

/** True when every vertex of `inner` lies inside `outer`. */
export const isEnclosedBy = (inner: Pt[], outer: Pt[]): boolean =>
  inner.length > 0 && inner.every((point) => pointInPolygon(point, outer));
