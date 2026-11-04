import type { RenderResult, RulerInfo } from "./render";

export type DimensionType = "manufacture" | "inner" | "outer";
export type Dimensions = { width: number; length: number; height: number };

/** Play left around a product across the box (mm in total); it needs none in height. */
export const INNER_CLEARANCE = 1;

/**
 * Turns the size a customer asks for into the size the dieline is drawn at.
 *
 * Templates are drawn at manufacturing size (the crease-to-crease distance). An
 * inner size needs room for the board on both sides, plus some clearance across
 * the box so the product slides in; an outer size loses the board on both sides.
 */
export function resolveDimensions(size: Dimensions, type: DimensionType, thickness: number): Dimensions {
  if (type === "manufacture") return { ...size };
  if (type === "outer") {
    return { width: size.width - 2 * thickness, length: size.length - 2 * thickness, height: size.height - 2 * thickness };
  }
  return {
    width: size.width + 2 * thickness + INNER_CLEARANCE,
    length: size.length + 2 * thickness + INNER_CLEARANCE,
    height: size.height + 2 * thickness,
  };
}

/**
 * The template's rulers as a customer's size reads. The drawing stays at its
 * crease-to-crease `size`; a ruler that measures one of those dimensions reports
 * it less that dimension's `delta` (crease size minus the typed size: positive
 * for inner, negative for outer). Its ends move in or out by an amount picked to
 * be seen, not to scale, because the real difference can be too small to notice.
 */
export function typedRulers(result: RenderResult, size: Dimensions, delta: Dimensions): RulerInfo[] {
  if (!delta.width && !delta.length && !delta.height) return result.rulers;
  const b = result.bounds;
  const nudge = (b ? Math.max(b.maxX - b.minX, b.maxY - b.minY) : 100) * 0.0075;
  return result.rulers.map((r) => {
    const dx = r.to[0] - r.from[0];
    const dy = r.to[1] - r.from[1];
    const len = Math.hypot(dx, dy);
    // Height may equal a width with another delta, so a ruler's direction goes first.
    const keys = ["width", "length", "height"] as const;
    const order = Math.abs(dy) > Math.abs(dx) ? [...keys].reverse() : keys;
    const key = order.find((k) => Math.abs(size[k] - r.value) < 0.01);
    if (!key || !len) return r;
    const move = Math.sign(delta[key]) * Math.min(nudge, len * 0.08);
    const ux = dx / len;
    const uy = dy / len;
    return {
      ...r,
      from: [r.from[0] + ux * move, r.from[1] + uy * move],
      to: [r.to[0] - ux * move, r.to[1] - uy * move],
      value: r.value - delta[key],
    };
  });
}
