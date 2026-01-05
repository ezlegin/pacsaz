"use client";

import { Button } from "@repo/ui/components/button";
import { toast } from "sonner";
import { cn } from "@repo/ui/lib/utils";
import { Heart } from "lucide-react";
import { useState } from "react";

const FavoriteDieline = ({ isFaved }: { isFaved: boolean }) => {
  const [isDielineFaved, setIsDielineFaved] = useState(isFaved);

  const onFave = () => {
    setIsDielineFaved((p) => !p);

    console.log("Dieline Faved.");

    if (!isDielineFaved) {
      toast.success("به لیست علاقه مندی ها اضافه شد.");
    } else {
      toast.info("از لیست علاقه مندی ها حذف شد.");
    }
  };

  return (
    <Button
      size={"icon"}
      variant={"ghost"}
      className="hover:text-destructive hover:border rounded-full"
      onClick={onFave}
    >
      <Heart
        size={18}
        className={cn(
          isDielineFaved
            ? "text-destructive"
            : "text-muted-foreground hover:text-destructive"
        )}
        fill={isDielineFaved ? "#e7000b" : "transparent"}
      />
    </Button>
  );
};

export default FavoriteDieline;
