import { PlanStatus } from "@repo/db";
import { Badge } from "@repo/ui/components/badge";

const SubscriptionStatus = ({
  endsAt,
  status,
}: {
  endsAt: Date;
  status: PlanStatus;
}) => {
  const isInDateRange = endsAt > new Date();
  const isActive = isInDateRange && status;

  return (
    <Badge variant={isActive ? "lightGreen" : "outline"}>
      {isActive ? "Active" : "Expired"}
    </Badge>
  );
};

export default SubscriptionStatus;
