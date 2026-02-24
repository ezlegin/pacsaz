import PageTitle from "@/components/PageTitle";
import { globalPageSize } from "@repo/lib/data/consts";
import Filter from "@repo/ui/components/custom/Filter";
import NewButton from "@repo/ui/components/custom/NewButton";
import Pagination from "@repo/ui/components/custom/Pagination";
import Search from "@repo/ui/components/custom/Search";
import DielinesList from "./DielinesList";

const page = () => {
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

        <NewButton title="New Dieline" href="/dielines/new" />
      </div>

      <DielinesList data={data} />

      <Pagination pageSize={globalPageSize} totalItems={data.length} />
    </div>
  );
};

export default page;

const data = [
  {
    id: 1,
    title: "جعبه دو طرف درب",
    slug: "tuck-end",
    categories: {
      byUsage: ["medicine", "food"],
      byModel: ["tuck-end"],
    },
    downloaded: 290,
  },
  {
    id: 2,
    title: "جعبه اسنپ لاک",
    slug: "tuck-end-snap-lock",
    categories: {
      byUsage: ["medicine", "food"],
      byModel: ["tuck-end"],
    },
    downloaded: 373,
  },
];
