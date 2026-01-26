import ActionButton from "@repo/ui/components/custom/ActionButton";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { formatDate } from "date-fns";
import { Pencil, Trash } from "lucide-react";
import { User } from "@repo/store/app/user.store";

const UsersList = ({ data }: { data: User[] }) => {
  const renderRows = (data: User) => {
    return (
      <TableRow key={data.id}>
        <TableCell className="text-center">{data.id}</TableCell>
        <TableCell className="text-center">{data.fullName}</TableCell>
        <TableCell className="text-center">{data.phoneNumber}</TableCell>
        <TableCell className="text-center">{data.email}</TableCell>
        <TableCell className="text-center">
          {formatDate(data.joinedAt, "PPP")}
        </TableCell>
        <TableCell className="flex justify-end gap-3">
          <ActionButton icon={Pencil} />
          <ActionButton icon={Trash} />
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

export default UsersList;

const columns = [
  { label: "Id" },
  { label: "Full Name" },
  { label: "Phone Number" },
  { label: "Email" },
  { label: "Joined At" },
  { label: "Action" },
];
