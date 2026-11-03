import type {
  ArcNode,
  BeltNode,
  EllipseNode,
  Expr,
  LineNode,
  LineType,
  PathNode,
  PolygonNode,
  RectNode,
  ShapeNode,
  StarNode,
} from "../spec/types";
import { filletPolyline } from "./fillet";
import { angleOf, distance, mid, polar, samePoint, sub, unit, add, scale } from "./math";
import type { Prim, Pt } from "./types";

/** Evaluates expressions for a builder; `field` names the input for diagnostics. */
export type Evaluate = {
  num: (expr: Expr, field: string) => number;
  opt: (expr: Expr | undefined, field: string, fallback: number) => number;
};

export class GeometryError extends Error {
  constructor(
    message: string,
    readonly field?: string,
  ) {
    super(message);
    this.name = "GeometryError";
  }
}

/** Local geometry of one shape, plus the named points it offers to references. */
export type Built = {
  parts: { prim: Prim; lineType: LineType }[];
  anchors: Record<string, Pt>;
  scalars: Record<string, number>;
};

const positive = (value: number, field: string, what: string) => {
  if (!(value > 0)) throw new GeometryError(`${what} must be greater than 0`, field);
  return value;
};

const tag = (prims: Prim[], lineType: LineType) =>
  prims.map((prim) => ({ prim, lineType }));

export function buildShape(node: ShapeNode, ev: Evaluate): Built {
  switch (node.kind) {
    case "line":
      return line(node, ev);
    case "path":
      return path(node, ev);
    case "rect":
      return rect(node, ev);
    case "ellipse":
      return ellipse(node, ev);
    case "arc":
      return arc(node, ev);
    case "polygon":
      return polygon(node, ev);
    case "star":
      return star(node, ev);
    case "belt":
      return belt(node, ev);
  }
}

function line(node: LineNode, ev: Evaluate): Built {
  const a: Pt = [ev.num(node.from.x, "from.x"), ev.num(node.from.y, "from.y")];
  const b: Pt = [ev.num(node.to.x, "to.x"), ev.num(node.to.y, "to.y")];

  return {
    parts: tag([{ kind: "line", a, b }], node.lineType),
    anchors: { start: a, end: b, mid: mid(a, b) },
    scalars: { length: distance(a, b), angle: angleOf(sub(b, a)) },
  };
}

function rect(node: RectNode, ev: Evaluate): Built {
  const w = positive(ev.num(node.width, "width"), "width", "Width");
  const h = positive(ev.num(node.height, "height"), "height", "Height");

  // Corners in the order the radius tuple uses: bl, br, tr, tl.
  const corners: Pt[] = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];

  const radii = [0, 0, 0, 0];
  if (Array.isArray(node.radius)) {
    node.radius.forEach((r, i) => {
      radii[i] = ev.opt(r, `radius.${i}`, 0);
    });
  } else if (node.radius !== undefined) {
    radii.fill(ev.opt(node.radius, "radius", 0));
  }

  let prims: Prim[];
  if (node.openSide) {
    // Start right after the missing edge so the outline is one open chain.
    const skip = { bottom: 0, right: 1, top: 2, left: 3 }[node.openSide];
    const order = [1, 2, 3, 4].map((k) => (skip + k) % 4);
    prims = filletPolyline(
      order.map((i) => corners[i]!),
      false,
      (k) => radii[order[k]!]!,
    );
  } else {
    prims = filletPolyline(corners, true, (i) => radii[i]!);
  }

  // The rect's own corners, so a node with copy modifiers still reports the
  // rect it is built from (box anchors would cover the copies too).
  return {
    parts: tag(prims, node.lineType),
    anchors: {
      bottomLeft: [0, 0],
      bottom: [w / 2, 0],
      bottomRight: [w, 0],
      right: [w, h / 2],
      topRight: [w, h],
      top: [w / 2, h],
      topLeft: [0, h],
      left: [0, h / 2],
      center: [w / 2, h / 2],
    },
    scalars: { width: w, height: h },
  };
}

function ellipse(node: EllipseNode, ev: Evaluate): Built {
  const rx = positive(ev.num(node.rx, "rx"), "rx", "Radius X");
  const ry = positive(ev.num(node.ry, "ry"), "ry", "Radius Y");

  const ends = { east: [rx, 0] as Pt, north: [0, ry] as Pt };

  if (Math.abs(rx - ry) < 1e-9) {
    return {
      parts: tag([{ kind: "circle", c: [0, 0], r: rx }], node.lineType),
      anchors: ends,
      scalars: { radius: rx, rx, ry },
    };
  }

  // A true ellipse is not made of circular arcs. A fine polyline is exact
  // enough for a cutting die (well under a tenth of a millimetre for boxes).
  const steps = 128;
  const pts: Pt[] = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * 2 * Math.PI;
    pts.push([rx * Math.cos(t), ry * Math.sin(t)]);
  }

  return {
    parts: tag(filletPolyline(pts, true, () => 0), node.lineType),
    anchors: ends,
    scalars: { rx, ry },
  };
}

