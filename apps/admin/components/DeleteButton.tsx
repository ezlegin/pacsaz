"use client";

import { ServerResponse } from "@repo/lib/data/types";
import { handleRes } from "@repo/lib/utils/handleRes";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/components/alert-dialog";
import { Button } from "@repo/ui/components/button";
import { Spinner } from "@repo/ui/components/spinner";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Row delete with a confirmation that names what goes.
 *
 * The confirm button is a plain button, not `AlertDialogAction`: the action
 * closes the dialog on click, before the server has answered, so a refusal
 * ("this user has payments") would flash by behind a closed dialog. Here the
 * dialog stays open until the delete succeeds.
 */
const DeleteButton = ({
  deleteFn,
  id,
  args,
  itemLabel = "this item",
}: {
  deleteFn: (id: number, ...arg: any) => ServerResponse;
  id: number;
  args?: any;
  /** Shown as "Delete {itemLabel}?", e.g. `the user "Sara Ahmadi"`. */
  itemLabel?: string;
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onDelete = async () => {
    setIsLoading(true);
    try {
      const res = await deleteFn(id, args);
      handleRes(res, {
        onSuccess: () => {
          setOpen(false);
          router.refresh();
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isLoading && setOpen(next)}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          aria-label="Delete"
          className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash size={14} />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {itemLabel}?</AlertDialogTitle>
          <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <Button variant="destructive" disabled={isLoading} onClick={onDelete}>
            <Spinner isLoading={isLoading} />
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteButton;
