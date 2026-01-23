import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { ChevronDown, ChevronLeft, Zap } from "lucide-react";
import Link from "next/link";
import SquarePattern from "../SquarePattern";
import HomeSVGModel from "./HomeSVGModel";

const LandingPage = () => {
  return (
    <div className="space-y-28">
      <SquarePattern />

      <div className="flex justify-between items-center">
        <div className="space-y-6">
          <div>
            <Link href={"/dielines"}>
              <Badge
                variant={"outline"}
                className="p-1 bg-background flex justify-center items-center gap-1.5 pl-3"
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
          </div>

          <div className="space-y-5">
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
              <Button className="w-35" variant={"gradient"}>
                ساخت اولین قالب
              </Button>
            </Link>
            <a href={"#subscription"}>
              <Button className="w-35" variant={"secondary"}>
                تعرفه <ChevronDown />
              </Button>
            </a>
          </div>
        </div>

        <HomeSVGModel />
      </div>
    </div>
  );
};

export default LandingPage;
