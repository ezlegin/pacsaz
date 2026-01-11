import { admin } from "@/data/admin";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";
import {
  Bookmark,
  CreditCard,
  Flag,
  Heart,
  Layout,
  Ratio,
  Users,
} from "lucide-react";
import Link from "next/link";
import PacsazLogo from "./PacsazLogo";

export function PanelSidebar() {
  return (
    <Sidebar>
      <SidebarContent className="p-6 py-5">
        <Link href={"/"} className="mb-4">
          <PacsazLogo scale={1.2} />
        </Link>

        <div>
          <p className="font-semibold text-lg">{admin.fullName}</p>
          <span className=" text-xs text-muted-foreground font-medium">
            {admin.email}
          </span>
        </div>

        <div>
          {menuItems.map((i, idx) => (
            <SidebarGroup key={idx}>
              <SidebarGroupLabel>{i.groupLabel}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-2">
                  {i.items.map((item, idx) => (
                    <SidebarMenuItem key={idx}>
                      <SidebarMenuButton asChild>
                        <Link href={item.url}>
                          <item.icon />
                          {item.title}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

const menuItems = [
  {
    groupLabel: "",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: Layout,
      },
    ],
  },
  {
    groupLabel: "Dieline Management",
    items: [
      {
        title: "Dielines",
        url: "/dielines",
        icon: Ratio,
      },
      {
        title: "Favs",
        url: "/favs",
        icon: Heart,
      },
      {
        title: "Saved",
        url: "/saved",
        icon: Bookmark,
      },
    ],
  },
  {
    groupLabel: "Payments",
    items: [
      {
        title: "Subscriptions",
        url: "/subscriptions",
        icon: Flag,
      },
      {
        title: "Tarrif",
        url: "/tarrif",
        icon: CreditCard,
      },
      {
        title: "Payments",
        url: "/payments",
        icon: CreditCard,
      },
    ],
  },
  {
    groupLabel: "Usre Management",
    items: [
      {
        title: "Users",
        url: "/users",
        icon: Users,
      },
      {
        title: "Customers",
        url: "/customers",
        icon: Users,
      },
    ],
  },
];
