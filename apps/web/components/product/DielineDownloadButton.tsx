import { useLoading } from "@/hooks/useLoading";
import { downloadPdf } from "@/lib/actions/export/downloader";
import Diamond from "@/public/icons/Diamond";
import { Button } from "@repo/ui/components/button";
import { Dialog, DialogContent, DialogTitle } from "@repo/ui/components/dialog";
import { Spinner } from "@repo/ui/components/spinner";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { useState } from "react";
import LoginPopup from "../forms/LoginPopup";
import { isSubscribed } from "@repo/dieline-core/data/consts";
import { FormatsType, Model, Dimensions } from "@repo/dieline-core/data/types";

interface Props {
  format: FormatsType;
  svg: Model | null;
  slug: string;
  isRendering: boolean;
  dimensions: Dimensions;
}

const DielineDownloadButton = ({
  format,
  svg,
  slug,
  isRendering,
  dimensions,
}: Props) => {
  const { startLoading, stopLoading, isLoading } = useLoading();
  const [openLoginPopup, setOpenLoginPopup] = useState(false);

  const onDownload = async () => {
    if (!isSubscribed) {
      setOpenLoginPopup(true);
      return;
    }

    if (!svg || isRendering) {
      toast.error("فایل آماده دانلود نیست.");
      return;
    }
    startLoading();

    await downloadPdf({
      svg,
      format,
      slug,
      dimensions,
    });
    toast.success("فایل با موفقیت تولید شد.");

    stopLoading();
  };

  return (
    <>
      <Dialog open={openLoginPopup} onOpenChange={setOpenLoginPopup}>
        <DialogContent
          overlayClassname="bg-accent/20 backdrop-blur-[4px]"
          showCloseButton={false}
          className="p-0 border-none sm:max-w-2xl"
        >
          <DialogTitle className="sr-only" />
          <LoginPopup />
        </DialogContent>
      </Dialog>

      <Button
        disabled={isRendering || isLoading}
        onClick={onDownload}
        variant={isSubscribed ? "green" : "default"}
        size="lg"
        className="mt-4 w-full gap-2 font-medium"
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
    </>
  );
};

export default DielineDownloadButton;
