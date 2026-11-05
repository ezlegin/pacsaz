"use client";

import LoginCard from "@/components/forms/LoginCard";
import { safePath } from "@/lib/safePath";
import { useAppSelector } from "@repo/store/hooks";
import { Dialog, DialogContent, DialogTitle } from "@repo/ui/components/dialog";
import { useRouter } from "next/navigation";

/**
 * Sign-in over the dieline page, so the visitor keeps their place. `refresh`
 * brings the signed-in user into the server-rendered props without touching the
 * size settings in the store.
 *
 * A new account still has to finish onboarding, which is a page of its own. The
 * store does not survive that trip, so the way back carries the size and material
 * in the query that the dieline page already reads.
 */
const LoginDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const router = useRouter();
  const raw = useAppSelector((s) => s.dielineSettings.dimension.raw);
  const material = useAppSelector((s) => s.dielineSettings.material.value);

  const onLoggedIn = (onboardingCompleted: boolean) => {
    if (onboardingCompleted) {
      onOpenChange(false);
      router.refresh();
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("w", String(raw.width));
    url.searchParams.set("l", String(raw.length));
    url.searchParams.set("h", String(raw.height));
    url.searchParams.set("m", material);

    const back = safePath(`${url.pathname}${url.search}`);
    router.push(`/onboarding?callbackUrl=${encodeURIComponent(back)}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassname="bg-accent/20 backdrop-blur-[4px]"
        showCloseButton={false}
        className="border-none bg-transparent p-0 shadow-none sm:max-w-4xl"
      >
        <DialogTitle className="sr-only">ورود یا ثبت‌نام</DialogTitle>
        <LoginCard onLoggedIn={onLoggedIn} />
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
