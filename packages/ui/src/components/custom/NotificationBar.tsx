"use client";

import { formatCountdown } from "@repo/ui/lib/formatCountdown";
import { cn } from "@repo/ui/lib/utils";
import { useEffect, useState, type ReactNode } from "react";

/**
 * Height of the bar.
 *
 * `data-notification-bar` is what the `body:has(...)` rule in globals.css keys
 * off to offset the fixed sidebars and the full-height page containers, and
 * `--notification-bar-height` is the single source of truth for both this height
 * and that offset.
 */
type Props = {
  text: string;
  /**
   * Deadline for the live countdown. The server only renders the bar while this
   * is in the future; the component also removes itself once the clock passes it.
   */
  expiresAt?: string | number | Date | null;
  /**
   * Optional call to action. The app renders it so the link can use `next/link`,
   * which cannot live in this shared package.
   */
  children?: ReactNode;
  className?: string;
};

const NotificationBar = ({ text, expiresAt, children, className }: Props) => {
  const target = expiresAt ? new Date(expiresAt).getTime() : null;

  /**
   * Null until mounted. "Now" differs between the server and the browser, so
   * computing the countdown during the first render would make the two disagree
   * and React would report a hydration mismatch. Until then the timer shows a
   * placeholder, which also keeps the bar's width stable as it fills in.
   */
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());

    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const countdown =
    target !== null && now !== null ? formatCountdown(target - now) : null;

  if (countdown?.expired) return null;

  // Placeholders keep the boxes the same width before the clock has mounted.
  const segments = countdown
    ? [countdown.days, countdown.hours, countdown.minutes, countdown.seconds]
    : ["--", "--", "--", "--"];

  return (
    <div
      dir="auto"
      data-notification-bar
      className={cn(
        "flex h-[var(--notification-bar-height)] items-center justify-center gap-2 overflow-hidden bg-linear-to-r from-primary via-primary/90 to-primary/75 px-3 text-xs text-primary-foreground sm:gap-3 sm:text-sm",
        className,
      )}
    >
      <p className="min-w-0 truncate">{text}</p>

      {target !== null && (
        <span dir="ltr" className="flex shrink-0 items-center gap-1">
          {segments.map((value, index) => (
            <span key={index} className="flex items-center gap-1">
              {index > 0 && (
                <span aria-hidden className="opacity-40">
                  :
                </span>
              )}
              <span className="min-w-7 rounded-md bg-primary-foreground/15 px-1 py-0.5 text-center font-semibold tabular-nums">
                {value}
              </span>
            </span>
          ))}
        </span>
      )}

      {children}
    </div>
  );
};

export default NotificationBar;
