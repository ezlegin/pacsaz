"use client";

import { ServerAction } from "@/data/types";
import { handleRes } from "@/lib/handleRes";
import { useLoading } from "@repo/lib/utils/useLoading";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/components/alert-dialog";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";

const DeleteButton = ({
  deleteFn,
  id,
}: {
  deleteFn: (id: number) => Promise<ServerAction>;
  id: number;
}) => {
  const router = useRouter();
  const { isLoading, startLoading, stopLoading } = useLoading();

  const onDelete = async () => {
    startLoading();
    const res = await deleteFn(id);
    handleRes(res, { onSuccess: () => router.refresh() });
    stopLoading();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="rounded-full bg-muted flex items-center justify-center hover:bg-gray-200 cursor-pointer text-muted-foreground hover:text-foreground size-7">
          <Trash size={14} />
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>مطمئن هستید؟</AlertDialogTitle>
          <AlertDialogDescription>
            با حذف این گزینه دیگر امکان بازگشت فراهم نمی باشد.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>لغو</AlertDialogCancel>
          <AlertDialogAction
            variant={"destructive"}
            disabled={isLoading}
            onClick={onDelete}
          >
            ادامه و حذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteButton;
