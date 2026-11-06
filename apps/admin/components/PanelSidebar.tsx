"use client";

import PacsazLogo from "@/components/PacsazLogo";
import type { CurrentAdmin } from "@/lib/session";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";
import {
  Bell,
  Coins,
  CreditCard,
  Flag,
  FolderTree,
  LayoutDashboard,
  List,
  type LucideIcon,
  Megaphone,
  MessageSquare,
  Ratio,
  ShieldCheck,
  Ticket,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type MenuItem = { title: string; url: string; icon: LucideIcon };

const menuGroups: { label: string; items: MenuItem[] }[] = [
  {
    label: "",
    items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }],
  },
  {
    label: "Dielines",
    items: [
      { title: "Dielines", url: "/dielines", icon: Ratio },
      { title: "Categories", url: "/categories", icon: FolderTree },
    ],
  },
  {
    label: "Sales",
    items: [
      { title: "Subscriptions", url: "/subscriptions", icon: Flag },
      { title: "Payments", url: "/payments", icon: CreditCard },
      { title: "Coupons", url: "/coupons", icon: Ticket },
      // Read-only report for the coupons minted by the monthly marketing job;
      // deliberately separate from the /coupons workbench.
      { title: "Marketing Coupons", url: "/marketing-coupons", icon: Megaphone },
    ],
  },
  {
    label: "Tariffs",
    items: [
      { title: "Tariffs", url: "/tarrif", icon: Coins },
      { title: "Features", url: "/tarrif/features", icon: List },
    ],
  },
  {
    label: "People",
    items: [
      { title: "Users", url: "/users", icon: Users },
      { title: "Customers", url: "/customers", icon: UserCheck },
      { title: "Admins", url: "/admins", icon: ShieldCheck },
    ],
  },
  {
    label: "Site",
    items: [
      { title: "Contacts", url: "/contacts", icon: MessageSquare },
      // The site-wide announcement bar shown at the top of every page of the
      // client site. Both apps read the same row.
      { title: "Announcement Bar", url: "/notification", icon: Bell },
    ],
  },
];

const allUrls = menuGroups.flatMap((g) => g.items.map((i) => i.url));

/**
 * The menu entry for a path is the longest URL that prefixes it, so
 * /tarrif/features lights up Features and not Tariffs, and /users/12 lights up
 * Users.
 */
const activeUrl = (pathname: string) =>
  allUrls
    .filter((url) => (url === "/" ? pathname === "/" : pathname === url || pathname.startsWith(`${url}/`)))
    .sort((a, b) => b.length - a.length)[0];

export function PanelSidebar({ admin }: { admin: CurrentAdmin }) {
  const pathname = usePathname();
  const current = activeUrl(pathname);

  return (
    <Sidebar>
      <SidebarHeader className="px-6 pt-6">
        <Link href="/" className="w-fit">
          <PacsazLogo type="full" scale={1.1} />
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3">
        {menuGroups.map((group, idx) => (
          <SidebarGroup key={idx}>
            {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={item.url === current}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {admin.fullName.trim().charAt(0).toUpperCase() || "A"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{admin.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{admin.email}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
