import { CategoriesForm } from "@/components/forms/CategoriesForm";
import Pagination from "@/components/Pagination";
import PopupNewDialog from "@/components/PopupNewDialog";
import Search from "@/components/Search";
import { contains, searchText } from "@/lib/listQuery";
import { prisma } from "@repo/db";
import { globalPageSize } from "@repo/lib/data/consts";
import { pagination } from "@repo/lib/utils/pagination";
import { DialogTitle } from "@repo/ui/components/dialog";
import { FolderTree } from "lucide-react";
import { Page, PageHeader } from "../components/PanelUI";
import CategoriesList from "./CategoriesList";

interface Props {
  searchParams: Promise<{ pageByUsage?: string; pageByModel?: string; search?: string }>;
}

const page = async ({ searchParams }: Props) => {
  const { pageByModel, pageByUsage, search } = await searchParams;
  const usagePage = pagination(pageByUsage ?? "", globalPageSize);
  const modelPage = pagination(pageByModel ?? "", globalPageSize);
  const q = searchText(search);

  // One search box filters both lists; each list keeps its own page.
  const where = q ? { OR: [{ title: contains(q) }, { slug: contains(q) }] } : {};
  const include = { _count: { select: { dieline: true } } };

  const [catByUsage, catByModel, totalByUsage, totalByModel] = await Promise.all([
    prisma.dielineCategoryByUsage.findMany({ where, include, orderBy: { title: "asc" }, ...usagePage }),
    prisma.dielineCategoryByModel.findMany({ where, include, orderBy: { title: "asc" }, ...modelPage }),
    prisma.dielineCategoryByUsage.count({ where }),
    prisma.dielineCategoryByModel.count({ where }),
  ]);

  const column = (
    title: string,
    type: "usage" | "model",
    data: typeof catByUsage,
    total: number,
    paramName: string,
  ) => (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          {title} <span className="font-normal text-muted-foreground">({total})</span>
        </h2>
        <PopupNewDialog buttonTitle="New">
          <DialogTitle>New {type} category</DialogTitle>
          <CategoriesForm type={type} />
        </PopupNewDialog>
      </div>
      <CategoriesList data={data} type={type} />
      <Pagination pageSize={globalPageSize} totalItems={total} paramName={paramName} />
    </section>
  );

  return (
    <Page>
      <PageHeader
        icon={FolderTree}
        title="Categories"
        description="By usage (what the box is for) and by model (its construction). A dieline can be in several of each."
      />

      <Search placeholder="Search categories" className="max-w-sm" />

      <div className="grid gap-8 lg:grid-cols-2">
        {column("By usage", "usage", catByUsage, totalByUsage, "pageByUsage")}
        {column("By model", "model", catByModel, totalByModel, "pageByModel")}
      </div>
    </Page>
  );
};

export default page;
