import { Badge } from "@repo/ui/components/badge";

const SubscriptionStatus = ({ endsAt }: { endsAt: Date }) => {
  const isActive = endsAt > new Date();

  return (
    <Badge variant={isActive ? "lightGreen" : "outline"}>
      {isActive ? "Active" : "Expired"}
    </Badge>
  );
};

export default SubscriptionStatus;
