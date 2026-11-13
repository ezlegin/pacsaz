import type { FoldRig } from "./types";

/**
 * When each panel folds during the 0–1 fold animation, and how far.
 *
 * Folding everything at once looks like a box imploding; a person closes a
 * carton in steps, and the order is what keeps panels from passing through
 * each other:
 *
 * 1. The body panels one at a time. The glue flap goes first, so the panel at
 *    the far end of the chain closes onto it last.
 * 2. The bottom flaps, then the top flaps. On each side the dust flaps fold
 *    first, then flaps hinged on flaps (the tuck bends while its lid is still
 *    open), and the lid closes last, carrying the bent tuck into the box.
 *
 * A snap lock bottom has an order of its own. Its four flaps overlap, so they go
 * in one after another: the notched flap, both side flaps together, then the tab
 * flap, each pressed 20° past square. With all four there, they ease back to
 * square together. All four stay flat, so they finish in layers one board apart
 * instead of cutting through each other: the notched flap outside, the tab flap on
 * it, the side flaps within. The flaps' bend lines only identify the lock.
 *
 * A gable top (flat roofs, a handle standing on them, end gussets leaning in
 * over the roofs to lock under the handle's ears) closes: handles up, roofs
 * pressed a little past flat, gussets in, then the roofs ease back so the
 * ears catch in the gussets' slits. Opening is a person's order: push the
 * roofs in to free the lock, open the gussets, then the roofs.
 *
 * Viewers start closed, so dragging the slider back reverses this: the lid
 * opens, the tuck straightens, the dust flaps open, the bottom, then the sides.
 *
 * Dust flaps under a lid, tucks, and the glue flap fold a little past square, so the
 * lid or the closing panel lands over them instead of into them.
 *
 * Everything is derived from the rig: a *body* panel hinges on a vertical fold
 * line (the creases between the panels of a carton), a *flap* on a horizontal
 * one, and a flap is "top" or "bottom" by which side of its body panel it sits.
 */

export type FoldWindow = {
  start: number;
  end: number;
  /** Fold angle at full closure (radians), when it differs from the node's own. */
  angle?: number;
  /**
   * Goes past the final angle first, then eases back to it during this window,
   * sliding `layer` board thicknesses into the box as it does.
   */
  press?: { angle: number; start: number; end: number; layer: number };
  /**
   * A corner web's half: its angle follows its wall, which rises to `web`
   * (radians) in the same window, so the web's two halves stay joined at their
   * crease the whole way (see `webAngle`), not only when the walls are up.
   */
  web?: number;
  /** The web folds into the box rather than out of the corner. */
  webIn?: boolean;
  /**
   * A web authored in a later step than its walls: it first follows the walls
   * up (during `start`–`end`), then turns on to the panel's own angle during
   * this window, both halves together as one doubled flap round the corner.
   */
  webThen?: { start: number; end: number };
};

/**
 * How far a corner web's half turns from its wall while two walls rise
 * together to `wall` over a square corner, with the web's crease on the
 * corner's diagonal. Both halves turn by the same φ. Turning out of the corner
 * their crease points meet when cos φ − sin θ · sin φ = cos θ (45° with the
 * walls upright); turning into the box, when cos φ + sin θ · sin φ = cos θ
 * (135°: both halves along the diagonal, inside). Neither is proportional to
 * θ, and a straight-line fold would part the halves by millimetres mid-step.
 */
export function webAngle(wall: number, inward = false): number {
  const s = Math.sin(wall);
  const meet = Math.acos(Math.cos(wall) / Math.sqrt(1 + s * s));
  return inward ? meet + Math.atan(s) : meet - Math.atan(s);
}

const ALWAYS: FoldWindow = { start: 0, end: 1 };

