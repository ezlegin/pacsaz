import { testUser } from "@/data/user";
import { formatDistance } from "date-fns";

export function calculateRemaningSubscription() {
  const distande = formatDistance(
    testUser.subscriptionEndsAt,
    testUser.subscribed
  );
  return parseInt(distande);
}
