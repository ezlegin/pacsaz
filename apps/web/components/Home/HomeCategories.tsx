import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import React from "react";
import Card from "../Card";
import Image from "next/image";
import { tuckEnd } from "@/public";

const HomeCategories = () => {
  return (
    <div className="bg-muted p-24 border-y space-y-8">
      <div className="flex justify-between">
        <div>
          <h2 className="font-semibold text-2xl">دسته بندی قالب‌ها</h2>
          <p className="text-sm text-muted-foreground">
            %100 لایه باز و 100% قابل شخصی سازی
          </p>
        </div>

        <Link href={"/dielines"}>
          <Button variant={"gradient"}>همه دسته ها</Button>
        </Link>
      </div>

      <div className="grid grid-cols-5 gap-6 items-center">
        {Array.from({ length: 10 }).map((_, idx) => (
          <Link key={idx} href={"/dielines"}>
            <Card className="bg-background/50 p-3 gap-0">
              <Image alt="" src={tuckEnd} width={300} height={300} />
              <div className="flex justify-between items-end">
                <h3>
                  <span className="block text-xs text-muted-foreground">
                    قالب
                  </span>
                  <span className="text-primary font-medium">جعبه Display</span>
                </h3>

                <span className="text-xs text-muted-foreground">126 قالب</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomeCategories;
