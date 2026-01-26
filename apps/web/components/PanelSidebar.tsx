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
import { Bookmark, CreditCard, Flag, Heart, User, Users } from "lucide-react";
import Link from "next/link";
import PacsazLogo from "./PacsazLogo";
import { isSubscribed, sessionUser } from "@repo/store/app/user.store";

const items = [
  {
    title: isSubscribed ? "وضعیت اشتراک" : "اشتراک",
    url: "/panel",
    icon: Flag,
  },
  {
    title: "علاقه‌مندی ها",
    url: "/panel/favs",
    icon: Heart,
  },
  {
    title: "ذخیره شده",
    url: "/panel/saved",
    icon: Bookmark,
  },
  {
    title: "مشتری‌ها",
    url: "/panel/customers",
    icon: Users,
  },
  {
    title: "پرداخت ها",
    url: "/panel/payments",
    icon: CreditCard,
  },
  {
    title: "مشخصات",
    url: "/panel/profile",
    icon: User,
  },
];

export function PanelSidebar() {
  return (
    <Sidebar side="right">
      <SidebarContent className="p-10 py-5">
        <Link href={"/"} className="mb-4">
          <PacsazLogo type="full" scale={1.2} />
        </Link>

        <div>
          <p className="font-semibold text-lg">{sessionUser?.fullName}</p>
          <span className=" text-xs text-muted-foreground font-medium">
            {sessionUser?.phoneNumber}
          </span>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>منو کاربری</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-3">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
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
      </SidebarContent>
    </Sidebar>
  );
}
