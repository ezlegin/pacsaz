import { PaymentStatusType } from "@repo/ui/components/custom/PaymentStatus";

export function mapPaymentStatusLable(status: PaymentStatusType) {
  if (status === "failed") return "ناموفق";
  if (status === "success") return "موفق";
  if (status === "pending") return "در انتظار";
  return "کنسل شده";
}