/** How far past square a dust flap or the glue flap tucks in. */
const TUCK_IN = (6 * Math.PI) / 180;
const SQUARE = Math.PI / 2;
/** How far past its final angle a snap lock flap is pressed. */
const LOCK_PRESS = (20 * Math.PI) / 180;
/** How many board thicknesses into the box each stage's flaps finish. */
/** How many board thicknesses an ear sits in from the wall edge: into the gap of a double wall. */
const EAR_LAYER = 1.5;
const LOCK_LAYER: Record<1 | 2 | 3, number> = { 1: 0, 2: 2, 3: 1 };
/**
 * How far past flat a gable's roofs are pushed in while its gussets go in.
 * The roofs turn on their outer folds, so the deeper they dip, the further
 * their inner edges draw back and part the handles standing on them: by
 * 2 · roof · (1 − cos press). At 5° a 75 mm roof parts them about 0.6 mm, less
 * than a board; at 12° it was over 3 mm, an open seam down the handle.
 */
const GABLE_PRESS = (5 * Math.PI) / 180;
/** A lone flap that closes this far short of square leans over the lids instead of under them. */
const CAP_BELOW = (75 * Math.PI) / 180;

/**
 * Folds a template authors step by step (`FoldOverride.step`) come first, in
 * their order, every panel of a step together and to its authored angle. The
 * rest keep the inferred order after them, with the time those authored panels
 * would have taken there closed up, so nothing pauses. Each authored step lasts
 * as long as the shortest inferred stage.
 */
export function foldSchedule(rig: FoldRig): FoldWindow[] {
  return timed(rig).windows;
}

/**
 * When each authored step runs on the 0–1 fold: the steps of panels and the
 * steps that only move a piece (`FoldRig.moveSteps`) alike, in order.
 */
export function stepWindows(rig: FoldRig): { step: number; start: number; end: number }[] {
  return timed(rig).steps;
}

const timings = new WeakMap<FoldRig, { windows: FoldWindow[]; steps: { step: number; start: number; end: number }[] }>();

function timed(rig: FoldRig): { windows: FoldWindow[]; steps: { step: number; start: number; end: number }[] } {
  const known = timings.get(rig);
  if (known) return known;
  const result = schedule(rig);
  timings.set(rig, result);
  return result;
}

