"use client";

import { duplicateDieline } from "@/actions/dieline";
import { ActButton } from "@repo/ui/components/custom/ActionButton";
import { Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const DuplicateButton = ({ dielineId }: { dielineId: number }) => {
  const router = useRouter();

  const onDuplicateDieline = async () => {
    const res = duplicateDieline(dielineId);

    toast.promise(res, {
      loading: "Duplicating Dieline...",
      success: "Dieline Duplicated Successfully.",
      error: "Failed to Duplicate Dieline.",
    });

    router.refresh();
  };

  return (
    <div className="cursor-pointer" onClick={onDuplicateDieline}>
      <ActButton>
        <Copy size={14} />
      </ActButton>
    </div>
  );
};

export default DuplicateButton;
