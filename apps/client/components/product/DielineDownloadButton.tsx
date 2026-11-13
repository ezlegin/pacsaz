import { downloadDieline } from "@/actions/dieline";
import { saveBase64File } from "@/lib/dieline/download";
import Diamond from "@/public/icons/Diamond";
import { Plan, SavedDieline, User } from "@repo/db";
import { useLoading } from "@repo/lib/utils/useLoading";
import { Button } from "@repo/ui/components/button";
import { Dialog, DialogContent, DialogTitle } from "@repo/ui/components/dialog";
import { Spinner } from "@repo/ui/components/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/utils";
import { BookmarkPlus, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import SaveDielineForm from "../forms/SaveDielineForm";
import LoginDialog from "./LoginDialog";
import { useAppSelector } from "@repo/store/hooks";

export interface UserType extends User {
  plan: Plan | null;
}

interface Props {
  slug: string;
  isRendering: boolean;
  user: UserType | null;
  /** Customize mode: the customer's overlay as JSON, saved and downloaded with the size. */
  customization?: string;
  /** Customize mode: the copy being edited, so saving updates it. */
  savedDieline?: SavedDieline;
  onSaved?: (id: number) => void;
  /** Problems the customer has to fix before the file can be produced. */
  blocked?: string | null;
}

const DielineDownloadButton = ({ slug, isRendering, user, customization, savedDieline, onSaved, blocked }: Props) => {
  const router = useRouter();
  const settings = useAppSelector((s) => s.dielineSettings);
  const svg = useAppSelector((s) => s.svg.svg);
  const { startLoading, stopLoading, isLoading } = useLoading();
  const [savePopup, setSavePopup] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

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
      setLoginOpen(true);
      return;
    }

    if (!user.plan) {
      router.push("/pricing");
      return;
    }

    if (blocked) {
      toast.error(blocked);
      return;
    }

    if (!svg || isRendering) {
      toast.error("فایل آماده دانلود نیست.");
      return;
    }

    startLoading();

    // The server renders the file itself from the template, the size and the
    // customization; nothing drawn in the browser is sent.
    const res = await downloadDieline(slug, setts, settings.format, customization);
    if ("error" in res) {
      toast.error(res.error, {
        action: {
          label: "تمدید اشتراک",
          onClick: () => {
            router.push("/pricing");
          },
        },
      });
      stopLoading();
      return;
    }

    saveBase64File(res.file, res.mime, res.fileName);
    toast.success("فایل با موفقیت تولید شد.");
    stopLoading();
  };

  const onOpenSavePopup = () => {
    startLoading();
    setSavePopup(true);
    stopLoading();
  };

  return (
    <>
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />

      <Dialog open={savePopup} onOpenChange={setSavePopup}>
        <DialogContent
          overlayClassname="bg-accent/20 backdrop-blur-[4px]"
          showCloseButton={false}
          className="border-none p-6 sm:max-w-lg"
        >
          <DialogTitle>ذخیره قالب</DialogTitle>
          <SaveDielineForm
            settings={setts}
            slug={slug}
            plan={user?.plan!}
            customization={customization}
            savedDieline={savedDieline}
            onSaved={(id) => {
              setSavePopup(false);
              onSaved?.(id);
            }}
          />
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-6 gap-2">
        <Button
          disabled={isRendering || isLoading}
          onClick={onDownload}
          variant={user?.plan ? "green" : "gradient"}
          size="lg"
          className={cn(
            user?.plan ? "col-span-5" : "col-span-6",
            "group gap-2 font-bold shadow-sm",
          )}
        >
          {isLoading || isRendering ? (
            <>
              <Spinner />
              در حال آماده‌سازی...
            </>
          ) : (
            <>
              {user?.plan ? <Download className="size-4" /> : <Diamond />}
              دانلود فایل
            </>
          )}
        </Button>

        {user?.plan && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                disabled={isRendering || isLoading}
                onClick={onOpenSavePopup}
                variant={"secondary"}
                size="lg"
                className="col-span-1"
                aria-label="ذخیره قالب"
              >
                <BookmarkPlus className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="p-0.5 text-[11px]">
                ذخیره‌ی این قالب با تنظیمات فعلی
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </>
  );
};

export default DielineDownloadButton;
