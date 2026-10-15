"use client";

import { faveDieline, unfaveDieline } from "@/actions/dieline";
import { loginPageRoute } from "@/proxy";
import { User } from "@repo/db";
import { useLoading } from "@repo/lib/utils/useLoading";
import { cn } from "@repo/ui/lib/utils";
import { Heart, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

/**
 * Overlay variant of the favourite toggle, for use on top of a linked card.
 * Rendered as a sibling of the card's <Link> (never inside it) so the markup
 * stays valid and a click does not navigate.
 */
const DielineFavoriteButton = ({
  dielineId,
  initialFaved,
  user,
  className,
}: {
  dielineId: number;
  initialFaved: boolean;
  user: User | null;
  className?: string;
}) => {
  const [faved, setFaved] = useState(initialFaved);
  const [isPending, startTransition] = useTransition();
  const { isLoading, startLoading, stopLoading } = useLoading();
  const router = useRouter();

  const busy = isLoading || isPending;

  const onClick = async () => {
    if (!user) {
      router.push(loginPageRoute);
      return;
    }

    const next = !faved;
    setFaved(next); // optimistic
    startLoading();

    const res = next
      ? await faveDieline(dielineId)
      : await unfaveDieline(dielineId);

    if (res.error) {
      setFaved(!next); // roll back
      toast.error(res.error);
    }

    stopLoading();
    startTransition(() => router.refresh());
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={faved}
      aria-label={faved ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
      className={cn(
        "grid size-8 place-items-center rounded-full border border-transparent backdrop-blur transition-all duration-200",
        faved
          ? "bg-background/90 text-destructive shadow-sm"
          : "bg-background/70 text-muted-foreground hover:bg-background/95 hover:text-destructive hover:shadow-sm",
        className,
      )}
    >
      {busy ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Heart
          className="size-4"
          fill={faved ? "currentColor" : "transparent"}
        />
      )}
    </button>
  );
};

export default DielineFavoriteButton;
