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
import { Bookmark, Flag, LogOut, User } from "lucide-react";
import PacsazLogo from "./PacsazLogo";

const items = [
  {
    title: "ذخیره شده",
    url: "/panel/saved",
    icon: Bookmark,
  },
  {
    title: "وضعیت اشتراک",
    url: "/panel/subscription",
    icon: Flag,
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
        <div className="mb-4">
          <PacsazLogo type="full" scale={1.2} />
        </div>

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
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <div className="text-muted-foreground cursor-pointer">
                    <LogOut className="text-destructive/50" />
                    <span>خروج از حساب</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
