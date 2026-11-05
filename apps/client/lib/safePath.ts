/**
 * A redirect target taken from a URL, limited to this site. `//evil.com` and
 * `/\evil.com` start with a slash but browsers treat them as another host, so a
 * crafted link could otherwise send someone away after they sign in.
 */
export const safePath = (value: string | null | undefined, fallback = "/panel"): string =>
  value && /^\/(?![/\\])/.test(value) ? value : fallback;
