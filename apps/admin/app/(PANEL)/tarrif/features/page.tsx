import FeatureForm from "@/components/forms/FeatureForm";
import PageTitle from "@/components/PageTitle";
import { prisma } from "@repo/db";
import { globalPageSize } from "@repo/lib/data/consts";
import Pagination from "@repo/ui/components/custom/Pagination";
import PopupNewDialog from "@repo/ui/components/custom/PopupNewDialog";
import { DialogTitle } from "@repo/ui/components/dialog";
import FeaturesList from "./FeaturesList";

const page = async () => {
  const features = await prisma.tarrifFeature.findMany({
    take: 10,
    orderBy: { id: "desc" },
  });

  // Todo: Pagination
  return (
    <div className="space-y-3">
      <PageTitle title="Features" />

      <div className="flex justify-between">
        <PopupNewDialog buttonTitle="New Feature">
          <DialogTitle>New Feature</DialogTitle>
          <FeatureForm />
        </PopupNewDialog>
      </div>

      <FeaturesList data={features} />

      <Pagination pageSize={globalPageSize} totalItems={features.length} />
    </div>
  );
};

export default page;
