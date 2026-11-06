import { getPlanState } from "@/lib/plan";
import { Plan } from "@repo/db";
import { Badge } from "@repo/ui/components/badge";

const labels = { active: "Active", expired: "Expired", inactive: "Inactive" } as const;

/**
 * The plan's real state: its stored status alone said "active" long after the
 * end date had passed.
 */
const SubscriptionStatus = ({ plan }: { plan: Pick<Plan, "status" | "endsAt"> }) => {
  const state = getPlanState(plan);
  return (
    <Badge variant={state === "active" ? "lightGreen" : state === "expired" ? "lightYellow" : "outline"}>
      {labels[state]}
    </Badge>
  );
};

export default SubscriptionStatus;
