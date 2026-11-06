import { deletePayment } from "@/actions/payment";
import DeleteButton from "@/components/DeleteButton";
import { PaymentForm } from "@/components/forms/PaymentForm";
import { Coupon, Payment, Plan, Price, Tarrif, User } from "@repo/db";
import { formatPrice } from "@repo/lib/utils/formatPrice";
import ActionButton from "@/components/ActionButton";
import Card from "@repo/ui/components/custom/Card";
import PaymentStatus from "@repo/ui/components/custom/PaymentStatus";
import Table from "@repo/ui/components/custom/Table";
import { DialogTitle } from "@repo/ui/components/dialog";
import { TableCell, TableRow } from "@repo/ui/components/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { Info, Pencil } from "lucide-react";
import PlanCard from "@/components/PlanCard";
import { format } from "date-fns";
import Link from "next/link";

export interface PaymentType extends Payment {
  user: User;
  plan: Plan | null;
  coupon: (Coupon & { tarrif: Tarrif[] }) | null;
}

const PaymentsList = ({
  data,
  tarrif,
}: {
  data: PaymentType[];
  tarrif: (Tarrif & { price: Price | null })[];
}) => {
  const renderRows = (data: PaymentType) => {
    return (
      <TableRow key={data.id}>
        <TableCell>{data.id}</TableCell>
        <TableCell className="text-center text-xs text-muted-foreground tabular-nums">
          {format(data.createdAt, "yyyy-MM-dd HH:mm")}
        </TableCell>
        <TableCell className="text-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={`/users/${data.userId}`}
                className="inline-flex items-center justify-center gap-1 hover:text-primary hover:underline"
              >
                {data.user.fullName}
                <Info size={10} className="text-muted-foreground" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {data.user.phoneNumber}
            </TooltipContent>
          </Tooltip>
        </TableCell>
        <TableCell className="text-center">
          <PaymentStatus label={data.status} status={data.status} />
          {data.method === "admin" && (
            <div className="mt-1 text-[10px] text-muted-foreground">by admin</div>
          )}
        </TableCell>
        <TableCell>
          <div className="flex justify-center">
            {data.plan ? (
              <PlanCard planKey={data.plan.key} planPeriod={data.plan.period} />
            ) : (
              <span className="text-xs text-muted-foreground">No subscription</span>
            )}
          </div>
        </TableCell>
        <TableCell className="text-center">
          {formatPrice(data.amount)}
        </TableCell>
        <TableCell className="text-center">
          {data.coupon && (
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center justify-center gap-1">
                  {formatPrice(data.discountCodeAmount)}
                  <Info size={10} className="text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Code: "{data.coupon.code}"
              </TooltipContent>
            </Tooltip>
          )}
        </TableCell>
        <TableCell className="text-center">{formatPrice(data.total)}</TableCell>
        <TableCell className="text-center flex justify-end gap-2">
          <ActionButton icon={Pencil}>
            <DialogTitle>Edit payment #{data.id}</DialogTitle>
            <PaymentForm payment={data} tarrif={tarrif} />
          </ActionButton>
          <DeleteButton deleteFn={deletePayment} id={data.id} itemLabel={`payment #${data.id} and its subscription`} />
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Card>
      <Table columns={columns} data={data} renderRows={renderRows} dir="ltr" noDataMessage="No payments match." />
    </Card>
  );
};

export default PaymentsList;

const columns = [
  { label: "ID" },
  { label: "Date" },
  { label: "User" },
  { label: "Status" },
  { label: "Plan" },
  { label: "Amount" },
  { label: "Discount" },
  { label: "Total" },
  { label: "Actions" },
];
