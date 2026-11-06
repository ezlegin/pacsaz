import { TarrifForm } from "@/components/forms/TarrifForm";
import PopupNewDialog from "@/components/PopupNewDialog";
import { prisma } from "@repo/db";
import { DialogTitle } from "@repo/ui/components/dialog";
import { Coins } from "lucide-react";
import { Page, PageHeader } from "../components/PanelUI";
import TarrifList from "./TarrifList";

const page = async () => {
  // At most one tariff per plan key (three in all), so no paging: the old
  // pager counted only the rows of the current page.
  const [tarrif, features] = await Promise.all([
    prisma.tarrif.findMany({
      include: { price: true, fairDownload: true, features: true },
      orderBy: { level: "asc" },
    }),
    prisma.tarrifFeature.findMany(),
  ]);

  return (
    <Page>
      <PageHeader
        icon={Coins}
        title="Tariffs"
        description="Plans sold on the pricing page: prices and fair-download limits per period, and the features each one lists."
        actions={
          tarrif.length < 3 ? (
            <PopupNewDialog buttonTitle="New tariff">
              <DialogTitle>New tariff</DialogTitle>
              <TarrifForm features={features} />
            </PopupNewDialog>
          ) : undefined
        }
      />

      <TarrifList data={tarrif} features={features} />
    </Page>
  );
};

export default page;
