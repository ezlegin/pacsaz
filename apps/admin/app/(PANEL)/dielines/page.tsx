import DielineSettingsForm from "@/components/forms/DielineSettingsForm";
import PageTitle from "@/components/PageTitle";
import { prisma } from "@repo/db";
import { globalPageSize } from "@repo/lib/data/consts";
import Filter from "@repo/ui/components/custom/Filter";
import Pagination from "@repo/ui/components/custom/Pagination";
import PopupNewDialog from "@repo/ui/components/custom/PopupNewDialog";
import Search from "@repo/ui/components/custom/Search";
import { DialogTitle } from "@repo/ui/components/dialog";
import DielinesList from "./DielinesList";
import { pagination } from "@repo/lib/utils/pagination";

interface Props {
  searchParams: Promise<{ page: string }>;
}

const page = async ({ searchParams }: Props) => {
  const { page } = await searchParams;
  const { skip, take } = pagination(page, globalPageSize);
  const dielines = await prisma.dieline.findMany({
    include: {
      image: true,
      settings: true,
      categoryByModel: true,
      categoryByUsage: true,
      _count: {
        select: {
          downloadHistory: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
  const totalDieliens = await prisma.dieline.count();
  const categories = {
    byModel: await prisma.dielineCategoryByModel.findMany(),
    byUsage: await prisma.dielineCategoryByUsage.findMany(),
  };

  // Todo: Sorting

  return (
    <div className="space-y-3">
      <PageTitle title="Dielines" />

      <div className="flex justify-between">
        <div className="flex gap-3">
          <Search placeholder="Search By Slug" />
          <Filter
            options={[
              { label: "Most Download", value: "most-download" },
              { label: "Less Download", value: "less-download" },
            ]}
            name="download"
            placeholder="Sort By Download"
          />
        </div>

        <PopupNewDialog buttonTitle="New Dieline">
          <DialogTitle>New Dieline</DialogTitle>
          <DielineSettingsForm categories={categories} />
        </PopupNewDialog>
      </div>

      <DielinesList data={dielines} categories={categories} />

      <Pagination pageSize={globalPageSize} totalItems={totalDieliens} />
    </div>
  );
};

export default page;
