"use client";

import { setDielineStatus } from "@/actions/dieline";
import { Dieline } from "@repo/db";
import { handleRes } from "@repo/lib/utils/handleRes";
import { cn } from "@repo/ui/lib/utils";
import { useRouter } from "next/navigation";

const DielineStatusSetter = ({ dieline }: { dieline: Dieline }) => {
  const router = useRouter();
  const setDielineActiveness = async (status: boolean, id: number) => {
    const res = await setDielineStatus(status, id);
    handleRes(res, { onSuccess: () => router.refresh() });
  };

  return (
    <div
      onClick={() => setDielineActiveness(!dieline.active, dieline.id)}
      className={cn(
        dieline.active ? "bg-green-500 drop-shadow-green-500" : "bg-gray-300",
        "w-5 h-1.5 rounded-full drop-shadow-sm cursor-pointer",
      )}
    />
  );
};

export default DielineStatusSetter;
