import { getSessionUser } from "@repo/auth/session";
import { cn } from "@repo/ui/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@repo/ui/components/sidebar";
import { Flag } from "lucide-react";
import Link from "next/link";
import PacsazLogo from "./PacsazLogo";
import PanelNav from "./PanelNav";

const PanelSidebar = async () => {
  const user = await getSessionUser();
  const hasPlan = Boolean(user?.plan);

  return (
    <Sidebar side="right">
      <SidebarContent className="gap-0 p-5">
        <Link href={"/"} className="mb-5 block">
          <PacsazLogo type="full" scale={1} />
        </Link>

        {/* ---------------------------- user chip ---------------------------- */}
        <div className="mb-5 space-y-3 rounded-2xl border bg-gradient-to-bl from-primary/[0.07] to-transparent p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-extrabold text-white shadow-md shadow-primary/20">
              {user?.fullName?.trim().charAt(0) ?? "؟"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{user?.fullName}</p>
              <p
                dir="ltr"
                className="truncate text-right text-[11px] text-muted-foreground"
              >
                {user?.phoneNumber}
              </p>
            </div>
          </div>

          <Link
            href="/panel"
            className={cn(
              "flex items-center justify-between rounded-xl px-3 py-2 text-[11px] font-bold transition-colors",
              hasPlan
                ? "bg-primary/10 text-primary hover:bg-primary/15"
                : "border border-dashed text-muted-foreground hover:border-primary/30 hover:text-primary",
            )}
          >
            <span className="flex items-center gap-1.5">
              <Flag className="size-3.5" />
              {hasPlan ? `پلن ${user?.plan?.title}` : "اشتراک فعالی نداری"}
            </span>
            <span className="text-[10px] opacity-70">
              {hasPlan ? "مشاهده" : "فعال‌سازی"}
            </span>
          </Link>
        </div>

        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-1 text-[10px]">
            منو کاربری
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <PanelNav />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default PanelSidebar;
