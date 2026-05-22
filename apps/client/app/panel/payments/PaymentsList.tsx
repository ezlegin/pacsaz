import { mapPaymentStatusLable } from "@/utils/mapPaymentStatusLable";
import { mapPeriodLabel } from "@/utils/mapPeriodLabel";
import { mapPlanTitle } from "@/utils/mapPlanTitle";
import { Payment, Plan } from "@repo/db";
import { PlanKey, PlanPeriod } from "@repo/lib/data/plans";
import { formatPrice } from "@repo/lib/utils/formatPrice";
import Card from "@repo/ui/components/custom/Card";
import PaymentStatus from "@repo/ui/components/custom/PaymentStatus";
import Table from "@repo/ui/components/custom/Table";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { formatDate } from "date-fns";

interface PaymentType extends Payment {
  plan: Plan | null;
}

function PaymentsList({ data }: { data: PaymentType[] }) {
  const renderRows = (payment: PaymentType) => {
    return (
      <TableRow key={payment.id}>
        <TableCell>{payment.id}</TableCell>
        <TableCell className="text-center">
          {formatPrice(payment.amount)}
        </TableCell>
        <TableCell className="text-center">
          {payment.discountCodeAmount &&
            formatPrice(payment.discountCodeAmount)}
        </TableCell>
        <TableCell className="text-center">
          {formatPrice(payment.total)}
        </TableCell>
        <TableCell className="text-center">{payment.discountCode}</TableCell>
        <TableCell className="text-center">
          {formatDate(payment.createdAt, "PPP")}
        </TableCell>
        <TableCell className="text-center">
          <PaymentStatus
            label={mapPaymentStatusLable(payment.status)}
            status={payment.status}
          />
        </TableCell>
        <TableCell className="text-center">
          {mapPlanTitle(payment.plan?.key as PlanKey)}
        </TableCell>
        <TableCell className="text-left">
          {mapPeriodLabel(payment.period as PlanPeriod)}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Card title="پرداخت ها">
      <Table
        columns={columns}
        data={data}
        renderRows={renderRows}
        noDataMessage="اطلاعاتی یافت نشد."
        dir="rtl"
      />
    </Card>
  );
}

export default PaymentsList;

const columns = [
  { label: "شناسه" },
  { label: "مجموع" },
  { label: "تخفیف" },
  { label: "قیمت کل" },
  { label: "کد تخفیف" },
  { label: "تاریخ" },
  { label: "وضعیت" },
  { label: "پلن" },
  { label: "دوره" },
];
