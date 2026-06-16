import { PlanStatus } from "@repo/db";
import { Badge } from "@repo/ui/components/badge";

const SubscriptionStatus = ({ status }: { status: PlanStatus }) => {
  return (
    <Badge variant={status === "active" ? "lightGreen" : "outline"}>
      <span className="capitalize">{status}</span>
    </Badge>
  );
};

export default SubscriptionStatus;
