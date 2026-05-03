import { admin } from "@/data/admin";
import PacsazLogo from "@repo/ui/components/custom/PacsazLogo";
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
  Coins,
  CreditCard,
  Flag,
  Layout,
  LayoutDashboard,
  List,
  Ratio,
  Ticket,
  Users,
} from "lucide-react";
import Link from "next/link";

export function PanelSidebar() {
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
          title: "Categories",
          url: "/categories",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      groupLabel: "Subscription",
      items: [
        {
          title: "Subscriptions",
          url: "/subscriptions",
          icon: Flag,
        },
      ],
    },
    {
      groupLabel: "Financial",
      items: [
        {
          title: "Payments",
          url: "/payments",
          icon: CreditCard,
        },
        {
          title: "Coupons",
          url: "/cuopons",
          icon: Ticket,
        },
      ],
    },
    {
      groupLabel: "Tarrif",
      items: [
        {
          title: "Tarrif",
          url: "/tarrif",
          icon: Coins,
        },
        {
          title: "Features",
          url: "/tarrif/features",
          icon: List,
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
                          <div>{item.title}</div>
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
