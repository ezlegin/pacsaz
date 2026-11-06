import { deleteAdmin } from "@/actions/admin";
import ActionButton from "@/components/ActionButton";
import DeleteButton from "@/components/DeleteButton";
import { AdminForm, type AdminRow } from "@/components/forms/AdminForm";
import { Badge } from "@repo/ui/components/badge";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { DialogTitle } from "@repo/ui/components/dialog";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { Pencil } from "lucide-react";

const AdminsList = ({
  data,
  currentAdminId,
}: {
  data: AdminRow[];
  currentAdminId: number;
}) => {
  const renderRows = (admin: AdminRow) => {
    const isMe = admin.id === currentAdminId;
    return (
      <TableRow key={admin.id}>
        <TableCell className="text-left">{admin.id}</TableCell>
        <TableCell className="text-center">
          {admin.fullName}
          {isMe && (
            <Badge variant="outline" className="ml-2">
              You
            </Badge>
          )}
        </TableCell>
        <TableCell className="text-center">{admin.phoneNumber}</TableCell>
        <TableCell className="text-center">{admin.email}</TableCell>

        <TableCell className="flex justify-end gap-2">
          <ActionButton icon={Pencil}>
            <DialogTitle>Edit admin</DialogTitle>
            <AdminForm admin={admin} />
          </ActionButton>
          {!isMe && (
            <DeleteButton deleteFn={deleteAdmin} id={admin.id} itemLabel={`the admin "${admin.fullName}"`} />
          )}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Card>
      <Table columns={columns} data={data} renderRows={renderRows} dir="ltr" noDataMessage="No admins match." />
    </Card>
  );
};

export default AdminsList;

const columns = [
  { label: "Id" },
  { label: "Full name" },
  { label: "Phone number" },
  { label: "Email" },
  { label: "Actions" },
];
