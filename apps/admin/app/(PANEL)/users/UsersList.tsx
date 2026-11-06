import { deleteUser } from "@/actions/user";
import DeleteButton from "@/components/DeleteButton";
import { UserForm } from "@/components/forms/UserForm";
import { User } from "@repo/db";
import ActionButton from "@/components/ActionButton";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { DialogTitle } from "@repo/ui/components/dialog";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { formatDate } from "date-fns";
import { Eye, Pencil } from "lucide-react";
import Link from "next/link";

const UsersList = ({ data }: { data: User[] }) => {
  const renderRows = (data: User) => {
    return (
      <TableRow key={data.id}>
        <TableCell className="text-left">{data.id}</TableCell>
        <TableCell className="text-center">
          <Link href={`/users/${data.id}`} className="font-medium hover:text-primary hover:underline">
            {data.fullName}
          </Link>
        </TableCell>
        <TableCell className="text-center">{data.phoneNumber}</TableCell>
        <TableCell className="text-center">{data.email}</TableCell>
        <TableCell className="text-center capitalize">
          {data.userType ?? "—"}
        </TableCell>
        <TableCell className="text-center">
          {formatDate(data.joinedAt, "PPP")}
        </TableCell>
        <TableCell className="flex justify-end gap-2">
          <ActionButton icon={Eye} href={`/users/${data.id}`} />
          <ActionButton icon={Pencil}>
            <DialogTitle>Update User</DialogTitle>
            <UserForm user={data} />
          </ActionButton>
          <DeleteButton deleteFn={deleteUser} id={data.id} itemLabel={`the user "${data.fullName}"`} />
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
        dir="ltr"
        noDataMessage="No users match."
      />
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
