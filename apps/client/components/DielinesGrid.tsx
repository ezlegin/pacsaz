"use client";

import { DielineType } from "@/data/types";
import { placeholder, tuckEnd } from "@/public";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { cn } from "@repo/ui/lib/utils";
import { Box, Ratio } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type ImageType = "model" | "dieline";

const DielinesGrid = ({
  dielines,
}: {
  dielines: Omit<DielineType, "settings">[];
}) => {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
        {dielines.map((d, idx) => (
          <DielineCard key={idx} dieline={d} imageType={imageType} />
        ))}
      </div>
    </div>
  );
};

export default DielinesGrid;

const DielineCard = ({
  imageType,
  dieline,
}: {
  imageType: ImageType;
  dieline: Omit<DielineType, "settings">;
}) => {
  return (
    <Link href={`/dieline/${dieline.slug}`} target="_blank">
      <div className="space-y-3 relative">
        <Image
          alt=""
          src={dieline.image?.url ?? placeholder}
          width={500}
          height={500}
          className={cn(
            imageType === "model"
              ? "opacity-100 hover:opacity-0"
              : "opacity-0 hover:opacity-100",
            `w-full aspect-square rounded-2xl absolute transition-opacity duration-400 object-cover`,
          )}
        />
        <Image
          alt=""
          src={tuckEnd}
          width={500}
          height={500}
          className="w-full aspect-square border rounded-2xl p-6 object-cover"
        />
        <div className="text-sm text-muted-foreground">{dieline.title}</div>
      </div>
    </Link>
  );
};
