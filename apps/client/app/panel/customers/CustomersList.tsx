import { CustomerForm } from "@/components/forms/CustomerForm";
import { Customer } from "@repo/db";
import ActionButton from "@repo/ui/components/custom/ActionButton";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { Pencil } from "lucide-react";

const CustomersList = ({ data }: { data: Customer[] }) => {
  const renderRows = (data: Customer) => {
    const { id, fullName, address, email, phoneNumber } = data;
    return (
      <TableRow key={id}>
        <TableCell>{fullName}</TableCell>
        <TableCell className="text-center">{phoneNumber}</TableCell>
        <TableCell className="text-center">{email}</TableCell>
        <TableCell className="text-center">{address}</TableCell>
        <TableCell className="text-left">
          <Dialog>
            <DialogTrigger asChild>
              <ActionButton icon={Pencil} />
            </DialogTrigger>
            <DialogContent>
              <CustomerForm type="update" customer={data} />
            </DialogContent>
          </Dialog>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Card>
      <Table columns={columns} data={data} renderRows={renderRows} />
    </Card>
  );
};

export default CustomersList;

const columns = [
  { label: "نام و نام خانوادگی", className: "" },
  { label: "شماره تماس", className: "" },
  { label: "ایمیل", className: "" },
  { label: "آدرس", className: "" },
  { label: "ویرایش", className: "" },
];
