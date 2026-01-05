import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import React from "react";
import Card from "../Card";
import Image from "next/image";
import { tuckEnd } from "@/public";
import Icon from "../Icon";
import { LayoutTemplate } from "lucide-react";

const HomeCategories = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <div className="flex items-center gap-5">
          <Icon icon={LayoutTemplate} />
          <div>
            <h2 className="font-semibold text-2xl">دسته بندی قالب‌ها</h2>
            <p className="text-sm text-muted-foreground">
              %100 لایه باز و 100% قابل شخصی سازی
            </p>
          </div>
        </div>

        <Link href={"/dielines"}>
          <Button variant={"gradient"}>همه دسته ها</Button>
        </Link>
      </div>

      <div className="grid grid-cols-5 grid-rows-2 gap-5 items-center">
        {dielineCategories.map((c, idx) => (
          <CategoryCard key={idx} category={c} />
        ))}
      </div>
    </div>
  );
};

export default HomeCategories;

const CategoryCard = ({
  category: { count, slug, title, className, imgClass },
}: {
  category: Category;
}) => {
  return (
    <Link href={`/dielines?category=${slug}`} className={className}>
      <Card className="p-4 gap-3 bg-background hover:shadow transition-shadow flex flex-col items-center">
        <Image
          alt=""
          src={tuckEnd}
          width={500}
          height={500}
          className={imgClass ? imgClass : " h-[200px] w-auto"}
        />
        <div className="flex justify-between items-end w-full">
          <h3>
            <span className="block text-xs text-muted-foreground">قالب</span>
            <span className="text-primary font-medium">{title}</span>
          </h3>

          <span className="text-xs text-muted-foreground">{count} قالب</span>
        </div>
      </Card>
    </Link>
  );
};

type Category = {
  title: string;
  slug: string;
  count: number;
  className?: string;
  imgClass?: string;
};

const dielineCategories: Category[] = [
  {
    title: "جعبه‌های تاشو",
    slug: "folding-boxes",
    count: 184,
    className: "row-span-2 col-span-2 h-full",
    imgClass: "mx-auto w-auto h-[500px]",
  },
  {
    title: "جعبه‌های تاشو",
    slug: "folding-boxes",
    count: 184,
  },
  {
    title: "جعبه‌های نمایشی",
    slug: "display-boxes",
    count: 126,
  },
  {
    title: "جعبه‌های پستی",
    slug: "postal-boxes",
    count: 72,
  },
  {
    title: "پاکت و اسلیو",
    slug: "sleeves-envelopes",
    count: 95,
  },
  {
    title: "جعبه‌های صنعتی (FEFCO)",
    slug: "fefco-boxes",
    count: 210,
  },
  {
    title: "تری و سینی",
    slug: "trays",
    count: 64,
  },
];
