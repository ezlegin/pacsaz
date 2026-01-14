import { PlanType } from "@/data/user";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { TableCell, TableRow } from "@repo/ui/components/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { Info, Pencil } from "lucide-react";
import SubscriptionStatus from "@/components/SubscriptionStatus";
import PlanCard from "@/components/PlanCard";
import { formatDate, formatDistanceToNow } from "date-fns";
import ActionButton from "@/components/ActionButton";

export type Subscription = {
  id: number;
  user: { fullName: string; phoneNumber: string };
  plan: PlanType;
  startedAt: Date;
  endsAt: Date;
  downloads: {
    fair: number;
    downloaded: number;
  };
};

const SubscriptionsList = ({ data }: { data: Subscription[] }) => {
  const renderRows = (data: Subscription) => {
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
          <SubscriptionStatus endsAt={data.endsAt} />
        </TableCell>
        <TableCell>
          <div className="flex justify-center">
            <PlanCard planKey={data.plan.key} planPeriod={data.plan.period} />
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

        <TableCell className="text-center">
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center justify-center gap-1">
                <span>
                  Remaining: {data.downloads.fair - data.downloads.downloaded}
                </span>
                <Info size={10} className="text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <div className="flex flex-col">
                <span>Fair: {data.downloads.fair}</span>
                <span>Downloaded: {data.downloads.downloaded}</span>
              </div>
            </TooltipContent>
          </Tooltip>
        </TableCell>

        <TableCell className="flex justify-end">
          <ActionButton icon={Pencil} />
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
  { label: "Edit" },
];
