import { sessionUser } from "@repo/store/app/user.store";
import { formatDistance } from "date-fns";

export function calculateRemaningSubscription() {
  if (!sessionUser || !sessionUser.plan) return;

  const distande = formatDistance(
    sessionUser?.plan?.endsAt,
    sessionUser?.plan?.startedAt
  );
  return parseInt(distande);
}
