import PlanStatus from "@/components/PlanStatus";
import { mapPeriodLabel } from "@/utils/mapPeriodLabel";
import { Payment, Plan } from "@repo/db";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { formatDate } from "date-fns";

interface PlanType extends Plan {
  payment: Payment | null;
}

function SubscriptionsList({ data }: { data: PlanType[] }) {
  const renderRows = (plan: PlanType) => {
    return (
      <TableRow key={plan.id}>
        <TableCell>{plan.title}</TableCell>
        <TableCell className="text-center">
          {formatDate(plan.startedAt, "PPP")}
        </TableCell>
        <TableCell className="text-center">
          {formatDate(plan.endsAt, "PPP")}
        </TableCell>
        <TableCell className="text-center">
          {mapPeriodLabel(plan.period)}
        </TableCell>
        <TableCell className="text-center">{plan.fairDownload}</TableCell>
        <TableCell className="text-center">{plan.downloaded}</TableCell>
        <TableCell className="text-center">
          {plan.firstDownload ? formatDate(plan.firstDownload, "PPP") : "-"}
        </TableCell>
        <TableCell className="text-center">
          {plan.lastDownload ? formatDate(plan.lastDownload, "PPP") : "-"}
        </TableCell>
        <TableCell className="text-center">
          <PlanStatus status={plan.status} />
        </TableCell>
        <TableCell className="text-left">{plan.payment?.id}</TableCell>
      </TableRow>
    );
  };

  return (
    <Card title="سوابق اشتراک">
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

export default SubscriptionsList;

const columns = [
  { label: "عنوان" },
  { label: "تاریخ شروع" },
  { label: "تاریخ پایان" },
  { label: "دوره" },
  { label: "دانلود مجاز" },
  { label: "دانلود شده" },
  { label: "اولین دانلود" },
  { label: "آخرین دانلود" },
  { label: "وضعیت" },
  { label: "شناسه پرداخت" },
];
