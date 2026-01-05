import React from "react";
import Card from "../Card";
import Image from "next/image";
import { alirezaEzleginiPic, packagingCoursePic } from "@/public";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

const HomeCourseIntro = () => {
  return (
    <Card className="flex justify-between items-center relative">
      <div className="space-y-3">
        <h2 className="font-semibold text-2xl">
          دوره جامع طراحی بسته بندی و لیبل
        </h2>
        <ul className="text-sm text-muted-foreground columns-2 space-y-1 mt-4 list-disc list-inside">
          <li>10.5 ساعت ویدیو آموزشی</li>
          <li>آموزش جامع طراحی بسته بندی از صفر تا صد</li>
          <li>مدرک پایان دوره</li>
          <li>پشتیبانی و رفع اشکال آنلاین</li>
        </ul>

        <div className="flex items-center gap-2">
          <Image
            alt="img"
            src={alirezaEzleginiPic}
            width={40}
            height={40}
            className="rounded-2xl"
          />
          <div className="flex gap-10">
            <div className="flex flex-col gap">
              <span className="text-xs font-semibold">مدرس:</span>
              <span className="text-sm">علیرضا ازگینی</span>
            </div>

            <Link
              target="_blank"
              href={"https://igraphical.ir/courses/packaging"}
            >
              <Button variant={"gradient"}>
                مشاهده دوره
                <ExternalLink />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Image
        alt="img"
        src={packagingCoursePic}
        width={375}
        height={375}
        className="rounded-2xl absolute left-4 bottom-4"
      />
    </Card>
  );
};

export default HomeCourseIntro;
