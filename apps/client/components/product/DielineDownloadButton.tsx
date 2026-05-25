import { createDownloadHistory } from "@/actions/dieline";
import Diamond from "@/public/icons/Diamond";
import { Plan } from "@repo/db";
import { dielineDownloder } from "@repo/lib/utils/dielineDownloader";
import { useLoading } from "@repo/lib/utils/useLoading";
import { useDielineSettingsStore } from "@repo/store/dieline/dielineSettings.store";
import { useSVGStore } from "@repo/store/dieline/svg.store";
import { Button } from "@repo/ui/components/button";
import { Dialog, DialogContent, DialogTitle } from "@repo/ui/components/dialog";
import { Spinner } from "@repo/ui/components/spinner";
import { cn } from "@repo/ui/lib/utils";
import { BookmarkPlus, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import LoginCard from "../forms/LoginCard";
import SaveDielineForm from "../forms/SaveDielineForm";
import { useUserStore } from "@repo/store/app/user.store";
import { redirect } from "next/navigation";

interface Props {
  slug: string;
  isRendering: boolean;
  plan: Plan | null;
}

const DielineDownloadButton = ({ slug, isRendering, plan }: Props) => {
  const { settings } = useDielineSettingsStore();
  const { svg } = useSVGStore();
  const { startLoading, stopLoading, isLoading } = useLoading();
  const [openPopup, setOpenPopup] = useState<"login" | "save" | null>(null);
  const { user } = useUserStore();

  const setts = {
    id: 0,
    width: settings.dimension.raw.width,
    length: settings.dimension.raw.length,
    height: settings.dimension.raw.height,
    material: settings.material.value,
    bleed: settings.bleed,
    dimensionType: settings.dimensionType,
    thickness: settings.thickness,
  };

  const onDownload = async () => {
    if (!user) {
      redirect("/login?callbackUrl=/subscription");
    }

    if (!plan) {
      redirect("/subscription");
    }

    if (!svg || isRendering) {
      toast.error("فایل آماده دانلود نیست.");
      return;
    }

    startLoading();

    const createRecord = await createDownloadHistory(slug, setts, plan.id);
    if (createRecord.error) {
      toast.error(createRecord.error);
      stopLoading();
      return;
    }

    const res = await dielineDownloder(slug);

    if (res?.success && createRecord.success) {
      toast.success("فایل با موفقیت تولید شد.");
      stopLoading();
      return;
    } else {
      toast.error("خطایی رخ داد. لطفا لحظاتی بعد مجددا تلاش کنید.");
      stopLoading();
    }
  };

  const onOpenSavePopup = () => {
    startLoading();
    setOpenPopup("save");
    stopLoading();
  };

  return (
    <>
      <Dialog open={!!openPopup} onOpenChange={() => setOpenPopup(null)}>
        <DialogContent
          overlayClassname="bg-accent/20 backdrop-blur-[4px]"
          showCloseButton={false}
          className={cn(
            openPopup === "login" ? "sm:max-w-2xl" : "sm:max-w-lg",
            "border-none p-6",
          )}
        >
          <DialogTitle className="sr-only" />
          {openPopup === "login" ? (
            <LoginCard />
          ) : (
            <>
              <DialogTitle>ذخیره قالب</DialogTitle>
              <SaveDielineForm settings={setts} slug={slug} plan={plan!} />
            </>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-6 gap-2">
        <Button
          disabled={isRendering || isLoading}
          onClick={onDownload}
          variant={plan ? "green" : "default"}
          size="lg"
          className={cn(
            plan ? "col-span-5" : "col-span-6",
            "gap-2 font-medium",
          )}
        >
          {isLoading || isRendering ? (
            <Spinner />
          ) : (
            <div className="flex gap-1.5 items-center">
              {plan ? <Download /> : <Diamond />}
              دانلود فایل
            </div>
          )}
        </Button>
        {plan && (
          <Button
            disabled={isRendering || isLoading}
            onClick={onOpenSavePopup}
            variant={"secondary"}
            size="lg"
            className=""
          >
            <BookmarkPlus />
          </Button>
        )}
      </div>
    </>
  );
};

export default DielineDownloadButton;
