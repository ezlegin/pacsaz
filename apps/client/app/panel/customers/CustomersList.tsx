import ActionButton from "@repo/ui/components/custom/ActionButton";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { Pencil } from "lucide-react";

type Customer = {
  id: number;
  fullName: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
};

const CustomersList = () => {
  const data: Customer[] = [
    {
      id: 1,
      fullName: "علیرضا ازلیگنی",
      address: "زنجان، خیابان فردوسی، کوچه نسترن اول، پلاک 46",
      email: "ezlegini.ir@gmail.com",
      phoneNumber: "09127452859",
    },
    {
      id: 2,
      fullName: "فاطمه احمدی",
      address: "زنجان، خیابان فردوسی، کوچه نسترن اول، پلاک 46",
      email: "fa.ahmdi03@gmail.com",
      phoneNumber: "09392563627",
    },
  ];

  const renderRows = ({
    id,
    fullName,
    address,
    email,
    phoneNumber,
  }: Customer) => {
    return (
      <TableRow key={id}>
        <TableCell>{fullName}</TableCell>
        <TableCell className="text-center">{phoneNumber}</TableCell>
        <TableCell className="text-center">{email}</TableCell>
        <TableCell className="text-center">{address}</TableCell>
        <TableCell className="text-left">
          <ActionButton icon={Pencil} />
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
