import { tuckEnd } from "@/public";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Zap, ChevronLeft } from "lucide-react";
import React from "react";
import SquarePattern from "../SquarePattern";
import Link from "next/link";
import Image from "next/image";
import Card from "../Card";

const LandingPage = () => {
  return (
    <div className="max-w-[1528px] mx-auto pt-20 space-y-28">
      <SquarePattern />
      {/* Landing Page */}
      <div className="flex items-center flex-col gap-7">
        <Link href={"/dielines"}>
          <Badge
            variant={"outline"}
            className="p-1 flex justify-center items-center gap-1.5 pl-3"
          >
            <Badge variant={"lightPrimary"}>
              <Zap />
              پک‌ساز
            </Badge>
            <span className="text-xs font-medium">
              بیش از <strong>1,000</strong> قالب دایلاین، آماده تولید
            </span>
            <ChevronLeft size={13} strokeWidth={2.2} />
          </Badge>
        </Link>
        <div className="space-y-4 text-center">
          <h1 className="text-5xl font-bold">
            طراحی دایلاین، بدون آزمون و خطا!
          </h1>
          <p className="text-muted-foreground">
            پک‌ساز ابزاری هوشمند برای طراحی آنلاین دایلاین‌های بسته‌بندی؛
            <br />
            ساخته‌شده برای طراحان، چاپخانه‌ها و تیم‌های حرفه‌ای.
          </p>
        </div>

        <div className="flex gap-2">
          <Link href={"/dieline/tuck-end"}>
            <Button className="w-[140px]" variant={"gradient"}>
              ساخت اولین قالب
            </Button>
          </Link>
          <Link href={"/subscription"}>
            <Button className="w-[140px]" variant={"secondary"}>
              تعرفه ها
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-5 gap-6 items-center pt-10">
          {Array.from({ length: 10 }).map((_, idx) => (
            <Card key={idx}>
              <Image alt="" src={tuckEnd} width={300} height={300} />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
