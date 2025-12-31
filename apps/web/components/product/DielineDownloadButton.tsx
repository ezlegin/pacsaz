import { useLoading } from "@/hooks/useLoading";
import { downloadPdf } from "@/lib/actions/export/downloader";
import { isSubscribed } from "@/lib/dielines/core/consts";
import { FormatsType, Model } from "@/lib/dielines/core/types";
import Diamond from "@/public/icons/Diamond";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Spinner } from "@workspace/ui/components/spinner";
import { toast } from "@workspace/ui/index";
import { Download } from "lucide-react";
import { useState } from "react";
import LoginForm from "../forms/LoginForm";

interface Props {
  format: FormatsType;
  svg: Model | null;
  slug: string;
  isRendering: boolean;
}

const DielineDownloadButton = ({ format, svg, slug, isRendering }: Props) => {
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
          <LoginForm />
        </DialogContent>
      </Dialog>

      <Button
        disabled={isRendering || isLoading}
        onClick={onDownload}
        variant={isSubscribed ? "green" : "default"}
        size="lg"
        className="mt-4 w-full gap-2 font-medium"
      >
        {isLoading ? (
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
