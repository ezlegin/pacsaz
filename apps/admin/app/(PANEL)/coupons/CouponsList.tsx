import { deleteCoupon } from "@/actions/coupon";
import DeleteButton from "@/components/DeleteButton";
import { CouponForm } from "@/components/forms/CouponForm";
import { Coupon, Tarrif } from "@repo/db";
import ActionButton from "@/components/ActionButton";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { DialogTitle } from "@repo/ui/components/dialog";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { format } from "date-fns";
import { Pencil } from "lucide-react";
import { campaignStateClassName, campaignStateLabel, getCampaignState } from "@/lib/campaign";
import { formatPrice } from "@repo/lib/utils/formatPrice";
import { cn } from "@repo/ui/lib/utils";

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
        <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
        <TableCell className="text-center">
          {coupon.type === "percent" ? `${coupon.amount}%` : formatPrice(coupon.amount, true, "en")}
        </TableCell>
        <TableCell className="text-center">
          <span
            className={cn(
              "rounded-md border px-2 py-0.5 text-xs font-medium",
              campaignStateClassName[getCampaignState(coupon)],
            )}
          >
            {campaignStateLabel[getCampaignState(coupon)]}
          </span>
        </TableCell>
        <TableCell className="text-center">
          {/* "MM" is the month; the old "Mm" printed the minutes in its place. */}
          {format(coupon.expiresAt, "yyyy-MM-dd")}
        </TableCell>
        <TableCell className="text-center tabular-nums">
          {coupon.used} / {coupon.limit ?? "∞"}
        </TableCell>
        <TableCell className="text-center">
          {coupon.tarrif.length > 0 ? (
            coupon.tarrif.map((p) => p.key).join(", ")
          ) : (
            <span className="font-semibold">All</span>
          )}
        </TableCell>
        <TableCell className="flex justify-end gap-2">
          <ActionButton icon={Pencil}>
            <DialogTitle>Edit coupon</DialogTitle>
            <CouponForm coupon={coupon} tarrif={tarrif} />
          </ActionButton>
          <DeleteButton deleteFn={deleteCoupon} id={coupon.id} itemLabel={`the coupon "${coupon.code}"`} />
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Card>
      <Table columns={columns} data={data} renderRows={renderRows} dir="ltr" noDataMessage="No coupons match." />
    </Card>
  );
};

export default CouponsList;

const columns = [
  { label: "Code" },
  { label: "Discount" },
  { label: "Status" },
  { label: "Expires" },
  { label: "Used / limit" },
  { label: "Plans" },
  { label: "Actions" },
];
