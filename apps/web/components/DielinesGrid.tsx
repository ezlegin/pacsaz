"use client";

import { tuckEnd, tuckEndModel } from "@/public";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";
import { cn } from "@workspace/ui/lib/utils";
import { Box, Ratio } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
type ImageType = "model" | "dieline";
const DielinesGrid = () => {
  const [imageType, setImageType] = useState<ImageType>("dieline");

  return (
    <div className="space-y-3">
      <ToggleGroup
        value={imageType}
        onValueChange={(val: ImageType | "") => {
          if (val === "") return;
          setImageType(val);
        }}
        type="single"
        className="mr-auto"
      >
        <ToggleGroupItem value="model" className="cursor-pointer">
          مـدل
          <Box />
        </ToggleGroupItem>
        <ToggleGroupItem value="dieline" className="cursor-pointer">
          دایلاین
          <Ratio />
        </ToggleGroupItem>
      </ToggleGroup>
      <div className="grid grid-cols-4 gap-8">
        {dielines.map((d, idx) => (
          <DielineCard key={idx} dieline={d} imageType={imageType} />
        ))}
      </div>
    </div>
  );
};

export default DielinesGrid;

type Dielines = {
  title: string;
  slug: string;
  dielineImg: string;
  modelImg: string;
};

const DielineCard = ({
  imageType,
  dieline,
}: {
  imageType: ImageType;
  dieline: Dielines;
}) => {
  return (
    <Link href={`/dieline/${dieline.slug}`} target="_blank">
      <div className="space-y-3 relative">
        <Image
          alt=""
          src={dieline.modelImg}
          width={400}
          height={400}
          className={cn(
            imageType === "model"
              ? "opacity-100 hover:opacity-0"
              : "opacity-0 hover:opacity-100",
            `w-full aspect-square rounded-2xl absolute transition-opacity duration-400`
          )}
        />
        <Image
          alt=""
          src={dieline.dielineImg}
          width={400}
          height={400}
          className="w-full aspect-square border rounded-2xl"
        />
        <div className="text-sm text-muted-foreground">{dieline.title}</div>
      </div>
    </Link>
  );
};

const dielines: Dielines[] = [
  {
    title: "جعبه درب‌دار ساده",
    slug: "tuck-end",
    dielineImg: tuckEnd,
    modelImg: tuckEndModel,
  },
  {
    title: "جعبه پستی",
    slug: "postal-card",
    dielineImg: tuckEnd,
    modelImg: tuckEndModel,
  },
  {
    title: "جعبه استاندارد FEFCO",
    slug: "fefco-box",
    dielineImg: tuckEnd,
    modelImg: tuckEndModel,
  },
  {
    title: "پاکت مقوایی",
    slug: "paper-envelope",
    dielineImg: tuckEnd,
    modelImg: tuckEndModel,
  },
  {
    title: "جعبه سینی‌دار",
    slug: "tray-box",
    dielineImg: tuckEnd,
    modelImg: tuckEndModel,
  },
  {
    title: "جعبه درب‌دار ساده",
    slug: "tuck-end",
    dielineImg: tuckEnd,
    modelImg: tuckEndModel,
  },
  {
    title: "جعبه پستی",
    slug: "postal-card",
    dielineImg: tuckEnd,
    modelImg: tuckEndModel,
  },
  {
    title: "جعبه استاندارد FEFCO",
    slug: "fefco-box",
    dielineImg: tuckEnd,
    modelImg: tuckEndModel,
  },
  {
    title: "پاکت مقوایی",
    slug: "paper-envelope",
    dielineImg: tuckEnd,
    modelImg: tuckEndModel,
  },
  {
    title: "جعبه سینی‌دار",
    slug: "tray-box",
    dielineImg: tuckEnd,
    modelImg: tuckEndModel,
  },
];
