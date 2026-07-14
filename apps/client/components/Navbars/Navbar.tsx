import Link from "next/link";
import NavbarButtons from "./NavbarButtons";
import PacsazLogo from "../PacsazLogo";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/sheet";
import { Menu } from "lucide-react";
import { Button } from "@repo/ui/components/button";

export const layoutPaddings = "p-3 px-4 md:px-10";

const Navbar = () => {
  return (
    <div
      className={`justify-between items-center border-b bg-background z-10 ${layoutPaddings}`}
    >
      <div className="hidden md:flex justify-between">
        <div className="flex gap-10 items-center">
          <Link href={"/"}>
            <PacsazLogo type="full" />
          </Link>
          <div className="flex gap-12">
            {navbarMenu.map((item, idx) => (
              <Link href={item.href} key={idx} className="relative group">
                <button className="cursor-pointer font-medium text-sm">
                  {item.label}
                </button>
                <div className="w-full h-px bg-accent-foreground absolute -bottom-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
            ))}
          </div>
        </div>
        <NavbarButtons />
      </div>

      <div className="flex md:hidden justify-between">
        <Link href={"/"}>
          <PacsazLogo type="full" />
        </Link>

        <Sheet>
          <SheetTrigger>
            <Menu />
          </SheetTrigger>
          <SheetContent showCloseButton={false} side="left">
            <SheetHeader className="space-y-2">
              <SheetTitle>منو کاربری</SheetTitle>
              <SheetDescription></SheetDescription>
              <NavbarButtons />
              <div className="space-y-4 mt-3 w-full ">
                {navbarMenu.map((item, idx) => (
                  <Link key={idx} href={item.href} className="cursor-pointer">
                    <Button
                      variant={"ghost"}
                      className="w-full border-b p-2 justify-start py-7"
                    >
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default Navbar;

const navbarMenu = [
  { label: "قالب ها", href: "/dielines" },
  { label: "درباره ما", href: "/about-us" },
  { label: "آموزش", href: "https://igraphical.ir/courses/packaging" },
];
