/**
 * Helpers for the list pages' URL state (`?page=&search=&<filter>=`).
 *
 * The search boxes and filters only wrote these params before; nothing read
 * them, so they looked like they worked and filtered nothing.
 */

/** Case-insensitive "contains" for a Prisma string filter. */
export const contains = (q: string) => ({ contains: q, mode: "insensitive" as const });

/** The trimmed search text, or undefined when there is none. */
export const searchText = (value: string | undefined) => {
  const q = value?.trim();
  return q ? q : undefined;
};

/** A filter param when it is one of the allowed values; anything else is "all". */
export const pick = <T extends string>(value: string | undefined, allowed: readonly T[]) =>
  allowed.includes(value as T) ? (value as T) : undefined;
