import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { ReactNode } from "react";
import NewButton from "./NewButton";

const PopupNewDialog = ({
  children,
  buttonTitle,
  icon = false,
}: {
  children: ReactNode;
  buttonTitle: string;
  icon?: boolean;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <NewButton title={buttonTitle} icon={icon} />
        {/* INSTALL LUDICE REACT V0.562.0 TO FIX TYPE ERROR */}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="sr-only" />
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default PopupNewDialog;
