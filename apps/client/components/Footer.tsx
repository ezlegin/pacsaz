import { cn } from "@repo/ui/lib/utils";
import React from "react";
import { layoutPaddings } from "./Navbars/Navbar";
import PacsazLogo from "./PacsazLogo";
import Image from "next/image";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import Card from "@repo/ui/components/custom/Card";

const Enamad = () => (
  <Image
    alt="e-namad"
    src="/enamad.png"
    width={100}
    height={120}
    className="rounded-lg border bg-accent"
  />
);

const Footer = () => {
  return (
    <div className={cn(layoutPaddings, "pb-0 z-10")}>
      <Card className="rounded-b-none">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3 max-w-md">
            <PacsazLogo scale={1.2} type="full" />
            <p className="text-sm text-muted-foreground leading-7">
              پک‌ساز ابزاری هوشمند برای طراحی دقیق دایلاین‌های بسته‌بندی؛
              <br className="hidden sm:block" />
              ساخته‌شده برای طراحان، چاپخانه‌ها و تیم‌های حرفه‌ای.
            </p>
          </div>

          <div className="flex flex-col-reverse md:items-center gap-6 sm:flex-row sm:items-start sm:justify-between lg:gap-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {menu.map((m, idx) => (
                <Link key={idx} href={m.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-muted-foreground"
                  >
                    {m.label}
                  </Button>
                </Link>
              ))}
            </div>

            <div className="hidden md:block">
              <Enamad />
            </div>
          </div>
          <div className="md:hidden">
            <Enamad />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Footer;

const menu = [
  { label: "صفحه اصلی", href: "/" },
  { label: "اشتراک", href: "/subscription" },
  { label: "قوانین و مقررات", href: "/terms" },
  { label: "درباره ما", href: "/about-us" },
  { label: "تماس با ما", href: "/contact-us" },
  { label: "آموزش", href: "https://igraphical.ir/courses/packaging" },
];
