import { getSessionUser } from "@repo/auth/session";
import { prisma } from "@repo/db";
import { formatToman } from "@/utils/formatPrice";
import { SubscriptionBannerSlot } from "./SubscriptionBanner";

/**
 * Subscription prompt for the marketing pages.
 *
 * Rendered from the public layouts only, so it never appears on the panel,
 * login, onboarding or the dieline editor. It is also skipped for anyone with an
 * active plan — there is nothing to sell them.
 *
 * The price is read from the database rather than hardcoded, so the banner can
 * never advertise a figure the checkout does not honour: it is the cheapest
 * monthly price across all tariffs.
 */
const SubscriptionBanner = async () => {
  const user = await getSessionUser();
  if (user?.plan) return null;

  const cheapest = await prisma.price.findFirst({
    orderBy: { monthly: "asc" },
    select: { monthly: true },
  });

  if (!cheapest) return null;

  return <SubscriptionBannerSlot minPrice={formatToman(cheapest.monthly)} />;
};

export default SubscriptionBanner;
