import Filter from "@/components/Filter";
import { DielineForm } from "@/components/forms/DielineForm";
import PageTitle from "@/components/PageTitle";
import Search from "@/components/Search";
import Pagination from "@repo/ui/components/custom/Pagination";
import DielinesList from "./DielinesList";
import PopupNewDialog from "@repo/ui/components/custom/PopupNewDialog";
import { globalPageSize } from "@repo/lib/data/consts";

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

        <PopupNewDialog buttonTitle="New Dieline">
          <DielineForm />
        </PopupNewDialog>
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
