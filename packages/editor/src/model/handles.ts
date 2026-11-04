import {
  formatNumber,
  offsetExpr,
  placePoint,
  type Expr,
  type Node,
  type NodeInfo,
  type PathNode,
  type Pt,
  type RenderResult,
} from "@repo/dieline-engine";
import { fullChain, linear, worldToLocalPoint } from "./frames";

/**
 * Direct-manipulation handles for one selected shape.
 *
 * A handle sits at a point in the node's local frame. Dragging it produces a
 * local movement `d`, which `apply` turns into edits of the node's expressions
 * (adjusting their constants, or writing plain numbers with Alt). Handles whose
 * value is an absolute coordinate (line ends, path points) can also take a
 * reference when they snap onto another node.
 */
export type Handle = {
  key: string;
  local: Pt;
  cursor: string;
  apply: (node: Node, d: Pt, options: HandleOptions) => Node;
  /** The node fields holding this point, when it is an absolute coordinate. */
  absolute?: { x: string; y: string };
};

export type HandleOptions = {
  plain: boolean;
  /** Replacement expressions for snapped axes of an absolute handle. */
  refs?: { x?: Expr; y?: Expr };
};

const adjust = (expr: Expr | undefined, current: number, delta: number, plain: boolean): Expr =>
  plain ? formatNumber(current + delta) : offsetExpr(expr ?? formatNumber(current), delta);

const dot = (a: Pt, b: Pt) => a[0] * b[0] + a[1] * b[1];
const unit = (v: Pt): Pt => {
  const len = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / len, v[1] / len];
};

const RECT_CURSORS: Record<string, string> = {
  "-1,-1": "nesw-resize",
  "0,-1": "ns-resize",
  "1,-1": "nwse-resize",
  "1,0": "ew-resize",
  "1,1": "nesw-resize",
  "0,1": "ns-resize",
  "-1,1": "nwse-resize",
  "-1,0": "ew-resize",
};

export function handlesFor(node: Node, result: RenderResult): Handle[] {
  const info = result.nodes[node.id];
  if (!info || info.failed) return [];

  const chain = fullChain(result, node.id);
  const local = (name: string): Pt | null => {
    const p = info.anchors[name];
    return p ? worldToLocalPoint(p, chain) : null;
  };

  switch (node.kind) {
    case "rect":
      return rectHandles(info);
    case "ellipse":
      return ellipseHandles(node, info);
    case "line":
      return [lineHandle("from", local("start")), lineHandle("to", local("end"))].filter(isHandle);
    case "path":
      return pathHandles(node, local);
    case "arc":
    case "polygon":
    case "star": {
      const at = local(node.kind === "arc" ? "mid" : node.kind === "star" ? "tip" : "p0");
      if (!at) return [];
      const radius = info.scalars.radius ?? 0;
      // A polygon sized by its side changes side length, not corner radius, as
      // the corner moves out: by 2·sin(π/n) per millimetre of radius.
      const bySide = node.kind === "polygon" && node.sizeBy === "side";
      const perRadius = bySide ? 2 * Math.sin(Math.PI / (info.scalars.sides ?? 3)) : 1;
      const current = bySide ? (info.scalars.side ?? 0) : radius;
      return [
        {
          key: "radius",
          local: at,
          cursor: "move",
          apply: (n, d, o) => {
            const grow = dot(d, unit(at)) * perRadius;
            return { ...n, radius: adjust((n as { radius: Expr }).radius, current, grow, o.plain) } as Node;
          },
        },
      ];
    }
    default:
      return [];
  }
}

const isHandle = (h: Handle | null): h is Handle => h !== null;

function rectHandles(info: NodeInfo): Handle[] {
  const w = info.scalars.width ?? 0;
  const h = info.scalars.height ?? 0;
  const out: Handle[] = [];

  for (const sx of [-1, 0, 1] as const) {
    for (const sy of [-1, 0, 1] as const) {
      if (sx === 0 && sy === 0) continue;

      out.push({
        key: `rect:${sx},${sy}`,
        local: [((sx + 1) / 2) * w, ((sy + 1) / 2) * h],
        cursor: RECT_CURSORS[`${sx},${sy}`]!,
        apply: (n, d, o) => {
          if (n.kind !== "rect") return n;
          // Never let a drag turn the rect inside out.
          const min = 0.5;
          const dx = sx === 1 ? Math.max(d[0], min - w) : sx === -1 ? Math.min(d[0], w - min) : 0;
          const dy = sy === 1 ? Math.max(d[1], min - h) : sy === -1 ? Math.min(d[1], h - min) : 0;

          const next = { ...n };
          if (sx !== 0) next.width = adjust(n.width, w, sx * dx, o.plain);
          if (sy !== 0) next.height = adjust(n.height, h, sy * dy, o.plain);

          // The reference point moves so the opposite side stays put: all the
          // way with the left or bottom side when it sits on the far corner,
          // along the rect's own axes (which may be rotated inside its parent).
          const origin = n.transform?.origin;
          const fx = !origin ? 0 : /right/i.test(origin) ? 1 : /left/i.test(origin) ? 0 : 0.5;
          const fy = !origin ? 0 : /top/i.test(origin) ? 1 : /bottom/i.test(origin) ? 0 : 0.5;
          const shift: Pt = [sx === -1 ? dx * (1 - fx) : sx === 1 ? dx * fx : 0, sy === -1 ? dy * (1 - fy) : sy === 1 ? dy * fy : 0];
          if (shift[0] || shift[1]) {
            const p = info.placement;
            const v = linear(shift, p);
            const at = placePoint(info.origin, p);
            const t = n.transform ?? {};
            next.transform = {
              ...t,
              ...(v[0] ? { x: adjust(t.x, at[0], v[0], o.plain) } : {}),
              ...(v[1] ? { y: adjust(t.y, at[1], v[1], o.plain) } : {}),
            };
          }
          return next;
        },
      });
    }
  }

  return out;
}

