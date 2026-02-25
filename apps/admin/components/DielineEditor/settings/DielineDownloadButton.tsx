import { dielineDownloder } from "@/actions/export/downloader";
import { useLoading } from "@repo/lib/utils/useLoading";
import { useSVGStore } from "@repo/store/dieline/svg.store";
import { Button } from "@repo/ui/components/button";
import { Spinner } from "@repo/ui/components/spinner";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface Props {
  slug: string;
  isRendering: boolean;
}

const DielineDownloadButton = ({ slug, isRendering }: Props) => {
  const { svg } = useSVGStore();
  const { startLoading, stopLoading, isLoading } = useLoading();

  const onDownload = async () => {
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

  return (
    <Button
      disabled={isRendering || isLoading}
      onClick={onDownload}
      variant={"green"}
      size="lg"
      className="w-full"
    >
      {isLoading || isRendering ? (
        <Spinner />
      ) : (
        <div className="flex gap-1.5 items-center">
          <Download />
          Download
        </div>
      )}
    </Button>
  );
};

export default DielineDownloadButton;
