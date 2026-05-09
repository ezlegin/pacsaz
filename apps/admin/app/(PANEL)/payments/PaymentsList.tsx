import { Coupon, Payment, Plan, User } from "@repo/db";
import { formatPrice } from "@repo/lib/utils/formatPrice";
import { ActButton } from "@repo/ui/components/custom/ActionButton";
import Card from "@repo/ui/components/custom/Card";
import PaymentStatus from "@repo/ui/components/custom/PaymentStatus";
import Table from "@repo/ui/components/custom/Table";
import { TableCell, TableRow } from "@repo/ui/components/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { Info, Pencil } from "lucide-react";
import Link from "next/link";

export interface PaymentType extends Payment {
  user: User;
  plan: Plan;
  coupon: (Coupon & { plan: Plan[] }) | null;
}

const PaymentsList = ({ data }: { data: PaymentType[] }) => {
  const renderRows = (data: PaymentType) => {
    return (
      <TableRow key={data.id}>
        <TableCell>{data.id}</TableCell>
        <TableCell className="text-center">
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center justify-center gap-1">
                {data.user.fullName}
                <Info size={10} className="text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {data.user.phoneNumber}
            </TooltipContent>
          </Tooltip>
        </TableCell>
        <TableCell className="text-center">
          <PaymentStatus label={data.status} status={data.status} />
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
        <TableCell className="text-center flex justify-end">
          <Link href={`/payments/${data.id}`}>
            <ActButton>
              <Pencil size={14} />
            </ActButton>
          </Link>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Card>
      <Table columns={columns} data={data} renderRows={renderRows} dir="ltr" />
    </Card>
  );
};

export default PaymentsList;

const columns = [
  { label: "ID" },
  { label: "User" },
  { label: "Status" },
  { label: "Amount" },
  { label: "Discount" },
  { label: "Total" },
  { label: "Edit" },
];