function ellipseHandles(node: Extract<Node, { kind: "ellipse" }>, info: NodeInfo): Handle[] {
  const rx = info.scalars.rx ?? 0;
  const ry = info.scalars.ry ?? 0;

  // One expression for both radii means a circle: keep it one.
  if (node.rx.trim() === node.ry.trim()) {
    return [
      {
        key: "radius",
        local: [rx, 0],
        cursor: "ew-resize",
        apply: (n, d, o) => {
          if (n.kind !== "ellipse") return n;
          const r = adjust(n.rx, rx, d[0], o.plain);
          return { ...n, rx: r, ry: r };
        },
      },
    ];
  }

  return [
    {
      key: "rx",
      local: [rx, 0],
      cursor: "ew-resize",
      apply: (n, d, o) => (n.kind === "ellipse" ? { ...n, rx: adjust(n.rx, rx, d[0], o.plain) } : n),
    },
    {
      key: "ry",
      local: [0, ry],
      cursor: "ns-resize",
      apply: (n, d, o) => (n.kind === "ellipse" ? { ...n, ry: adjust(n.ry, ry, d[1], o.plain) } : n),
    },
  ];
}

function lineHandle(end: "from" | "to", at: Pt | null): Handle | null {
  if (!at) return null;
  return {
    key: `line:${end}`,
    local: at,
    cursor: "move",
    absolute: { x: `${end}.x`, y: `${end}.y` },
    apply: (n, d, o) => {
      if (n.kind !== "line") return n;
      const p = n[end];
      return {
        ...n,
        [end]: {
          x: o.refs?.x ?? adjust(p.x, at[0], d[0], o.plain),
          y: o.refs?.y ?? adjust(p.y, at[1], d[1], o.plain),
        },
      };
    },
  };
}

/** A segment whose end is stored relative to its start. */
const isRelative = (s: PathNode["segments"][number] | undefined) =>
  !!s && (s.type === "by" || (s.type === "arc" && !!s.relative));

function pathHandles(node: PathNode, local: (name: string) => Pt | null): Handle[] {
  const out: Handle[] = [];

  const start = local("p0");
  if (start) {
    out.push({
      key: "path:start",
      local: start,
      cursor: "move",
      absolute: { x: "start.x", y: "start.y" },
      apply: (n, d, o) => {
        if (n.kind !== "path") return n;
        // Moving the start must not drag a relative first segment's end along.
        const segments = compensate(n.segments, 0, d, o.plain, local);
        return {
          ...n,
          segments,
          start: {
            x: o.refs?.x ?? adjust(n.start.x, start[0], d[0], o.plain),
            y: o.refs?.y ?? adjust(n.start.y, start[1], d[1], o.plain),
          },
        };
      },
    });
  }

  node.segments.forEach((seg, i) => {
    if (seg.type === "polar") return; // Edited through length and angle.

    const at = local(`p${i + 1}`);
    const before = local(`p${i}`);
    if (!at || !before) return;

    const relative = isRelative(seg);

    out.push({
      key: `path:${i}`,
      local: at,
      cursor: "move",
      ...(relative ? {} : { absolute: { x: `segments.${i}.x`, y: `segments.${i}.y` } }),
      apply: (n, d, o) => {
        if (n.kind !== "path") return n;
        const segments = [...n.segments];
        const s = segments[i]!;

        if (s.type === "by") {
          segments[i] = {
            ...s,
            dx: adjust(s.dx, at[0] - before[0], d[0], o.plain),
            dy: adjust(s.dy, at[1] - before[1], d[1], o.plain),
          };
        } else if (s.type === "to" || s.type === "arc") {
          const base: Pt = s.type === "arc" && s.relative ? [at[0] - before[0], at[1] - before[1]] : at;
          const absolute = !(s.type === "arc" && s.relative);
          segments[i] = {
            ...s,
            x: (absolute && o.refs?.x) || adjust(s.x, base[0], d[0], o.plain),
            y: (absolute && o.refs?.y) || adjust(s.y, base[1], d[1], o.plain),
          };
        }

        return { ...n, segments: compensate(segments, i + 1, d, o.plain, local) };
      },
    });
  });

  return out;
}

/**
 * When a point moves, a following relative segment would carry everything after
 * it along. Its offset is reduced by the same amount so later points stay put.
 */
function compensate(
  segments: PathNode["segments"],
  index: number,
  d: Pt,
  plain: boolean,
  local: (name: string) => Pt | null,
): PathNode["segments"] {
  const next = segments[index];
  if (!isRelative(next)) return segments;

  const from = local(`p${index}`);
  const to = local(`p${index + 1}`);
  if (!from || !to) return segments;
  const current: Pt = [to[0] - from[0], to[1] - from[1]];

  const copy = [...segments];
  if (next!.type === "by") {
    copy[index] = {
      ...next!,
      dx: adjust(next!.dx, current[0], -d[0], plain),
      dy: adjust(next!.dy, current[1], -d[1], plain),
    };
  } else if (next!.type === "arc") {
    copy[index] = {
      ...next!,
      x: adjust(next!.x, current[0], -d[0], plain),
      y: adjust(next!.y, current[1], -d[1], plain),
    };
  }
  return copy;
}
