import type { LineType, Path, Prim, RenderResult } from "@repo/dieline-engine";

const RAD = Math.PI / 180;
const f = (n: number) => Math.round(n * 1e4) / 1e4;
export const pt = (x: number, y: number) => `${f(x)} ${f(y)}`;

/**
 * SVG path data in world coordinates (Y up). The canvas draws it through a
 * Y-flipping matrix, so a counter-clockwise arc is sweep-flag 1 here.
 */
export function primD(prim: Prim): string {
  switch (prim.kind) {
    case "line":
      return `M${pt(prim.a[0], prim.a[1])}L${pt(prim.b[0], prim.b[1])}`;
    case "circle": {
      const { c, r } = prim;
      return `M${pt(c[0] - r, c[1])}A${f(r)} ${f(r)} 0 1 1 ${pt(c[0] + r, c[1])}A${f(r)} ${f(r)} 0 1 1 ${pt(c[0] - r, c[1])}`;
    }
    case "arc": {
      const { c, r, start, end } = prim;
      const sweep = (((end - start) % 360) + 360) % 360 || 360;
      const a = [c[0] + r * Math.cos(start * RAD), c[1] + r * Math.sin(start * RAD)] as const;
      if (sweep >= 359.999) {
        const m = [c[0] - (a[0] - c[0]), c[1] - (a[1] - c[1])] as const;
        return `M${pt(a[0], a[1])}A${f(r)} ${f(r)} 0 1 1 ${pt(m[0], m[1])}A${f(r)} ${f(r)} 0 1 1 ${pt(a[0], a[1])}`;
      }
      const b = [c[0] + r * Math.cos(end * RAD), c[1] + r * Math.sin(end * RAD)] as const;
      return `M${pt(a[0], a[1])}A${f(r)} ${f(r)} 0 ${sweep > 180 ? 1 : 0} 1 ${pt(b[0], b[1])}`;
    }
  }
}

export type PathGroup = { key: string; nodeId: string; lineType: LineType; d: string };

/** One SVG path per node and line type, in draw order. */
export function groupPaths(paths: readonly Path[]): PathGroup[] {
  const groups = new Map<string, PathGroup>();
  for (const p of paths) {
    const key = `${p.nodeId}|${p.lineType}`;
    const g = groups.get(key);
    if (g) g.d += primD(p);
    else groups.set(key, { key, nodeId: p.nodeId, lineType: p.lineType, d: primD(p) });
  }
  return [...groups.values()];
}

/** Path data per leaf node id, for hit areas and highlights. */
export function pathsByNode(result: RenderResult): Map<string, string> {
  const out = new Map<string, string>();
  // Bend lines exist only for the 3D fold, so selecting a body must not show them.
  for (const p of result.paths) if (p.lineType !== "bend") out.set(p.nodeId, (out.get(p.nodeId) ?? "") + primD(p));
  return out;
}
