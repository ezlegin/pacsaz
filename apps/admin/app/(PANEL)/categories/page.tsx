import { CategoriesForm } from "@/components/forms/CategoriesForm";
import PageTitle from "@/components/PageTitle";
import Pagination from "@repo/ui/components/custom/Pagination";
import CategoriesList from "./CategoriesList";
import PopupNewDialog from "@repo/ui/components/custom/PopupNewDialog";
import { globalPageSize } from "@repo/lib/data/consts";
import Search from "@repo/ui/components/custom/Search";
import Filter from "@repo/ui/components/custom/Filter";
import { prisma } from "@repo/db";
import { DialogTitle } from "@repo/ui/components/dialog";

const page = async () => {
  const dielineIncludes = {
    include: { _count: { select: { dieline: true } } },
  };
  const catByUsage =
    await prisma.dielineCategoryByUsage.findMany(dielineIncludes);
  const catByModel =
    await prisma.dielineCategoryByModel.findMany(dielineIncludes);

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
          totalItems={catByUsage.length}
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
          totalItems={catByModel.length}
          paramName="pageByModel"
        />
      </div>
    </div>
  );
};

export default page;