function arc(node: ArcNode, ev: Evaluate): Built {
  const r = positive(ev.num(node.radius, "radius"), "radius", "Radius");
  const start = ev.num(node.start, "start");
  const end = ev.num(node.end, "end");

  return {
    parts: tag([{ kind: "arc", c: [0, 0], r, start, end }], node.lineType),
    anchors: {
      start: polar(start, r),
      end: polar(end, r),
      mid: polar(start + (((end - start) % 360) + 360) % 360 / 2, r),
    },
    scalars: { radius: r },
  };
}

function regularPoints(count: number, radius: number, angle: number): Pt[] {
  return Array.from({ length: count }, (_, i) =>
    polar(angle + (i * 360) / count, radius),
  );
}

function polygon(node: PolygonNode, ev: Evaluate): Built {
  const sides = Math.round(ev.num(node.sides, "sides"));
  if (sides < 3 || sides > 360) {
    throw new GeometryError("Sides must be between 3 and 360", "sides");
  }
  const bySide = node.sizeBy === "side";
  const size = positive(ev.num(node.radius, "radius"), "radius", bySide ? "Side" : "Radius");
  // A regular polygon's side is 2·R·sin(π/n), so the corner radius follows from it.
  const chord = 2 * Math.sin(Math.PI / sides);
  const r = bySide ? size / chord : size;
  const pts = regularPoints(sides, r, ev.opt(node.angle, "angle", 90));

  return {
    parts: tag(filletPolyline(pts, true, () => 0), node.lineType),
    anchors: Object.fromEntries(pts.map((p, i) => [`p${i}`, p])),
    scalars: { radius: r, side: r * chord, sides },
  };
}

function star(node: StarNode, ev: Evaluate): Built {
  const points = Math.round(ev.num(node.points, "points"));
  if (points < 3 || points > 180) {
    throw new GeometryError("Points must be between 3 and 180", "points");
  }
  const r = positive(ev.num(node.radius, "radius"), "radius", "Radius");

  // The regular-star inner radius (the classic pentagram for 5 points); fewer
  // points have no regular star, so they fall back to half the radius.
  const regular = r * (Math.cos((2 * Math.PI) / points) / Math.cos(Math.PI / points));
  const inner = ev.opt(node.innerRadius, "innerRadius", regular > r * 0.1 ? regular : r / 2);
  positive(inner, "innerRadius", "Inner radius");

  const angle = ev.opt(node.angle, "angle", 90);
  const pts: Pt[] = [];
  for (let i = 0; i < points * 2; i++) {
    pts.push(polar(angle + (i * 180) / points, i % 2 === 0 ? r : inner));
  }

  return {
    parts: tag(filletPolyline(pts, true, () => 0), node.lineType),
    anchors: { tip: pts[0]! },
    scalars: { radius: r, innerRadius: inner },
  };
}

function belt(node: BeltNode, ev: Evaluate): Built {
  const r1 = positive(ev.num(node.radius1, "radius1"), "radius1", "Radius 1");
  const r2 = positive(ev.num(node.radius2, "radius2"), "radius2", "Radius 2");
  const d = positive(ev.num(node.distance, "distance"), "distance", "Distance");

  if (d <= Math.abs(r1 - r2)) {
    throw new GeometryError(
      "Distance must be larger than the difference of the radii",
      "distance",
    );
  }

  // External tangents: the shared normal n satisfies n·(c2 − c1) = r1 − r2.
  const nx = (r1 - r2) / d;
  const ny = Math.sqrt(1 - nx * nx);
  const a = angleOf([nx, ny]);

  const c1: Pt = [0, 0];
  const c2: Pt = [d, 0];

  const prims: Prim[] = [
    { kind: "line", a: polar(a, r1, c1), b: polar(a, r2, c2) },
    { kind: "arc", c: c2, r: r2, start: -a, end: a },
    { kind: "line", a: polar(-a, r2, c2), b: polar(-a, r1, c1) },
    { kind: "arc", c: c1, r: r1, start: a, end: 360 - a },
  ];

  return {
    parts: tag(prims, node.lineType),
    anchors: { center1: c1, center2: c2 },
    scalars: {},
  };
}

