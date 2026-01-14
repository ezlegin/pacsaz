import ActionButton from "@/components/ActionButton";
import PlanCard from "@/components/PlanCard";
import { PlanType } from "@/data/user";
import { formatPrice } from "@/utils/formatPrice";
import Card from "@repo/ui/components/custom/Card";
import PaymentStatus, {
  PaymentStatusType,
} from "@repo/ui/components/custom/PaymentStatus";
import Table from "@repo/ui/components/custom/Table";
import { TableCell, TableRow } from "@repo/ui/components/table";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@repo/ui/components/tooltip";
import { Info, Pencil } from "lucide-react";
import Link from "next/link";

export type Payment = {
  id: number;
  user: { fullName: string; phoneNumber: string };
  status: PaymentStatusType;
  amount: number;
  discount?: { amount: number; code: string };
  total: number;
  plan: PlanType;
};

const PaymentsList = ({ data }: { data: Payment[] }) => {
  const renderRows = (data: Payment) => {
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
          {data.discount && (
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center justify-center gap-1">
                  {formatPrice(data.discount.amount)}
                  <Info size={10} className="text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Code: "{data.discount.code}"
              </TooltipContent>
            </Tooltip>
          )}
        </TableCell>
        <TableCell className="text-center">{formatPrice(data.total)}</TableCell>
        <TableCell>
          <div className="flex justify-center">
            <PlanCard planKey={data.plan.key} planPeriod={data.plan.period} />
          </div>
        </TableCell>
        <TableCell className="text-center flex justify-end">
          <Link href={`/payments/${data.id}`}>
            <ActionButton icon={Pencil} />
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
  { label: "discount" },
  { label: "Total" },
  { label: "Plan" },
  { label: "Edit" },
];
