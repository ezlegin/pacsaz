import { CouponForm } from "@/components/forms/CouponForm";
import PageTitle from "@/components/PageTitle";
import { prisma } from "@repo/db";
import { globalPageSize } from "@repo/lib/data/consts";
import { pagination } from "@repo/lib/utils/pagination";
import Pagination from "@repo/ui/components/custom/Pagination";
import PopupNewDialog from "@repo/ui/components/custom/PopupNewDialog";
import Search from "@repo/ui/components/custom/Search";
import { DialogTitle } from "@repo/ui/components/dialog";
import CouponsList from "./CouponsList";

interface Props {
  searchParams: Promise<{ page: string }>;
}

const page = async ({ searchParams }: Props) => {
  const { page } = await searchParams;
  const { skip, take } = pagination(page, globalPageSize);

  const coupons = await prisma.coupon.findMany({
    include: { tarrif: true },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
  const totalCoupons = await prisma.coupon.count();
  const tarrif = await prisma.tarrif.findMany();

  return (
    <div className="space-y-3">
      <PageTitle title="Coupons" />

      <div className="flex justify-between">
        <Search placeholder="Search Coupons" />

        <PopupNewDialog buttonTitle="New Plan">
          <DialogTitle>New Coupon</DialogTitle>
          <CouponForm tarrif={tarrif} />
        </PopupNewDialog>
      </div>

      <CouponsList data={coupons} tarrif={tarrif} />

      <Pagination pageSize={globalPageSize} totalItems={totalCoupons} />
    </div>
  );
};

export default page;
