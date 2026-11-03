import { newId, type Customization, type Cutout } from "@repo/dieline-engine";

/**
 * Pure edits of a customer's overlay. Each returns a new overlay and drops
 * entries that are back at the template's value, so a saved copy only lists what
 * the customer actually changed.
 */

const prune = <T extends object>(record: Record<string, T> | undefined, key: string, value: T | undefined) => {
  const next = { ...record };
  if (value === undefined || Object.keys(value).length === 0) delete next[key];
  else next[key] = value;
  return Object.keys(next).length ? next : undefined;
};

const withField = <K extends keyof Customization>(c: Customization, key: K, value: Customization[K]): Customization => {
  const next = { ...c };
  if (value === undefined || (Array.isArray(value) && value.length === 0)) delete next[key];
  else next[key] = value;
  return next;
};

const round = (v: number) => Math.round(v * 100) / 100;

function omit<T extends object, K extends keyof T>(value: T, ...keys: K[]): Omit<T, K> {
  const next = { ...value };
  for (const k of keys) delete next[k];
  return next;
}

/** `undefined` resets the param to the template's default. */
export function setParam(c: Customization, name: string, value: number | undefined): Customization {
  const params = { ...c.params };
  if (value === undefined) delete params[name];
  else params[name] = value;
  return withField(c, "params", Object.keys(params).length ? params : undefined);
}

/** Switches an optional part; `on` equal to the template's own state removes the entry. */
export function setPartShown(c: Customization, id: string, on: boolean, hiddenByDefault: boolean): Customization {
  const rest = omit(c.nodes?.[id] ?? {}, "hidden");
  const entry = on === !hiddenByDefault ? rest : { ...rest, hidden: !on };
  return withField(c, "nodes", prune(c.nodes, id, entry));
}


/** Sets a movable part's offset, clamped to `max` along each axis. */
export function setPartOffset(c: Customization, id: string, dx: number, dy: number, max: number): Customization {
  const clamp = (v: number) => round(Math.max(-max, Math.min(max, v)));
  const rest = omit(c.nodes?.[id] ?? {}, "dx", "dy");
  const x = clamp(dx);
  const y = clamp(dy);
  const entry = { ...rest, ...(x ? { dx: x } : {}), ...(y ? { dy: y } : {}) };
  return withField(c, "nodes", prune(c.nodes, id, entry));
}

/** Picks the part on an edge. Choosing the template's own part keeps only its args. */
export function setEdgePart(c: Customization, key: string, component: string, templateComponent: string): Customization {
  const current = c.edges?.[key];
  // Args belong to a part: switching parts starts from the new part's defaults.
  const args = current && (current.component ?? templateComponent) === component ? current.args : undefined;
  const entry = { ...(component !== templateComponent ? { component } : {}), ...(args ? { args } : {}) };
  return withField(c, "edges", prune(c.edges, key, entry));
}

/** `undefined` resets an edge arg to the part's own default. */
export function setEdgeArg(c: Customization, key: string, name: string, value: number | undefined): Customization {
  const current = c.edges?.[key] ?? {};
  const args = { ...current.args };
  if (value === undefined) delete args[name];
  else args[name] = value;
  const entry = { ...(current.component ? { component: current.component } : {}), ...(Object.keys(args).length ? { args } : {}) };
  return withField(c, "edges", prune(c.edges, key, entry));
}

export function addCutout(c: Customization, shape: Cutout["shape"], panel: string, size = 30): { customization: Customization; id: string } {
  const id = `cut_${newId()}`;
  const cutout: Cutout = { id, shape, panel, cx: 0, cy: 0, width: size, height: size };
  return { customization: withField(c, "cutouts", [...(c.cutouts ?? []), cutout]), id };
}

export function updateCutout(c: Customization, id: string, patch: Partial<Omit<Cutout, "id">>): Customization {
  const cutouts = (c.cutouts ?? []).map((cut) => {
    if (cut.id !== id) return cut;
    const next: Cutout = { ...cut, ...patch };
    for (const k of ["cx", "cy", "width", "height"] as const) next[k] = round(next[k]);
    if (!next.radius || next.shape !== "rect") delete next.radius;
    return next;
  });
  return withField(c, "cutouts", cutouts);
}

export function removeCutout(c: Customization, id: string): Customization {
  return withField(c, "cutouts", (c.cutouts ?? []).filter((cut) => cut.id !== id));
}

/** Number of changes in an overlay, for "3 changes" badges. */
export function changeCount(c: Customization): number {
  return (
    Object.keys(c.params ?? {}).length +
    Object.keys(c.nodes ?? {}).length +
    Object.keys(c.edges ?? {}).length +
    (c.cutouts?.length ?? 0)
  );
}
