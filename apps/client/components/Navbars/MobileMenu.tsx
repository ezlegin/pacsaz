import { Button } from "@repo/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/sheet";
import { ArrowUpRight, Menu } from "lucide-react";
import Link from "next/link";
import PacsazLogo from "../PacsazLogo";
import { MobileAccountPanel } from "./NavbarButtons";
import { type NavItem } from "./NavLinks";

const navItems: NavItem[] = [
  { label: "قالب ها", href: "/dielines" },
  { label: "درباره ما", href: "/about-us" },
  {
    label: "آموزش",
    href: "https://igraphical.ir/courses/packaging",
    external: true,
  },
];

/** Mobile navigation drawer. */
const MobileMenu = () => (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline" size="icon" aria-label="منوی سایت">
        <Menu className="size-4" />
      </Button>
    </SheetTrigger>

    <SheetContent
      side="right"
      showCloseButton={false}
      className="w-full overflow-y-auto p-5 sm:max-w-sm"
    >
      <SheetHeader className="space-y-5 p-0 text-right">
        <Link href="/">
          <PacsazLogo type="full" />
        </Link>

        <SheetTitle className="sr-only">منوی سایت</SheetTitle>
        <SheetDescription className="sr-only">
          دسترسی به بخش‌های مختلف پک‌ساز
        </SheetDescription>

        {/* primary navigation */}
        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              className="flex items-center justify-between rounded-xl border bg-background px-4 py-3 text-sm font-medium transition-colors hover:border-primary/30 hover:text-primary"
            >
              {item.label}
              <ArrowUpRight className="size-3.5 text-muted-foreground" />
            </Link>
          ))}
        </nav>

        <div className="h-px bg-border" />

        {/* account + panel links */}
        <MobileAccountPanel />
      </SheetHeader>
    </SheetContent>
  </Sheet>
);

export default MobileMenu;
