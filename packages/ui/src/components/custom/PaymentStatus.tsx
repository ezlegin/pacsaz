import { Badge } from "@repo/ui/components/badge";

export type PaymentStatusType = "success" | "failed" | "canceled" | "pending";

const PaymentStatus = ({
  label,
  status,
}: {
  status: PaymentStatusType;
  label: string;
}) => {
  return (
    <Badge
      variant={
        status === "success"
          ? "lightGreen"
          : status === "failed"
            ? "lightRed"
            : status === "pending"
              ? "lightYellow"
              : "outline"
      }
      className="w-20 capitalize"
    >
      {label}
    </Badge>
  );
};

export default PaymentStatus;
