import Filter from "@/components/Filter";
import NewButton from "@/components/NewButton";
import PageTitle from "@/components/PageTitle";
import Search from "@/components/Search";
import CategoriesList from "./CategoriesList";
import Pagination from "@repo/ui/components/custom/Pagination";
import { globalPageSize } from "@/lib/consts";

const page = () => {
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

          <NewButton title="New" />
        </div>

        <CategoriesList data={data} />

        <Pagination
          pageSize={globalPageSize}
          totalItems={data.length}
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
          <NewButton title="New" />
        </div>

        <CategoriesList data={data} />

        <Pagination
          pageSize={globalPageSize}
          totalItems={data.length}
          paramName="pageByModel"
        />
      </div>
    </div>
  );
};

export default page;

const data = [
  {
    id: 1,
    title: "مواد غذایی",
    slug: "food",
    dielines: 123,
  },
  {
    id: 2,
    title: "کادو",
    slug: "gift",
    dielines: 123,
  },
];
