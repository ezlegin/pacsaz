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
}: {
  children: ReactNode;
  buttonTitle: string;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <NewButton title={buttonTitle} />
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="sr-only" />
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default PopupNewDialog;
