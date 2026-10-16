/**
 * Milliseconds → the parts of a `DD : HH : MM : SS` countdown.
 *
 * Days are not folded into hours: a two-day deadline reads `02 : 00 : 00 : 00`,
 * not `48 : 00 : 00`. Everything is zero-padded so the bar does not jitter as
 * digits change, and negative input clamps to zero.
 */
export function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));

  const pad = (value: number) => String(value).padStart(2, "0");

  return {
    days: pad(Math.floor(total / 86400)),
    hours: pad(Math.floor((total % 86400) / 3600)),
    minutes: pad(Math.floor((total % 3600) / 60)),
    seconds: pad(total % 60),
    expired: total <= 0,
  };
}
