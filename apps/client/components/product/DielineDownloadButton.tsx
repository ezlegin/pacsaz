import { dielineDownloder } from "@/lib/actions/export/downloader";
import Diamond from "@/public/icons/Diamond";
import { useLoading } from "@repo/lib/utils/useLoading";
import { useUserStore } from "@repo/store/app/user.store";
import { useSVGStore } from "@repo/store/dieline/svg.store";
import { Button } from "@repo/ui/components/button";
import { Dialog, DialogContent, DialogTitle } from "@repo/ui/components/dialog";
import { Spinner } from "@repo/ui/components/spinner";
import { cn } from "@repo/ui/lib/utils";
import { BookmarkPlus, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import LoginPopup from "../forms/LoginPopup";
import SaveDielineForm from "../forms/SaveDielineForm";

interface Props {
  svg: string | null;
  slug: string;
  isRendering: boolean;
}

const DielineDownloadButton = ({ slug, isRendering }: Props) => {
  const { svg } = useSVGStore();
  const { startLoading, stopLoading, isLoading } = useLoading();
  const [openPopup, setOpenPopup] = useState<"login" | "save" | null>(null);
  const { isSubscribed } = useUserStore();

  const onDownload = async () => {
    if (!isSubscribed) {
      setOpenPopup("login");
      return;
    }

    if (!svg || isRendering) {
      toast.error("فایل آماده دانلود نیست.");
      return;
    }
    startLoading();

    const res = await dielineDownloder(slug);

    if (!res?.success) {
      toast.error("خطایی رخ داد. لطفا لحظاتی بعد مجددا تلاش کنید.");
      stopLoading();
      return;
    } else {
      toast.success("فایل با موفقیت تولید شد.");
    }

    stopLoading();
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
            <LoginPopup />
          ) : (
            <SaveDielineForm type="create" />
          )}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-6 gap-2">
        <Button
          disabled={isRendering || isLoading}
          onClick={onDownload}
          variant={isSubscribed ? "green" : "default"}
          size="lg"
          className={cn(
            isSubscribed ? "col-span-5" : "col-span-6",
            "gap-2 font-medium",
          )}
        >
          {isLoading || isRendering ? (
            <Spinner />
          ) : (
            <div className="flex gap-1.5 items-center">
              {isSubscribed ? <Download /> : <Diamond />}
              دانلود فایل
            </div>
          )}
        </Button>
        {isSubscribed && (
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
