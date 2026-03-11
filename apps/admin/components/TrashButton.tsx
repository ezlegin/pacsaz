"use client";

import { ServerAction } from "@/actions/dieline";
import { handleRes } from "@/lib/utils/handleRes";
import { useLoading } from "@repo/lib/utils/useLoading";
import { Button } from "@repo/ui/components/button";
import ActionButton from "@repo/ui/components/custom/ActionButton";
import { DialogDescription, DialogTitle } from "@repo/ui/components/dialog";
import { Spinner } from "@repo/ui/components/spinner";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";

const DeleteButton = ({
  deleteFn,
}: {
  deleteFn: (id: number) => ServerAction;
}) => {
  const router = useRouter();
  const { isLoading, startLoading, stopLoading } = useLoading();

  const onDelete = async () => {
    startLoading();
    const res = await deleteFn(2);
    handleRes(res, { onSuccess: () => router.refresh() });
    stopLoading();
  };
  //   Todo: Use AlertDialog from Shadcn instead of raw Dialog.
  return (
    <ActionButton icon={Trash}>
      <DialogTitle>Delete</DialogTitle>
      <DialogDescription>Are you sure?</DialogDescription>
      <Button disabled={isLoading} onClick={onDelete} variant={"destructive"}>
        <Spinner isLoading={isLoading} />
        Yes
      </Button>
    </ActionButton>
  );
};

export default DeleteButton;