//! Paths ------------------------------------------------------------------------

function path(node: PathNode, ev: Evaluate): Built {
  const start: Pt = [ev.num(node.start.x, "start.x"), ev.num(node.start.y, "start.y")];
  const parts: Built["parts"] = [];
  const vertices: Pt[] = [start];

  // A run is a stretch of straight segments of one line type; corners inside a
  // run can be rounded. Arcs and line-type changes end the current run. It lives
  // in an object because the closures below reassign it.
  type Run = { points: Pt[]; radii: number[]; lineType: LineType };
  const state: { run: Run | null } = { run: null };
  let current = start;

  const flush = (closed = false) => {
    const run = state.run;
    if (run && run.points.length >= 2) {
      parts.push(
        ...tag(filletPolyline(run.points, closed, (i) => run.radii[i] ?? 0), run.lineType),
      );
    }
    state.run = null;
  };

  node.segments.forEach((seg, i) => {
    const field = `segments.${i}`;
    const lineType = seg.lineType ?? node.lineType;
    const round = ev.opt(seg.round, `${field}.round`, 0);

    if (seg.type === "arc") {
      flush();
      const target: Pt = seg.relative
        ? [current[0] + ev.num(seg.x, `${field}.x`), current[1] + ev.num(seg.y, `${field}.y`)]
        : [ev.num(seg.x, `${field}.x`), ev.num(seg.y, `${field}.y`)];
      const r = positive(ev.num(seg.radius, `${field}.radius`), `${field}.radius`, "Radius");
      const built = arcThrough(current, target, r, !!seg.clockwise, !!seg.large);
      if (built) parts.push({ prim: built, lineType });
      current = target;
      vertices.push(current);
      return;
    }

    let next: Pt;
    switch (seg.type) {
      case "to":
        next = [ev.num(seg.x, `${field}.x`), ev.num(seg.y, `${field}.y`)];
        break;
      case "by":
        next = [current[0] + ev.num(seg.dx, `${field}.dx`), current[1] + ev.num(seg.dy, `${field}.dy`)];
        break;
      case "polar":
        next = polar(ev.num(seg.angle, `${field}.angle`), ev.num(seg.length, `${field}.length`), current);
        break;
    }

    if (state.run && state.run.lineType !== lineType) flush();
    const run = (state.run ??= { points: [current], radii: [0], lineType });

    run.points.push(next);
    // `round` rounds the corner at the end of this segment.
    run.radii.push(round);
    current = next;
    vertices.push(current);
  });

  if (node.closed) {
    const run = state.run;
    const singleRun =
      run !== null && parts.length === 0 && run.points.length === node.segments.length + 1;

    if (run && singleRun) {
      // A path drawn back onto its start already has the closing edge; drop the
      // duplicate point and carry its rounding over to vertex 0.
      if (run.points.length > 3 && samePoint(run.points[0]!, run.points[run.points.length - 1]!)) {
        run.points.pop();
        run.radii[0] = run.radii.pop() ?? 0;
      }
      flush(true);
    } else {
      flush();
      if (!samePoint(current, start)) {
        parts.push({ prim: { kind: "line", a: current, b: start }, lineType: node.lineType });
      }
    }
  } else {
    flush();
  }

  return {
    parts,
    anchors: {
      start,
      end: current,
      ...Object.fromEntries(vertices.map((p, i) => [`p${i}`, p])),
    },
    scalars: {},
  };
}

/**
 * The arc of radius `r` from `from` to `to`. Without `large` it is the short
 * way round. A radius smaller than half the chord is grown to fit (a half circle)
 * rather than rejected, so dragging the end point never breaks the path.
 */
export function arcThrough(from: Pt, to: Pt, r: number, clockwise: boolean, large: boolean): Prim | null {
  const chord = distance(from, to);
  if (chord < 1e-9) return null;

  const radius = Math.max(r, chord / 2);
  const h = Math.sqrt(Math.max(0, radius * radius - (chord / 2) ** 2));
  const m = mid(from, to);
  const dir = unit(sub(to, from));
  const left: Pt = [-dir[1], dir[0]];

  // For a counter-clockwise short arc the centre is on the left of the chord.
  const centreOnLeft = clockwise === large;
  const c = add(m, scale(left, centreOnLeft ? h : -h));

  const a1 = angleOf(sub(from, c));
  const a2 = angleOf(sub(to, c));

  return clockwise
    ? { kind: "arc", c, r: radius, start: a2, end: a1 }
    : { kind: "arc", c, r: radius, start: a1, end: a2 };
}
