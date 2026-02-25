import { dielineDownloder } from "@repo/lib/utils/dielineDownloader";
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
      toast.error("File Not Ready.");
      return;
    }
    startLoading();

    const res = await dielineDownloder(slug);

    if (!res?.success) {
      toast.error("Something Happended. Check The Logs.");
      stopLoading();
      return;
    } else {
      toast.success("Successfully Downloaded.");
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
