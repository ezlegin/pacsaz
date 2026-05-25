import { getSessionUser } from "@repo/auth/session";
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
import { Button } from "@repo/ui/components/button";

const PanelSidebar = async () => {
  const user = await getSessionUser();

  const items = [
    {
      title: "سوابق اشتراک",
      url: "/panel/subscriptions",
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

  return (
    <Sidebar side="right">
      <SidebarContent className="p-10 py-5">
        <Link href={"/"} className="mb-4">
          <PacsazLogo type="full" scale={1} />
        </Link>

        <div>
          <p className="font-semibold text-lg">{user?.fullName}</p>
          <span className=" text-xs text-muted-foreground font-medium">
            {user?.phoneNumber}
          </span>
        </div>

        {user?.plan && (
          <Link href={"/panel"}>
            <Button
              variant={"primaryForeground"}
              className="w-full border border-primary/40 mt-3"
            >
              <Flag />
              اشتراک من
            </Button>
          </Link>
        )}

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
};

export default PanelSidebar;
