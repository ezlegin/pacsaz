import { mapPaymentStatusLable } from "@/utils/mapPaymentStatusLable";
import { mapPeriodLabel } from "@/utils/mapPeriodLabel";
import { mapPlanTitle } from "@/utils/mapPlanTitle";
import { PlanKey, PlanPeriod } from "@repo/lib/data/plans";
import { formatPrice } from "@repo/lib/utils/formatPrice";
import Card from "@repo/ui/components/custom/Card";
import PaymentStatus, {
  PaymentStatusType,
} from "@repo/ui/components/custom/PaymentStatus";
import Table from "@repo/ui/components/custom/Table";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { formatDate } from "date-fns";

type Data = {
  id: number;
  date: Date;
  status: string;
  amount: number;
  plan: string;
  period: string;
  discountCode?: string;
  discountAmount?: number;
  total: number;
};

function PaymentsList({ data }: { data: Data[] }) {
  const renderRows = (data: Data) => {
    return (
      <TableRow key={data.id}>
        <TableCell>{data.id}</TableCell>
        <TableCell className="text-center">
          {formatPrice(data.amount)}
        </TableCell>
        <TableCell className="text-center">
          {data.discountAmount && formatPrice(data.discountAmount)}
        </TableCell>
        <TableCell className="text-center">{data.discountCode}</TableCell>
        <TableCell className="text-center">{formatPrice(data.total)}</TableCell>
        <TableCell className="text-center">
          {formatDate(data.date, "PPP")}
        </TableCell>
        <TableCell className="text-center">
          <PaymentStatus
            label={mapPaymentStatusLable(data.status as PaymentStatusType)}
            status={data.status as PaymentStatusType}
          />
        </TableCell>
        <TableCell className="text-center">
          {mapPlanTitle(data.plan as PlanKey)}
        </TableCell>
        <TableCell className="text-left">
          {mapPeriodLabel(data.period as PlanPeriod)}
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
  { label: "کد تخفیف" },
  { label: "قیمت" },
  { label: "تاریخ" },
  { label: "وضعیت" },
  { label: "پلن" },
  { label: "دوره" },
];
