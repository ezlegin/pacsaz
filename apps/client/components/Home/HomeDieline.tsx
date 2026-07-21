"use client";

import { DIMENSIONS } from "@/data/consts";
import { DielineType } from "@/data/types";
import { tuckEnd } from "@/public";
import { useDielineGenerator } from "@repo/dieline-core/hooks/useDielineGenerator";
import { useDeveloperToolsStore } from "@repo/store/dieline/developerTools.store";
import { Card } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect } from "react";
import DielineLoadingOverlay from "../product/DielineLoadingOverlay";
import { DimensionInput } from "../product/DimensionsInput";
const SVGPreview = dynamic(
  () => import("@repo/ui/components/custom/SVGPreview"),
  {
    ssr: false,
  },
);

const HomeDieline = ({ dieline }: { dieline: DielineType | null }) => {
  const containerClass = "h-175 max-w-225 min-w-225";
  if (!dieline)
    return (
      <div className={cn(containerClass, "flex justify-center items-center")}>
        <Image
          alt="dieline"
          src={tuckEnd}
          width={800}
          height={800}
          className="h-full w-auto"
        />
      </div>
    );

  dieline.settings.width = 80;
  dieline.settings.length = 130;
  dieline.settings.height = 40;
  const specs = JSON.parse(dieline.specification);
  const variables = JSON.parse(dieline.variable);
  const { isRendering } = useDielineGenerator(
    {
      ...dieline,
      specification: specs,
      settings: dieline.settings!,
      variables,
    },
    "client",
  );
  const { setDeveloperTools: setDeveloperToolsCTX } = useDeveloperToolsStore();

  useEffect(() => {
    setDeveloperToolsCTX("showWatermark", false);
    setDeveloperToolsCTX("showContainer", false);
    setDeveloperToolsCTX("doCenterSVG", true);
  }, []);

  return (
    <div className="relative p-0">
      <DielineLoadingOverlay />

      <div className={containerClass}>
        <SVGPreview
          isRendering={isRendering}
          showControls={false}
          disablePanning
          disableWheel
          type="client"
        />
      </div>

      <Card className="gap-3 max-w-40 absolute right-0 bottom-0 bg-background p-3">
        {DIMENSIONS.map(({ key, label }) => (
          <DimensionInput
            key={key}
            label={label}
            min={dieline.settings[key]}
            dimKey={key}
            isRendering={isRendering}
          />
        ))}
      </Card>
    </div>
  );
};

export default HomeDieline;
