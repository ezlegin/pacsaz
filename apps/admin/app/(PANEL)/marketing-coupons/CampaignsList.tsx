import { Coupon } from "@repo/db";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { cn } from "@repo/ui/lib/utils";
import { format } from "date-fns";
import {
  campaignStateClassName,
  campaignStateLabel,
  getCampaignState,
  redemptionPercent,
} from "@/lib/campaign";

/**
 * Read-only table of the auto-generated campaign coupons.
 *
 * Deliberately has no edit or delete affordance: these rows are the historical
 * record of what was emailed to users. Changing a live campaign's percentage
 * would make the email that quoted it wrong, and deleting a row would erase the
 * only link between an email and the code it carried.
 */
const CampaignsList = ({
  data,
  now,
}: {
  data: Coupon[];
  /** Passed in so every row is classified against the same instant. */
  now: Date;
}) => {
  const renderRows = (coupon: Coupon) => {
    const state = getCampaignState(coupon, now);
    const percent = redemptionPercent(coupon);

    return (
      <TableRow key={coupon.id}>
        <TableCell className="font-medium" dir="ltr">
          {coupon.code}
        </TableCell>
        <TableCell className="text-center" dir="ltr">
          {coupon.campaign ?? "—"}
        </TableCell>
        <TableCell className="text-center">{coupon.amount}%</TableCell>
        <TableCell className="text-center">
          {format(coupon.createdAt, "yyyy-MM-dd")}
        </TableCell>
        <TableCell className="text-center">
          {format(coupon.expiresAt, "yyyy-MM-dd")}
        </TableCell>
        <TableCell className="text-center" dir="ltr">
          <div className="flex flex-col items-center gap-1">
            <span>
              {coupon.used} / {coupon.limit ?? "∞"}
            </span>
            <span className="h-1 w-16 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full bg-primary/70"
                style={{ width: `${percent}%` }}
              />
            </span>
          </div>
        </TableCell>
        <TableCell className="text-center">
          <span
            className={cn(
              "inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium",
              campaignStateClassName[state],
            )}
          >
            {campaignStateLabel[state]}
          </span>
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

export default CampaignsList;

const columns = [
  { label: "Code" },
  { label: "Campaign" },
  { label: "Discount" },
  { label: "Created" },
  { label: "Expires" },
  { label: "Redemptions" },
  { label: "State" },
];
