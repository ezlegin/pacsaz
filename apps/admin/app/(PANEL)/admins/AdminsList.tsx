import { deleteAdmin } from "@/actions/admin";
import DeleteButton from "@/components/DeleteButton";
import { AdminForm } from "@/components/forms/AdminForm";
import { Admin } from "@repo/db";
import ActionButton from "@repo/ui/components/custom/ActionButton";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { DialogTitle } from "@repo/ui/components/dialog";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { Pencil } from "lucide-react";

const AdminsList = ({ data }: { data: Admin[] }) => {
  const renderRows = (admin: Admin) => {
    return (
      <TableRow key={admin.id}>
        <TableCell className="text-left">{admin.id}</TableCell>
        <TableCell className="text-center">{admin.fullName}</TableCell>
        <TableCell className="text-center">{admin.phoneNumber}</TableCell>
        <TableCell className="text-center">{admin.email}</TableCell>

        <TableCell className="flex justify-end gap-3">
          <ActionButton icon={Pencil}>
            <DialogTitle>Update User</DialogTitle>
            <AdminForm admin={admin} />
          </ActionButton>
          <DeleteButton deleteFn={deleteAdmin} id={admin.id} />
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

export default AdminsList;

const columns = [
  { label: "Id" },
  { label: "Full Name" },
  { label: "Phone Number" },
  { label: "Email" },
  { label: "Action" },
];
