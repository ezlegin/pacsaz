import { useLoading } from "@/hooks/useLoading";
import { downloadPdf } from "@/lib/actions/export/downloader";
import { isSubscribed } from "@/lib/dielines/core/consts";
import { FormatsType, Model } from "@/lib/dielines/core/types";
import Diamond from "@/public/icons/Diamond";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Spinner } from "@workspace/ui/components/spinner";
import { toast } from "@workspace/ui/index";
import { Download } from "lucide-react";
import { useState } from "react";

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
      <Dialog open={openLoginPopup}>
        <DialogContent dir="rtl" showCloseButton={false}>
          <DialogHeader dir="rtl" className="text-right">
            <DialogTitle className="text-right">ورود یا ثبت نام</DialogTitle>
            <DialogDescription className="text-right">
              ورود به حساب کاربری با ارسال کد تایید
            </DialogDescription>
          </DialogHeader>
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
