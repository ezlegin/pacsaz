import { getSessionUser } from "@repo/auth/session";
import { prisma } from "@repo/db";
import { formatToman } from "@/utils/formatPrice";
import { cn } from "@repo/ui/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@repo/ui/components/sidebar";
import { ArrowLeft, Flag, Sparkles } from "lucide-react";
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

        {/* ----------------------- subscription promo ----------------------- */}
        {!hasPlan && <PanelSubscribePromo />}
      </SidebarContent>
    </Sidebar>
  );
};

export default PanelSidebar;

/**
 * Anchored to the bottom of the sidebar for users without a plan. In-flow
 * rather than floating, so it never covers the navigation.
 */
const PanelSubscribePromo = async () => {
  const cheapest = await prisma.price.findFirst({
    orderBy: { monthly: "asc" },
    select: { monthly: true },
  });

  if (!cheapest) return null;

  return (
    <div className="mt-auto pt-5">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-violet-600 to-purple-700 p-4 text-white shadow-lg shadow-primary/20">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-fuchsia-400/30 blur-2xl"
        />

        <div className="relative space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 py-0.5 text-[10px] font-medium">
            <Sparkles className="size-3" />
            اشتراک پک‌ساز
          </span>

          <div className="space-y-1">
            <p className="text-base leading-5 text-primary-foreground">
              شروع از{" "}
              <span className="font-bold tabular-nums">
                {formatToman(cheapest.monthly)}
              </span>{" "}
              تومان در ماه
            </p>
            <p className="font-extrabold leading-snug text-[10px] text-white/75">
              به همه‌ی قالب‌ها دسترسی بگیر
            </p>
          </div>

          <Link
            href="/subscription"
            className="group flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[11px] font-extrabold text-violet-700 transition-all duration-300 hover:gap-2.5"
          >
            فعال‌سازی اشتراک
            <ArrowLeft className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