function schedule(rig: FoldRig): { windows: FoldWindow[]; steps: { step: number; start: number; end: number }[] } {
  const inferred = inferredSchedule(rig);
  const nodes = rig.nodes;
  const stepOf = (i: number): number | undefined => {
    // A bend moves with the panel it belongs to.
    let owner = i;
    while (nodes[owner]!.kind === "bend" && nodes[owner]!.parent !== null) owner = nodes[owner]!.parent!;
    const node = nodes[owner]!;
    return node.parent === null || node.isHole ? undefined : node.step;
  };
  // A step may only move a piece; it takes its turn like any other.
  const steps = [...new Set([...nodes.map((_, i) => stepOf(i)), ...(rig.moveSteps ?? [])].filter((s): s is number => s !== undefined))].sort((a, b) => a - b);
  if (steps.length === 0) return { windows: inferred, steps: [] };

  // The time the remaining panels use, gaps closed up.
  const rest = nodes.flatMap((node, i) => {
    const w = inferred[i]!;
    if (node.parent === null || node.isHole || stepOf(i) !== undefined || w === ALWAYS) return [];
    return w.press ? [w, w.press] : [w];
  });
  const spans = rest
    .map((w) => [w.start, w.end] as [number, number])
    .filter(([a, b]) => b > a)
    .sort((a, b) => a[0] - b[0])
    .reduce<[number, number][]>((merged, [a, b]) => {
      const last = merged[merged.length - 1];
      if (last && a <= last[1] + 1e-9) last[1] = Math.max(last[1], b);
      else merged.push([a, b]);
      return merged;
    }, []);
  const covered = spans.reduce((sum, [a, b]) => sum + (b - a), 0);
  const stage = rest.length ? Math.min(...rest.map((w) => w.end - w.start).filter((d) => d > 0)) : 1;
  const total = steps.length * stage + covered;
  const authored = (steps.length * stage) / total;
  const each = authored / steps.length;
  // Inferred time, with the gaps removed, onto what is left after the authored steps.
  const later = (t: number) => {
    let before = 0;
    for (const [a, b] of spans) before += Math.max(0, Math.min(t, b) - a);
    return covered > 0 ? authored + (before / covered) * (1 - authored) : 1;
  };

  // Corner webs: a half that turns on a wall and shares an outline edge with a
  // half on the neighbouring wall, both walls rising together off one panel,
  // the halves in that step or a later one. The pair closes a loop the fold
  // tree cannot see.
  const sharesEdge = (a: number, b: number) =>
    nodes[a]!.face.outline.filter((p) => nodes[b]!.face.outline.some((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 1e-6)).length >= 2;
  const isWebHalf = (i: number) => {
    const node = nodes[i]!;
    const wall = node.parent;
    if (node.kind === "bend" || node.step === undefined || wall === null) return false;
    const wallStep = nodes[wall]!.step;
    if (wallStep === undefined || wallStep > node.step) return false;
    return nodes.some((other, j) => {
      const otherWall = other.parent;
      return (
        j !== i &&
        other.step === node.step &&
        otherWall !== null &&
        otherWall !== wall &&
        nodes[otherWall]!.parent === nodes[wall]!.parent &&
        nodes[otherWall]!.step === wallStep &&
        Math.abs(nodes[otherWall]!.angle - nodes[wall]!.angle) < 1e-6 &&
        sharesEdge(i, j)
      );
    });
  };
  const windowOfStep = (step: number): FoldWindow => {
    const k = steps.indexOf(step);
    return { start: k * each, end: (k + 1) * each };
  };

  const windows = nodes.map((node, i): FoldWindow => {
    const w = inferred[i]!;
    const step = stepOf(i);
    if (step !== undefined) {
      const window = windowOfStep(step);
      if (node.kind === "bend") return { ...window, angle: 0 };
      if (!isWebHalf(i)) return window;
      const wall = nodes[node.parent!]!;
      const rising = windowOfStep(wall.step!);
      const web = { web: wall.angle, webIn: node.valley };
      return wall.step === step ? { ...window, ...web } : { ...rising, ...web, webThen: window };
    }
    if (w === ALWAYS) return w;
    return {
      ...w,
      start: later(w.start),
      end: later(w.end),
      ...(w.press ? { press: { ...w.press, start: later(w.press.start), end: later(w.press.end) } } : {}),
    };
  });
  return { windows, steps: steps.map((step) => ({ step, ...windowOfStep(step) })) };
}

function inferredSchedule(rig: FoldRig): FoldWindow[] {
  const nodes = rig.nodes;
  const root = nodes.findIndex((n) => n.parent === null);
  if (root < 0) return nodes.map(() => ALWAYS);

  const vertical = (i: number) => {
    const a = nodes[i]!.axis;
    return Math.abs(a[1]) > Math.abs(a[0]);
  };

  // Resolve parents before children: depth order.
  const order = nodes.map((_, i) => i).filter((i) => nodes[i]!.depth >= 0).sort((a, b) => nodes[a]!.depth - nodes[b]!.depth);

  // Every piece's root: a tray's sleeve is a body of its own.
  const roots = nodes.flatMap((n, i) => (n.parent === null && !n.isHole ? [i] : []));
  const body = new Set<number>(roots);
  const group = new Map<number, { side: "top" | "bottom"; level: number }>();

  for (const i of order) {
    const node = nodes[i]!;
    if (node.parent === null || node.isHole) continue;
    const parent = node.parent;
    if (body.has(parent) && vertical(i)) {
      body.add(i);
      continue;
    }
    const inherited = group.get(parent);
    if (inherited) {
      group.set(i, { side: inherited.side, level: inherited.level + 1 });
    } else {
      // SVG coordinates: smaller y is higher on the sheet.
      const above = node.face.centroid[1] < nodes[parent]!.face.centroid[1];
      group.set(i, { side: above ? "top" : "bottom", level: 1 });
    }
  }

  const hasChildren = new Set(nodes.filter((n) => n.parent !== null && !n.isHole).map((n) => n.parent!));
  const width = (i: number) => {
    const xs = nodes[i]!.face.outline.map((p) => p[0]);
    return Math.max(...xs) - Math.min(...xs);
  };

  //! Body panels ------------------------------------------------------------------

  const rootX = nodes[root]!.face.centroid[0];
  const others = [...body].filter((i) => !roots.includes(i));
  // The glue flap: a narrow panel at an end of the chain.
  const widths = [...body].map(width).sort((a, b) => a - b);
  const median = widths[Math.floor(widths.length / 2)] ?? 0;
  const glue = others
    .filter((i) => ![...body].some((j) => nodes[j]!.parent === i) && width(i) < median * 0.6)
    .sort((a, b) => width(a) - width(b))[0];
  const glueSide = glue === undefined ? 0 : Math.sign(nodes[glue]!.face.centroid[0] - rootX);

  const panels = others
    .filter((i) => i !== glue)
    .sort((a, b) => {
      const da = nodes[a]!.depth;
      const db = nodes[b]!.depth;
      if (da !== db) return da - db;
      // At equal depth the glue side closes first, so the far end closes onto the glue last.
      const sa = Math.sign(nodes[a]!.face.centroid[0] - rootX) === glueSide ? 0 : 1;
      const sb = Math.sign(nodes[b]!.face.centroid[0] - rootX) === glueSide ? 0 : 1;
      return sa - sb || Math.abs(nodes[a]!.face.centroid[0] - rootX) - Math.abs(nodes[b]!.face.centroid[0] - rootX);
    });

  const stages: string[] = [];
  if (glue !== undefined) stages.push(`panel:${glue}`);
  for (const i of panels) stages.push(`panel:${i}`);

  //! Flaps ------------------------------------------------------------------------

  /**
   * A snap lock is the flaps that carry bends: the notched flap has one on each
   * prong, the tab flap one across its tongue, and the two left are the side flaps.
   */
  const bends = (i: number) => nodes.filter((n) => n.parent === i && n.kind === "bend").length;
  const lockStage = new Map<number, 1 | 2 | 3>();
  for (const side of ["bottom", "top"] as const) {
    const flaps = [...group.entries()].filter(([, g]) => g.side === side && g.level === 1).map(([i]) => i);
    const notched = flaps.find((i) => bends(i) === 2);
    const tab = flaps.find((i) => bends(i) === 1);
    if (notched === undefined || tab === undefined) continue;
    for (const flap of flaps) lockStage.set(flap, flap === notched ? 1 : flap === tab ? 3 : 2);
  }

  /**
   * A slotted case (FEFCO 0201) has no lid: the flaps on one side all stand
   * alone, and the outer ones hinge one board further out than the inner ones,
   * so they close over them. The inner flaps go in first, then the outer ones;
   * opening, the outer flaps lift first. Flaps on one hinge line fold together.
   */
  const outerFlaps = new Set<number>();
  for (const side of ["bottom", "top"] as const) {
    const level1 = [...group.entries()].filter(([i, g]) => g.side === side && g.level === 1 && nodes[i]!.kind !== "bend").map(([i]) => i);
    if (level1.some((i) => hasChildren.has(i) || lockStage.has(i))) continue;
    // SVG coordinates: a top hinge further out is higher (smaller y).
    const out = (i: number) => (side === "top" ? -1 : 1) * nodes[i]!.pivot[1];
    const innermost = Math.min(...level1.map(out));
    for (const i of level1) if (out(i) - innermost > 0.05) outerFlaps.add(i);
  }

  /**
   * Gussets: lone first-level flaps that close well short of square on a side
   * with a lid. They lean in over the closed lids (a gable's ends), so they go
   * after them, and the lids are held pressed past their angle until they are in.
   */
  const capFlaps = new Set<number>();
  for (const side of ["bottom", "top"] as const) {
    const level1 = [...group.entries()].filter(([i, g]) => g.side === side && g.level === 1 && nodes[i]!.kind !== "bend").map(([i]) => i);
    if (!level1.some((i) => hasChildren.has(i))) continue;
    for (const i of level1) if (!hasChildren.has(i) && !lockStage.has(i) && nodes[i]!.angle < CAP_BELOW) capFlaps.add(i);
  }
  const capped = new Set([...capFlaps].map((i) => group.get(i)!.side));

  const mirrored = mirrorStages();
  if (mirrored) return mirrored;

  // Stage of a flap: dust flaps (lone first-level flaps), then deeper flaps from
  // the deepest up, then the lids that carry them.
  const flapStage = (i: number): string => {
    const g = group.get(i)!;
    // A bend moves with its flap, so the tab is already flexed as it goes in.
    if (nodes[i]!.kind === "bend") return flapStage(nodes[i]!.parent!);
    const lock = lockStage.get(i);
    if (lock) return `${g.side}:lock${lock}`;
    if (capFlaps.has(i)) return `${g.side}:cap`;
    if (g.level === 1) return `${g.side}:${hasChildren.has(i) ? "lid" : outerFlaps.has(i) ? "outer" : "dust"}`;
    return `${g.side}:level${g.level}`;
  };
  for (const side of ["bottom", "top"] as const) {
    const mine = [...group.entries()].filter(([, g]) => g.side === side);
    const deeper = [...new Set(mine.map(([, g]) => g.level).filter((l) => l > 1))].sort((a, b) => b - a);
    const keys = [
      `${side}:lock1`,
      `${side}:lock2`,
      `${side}:lock3`,
      `${side}:settle`,
      `${side}:dust`,
      `${side}:outer`,
      ...deeper.map((l) => `${side}:level${l}`),
      `${side}:lid`,
      `${side}:cap`,
      `${side}:latch`,
    ];
    const locked = mine.some(([i]) => lockStage.has(i));
    for (const key of keys) {
      const filler = (locked && key === `${side}:settle`) || (capped.has(side) && key === `${side}:latch`);
      if (mine.some(([i]) => flapStage(i) === key) || filler) stages.push(key);
    }
  }

  /**
   * A symmetric body with no glue flap (a mailer: base in the middle, double walls
   * either side) closes like a tray: mirrored panels move together. In order:
   * both end walls; their ears; the outer side walls over the ears; the inner
   * walls, folding down into the base's slots; the lid's own flaps (and the
   * tuck's ears); then the lid; the tuck last.
   */
  function mirrorStages(): FoldWindow[] | null {
    if (glue !== undefined || lockStage.size > 0 || others.length === 0) return null;
    const near = (a: number, b: number) => Math.abs(a - b) <= Math.max(1, Math.abs(a) * 0.02);
    const offset = (i: number) => nodes[i]!.face.centroid[0] - rootX;
    const paired = others.every((i) =>
      others.some((j) => j !== i && nodes[j]!.depth === nodes[i]!.depth && near(width(j), width(i)) && near(-offset(j), offset(i))),
    );
    if (!paired) return null;

    const flaps = [...group.entries()].filter(([i]) => nodes[i]!.kind !== "bend");
    const deepest = (side: "top" | "bottom") => Math.max(0, ...flaps.filter(([, g]) => g.side === side).map(([, g]) => g.level));
    const lidSide = deepest("top") >= deepest("bottom") ? "top" : "bottom";
    const leaf = (i: number) => !hasChildren.has(i) || nodes.every((n) => n.parent !== i || n.kind === "bend" || n.isHole);

    // Stages, closing: 0 both end walls; 1 their ears; 2 the outer side walls
    // over the ears; 3 the inner walls down into the base's slots; 4 the lid's own
    // flaps; then the lid and each deeper flap carrying more.
    const INNER = 3;
    const stageOf = new Map<number, number>();
    for (const [i, g] of flaps) {
      const ear = g.level === 2 && leaf(i);
      if (g.level === 1) stageOf.set(i, 0);
      else if (g.side !== lidSide || ear) stageOf.set(i, 1);
      else if (leaf(i)) stageOf.set(i, 4);
      else stageOf.set(i, 3 + g.level);
    }
    for (const i of others) stageOf.set(i, nodes[i]!.depth === 1 ? 2 : INNER);
    // Close the numbering up, so an empty stage takes no time.
    const used = [...new Set(stageOf.values())].sort((a, b) => a - b);
    const step = 1 / used.length;
    const windowAt = (k: number): FoldWindow => {
      const n = used.indexOf(k);
      return { start: n * step, end: (n + 1) * step };
    };

    return nodes.map((node, i) => {
      if (node.parent === null || node.isHole) return ALWAYS;
      // A bend moves with its flap.
      let owner = i;
      while (nodes[owner]!.kind === "bend" && nodes[owner]!.parent !== null) owner = nodes[owner]!.parent!;
      const k = stageOf.get(owner);
      if (k === undefined) return ALWAYS;
      const window = windowAt(k);
      if (node.kind === "bend") return { ...window, angle: 0 };
      const level = group.get(i)?.level ?? 0;
      // An ear on a wall goes between the double walls that close over it, not
      // inside them: it stays square and slides off the wall's edge into the gap
      // as the inner walls come down.
      if (k === 1 && level === 2 && leaf(i)) {
        const walls = windowAt(INNER);
        return { ...window, press: { angle: node.angle, start: walls.start, end: walls.end, layer: EAR_LAYER } };
      }
      // Nothing here folds past square: the lid's side flaps and the tuck's ears
      // stand against the walls, they do not tuck under anything.
      return window;
    });
  }

  if (stages.length === 0) return nodes.map(() => ALWAYS);

  const step = 1 / stages.length;
  const windowOf = (key: string): FoldWindow => {
    const k = stages.indexOf(key);
    return k < 0 ? ALWAYS : { start: k * step, end: (k + 1) * step };
  };
  const lidOn = new Set(stages.filter((k) => k.endsWith(":lid")).map((k) => k.split(":")[0]));

  return nodes.map((node, i) => {
    if (node.parent === null) return ALWAYS;
    if (body.has(i)) {
      const window = windowOf(`panel:${i}`);
      return i === glue && !node.authored && Math.abs(node.angle - SQUARE) < 1e-6 ? { ...window, angle: node.angle + TUCK_IN } : window;
    }
    const g = group.get(i);
    if (!g) return ALWAYS;
    const window = windowOf(flapStage(i));
    if (node.kind === "bend") return { ...window, angle: 0 };
    const lock = lockStage.get(i);
    if (lock) {
      const settle = windowOf(`${g.side}:settle`);
      return {
        ...window,
        press: { angle: node.angle + LOCK_PRESS, start: settle.start, end: settle.end, layer: LOCK_LAYER[lock] },
      };
    }
    // A gable: the roofs close past flat and hold there while the gussets go in,
    // then ease back to lock. Their handles fold back up as far meanwhile (a
    // handle folds the other way from its roof, so further, not less), and stay
    // upright: nothing above the roofs moves until the roofs themselves open.
    if (capped.has(g.side) && !capFlaps.has(i)) {
      const latch = windowOf(`${g.side}:latch`);
      const lid = g.level === 1 && hasChildren.has(i);
      const onLid = g.level === 2 && group.get(node.parent!)?.level === 1 && hasChildren.has(node.parent!);
      if (lid || onLid) {
        const angle = node.angle + GABLE_PRESS;
        return { ...window, press: { angle, start: latch.start, end: latch.end, layer: 0 } };
      }
    }
    // Only an untouched square fold is deepened; an authored angle is kept.
    // Dust flaps under a lid, and a tuck on its lid, go a little past square so
    // the lid lands over the dust flaps and the tuck slides inside the box.
    const square = !node.authored && Math.abs(node.angle - SQUARE) < 1e-6;
    const dust = flapStage(i).endsWith(":dust") && lidOn.has(g.side);
    // A lid carrying flaps of its own is not a tuck: it closes square.
    return square && (dust || (g.level > 1 && !hasChildren.has(i))) ? { ...window, angle: node.angle + TUCK_IN } : window;
  });
}

/** The fold angle of a panel with this window at overall `progress`. */
export function foldAngle(window: FoldWindow, nodeAngle: number, progress: number): number {
  if (window.web !== undefined) {
    const standing = webAngle(window.web * stageProgress(window, progress), window.webIn);
    if (!window.webThen) return standing;
    return standing + (nodeAngle - standing) * stageProgress(window.webThen, progress);
  }
  const angle = window.angle ?? nodeAngle;
  const { press } = window;
  if (!press) return angle * stageProgress(window, progress);
  if (progress <= press.start) return press.angle * stageProgress(window, progress);
  return press.angle + (angle - press.angle) * stageProgress(press, progress);
}

/** How far a panel with this window has folded at overall `progress`, 0–1. */
export function stageProgress(window: FoldWindow, progress: number): number {
  if (progress <= window.start) return 0;
  if (progress >= window.end) return 1;
  return (progress - window.start) / (window.end - window.start);
}
