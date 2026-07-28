import { createDownloadHistory } from "@/actions/dieline";
import Diamond from "@/public/icons/Diamond";
import { Plan, User } from "@repo/db";
import { dielineDownloder } from "@repo/lib/utils/dielineDownloader";
import { useLoading } from "@repo/lib/utils/useLoading";
import { Button } from "@repo/ui/components/button";
import { Dialog, DialogContent, DialogTitle } from "@repo/ui/components/dialog";
import { Spinner } from "@repo/ui/components/spinner";
import { cn } from "@repo/ui/lib/utils";
import { BookmarkPlus, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import LoginCard from "../forms/LoginCard";
import SaveDielineForm from "../forms/SaveDielineForm";
import { useAppSelector } from "@repo/store/hooks";

export interface UserType extends User {
  plan: Plan | null;
}

interface Props {
  slug: string;
  isRendering: boolean;
  user: UserType | null;
}

const DielineDownloadButton = ({ slug, isRendering, user }: Props) => {
  const router = useRouter();
  const settings = useAppSelector((s) => s.dielineSettings);
  const svg = useAppSelector((s) => s.svg.svg);
  const { startLoading, stopLoading, isLoading } = useLoading();
  const [openPopup, setOpenPopup] = useState<"login" | "save" | null>(null);

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
      router.push("/login?callbackUrl=/subscription");
      return;
    }

    if (!user.plan) {
      router.push("/subscription");
      return;
    }

    if (!svg || isRendering) {
      toast.error("فایل آماده دانلود نیست.");
      return;
    }

    startLoading();

    const createRecord = await createDownloadHistory(slug, setts, user.plan.id);
    if (createRecord.error) {
      toast.error(createRecord.error, {
        action: {
          label: "تمدید اشتراک",
          onClick: () => {
            router.push("/subscription");
          },
        },
      });
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
              <SaveDielineForm
                settings={setts}
                slug={slug}
                plan={user?.plan!}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-6 gap-2">
        <Button
          disabled={isRendering || isLoading}
          onClick={onDownload}
          variant={user?.plan ? "green" : "default"}
          size="lg"
          className={cn(
            user?.plan ? "col-span-5" : "col-span-6",
            "gap-2 font-medium",
          )}
        >
          {isLoading || isRendering ? (
            <Spinner />
          ) : (
            <div className="flex gap-1.5 items-center">
              {user?.plan ? <Download /> : <Diamond />}
              دانلود فایل
            </div>
          )}
        </Button>
        {user?.plan && (
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
