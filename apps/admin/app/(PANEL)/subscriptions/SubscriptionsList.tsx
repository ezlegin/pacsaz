import PlanCard from "@/components/PlanCard";
import SubscriptionStatus from "@/components/SubscriptionStatus";
import { Payment, Plan, User } from "@repo/db";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { TableCell, TableRow } from "@repo/ui/components/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { formatDate, formatDistanceToNow } from "date-fns";
import { Info } from "lucide-react";

interface PlanType extends Plan {
  user: User | null;
  payment: Payment | null;
}

const SubscriptionsList = ({ data }: { data: PlanType[] }) => {
  const renderRows = (data: PlanType) => {
    return (
      <TableRow key={data.id}>
        <TableCell>{data.id}</TableCell>
        <TableCell className="text-center">
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center justify-center gap-1">
                {data.user?.fullName}
                <Info size={10} className="text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {data.user?.phoneNumber}
            </TooltipContent>
          </Tooltip>
        </TableCell>
        <TableCell className="text-center">
          <SubscriptionStatus endsAt={data.endsAt} />
        </TableCell>
        <TableCell>
          <div className="flex justify-center">
            <PlanCard planKey={data.key} planPeriod={data.period} />
          </div>
        </TableCell>

        <TableCell className="text-center">
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center justify-center gap-1">
                {formatDistanceToNow(data.startedAt, { addSuffix: true })}
                <Info size={10} className="text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {formatDate(data.startedAt, "PPP")}
            </TooltipContent>
          </Tooltip>
        </TableCell>

        <TableCell className="text-center">
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center justify-center gap-1">
                {formatDistanceToNow(data.endsAt, { addSuffix: true })}
                <Info size={10} className="text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {formatDate(data.endsAt, "PPP")}
            </TooltipContent>
          </Tooltip>
        </TableCell>

        <TableCell className="text-right">
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center justify-center gap-1">
                <span>Remaining: {data.fairDownload - data.downloaded}</span>
                <Info size={10} className="text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <div className="flex flex-col">
                <span>Fair: {data.fairDownload}</span>
                <span>Downloaded: {data.downloaded}</span>
              </div>
            </TooltipContent>
          </Tooltip>
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

export default SubscriptionsList;

const columns = [
  { label: "ID" },
  { label: "User" },
  { label: "Status" },
  { label: "Plan" },
  { label: "Start Date" },
  { label: "End Date" },
  { label: "Downloads" },
];
