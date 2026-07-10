"use client";

import { faveDieline, unfaveDieline } from "@/actions/dieline";
import { handleRes } from "@/lib/handleRes";
import { loginPageRoute } from "@/proxy";
import { User } from "@repo/db";
import { useLoading } from "@repo/lib/utils/useLoading";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

const FavoriteDieline = ({
  isFaved,
  dielineId,
  user,
}: {
  isFaved: boolean;
  dielineId: number;
  user: User | null;
}) => {
  const { isLoading, startLoading, stopLoading } = useLoading();
  const router = useRouter();
  const onFave = async () => {
    if (!user) {
      router.push(loginPageRoute);
      return;
    }

    startLoading();
    const res = isFaved
      ? await unfaveDieline(dielineId)
      : await faveDieline(dielineId);

    handleRes(res, { onSuccess: () => router.refresh() });
    stopLoading();
  };

  return (
    <Button
      disabled={isLoading}
      size={"icon"}
      variant={"ghost"}
      className="hover:text-destructive hover:border rounded-full"
      onClick={onFave}
    >
      <Heart
        size={18}
        className={cn(
          isFaved
            ? "text-destructive"
            : "text-muted-foreground hover:text-destructive",
        )}
        fill={isFaved ? "#e7000b" : "transparent"}
      />
    </Button>
  );
};

export default FavoriteDieline;
