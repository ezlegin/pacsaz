import { mapPaymentStatusLable } from "@/utils/mapPaymentStatusLable";
import { mapPeriodLabel } from "@/utils/mapPeriodLabel";
import { mapPlanTitle } from "@/utils/mapPlanTitle";
import { Payment, Plan } from "@repo/db";
import { formatPrice } from "@repo/lib/utils/formatPrice";
import PaymentStatus from "@repo/ui/components/custom/PaymentStatus";
import { formatDate } from "date-fns";
import { CreditCard } from "lucide-react";
import { EmptyState, PanelCard, SectionHeader, Td, Th } from "../components/PanelUI";

interface PaymentType extends Payment {
  plan: Plan | null;
}

const fa = (value: number) =>
  Math.round(value).toLocaleString("fa-IR", { useGrouping: false });

const COLUMNS = [
  "شناسه",
  "پلن",
  "دوره",
  "مبلغ",
  "تخفیف",
  "قابل پرداخت",
  "کد تخفیف",
  "تاریخ",
  "وضعیت",
];

function PaymentsList({ data }: { data: PaymentType[] }) {
  return (
    <PanelCard>
      <SectionHeader
        icon={CreditCard}
        title="تاریخچه پرداخت‌ها"
        description="همه‌ی تراکنش‌های اشتراک تو"
      />

      {data.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="هنوز پرداختی ثبت نشده است"
          description="بعد از فعال‌سازی اولین اشتراک، تراکنش‌ها به همراه وضعیت و مبلغ در همین جدول نمایش داده می‌شوند."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/40">
              <tr>
                {COLUMNS.map((label, index) => (
                  <Th key={label} className={index === 0 ? "" : "text-center"}>
                    {label}
                  </Th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y">
              {data.map((payment) => (
                <tr
                  key={payment.id}
                  className="transition-colors hover:bg-primary/[0.03]"
                >
                  <Td className="font-bold text-muted-foreground">
                    #{fa(payment.id)}
                  </Td>

                  <Td className="text-center font-medium">
                    {payment.plan ? mapPlanTitle(payment.plan.key) : "—"}
                  </Td>

                  <Td className="text-center">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[11px]">
                      {mapPeriodLabel(payment.period)}
                    </span>
                  </Td>

                  <Td className="text-center text-muted-foreground">
                    {formatPrice(payment.amount, false, "fa")}
                  </Td>

                  <Td className="text-center">
                    {payment.discountCodeAmount ? (
                      <span className="font-medium text-green-600">
                        − {formatPrice(payment.discountCodeAmount, false, "fa")}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </Td>

                  <Td className="text-center font-extrabold text-primary">
                    {formatPrice(payment.total, false, "fa")}
                  </Td>

                  <Td className="text-center">
                    {payment.discountCode ? (
                      <span
                        dir="ltr"
                        className="inline-block rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary"
                      >
                        {payment.discountCode}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </Td>

                  <Td className="text-center text-muted-foreground">
                    {formatDate(payment.createdAt, "yyyy/MM/dd")}
                  </Td>

                  <Td className="text-center">
                    <div className="flex justify-center">
                      <PaymentStatus
                        label={mapPaymentStatusLable(payment.status)}
                        status={payment.status}
                      />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PanelCard>
  );
}

export default PaymentsList;
