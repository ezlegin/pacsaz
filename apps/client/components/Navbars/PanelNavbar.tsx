import { getSessionUser } from "@repo/auth/session";
import { cn } from "@repo/ui/lib/utils";
import { Flag } from "lucide-react";
import Link from "next/link";
import LogoutButton from "../LogoutButton";

const PanelNavbar = async () => {
  const user = await getSessionUser();
  const hasPlan = Boolean(user?.plan);

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3">
      <Link
        href="/panel"
        className="group inline-flex items-center gap-2.5 rounded-2xl border bg-background px-4 py-2 transition-colors hover:border-primary/30"
      >
        <span
          className={cn(
            "grid size-8 place-items-center rounded-xl transition-colors",
            hasPlan
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          <Flag className="size-3.5" strokeWidth={2} />
        </span>

        <span className="space-y-0.5">
          <span className="block text-[10px] leading-none text-muted-foreground">
            پلن فعال
          </span>
          <span className="flex items-center gap-1.5 text-xs font-bold leading-none">
            {hasPlan ? (
              <>
                <span className="size-1.5 rounded-full bg-green-500" />
                {user?.plan?.title}
              </>
            ) : (
              <>
                <span className="size-1.5 rounded-full bg-muted-foreground" />
                ندارد
              </>
            )}
          </span>
        </span>
      </Link>

      <LogoutButton />
    </div>
  );
};

export default PanelNavbar;
