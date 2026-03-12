import { deleteUser } from "@/actions/user";
import DeleteButton from "@/components/DeleteButton";
import { UserForm } from "@/components/forms/UserForm";
import { User } from "@repo/db";
import ActionButton from "@repo/ui/components/custom/ActionButton";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { DialogTitle } from "@repo/ui/components/dialog";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { formatDate } from "date-fns";
import { Pencil } from "lucide-react";

const UsersList = ({ data }: { data: User[] }) => {
  const renderRows = (data: User) => {
    return (
      <TableRow key={data.id}>
        <TableCell className="text-left">{data.id}</TableCell>
        <TableCell className="text-center">{data.fullName}</TableCell>
        <TableCell className="text-center">{data.phoneNumber}</TableCell>
        <TableCell className="text-center">{data.email}</TableCell>
        <TableCell className="text-center capitalize">{data.type}</TableCell>
        <TableCell className="text-center">
          {formatDate(data.joinedAt, "PPP")}
        </TableCell>
        <TableCell className="flex justify-end gap-3">
          <ActionButton icon={Pencil}>
            <DialogTitle>Update User</DialogTitle>
            <UserForm user={data} />
          </ActionButton>
          <DeleteButton deleteFn={deleteUser} id={data.id} />
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
  { label: "Type" },
  { label: "Joined At" },
  { label: "Action" },
];
