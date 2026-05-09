import { PlanPeriod, PlanKey } from "@repo/lib/data/plans";
import { Badge } from "@repo/ui/components/badge";

const PlanCard = ({
  planKey,
  planPeriod,
}: {
  planPeriod: PlanPeriod;
  planKey: PlanKey;
}) => {
  const keyVariant =
    planKey === "standard"
      ? "outline"
      : planKey === "pro"
        ? "lightYellow"
        : "gradient";

  const periodVariant =
    planPeriod === "monthly"
      ? "outline"
      : planPeriod === "threeMonth"
        ? "lightYellow"
        : "gradient";

  return (
    <div className="flex capitalize">
      <Badge variant={keyVariant} className="w-24 rounded-r-none">
        {planKey}
      </Badge>
      <Badge variant={periodVariant} className="w-24 rounded-l-none">
        {planPeriod}
      </Badge>
    </div>
  );
};

export default PlanCard;
