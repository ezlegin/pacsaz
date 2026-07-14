import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { tuckEnd } from "@/public";
import Icon from "../Icon";
import { LayoutTemplate } from "lucide-react";
import Card from "@repo/ui/components/custom/Card";

const HomeCategories = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <Icon icon={LayoutTemplate} />
          <div>
            <h2 className="text-2xl font-semibold">دسته بندی قالب‌ها</h2>
            <p className="text-sm text-muted-foreground">
              %100 لایه باز و 100% قابل شخصی سازی
            </p>
          </div>
        </div>

        <Link href="/dielines" className="w-full sm:w-auto">
          <Button variant="gradient" className="w-full sm:w-auto">
            همه دسته ها
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 lg:grid-rows-2">
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
      <Card className="flex h-full flex-col items-center gap-3 p-4 transition-shadow hover:shadow bg-background">
        <Image
          alt=""
          src={tuckEnd}
          width={500}
          height={500}
          className={imgClass ?? "h-40 w-auto object-contain sm:h-48 lg:h-52"}
        />

        <div className="flex w-full items-end justify-between">
          <h3>
            <span className="block text-xs text-muted-foreground">قالب</span>
            <span className="font-medium text-primary">{title}</span>
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
    className: "lg:row-span-2 lg:col-span-2 lg:h-full",
    imgClass: "mx-auto h-64 w-auto object-contain lg:h-[500px]",
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
