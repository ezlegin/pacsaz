import { Customer, User } from "@repo/db";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { TableCell, TableRow } from "@repo/ui/components/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { Info } from "lucide-react";

interface CustomerType extends Customer {
  user: User | null;
}

const CustomersList = ({ data }: { data: CustomerType[] }) => {
  const renderRows = (data: CustomerType) => {
    return (
      <TableRow key={data.id}>
        <TableCell>{data.id}</TableCell>
        <TableCell className="text-center">{data.fullName}</TableCell>
        <TableCell className="text-center">{data.phoneNumber}</TableCell>
        <TableCell className="text-center">{data.email}</TableCell>
        <TableCell className="text-center">{data.address}</TableCell>
        <TableCell className="text-right">
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center justify-center gap-1">
                <Info size={10} className="text-muted-foreground" />
                {data.user?.fullName}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {data.user?.phoneNumber}
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

export default CustomersList;

const columns = [
  { label: "Id" },
  { label: "Full Name" },
  { label: "Phone Number" },
  { label: "Email" },
  { label: "Address" },
  { label: "User" },
];
