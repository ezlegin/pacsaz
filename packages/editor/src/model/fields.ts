/**
 * Reading and writing a value inside a node by dotted path (`segments.2.dx`),
 * the same paths the engine uses in diagnostics, so a field and its error line
 * up by construction.
 */

export function getIn(value: unknown, path: string): unknown {
  let cur = value;
  for (const key of path.split(".")) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

export function setIn<T>(value: T, path: string, next: unknown): T {
  const [key, ...rest] = path.split(".");
  if (key === undefined) return value;

  const container = (value ?? (/^\d+$/.test(key) ? [] : {})) as Record<string, unknown> | unknown[];
  const child = rest.length ? setIn((container as Record<string, unknown>)[key], rest.join("."), next) : next;

  if (Array.isArray(container)) {
    const copy = [...container];
    copy[Number(key)] = child;
    return copy as T;
  }

  const copy = { ...(container as Record<string, unknown>) };
  // Optional fields are removed rather than stored as undefined.
  if (child === undefined) delete copy[key];
  else copy[key] = child;
  return copy as T;
}
