import FeatureForm from "@/components/forms/FeatureForm";
import PageTitle from "@/components/PageTitle";
import { prisma } from "@repo/db";
import { globalPageSize } from "@repo/lib/data/consts";
import Pagination from "@/components/Pagination";
import PopupNewDialog from "@/components/PopupNewDialog";
import { DialogTitle } from "@repo/ui/components/dialog";
import FeaturesList from "./FeaturesList";
import { pagination } from "@repo/lib/utils/pagination";

interface Props {
  searchParams: Promise<{ page: string }>;
}

const page = async ({ searchParams }: Props) => {
  const { page } = await searchParams;
  const { skip, take } = pagination(page, globalPageSize);

  const features = await prisma.tarrifFeature.findMany({
    orderBy: { id: "desc" },
    skip,
    take,
  });

  const count = await prisma.tarrifFeature.count();

  return (
    <div className="space-y-3">
      <PageTitle title="Features" />

      <div className="flex justify-between">
        <PopupNewDialog buttonTitle="New Feature">
          <DialogTitle>New Feature</DialogTitle>
          <FeatureForm />
        </PopupNewDialog>
      </div>

      <FeaturesList data={features} />

      <Pagination pageSize={globalPageSize} totalItems={count} />
    </div>
  );
};

export default page;
