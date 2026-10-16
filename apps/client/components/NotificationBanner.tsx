import { prisma } from "@repo/db";
import NotificationBar from "@repo/ui/components/custom/NotificationBar";
import Link from "next/link";

/**
 * The site-wide announcement bar, rendered by the root layout so it appears on
 * every page (including the panel).
 *
 * The row is edited in the admin panel; both apps read the same database, so an
 * edit there shows up here on the next request. Rows that are switched off or
 * whose deadline has passed are not rendered.
 */
const NotificationBanner = async () => {
  const now = new Date();

  try {
    const notification = await prisma.notificationBar.findFirst({
      where: {
        // The admin panel always writes row 1, so read exactly that row. Scanning
        // for "the first active row" instead lets a stray row shadow the value the
        // admin believes they just saved.
        id: 1,
        active: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    });

    if (!notification) return null;

    return (
      <NotificationBar
        text={notification.text}
        expiresAt={notification.expiresAt}
      >
        {notification.ctaTitle && notification.ctaLink ? (
          <Link
            href={notification.ctaLink}
            className="shrink-0 rounded-full bg-primary-foreground/15 px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors hover:bg-primary-foreground/25"
          >
            {notification.ctaTitle}
          </Link>
        ) : null}
      </NotificationBar>
    );
  } catch (error) {
    // A pending migration or an unreachable database must not take down every
    // page in the app: no notification is preferable to no site.
    console.error("Could not load the notification bar:", error);
    return null;
  }
};

export default NotificationBanner;
