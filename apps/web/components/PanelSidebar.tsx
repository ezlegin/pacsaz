import { testUser } from "@/data/user";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import { Bookmark, CreditCard, Flag, Heart, User, Users } from "lucide-react";
import Link from "next/link";
import PacsazLogo from "./PacsazLogo";
import { isSubscribed } from "@/lib/dielines/core/consts";
import { Badge } from "@workspace/ui/components/badge";

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
    url: "#",
    icon: Users,
    onDevelopment: true,
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
          <p className="font-semibold text-lg">{testUser.fullName}</p>
          <span className=" text-xs text-muted-foreground font-medium">
            {testUser.phone}
          </span>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>منو کاربری</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-3">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={
                        item.onDevelopment ? "cursor-default" : "cursor-pointer"
                      }
                    >
                      <item.icon />
                      <div className="flex gap-2 items-center">
                        <span>{item.title}</span>
                        {item.onDevelopment && (
                          <Badge variant={"primaryForeground"}>بزودی</Badge>
                        )}
                      </div>
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
