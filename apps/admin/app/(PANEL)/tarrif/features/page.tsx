import FeatureForm from "@/components/forms/FeatureForm";
import Pagination from "@/components/Pagination";
import PopupNewDialog from "@/components/PopupNewDialog";
import { prisma } from "@repo/db";
import { globalPageSize } from "@repo/lib/data/consts";
import { pagination } from "@repo/lib/utils/pagination";
import { DialogTitle } from "@repo/ui/components/dialog";
import { List } from "lucide-react";
import { Page, PageHeader } from "../../components/PanelUI";
import FeaturesList from "./FeaturesList";

interface Props {
  searchParams: Promise<{ page?: string }>;
}

const page = async ({ searchParams }: Props) => {
  const { page } = await searchParams;
  const { skip, take } = pagination(page ?? "", globalPageSize);

  const [features, count] = await Promise.all([
    prisma.tarrifFeature.findMany({ orderBy: { id: "desc" }, skip, take }),
    prisma.tarrifFeature.count(),
  ]);

  return (
    <Page>
      <PageHeader
        icon={List}
        title="Tariff features"
        description="The lines listed under each plan on the pricing page. Tick them per tariff in the tariff form."
        actions={
          <PopupNewDialog buttonTitle="New feature">
            <DialogTitle>New feature</DialogTitle>
            <FeatureForm />
          </PopupNewDialog>
        }
      />

      <FeaturesList data={features} />

      <Pagination pageSize={globalPageSize} totalItems={count} />
    </Page>
  );
};

export default page;
