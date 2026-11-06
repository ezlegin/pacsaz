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
import Link from "next/link";

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
          {data.user ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={`/users/${data.user.id}`}
                  className="inline-flex items-center gap-1 hover:text-primary hover:underline"
                >
                  <Info size={10} className="text-muted-foreground" />
                  {data.user.fullName}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">{data.user.phoneNumber}</TooltipContent>
            </Tooltip>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Card>
      <Table columns={columns} data={data} renderRows={renderRows} dir="ltr" noDataMessage="No customers match." />
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
