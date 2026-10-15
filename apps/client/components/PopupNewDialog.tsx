// Lives in the app rather than @repo/ui: its NewButton child imports next/link,
// and Next.js imports inside the shared UI package make Vercel treat
// packages/ui as a deployable service. The admin and client apps each keep
// their own copy.
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { ReactNode } from "react";
import NewButton from "./NewButton";

const PopupNewDialog = ({
  children,
  buttonTitle,
  icon = false,
  dialogClassName,
}: {
  children: ReactNode;
  buttonTitle: string;
  icon?: boolean;
  dialogClassName?: string;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <NewButton title={buttonTitle} icon={icon} />
        {/* INSTALL LUDICE REACT V0.562.0 TO FIX TYPE ERROR */}
      </DialogTrigger>
      <DialogContent className={dialogClassName}>{children}</DialogContent>
    </Dialog>
  );
};

export default PopupNewDialog;
