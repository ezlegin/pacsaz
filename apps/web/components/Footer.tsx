import { cn } from "@workspace/ui/lib/utils";
import React from "react";
import { layoutPaddings } from "./Navbars/Navbar";
import PacsazLogo from "./PacsazLogo";
import Image from "next/image";
import Card from "./Card";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

const Footer = () => {
  return (
    <div className={cn(layoutPaddings, "pb-0 z-10")}>
      <Card className="rounded-b-none">
        <div className="flex justify-between items-start">
          <div className="space-y-2 max-w-md">
            <PacsazLogo scale={1.2} type="full" />
            <p className="text-sm text-muted-foreground">
              پک‌ساز ابزاری هوشمند برای طراحی دقیق دایلاین‌های بسته‌بندی؛
              <br />
              ساخته‌شده برای طراحان، چاپخانه‌ها و تیم‌های حرفه‌ای.
            </p>
          </div>

          <div className="flex gap-10">
            <div className="grid grid-cols-2 text-sm">
              {menu.map((m, idx) => (
                <Link key={idx} href={m.href}>
                  <Button
                    variant={"ghost"}
                    size={"sm"}
                    className="text-muted-foreground w-full"
                  >
                    {m.label}
                  </Button>
                </Link>
              ))}
            </div>
            <div>
              <Image
                alt="e-namad"
                src={"/enamad.png"}
                width={100}
                height={120}
                className="border rounded-lg bg-accent"
              />
            </div>
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
