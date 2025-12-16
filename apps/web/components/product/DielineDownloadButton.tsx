import Diamond from "@/public/icons/Diamond";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { Download } from "lucide-react";

interface Props {
  download: () => void;
  loading: boolean;
}

const DielineDownloadButton = ({ download, loading = false }: Props) => {
  const isSubscribed = false;
  return (
    <Button
      disabled={loading}
      onClick={download}
      size="lg"
      className="mt-4 w-full gap-2 font-medium"
    >
      {loading ? (
        <Spinner />
      ) : (
        <div className="flex gap-1.5 items-center">
          {isSubscribed ? <Download /> : <Diamond />}
          دانلود فایل
        </div>
      )}
    </Button>
  );
};

export default DielineDownloadButton;
