import PageTitle from "@/components/PageTitle";
import { prisma } from "@repo/db";
import { globalPageSize } from "@repo/lib/data/consts";
import Filter from "@repo/ui/components/custom/Filter";
import NewButton from "@repo/ui/components/custom/NewButton";
import Pagination from "@repo/ui/components/custom/Pagination";
import Search from "@repo/ui/components/custom/Search";
import DielinesList from "./DielinesList";

const page = async () => {
  const dielines = await prisma.dieline.findMany({
    include: {
      categoryByModel: true,
      categoryByUsage: true,
      _count: {
        select: {
          downloadRecords: true,
        },
      },
    },
  });
  const categories = {
    byModel: await prisma.dielineCategoryByModel.findMany(),
    byUsage: await prisma.dielineCategoryByUsage.findMany(),
  };

  const x = await prisma.downloadRecord.findMany({
    include: { dieline: { include: { settings: true } } },
  });
  console.log(x[2]);

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

        <NewButton title="New Dieline" href="/editor/new" />
      </div>

      <DielinesList data={dielines} categories={categories} />

      <Pagination pageSize={globalPageSize} totalItems={dielines.length} />
    </div>
  );
};

export default page;
