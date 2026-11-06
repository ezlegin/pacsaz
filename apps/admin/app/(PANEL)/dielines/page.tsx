import DielineSettingsForm from "@/components/forms/DielineSettingsForm";
import Filter from "@/components/Filter";
import Pagination from "@/components/Pagination";
import PopupNewDialog from "@/components/PopupNewDialog";
import Search from "@/components/Search";
import { contains, pick, searchText } from "@/lib/listQuery";
import { Prisma, prisma } from "@repo/db";
import { globalPageSize } from "@repo/lib/data/consts";
import { pagination } from "@repo/lib/utils/pagination";
import { DialogTitle } from "@repo/ui/components/dialog";
import { Ratio } from "lucide-react";
import { Page, PageHeader } from "../components/PanelUI";
import DielinesList from "./DielinesList";

interface Props {
  searchParams: Promise<{ page?: string; search?: string; status?: string; sort?: string }>;
}

const sorts = ["most-download", "less-download", "title"] as const;

const orderBy: Record<(typeof sorts)[number], Prisma.DielineOrderByWithRelationInput> = {
  "most-download": { downloadHistory: { _count: "desc" } },
  "less-download": { downloadHistory: { _count: "asc" } },
  title: { title: "asc" },
};

const page = async ({ searchParams }: Props) => {
  const { page, search, status, sort } = await searchParams;
  const { skip, take } = pagination(page ?? "", globalPageSize);
  const q = searchText(search);
  const state = pick(status, ["active", "inactive"] as const);
  const sortBy = pick(sort, sorts);

  const where: Prisma.DielineWhereInput = {
    ...(q ? { OR: [{ title: contains(q) }, { slug: contains(q) }] } : {}),
    ...(state ? { active: state === "active" } : {}),
  };

  const [dielines, total, byModel, byUsage] = await Promise.all([
    prisma.dieline.findMany({
      where,
      include: {
        dielineImage: true,
        modelImage: true,
        settings: true,
        categoryByModel: true,
        categoryByUsage: true,
        _count: { select: { downloadHistory: true } },
      },
      orderBy: sortBy ? orderBy[sortBy] : { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.dieline.count({ where }),
    prisma.dielineCategoryByModel.findMany(),
    prisma.dielineCategoryByUsage.findMany(),
  ]);
  const categories = { byModel, byUsage };

  return (
    <Page>
      <PageHeader
        icon={Ratio}
        title="Dielines"
        description="The template catalogue. The pencil opens a template in the editor; the gear edits its sizes, materials and images."
        actions={
          <PopupNewDialog buttonTitle="New dieline" dialogClassName="min-w-4xl">
            <DialogTitle>New dieline</DialogTitle>
            <DielineSettingsForm categories={categories} />
          </PopupNewDialog>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Search placeholder="Search title or slug" className="w-64" />
        <Filter
          name="status"
          placeholder="All statuses"
          options={[
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ]}
        />
        <Filter
          name="sort"
          placeholder="Newest first"
          options={[
            { label: "Most downloaded", value: "most-download" },
            { label: "Least downloaded", value: "less-download" },
            { label: "Title A–Z", value: "title" },
          ]}
        />
      </div>

      <DielinesList data={dielines} categories={categories} />

      <Pagination pageSize={globalPageSize} totalItems={total} />
    </Page>
  );
};

export default page;
