import { CategoriesForm } from "@/components/forms/CategoriesForm";
import PageTitle from "@/components/PageTitle";
import { prisma } from "@repo/db";
import { globalPageSize } from "@repo/lib/data/consts";
import { pagination } from "@repo/lib/utils/pagination";
import Filter from "@repo/ui/components/custom/Filter";
import Pagination from "@repo/ui/components/custom/Pagination";
import PopupNewDialog from "@repo/ui/components/custom/PopupNewDialog";
import Search from "@repo/ui/components/custom/Search";
import { DialogTitle } from "@repo/ui/components/dialog";
import CategoriesList from "./CategoriesList";

interface Props {
  searchParams: Promise<{ pageByUsage: string; pageByModel: string }>;
}

const page = async ({ searchParams }: Props) => {
  const { pageByModel, pageByUsage } = await searchParams;
  const { skip: skipPageByUsage, take: takePageByUsage } = pagination(
    pageByUsage,
    globalPageSize,
  );
  const { skip: skipPageByModel, take: takePageByModel } = pagination(
    pageByModel,
    globalPageSize,
  );

  const dielineIncludes = {
    include: { _count: { select: { dieline: true } } },
  };
  const catByUsage = await prisma.dielineCategoryByUsage.findMany({
    ...dielineIncludes,
    take: takePageByUsage,
    skip: skipPageByUsage,
  });

  const catByModel = await prisma.dielineCategoryByModel.findMany({
    ...dielineIncludes,
    take: takePageByModel,
    skip: skipPageByModel,
  });
  const totalCatByUsage = await prisma.dielineCategoryByUsage.count();
  const totalCatByModel = await prisma.dielineCategoryByModel.count();

  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-3">
        <PageTitle title="Categories By Usage" />

        <div className="flex justify-between">
          <div className="flex gap-3">
            <Search placeholder="Search" />
            <Filter
              options={[
                { label: "Most Dielines", value: "most-dieline" },
                { label: "Less Dielines", value: "less-dieline" },
              ]}
              name="dieline"
              placeholder="Sort"
            />
          </div>

          <PopupNewDialog buttonTitle="New">
            <DialogTitle>New Category By Usage</DialogTitle>
            <CategoriesForm type="usage" />
          </PopupNewDialog>
        </div>

        <CategoriesList data={catByUsage} type="usage" />

        <Pagination
          pageSize={globalPageSize}
          totalItems={totalCatByUsage}
          paramName="pageByUsage"
        />
      </div>

      <div className="space-y-3">
        <PageTitle title="Categories By Model" />

        <div className="flex justify-between">
          <div className="flex gap-3">
            <Search placeholder="Search" />

            <Filter
              options={[
                { label: "Most Dielines", value: "most-dieline" },
                { label: "Less Dielines", value: "less-dieline" },
              ]}
              name="dieline"
              placeholder="Sort"
            />
          </div>

          <PopupNewDialog buttonTitle="New">
            <DialogTitle>New Category By Model</DialogTitle>
            <CategoriesForm type="model" />
          </PopupNewDialog>
        </div>

        <CategoriesList data={catByModel} type="model" />

        <Pagination
          pageSize={globalPageSize}
          totalItems={totalCatByModel}
          paramName="pageByModel"
        />
      </div>
    </div>
  );
};

export default page;
