import { TarrifForm } from "@/components/forms/TarrifForm";
import PageTitle from "@/components/PageTitle";
import { prisma } from "@repo/db";
import { globalPageSize } from "@repo/lib/data/consts";
import Pagination from "@repo/ui/components/custom/Pagination";
import PopupNewDialog from "@repo/ui/components/custom/PopupNewDialog";
import { DialogTitle } from "@repo/ui/components/dialog";
import TarrifList from "./TarrifList";
import { pagination } from "@repo/lib/utils/pagination";

interface Props {
  searchParams: Promise<{ page: string }>;
}

const page = async ({ searchParams }: Props) => {
  const { page } = await searchParams;
  const { skip, take } = pagination(page, globalPageSize);
  const tarrif = await prisma.tarrif.findMany({
    include: {
      price: true,
      fairDownload: true,
      features: true,
    },
    orderBy: { id: "desc" },
    skip,
    take,
  });
  const features = await prisma.tarrifFeature.findMany();

  return (
    <div className="space-y-3">
      <PageTitle title="Tarrif" />

      <div className="flex justify-between">
        <PopupNewDialog buttonTitle="New Tarrif">
          <DialogTitle>New Tarrif</DialogTitle>
          <TarrifForm features={features} />
        </PopupNewDialog>
      </div>

      <TarrifList data={tarrif} features={features} />

      <Pagination pageSize={globalPageSize} totalItems={tarrif.length} />
    </div>
  );
};

export default page;
