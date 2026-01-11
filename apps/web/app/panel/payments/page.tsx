import Status from "@/components/Status";
import { SubPeriod } from "@/components/SubscriptionList";
import { PlanKey } from "@/data/subscription";
import {
  mapPeriodLabel,
  mapStatusLable,
  mapUserPlanTitle,
  Status as StatusType,
} from "@/data/user";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { formatDate } from "date-fns";

function page() {
  const data = [
    {
      id: 1,
      date: new Date("2026-01-01"),
      status: "success",
      amount: 399000,
      plan: "standard",
      period: "monthly",
    },
    {
      id: 2,
      date: new Date("2026-01-01"),
      status: "failed",
      amount: 399000,
      plan: "standard",
      period: "monthly",
    },
    {
      id: 3,
      date: new Date("2026-01-01"),
      status: "canceled",
      amount: 399000,
      plan: "standard",
      period: "monthly",
    },
    {
      id: 4,
      date: new Date("2026-01-01"),
      status: "success",
      amount: 399000,
      plan: "standard",
      period: "monthly",
    },
  ];

  const renderRows = (data: {
    id: number;
    date: Date;
    amount: number;
    status: string;
    plan: string;
    period: string;
  }) => {
    return (
      <TableRow key={data.id}>
        <TableCell>{data.id}</TableCell>
        <TableCell className="text-center">{data.amount}</TableCell>
        <TableCell className="text-center">
          {formatDate(data.date, "PPP")}
        </TableCell>
        <TableCell className="text-center">
          <Status
            label={mapStatusLable(data.status as StatusType)}
            status={
              data.status === "success"
                ? "success"
                : data.status === "failed"
                  ? "failed"
                  : "canceled"
            }
          />
        </TableCell>
        <TableCell className="text-center">
          {mapUserPlanTitle(data.plan as PlanKey)}
        </TableCell>
        <TableCell className="text-left">
          {mapPeriodLabel(data.period as SubPeriod)}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Card>
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

export default page;

const columns = [
  { label: "#", className: "" },
  { label: "قیمت", className: "" },
  { label: "تاریخ", className: "" },
  { label: "وضعیت", className: "" },
  { label: "پلن", className: "" },
  { label: "دوره", className: "text-right" },
];
