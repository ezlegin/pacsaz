import { deleteCoupon } from "@/actions/coupon";
import DeleteButton from "@/components/DeleteButton";
import { CouponForm } from "@/components/forms/CouponForm";
import { Coupon, Tarrif } from "@repo/db";
import ActionButton from "@repo/ui/components/custom/ActionButton";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { DialogTitle } from "@repo/ui/components/dialog";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { format } from "date-fns";
import { Pencil } from "lucide-react";

export interface CouponType extends Coupon {
  tarrif: Tarrif[];
}

const CouponsList = ({
  data,
  tarrif,
}: {
  data: CouponType[];
  tarrif: Tarrif[];
}) => {
  const renderRows = (coupon: CouponType) => {
    return (
      <TableRow key={coupon.id}>
        <TableCell>{coupon.code}</TableCell>
        <TableCell className="text-center">
          {format(coupon.expiresAt, "yyyy-Mm-dd")}
        </TableCell>
        <TableCell className="text-center">{coupon.used}</TableCell>
        <TableCell className="text-center">{coupon.limit}</TableCell>
        <TableCell className="text-center">
          {coupon.tarrif.length > 0 ? (
            coupon.tarrif.map((p) => p.key).join(", ")
          ) : (
            <span className="font-semibold">All</span>
          )}
        </TableCell>
        <TableCell className="flex justify-end">
          <ActionButton icon={Pencil}>
            <DialogTitle>Update Coupon</DialogTitle>
            <CouponForm coupon={coupon} tarrif={tarrif} />
          </ActionButton>
          <DeleteButton deleteFn={deleteCoupon} id={coupon.id} />
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

export default CouponsList;

const columns = [
  { label: "Code" },
  { label: "Expires At" },
  { label: "Used" },
  { label: "Limit" },
  { label: "Plans" },
  { label: "Action" },
];
