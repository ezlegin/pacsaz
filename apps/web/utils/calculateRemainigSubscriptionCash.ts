import { testUser } from "@/data/user";
import { formatDistance, formatDistanceToNow } from "date-fns";

export function calculateRemainigSubscriptionCash({
  user,
}: {
  user: typeof testUser;
}) {
  const remainingDays = parseInt(formatDistanceToNow(user.subscriptionEndsAt));
  const period = parseInt(
    formatDistance(user.subscriptionEndsAt, user.subscribed)
  );

  const cashPerDay = user.paid / period;
  const weOweToThem = Math.ceil((remainingDays * cashPerDay) / 1000) * 1000;

  return weOweToThem;
}
